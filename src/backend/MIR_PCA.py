import os
import numpy as np
import shutil
from music21 import converter
from backend.utils.convert_audio_to_midi import convert_audio_to_midi
import json

# Constants
MIDI_MIN = 0
MIDI_MAX = 127
N_COMPONENTS = 20  # Number of principal components for PCA

# --------------------------------------------------------------------------------------------------
# Step 1: Audio Processing
# --------------------------------------------------------------------------------------------------


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


# --------------------------------------------------------------------------------------------------
# Step 2: Feature Extraction
# --------------------------------------------------------------------------------------------------


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


# --------------------------------------------------------------------------------------------------
# Additional: Feature Processing (Dimensionality Reduction using PCA)
# --------------------------------------------------------------------------------------------------


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


# --------------------------------------------------------------------------------------------------
# Step 3: Similarity Calculation
# --------------------------------------------------------------------------------------------------


def cosine_similarity_metric(vector1, vector2):
    """
    Calculate cosine similarity between two vectors.

    Formula:
    cos(θ) = (A ⋅ B) / (||A|| * ||B||)
    Where A and B are the vectors.
    """
    dot_product = np.dot(vector1, vector2)
    norm1 = np.linalg.norm(vector1)
    norm2 = np.linalg.norm(vector2)
    if norm1 == 0 or norm2 == 0:
        return 0
    return dot_product / (norm1 * norm2)


def calculate_similarity(query_features, database_features):
    """
    Compare query features with database features using cosine similarity.
    """
    similarities = []
    for db_feature in database_features:
        similarity = cosine_similarity_metric(query_features, db_feature)
        similarities.append(similarity)
    return similarities


# --------------------------------------------------------------------------------------------------
# Additional Utility Functions
# --------------------------------------------------------------------------------------------------


def save_matches(matches, mapper, result_dir):
    """
    Save the matched audio files and album images to the result directory.
    """
    result_audio_dir = os.path.join(result_dir, "audio")
    result_picture_dir = os.path.join(result_dir, "picture")
    os.makedirs(result_audio_dir, exist_ok=True)
    os.makedirs(result_picture_dir, exist_ok=True)

    # Empty the destination folders before saving new files
    for folder in [result_audio_dir, result_picture_dir]:
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")

    for rank, (match, similarity) in enumerate(matches, start=1):
        # Find the corresponding audio file and image
        found = False
        for album in mapper:
            for song in album["songs"]:
                if (
                    song["file"].rsplit(".", 1)[0]
                    == os.path.basename(match).rsplit(".", 1)[0]
                ):
                    audio_file_path = os.path.join(
                        "src/backend/database/audio", song["file"]
                    )
                    if not os.path.exists(audio_file_path):
                        print(f"Audio file {audio_file_path} does not exist.")
                        continue
                    destination_audio_path = os.path.join(
                        result_audio_dir, f"{rank}_{os.path.basename(song['file'])}"
                    )
                    shutil.copy(audio_file_path, destination_audio_path)
                    print(f"Copied {audio_file_path} to {destination_audio_path}")

                    # Save the corresponding album image
                    image_src = album["imageSrc"]
                    if not os.path.exists(image_src):
                        print(f"Image file {image_src} does not exist.")
                        continue
                    destination_image_path = os.path.join(
                        result_picture_dir, f"{rank}.jpg"
                    )
                    shutil.copy(image_src, destination_image_path)
                    print(f"Copied {image_src} to {destination_image_path}")
                    found = True
                    break  # Exit the inner loop if match is found
            if found:
                break  # Exit the outer loop if match is found


def convert_dataset_to_midi(dataset_path, midi_dataset_path):
    """
    Convert all audio files in the dataset to MIDI and save them in the MIDI dataset path.
    This function should be called only when a new dataset is added.
    """
    os.makedirs(midi_dataset_path, exist_ok=True)
    for audio_file in os.listdir(dataset_path):
        if audio_file.endswith((".wav", ".mp3", ".flac", ".ogg")):
            audio_file_path = os.path.join(dataset_path, audio_file)
            midi_file_name = audio_file.rsplit(".", 1)[0] + ".mid"
            midi_file_path = os.path.join(midi_dataset_path, midi_file_name)
            if os.path.exists(midi_file_path):
                print(
                    f"MIDI file already exists for {audio_file_path}, skipping conversion."
                )
                continue
            try:
                convert_audio_to_midi(audio_file_path, midi_file_path)
                print(f"Converted {audio_file_path} to {midi_file_path}")
            except Exception as e:
                print(f"Error converting {audio_file_path} to MIDI: {e}")


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


# --------------------------------------------------------------------------------------------------
# Overall Process Function: Query by Humming
# --------------------------------------------------------------------------------------------------


def query_by_humming(
    query_audio_file,
    database_files,
    mapper,
    pca_model,
    threshold=0.8,
    result_dir="test/result",
):
    """
    Perform the query by humming process:
    - Convert the query audio file to MIDI.
    - Process the query MIDI file to extract notes (Step 1).
    - Normalize the notes (Step 1).
    - Extract features from the query (Step 2).
    - Apply PCA to the query features (Feature Processing).
    - Process the database MIDI files similarly.
    - Calculate similarities between the query and database features (Step 3).
    - Save the matches that exceed the similarity threshold.
    """
    # Convert query audio file to MIDI
    try:
        query_midi_file = query_audio_file.rsplit(".", 1)[0] + ".mid"
        convert_audio_to_midi(query_audio_file, query_midi_file)
    except Exception as e:
        print(f"Error converting {query_audio_file} to MIDI: {e}")
        return []

    # Process the query MIDI file (Step 1)
    query_notes = process_midi_file(query_midi_file)
    normalized_query_notes = normalize_notes(query_notes)

    # Extract features from the query (Step 2)
    query_atb, query_rtb, query_ftb = extract_features(normalized_query_notes)
    query_combined_features = np.concatenate(
        [query_atb, query_rtb, query_ftb]
    )  # Total 638 features

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
        db_combined_features = np.concatenate(
            [db_atb, db_rtb, db_ftb]
        )  # Total 638 features

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

    # Save matches to result directories
    save_matches(matches, mapper, result_dir)

    return matches


# --------------------------------------------------------------------------------------------------
# Entry Point: Main Function
# --------------------------------------------------------------------------------------------------


def main():
    dataset_path = "src/backend/database/audio"
    midi_dataset_path = "src/backend/database/midi_audio"
    query_audio_file = "test/query/audio/Cogitation of Epochs.mp3"
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
    # Uncomment the following line when adding a new dataset
    # convert_dataset_to_midi(dataset_path, midi_dataset_path)

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
    matches = query_by_humming(
        query_audio_file,
        database_files,
        mapper,
        pca_model,
        threshold=0.85,
        result_dir=result_dir,
    )

    # Print the matches
    if matches:
        print("\nTop Matches:")
        for match, similarity in matches:
            print(f"Match: {match} with similarity: {similarity:.4f}")
    else:
        print("No matches found.")


if __name__ == "__main__":
    main()
