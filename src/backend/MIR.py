import os
import numpy as np
import shutil
from music21 import converter
from backend.utils.convert_audio_to_midi import convert_audio_to_midi
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)

# Constants
ROOT_DIR = BASE_DIR = Path(__file__).resolve().parent.parent.parent
BASE_DIR = Path(__file__).resolve().parent  # Points to 'backend/'
MIDI_DATASET_PATH = BASE_DIR / "database" / "midi_audio"
AUDIO_DIR = os.path.join(BASE_DIR, "database", "audio")
SIMILARITY_THRESHOLD = 0.75  # Minimum similarity score to consider a match
MIR_RESULT_JSON = "src/backend/query_result/MIR_result.json"


# Step 1: Audio Processing


def process_midi_file(midi_file_path):
    """
    Parameters:
        midi_file_path (str): The path to the MIDI file.

    Returns:
        list: A list of MIDI note pitches extracted from the main melody track.
    """
    try:
        audio = converter.parse(midi_file_path)
        notes = []

        # Try to select the first "Part" (channel 1, main melody)
        parts = audio.getElementsByClass("Part")
        melody_part = parts[0] if parts else audio

        for element in melody_part.flatten().notes:
            if element.isNote:
                notes.append(element.pitch.midi)
            elif element.isChord:
                # If the element is a chord, extend the list with MIDI pitches of all notes in the chord
                notes.extend(p.midi for p in element.pitches)

        return notes
    except Exception as e:
        print(f"Error processing MIDI file {midi_file_path}: {e}")
        return []


def normalize_notes(notes):
    """
    Normalize pitch values using mean and standard deviation.

    Parameters:
        notes (list): The list of MIDI note pitches.

    Returns:
        list: The list of normalized note pitches.
    """
    if not notes:
        return []
    mean_pitch = np.mean(notes)
    std_pitch = np.std(notes)
    if std_pitch == 0:
        std_pitch = 1  # Prevent division by zero
    normalized_notes = [(note - mean_pitch) / std_pitch for note in notes]
    return normalized_notes


# ====================================================================================
# Step 2: Feature Extraction
# ====================================================================================


def extract_features(notes):
    """
    Extract ATB, RTB, FTB (normalized: density=True).

    Parameters:
        notes (list): List of normalized note pitches.

    Returns:
        tuple: Three np arrays representing normalized ATB, RTB, FTB features.
    """
    if not notes:
        # Return zero arrays if notes are empty
        return np.zeros(128), np.zeros(255), np.zeros(255)

    # ATB
    atb = np.histogram(notes, bins=range(0, 128 + 1), density=True)[0]

    # RTB
    intervals = np.diff(notes)
    if intervals.size == 0:
        intervals = [0]
    rtb = np.histogram(intervals, bins=range(-127, 128 + 1), density=True)[0]

    # FTB
    first_note = notes[0]
    ftb_intervals = [note - first_note for note in notes]
    ftb = np.histogram(ftb_intervals, bins=range(-127, 128 + 1), density=True)[0]
    return atb, rtb, ftb


# ====================================================================================
# Step 3: Similarity Calculation
# ====================================================================================


def cosine_similarity(vector1, vector2):
    """
    Parameters:
        vector1 (numpy.ndarray): The first vector.
        vector2 (numpy.ndarray): The second vector.

    Returns:
        float: The cosine similarity value.
    """
    dot_product = np.dot(vector1, vector2)
    norm1 = np.linalg.norm(vector1)
    norm2 = np.linalg.norm(vector2)
    if norm1 == 0 or norm2 == 0:
        return 0  # Avoid division by zero
    return dot_product / (norm1 * norm2)


def calculate_similarity(query_features, database_features):
    """
    Compare query features with database features using cosine similarity.

    Parameters:
        query_features (tuple): ATB, RTB, and FTB features of the query.
        database_features (list): A list of tuples containing ATB, RTB, and FTB features of the database entries.

    Returns:
        list: A list of weighted similarity audios.
    """
    similarities = []
    # Weights for ATB, RTB, and FTB respectively
    weights = [0.4, 0.4, 0.2]
    for db_features in database_features:
        weighted_similarity = sum(
            cosine_similarity(query_feature, db_feature) * weight
            for query_feature, db_feature, weight in zip(
                query_features, db_features, weights
            )
        )
        similarities.append(weighted_similarity)
    return similarities


# ====================================================================================
# Step 4: Similarity Calculation and Matching
# ====================================================================================


def query_by_humming(query_audio_file, database_files, threshold=SIMILARITY_THRESHOLD):
    """
    Parameters:
        query_audio_file (str): The path to the query audio file.
        database_files (list): A list of database MIDI file paths.
        threshold (float): The similarity threshold for matches.

    Returns:
        list: A list of tuples containing matched file paths and their similarity audios.
    """
    # Convert query audio file to MIDI
    query_midi_file = query_audio_file.rsplit(".", 1)[0] + ".mid"
    convert_audio_to_midi(query_audio_file, query_midi_file)

    # Process the query MIDI file
    query_notes = process_midi_file(query_midi_file)
    normalized_query_notes = normalize_notes(query_notes)
    query_features = extract_features(normalized_query_notes)

    # Process the database MIDI files
    database_features = []
    for db_file in database_files:
        db_notes = process_midi_file(db_file)
        normalized_db_notes = normalize_notes(db_notes)
        db_features = extract_features(normalized_db_notes)
        database_features.append(db_features)

    # Calculate query w/ database entries similarity
    similarities = calculate_similarity(query_features, database_features)

    # Find matches > threshold
    matches = [
        (db_file, similarity)
        for db_file, similarity in zip(database_files, similarities)
        if similarity >= threshold
    ]

    # Sort matches by similarity in descending order
    matches.sort(key=lambda x: x[1], reverse=True)

    return matches


# ====================================================================================
# Step 5: Save Matches
# ====================================================================================


def save_matches(matches, mapper, result_dir):
    if not matches:
        logging.info("No matches to save.")
        return

    # Prepare result directories
    result_audio_dir = os.path.join(result_dir, "audio")
    result_picture_dir = os.path.join(result_dir, "picture")
    mir_result_path = os.path.join(
        result_dir, "json/MIR_result.json"
    )  # Define the JSON path
    os.makedirs(result_audio_dir, exist_ok=True)
    os.makedirs(result_picture_dir, exist_ok=True)

    # Clear previous results
    for folder in [result_audio_dir, result_picture_dir]:
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
                logging.info(f"Deleted file: {file_path}")
            except Exception as e:
                logging.error(f"Error deleting file {file_path}: {e}")

    # Remove existing MIR_result.json if it exists
    if os.path.exists(mir_result_path):
        try:
            os.remove(mir_result_path)
            logging.info(f"Removed existing JSON file: {mir_result_path}")
        except Exception as e:
            logging.error(f"Error deleting JSON file {mir_result_path}: {e}")

    # Prepare list for MIR_result.json
    mir_results = []
    similarity_rank = 1

    for match, similarity in matches:
        # Find the corresponding album and song from the mapper
        match_found = False
        for album in mapper:
            for song in album["songs"]:
                song_basename = os.path.splitext(os.path.basename(song["file"]))[0]
                match_basename = os.path.splitext(os.path.basename(match))[0]
                if song_basename == match_basename:
                    # Copy the audio file
                    audio_file_path = os.path.join(AUDIO_DIR, song["file"])
                    destination_audio_path = os.path.join(
                        result_audio_dir,
                        f"{similarity_rank}_{os.path.basename(song['file'])}",
                    )
                    if not os.path.exists(audio_file_path):
                        logging.error(f"Audio file does not exist: {audio_file_path}")
                        continue
                    try:
                        shutil.copy(audio_file_path, destination_audio_path)
                        logging.info(
                            f"Copied {audio_file_path} to {destination_audio_path}"
                        )
                    except Exception as e:
                        logging.error(
                            f"Error copying audio file {audio_file_path}: {e}"
                        )
                        continue  # Skip to next if copying fails

                    # Copy the album image
                    image_src = os.path.join(ROOT_DIR, album["imageSrc"])
                    destination_image_path = os.path.join(
                        result_picture_dir, f"{similarity_rank}.jpg"
                    )

                    try:
                        shutil.copy(image_src, destination_image_path)
                        logging.info(f"Copied {image_src} to {destination_image_path}")
                    except Exception as e:
                        logging.error(f"Error copying image {image_src}: {e}")
                        continue  # Skip to next if copying fails

                    # Prepare MIR_result.json entry
                    mir_entry = {
                        "similarity_rank": similarity_rank,
                        "similarity_percentage": round(similarity, 4),
                        "id": album["id"],
                        "title": album["title"],
                        "imageSrc": album["imageSrc"],
                        "song": song,
                    }
                    mir_results.append(mir_entry)
                    match_found = True
                    break  # Assuming one song per MIDI file
            if match_found:
                break  # Move to next match

        if not match_found:
            logging.warning(f"No matching album/song found for MIDI file {match}")
            continue

        similarity_rank += 1

    # Save MIR_result.json
    try:
        os.makedirs(os.path.dirname(mir_result_path), exist_ok=True)
        with open(mir_result_path, "w") as f:
            json.dump(mir_results, f, indent=4)
        logging.info(f"Saved MIR_result.json to {mir_result_path}")
    except Exception as e:
        logging.error(f"Error saving MIR_result.json: {e}")

    return mir_results  # Return the list of matched results


# ====================================================================================
# Step 6: Utils - Convert Dataset to MIDI
# ====================================================================================


def convert_dataset_to_midi(dataset_path, midi_dataset_path):
    """
    Parameters:
        dataset_path (str): The path to the directory containing the audio files.
        midi_dataset_path (str): The path to the directory where MIDI files will be stored.
    """
    os.makedirs(midi_dataset_path, exist_ok=True)
    for audio_file in os.listdir(dataset_path):
        if audio_file.endswith((".wav", ".mp3", ".flac", ".ogg")):
            audio_file_path = os.path.join(dataset_path, audio_file)
            midi_file_name = audio_file.rsplit(".", 1)[0] + ".mid"
            midi_file_path = os.path.join(midi_dataset_path, midi_file_name)
            if not os.path.exists(midi_file_path):
                try:
                    convert_audio_to_midi(audio_file_path, midi_file_path)
                    print(f"Converted {audio_file_path} to {midi_file_path}")
                except Exception as e:
                    print(f"Error converting {audio_file_path} to MIDI: {e}")
            else:
                print(
                    f"MIDI file {midi_file_path} already exists. Skipping conversion."
                )


# ====================================================================================
# Entry Point: Main Function
# ====================================================================================


def main():
    dataset_path = "src/backend/database/audio"
    midi_dataset_path = "src/backend/database/midi_audio"
    query_audio_file = "test/query/audio/pop.00099.wav"
    result_dir = "test/result"
    mapper_file = "src/backend/database/mapper_all_img.json"

    # Load mapper
    try:
        with open(mapper_file, "r") as f:
            mapper = json.load(f)
    except Exception as e:
        print(f"Error loading mapper file {mapper_file}: {e}")
        return

    # Convert the dataset to MIDI files (only if new audio files are added, else comment the two lines below)
    print("Converting dataset audio files to MIDI...")
    convert_dataset_to_midi(dataset_path, midi_dataset_path)

    # Get the list of MIDI files for querying
    database_files = [
        os.path.join(midi_dataset_path, f)
        for f in os.listdir(midi_dataset_path)
        if f.endswith(".mid")
    ]

    if not database_files:
        print(
            f"No MIDI files found in {midi_dataset_path}. Please convert the dataset first."
        )
        return

    # Debugging statement
    print(f"Loaded {len(database_files)} MIDI files for querying.")

    # Query by humming
    print("Processing query audio and retrieving similar MIDI files...\n")
    matches = query_by_humming(
        query_audio_file, database_files, threshold=SIMILARITY_THRESHOLD
    )

    # Save the matches to the result directories and MIR_result.json
    mir_results = save_matches(matches, mapper, result_dir=result_dir)

    # Print the matches
    if mir_results:
        # Print the matched MIDI paths that are above SIMILARITY_THRESHOLD
        print(f"\nMatched MIDI Files (Similarity >= {SIMILARITY_THRESHOLD}):")
        for entry in mir_results:
            print(
                f"Rank {entry['similarity_rank']}: {entry['song']['file']} (Similarity: {entry['similarity_percentage']})"
            )
    else:
        print(f"No matches found with similarity score >= {SIMILARITY_THRESHOLD}.")


if __name__ == "__main__":
    main()
