import os
import numpy as np
import shutil
from music21 import converter
from backend.utils.convert_audio_to_midi import convert_audio_to_midi
import json
from pathlib import Path
import logging


# ====================================================================================
# Constants
# ====================================================================================

SIMILARITY_THRESHOLD = 0.75  # Minimum similarity score to consider a match
MIR_RESULT_JSON = "src/backend/query_result/MIR_result.json"

ROOT_DIR = BASE_DIR = Path(__file__).resolve().parent.parent.parent
BASE_DIR = Path(__file__).resolve().parent  # Points to 'backend/'
MIDI_DATASET_PATH = BASE_DIR / "database" / "midi_audio"
AUDIO_DIR = os.path.join(BASE_DIR, "database", "audio")

MIDI_MIN = 0
MIDI_MAX = 127
N_COMPONENTS = 20  # Number of principal components for PCA

# ====================================================================================
# Step 1: Audio Processing
# ====================================================================================


def process_midi_file(midi_file_path):
    """
    Process a MIDI file: Extract note pitches.
    Focus on the main melody track, usually on Channel 1.
    """
    try:
        score = converter.parse(midi_file_path)
        notes = []

        # Focus on Channel 1 (melody track)
        parts = score.getElementsByClass("Part")
        melody_part = (
            parts[0] if parts else score
        )  # Default to first part if no parts found

        for element in melody_part.flatten().notes:
            if element.isNote:
                notes.append(element.pitch.midi)
            elif element.isChord:
                notes.extend(p.midi for p in element.pitches)

        return notes
    except Exception as e:
        print(f"Error processing MIDI file {midi_file_path}: {e}")
        return []


def normalize_notes(notes):
    """
    Normalize pitch values using mean and standard deviation.

    Formula:
    NP(note) = (note - μ) / σ
    Where μ is the mean pitch and σ is the standard deviation of the pitch.
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
    Extract features: ATB (Absolute Tone Based), RTB (Relative Tone Based), FTB (First Tone Based).
    This function computes the tone distribution based on three viewpoints.

    2.1. Absolute Tone Based (ATB):
        - Counts the frequency of occurrence of each MIDI note (0-127).
        - Creates a histogram with 128 bins.
        - Normalizes the histogram to get a standardized distribution.

    2.2. Relative Tone Based (RTB):
        - Analyzes changes between sequential notes.
        - Calculates differences between consecutive notes (intervals).
        - Creates a histogram with 255 bins ranging from -127 to +127.
        - Normalizes the histogram.

    2.3. First Tone Based (FTB):
        - Focuses on the difference between each note and the first note.
        - Calculates differences between each note and the first note.
        - Creates a histogram with 255 bins ranging from -127 to +127.
        - Normalizes the histogram.

    All histograms are normalized to ensure all values are on a probability scale.
    """
    if not notes:
        # Return zero arrays if notes are empty
        return np.zeros(128), np.zeros(255), np.zeros(255)

    # Absolute Tone Based (ATB)
    atb_histogram, _ = np.histogram(
        notes, bins=range(MIDI_MIN, MIDI_MAX + 2)
    )  # 128 bins
    atb = atb_histogram / np.sum(atb_histogram)  # Normalize histogram

    # Relative Tone Based (RTB)
    intervals = np.diff(notes)  # Differences between consecutive notes
    rtb_histogram, _ = np.histogram(
        intervals, bins=range(-MIDI_MAX, MIDI_MAX + 2)
    )  # 255 bins
    rtb = rtb_histogram / np.sum(rtb_histogram)  # Normalize histogram

    # First Tone Based (FTB)
    first_note = notes[0]
    ftb_intervals = [note - first_note for note in notes]
    ftb_histogram, _ = np.histogram(
        ftb_intervals, bins=range(-MIDI_MAX, MIDI_MAX + 2)
    )  # 255 bins
    ftb = ftb_histogram / np.sum(ftb_histogram)  # Normalize histogram

    return atb, rtb, ftb  # Total features: 128 + 255 + 255 = 638


# ====================================================================================
# Additional: Feature Processing (Dimensionality Reduction using PCA)
# ====================================================================================


def fit_pca_model(features):
    """
    Fit a PCA model using NumPy.
    Returns the PCA model as a dictionary containing the mean and eigenvectors.
    """
    mean = np.mean(features, axis=0)
    features_centered = features - mean
    covariance_matrix = np.cov(features_centered, rowvar=False)
    eigen_values, eigen_vectors = np.linalg.eigh(covariance_matrix)
    # Sort eigenvectors by eigenvalues in descending order
    sorted_index = np.argsort(eigen_values)[::-1]
    sorted_eigenvectors = eigen_vectors[:, sorted_index]
    # Select top N_COMPONENTS
    eigenvector_subset = sorted_eigenvectors[:, 0:N_COMPONENTS]
    pca_model = {"mean": mean, "eigenvectors": eigenvector_subset}
    print(f"PCA model fitted with {N_COMPONENTS} components.")
    return pca_model


def apply_pca(features, pca_model):
    """
    Apply PCA to reduce the dimensionality of the feature space.
    """
    features_centered = features - pca_model["mean"]
    reduced_features = np.dot(features_centered, pca_model["eigenvectors"])
    return reduced_features


# ====================================================================================
# Step 3: Similarity Calculation
# ====================================================================================


def cosine_similarity_metric(vector1, vector2):
    dot_product = np.dot(vector1, vector2)
    norm1 = np.linalg.norm(vector1)
    norm2 = np.linalg.norm(vector2)
    if norm1 == 0 or norm2 == 0:
        return 0
    return dot_product / (norm1 * norm2)


def calculate_similarity(query_features, database_features):
    similarities = []
    for db_feature in database_features:
        similarity = cosine_similarity_metric(query_features, db_feature)
        similarities.append(similarity)
    return similarities


# ====================================================================================
# Step 4: Similarity Calculation and Matching
# ====================================================================================


def query_by_humming(
    query_audio_file,
    database_files,
    mapper,
    pca_model,
    threshold=SIMILARITY_THRESHOLD,
    result_dir="test/result",
):
    # Convert query audio file to MIDI
    query_midi_file = query_audio_file.rsplit(".", 1)[0] + ".mid"

    if query_audio_file.endswith(".mid"):
        query_midi_file = query_audio_file
    else:
        convert_audio_to_midi(query_audio_file, query_midi_file)

    # Process the query MIDI file (Step 1)
    query_notes = process_midi_file(query_midi_file)
    normalized_query_notes = normalize_notes(query_notes)

    # Extract features from the query (Step 2)
    query_atb, query_rtb, query_ftb = extract_features(normalized_query_notes)
    query_combined_features = np.concatenate([query_atb, query_rtb, query_ftb])

    if query_combined_features.size == 0:
        print("No features extracted from the query MIDI file.")
        return []

    # Ensure query_combined_features is 2D
    query_combined_features = query_combined_features.reshape(1, -1)

    # Apply PCA to the query features (Feature Processing)
    query_features_pca = apply_pca(query_combined_features, pca_model)

    # Process the database MIDI files
    database_features_pca = []
    for db_file in database_files:
        # Process database MIDI file (Step 1)
        db_notes = process_midi_file(db_file)
        db_normalized_notes = normalize_notes(db_notes)

        # Extract features from the database MIDI file (Step 2)
        db_atb, db_rtb, db_ftb = extract_features(db_normalized_notes)
        db_combined_features = np.concatenate([db_atb, db_rtb, db_ftb])

        if db_combined_features.size != 0:
            db_combined_features = db_combined_features.reshape(1, -1)
            # Apply PCA to the database features (Feature Processing)
            db_features_pca = apply_pca(db_combined_features, pca_model)
            database_features_pca.append(db_features_pca[0])
        else:
            database_features_pca.append(np.zeros(N_COMPONENTS))

    # Calculate similarities (Step 3)
    similarities = calculate_similarity(query_features_pca[0], database_features_pca)

    # Combine database files with their similarities
    matches = [
        (db_file, similarity)
        for db_file, similarity in zip(database_files, similarities)
        if similarity >= threshold
    ]
    matches.sort(key=lambda x: x[1], reverse=True)

    # Save matches to result directories and JSON
    mir_results = save_matches(matches, mapper, result_dir)

    return mir_results


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
    os.makedirs(midi_dataset_path, exist_ok=True)
    for audio_file in os.listdir(dataset_path):
        if audio_file.endswith((".mid", ".wav", ".mp3", ".flac", ".ogg")):
            audio_file_path = os.path.join(dataset_path, audio_file)
            midi_file_name = audio_file.rsplit(".", 1)[0] + ".mid"
            midi_file_path = os.path.join(midi_dataset_path, midi_file_name)

            if os.path.exists(midi_file_path):
                print(
                    f"MIDI file {midi_file_path} already exists. Skipping conversion."
                )
                continue

            if audio_file.lower().endswith(".mid"):
                # Just copy the existing .mid file
                shutil.copy(audio_file_path, midi_file_path)
                print(f"Copied existing MIDI file to {midi_file_path}")
            else:
                # Convert non-MIDI to MIDI
                try:
                    convert_audio_to_midi(audio_file_path, midi_file_path)
                    print(f"Converted {audio_file_path} to {midi_file_path}")
                except Exception as e:
                    print(f"Error converting {audio_file_path} to MIDI: {e}")


# ====================================================================================
# Step 7: Load and Fit PCA Model
# ====================================================================================


def load_pca_model(midi_dataset_path):
    """
    Load and fit PCA model based on the database MIDI files.
    Returns the fitted PCA model.
    """
    all_features = []
    for midi_file in os.listdir(midi_dataset_path):
        if midi_file.endswith(".mid"):
            midi_file_path = os.path.join(midi_dataset_path, midi_file)
            notes = process_midi_file(midi_file_path)
            normalized_notes = normalize_notes(notes)
            atb, rtb, ftb = extract_features(normalized_notes)
            combined_features = np.concatenate([atb, rtb, ftb])  # Total 638 features
            if combined_features.size != 0:
                all_features.append(combined_features)

    if not all_features:
        print("No features extracted from MIDI files. PCA cannot be applied.")
        return None

    all_features = np.array(all_features)
    pca_model = fit_pca_model(all_features)
    return pca_model


# ====================================================================================
# Entry Point: Main Function
# ====================================================================================


def main():
    dataset_path = "src/backend/database/audio"
    midi_dataset_path = "src/backend/database/midi_audio"
    query_audio_file = "test/query/audio/pop.00099.wav"
    result_dir = "test/result"
    mapper_file = "src/backend/database/mapper_all_img.json"

    # Load the mapper
    try:
        with open(mapper_file, "r") as f:
            mapper = json.load(f)
    except Exception as e:
        print(f"Error loading mapper file {mapper_file}: {e}")
        return

    # Convert dataset to MIDI (only if needed)
    print("Converting dataset audio files to MIDI...")
    convert_dataset_to_midi(dataset_path, midi_dataset_path)

    # Ensure MIDI dataset directory exists
    if not os.path.exists(midi_dataset_path):
        print(
            f"MIDI dataset path {midi_dataset_path} does not exist. Please convert the dataset first."
        )
        return

    # List of MIDI files for querying
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

    # Debug print to check loaded MIDI files
    print(f"Loaded {len(database_files)} MIDI files for querying.")

    # Load and fit PCA model
    pca_model = load_pca_model(midi_dataset_path)
    if pca_model is None:
        print("PCA model could not be loaded. Exiting.")
        return

    # Perform query by humming
    print("Processing query audio and retrieving similar MIDI files...\n")
    mir_results = query_by_humming(
        query_audio_file,
        database_files,
        mapper,
        pca_model,
        threshold=SIMILARITY_THRESHOLD,
        result_dir=result_dir,
    )

    # Print the matches
    if mir_results:
        print(f"\nMatched MIDI Files (Similarity >= {SIMILARITY_THRESHOLD}):")
        for entry in mir_results:
            print(
                f"Rank {entry['similarity_rank']}: {entry['song']['file']} (Similarity: {entry['similarity_score']})"
            )
    else:
        print(f"No matches found with similarity score >= {SIMILARITY_THRESHOLD}.")


if __name__ == "__main__":
    main()
