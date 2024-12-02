import os
import numpy as np
from music21 import converter
from convert_audio_to_midi import convert_audio_to_midi

# Constants
MIDI_MIN = 0
MIDI_MAX = 127


def process_midi_file(midi_file_path):
    """
    Process a MIDI file: Extract note pitches and durations.
    """
    score = converter.parse(midi_file_path)
    notes = []

    for element in score.flatten().notes:
        if element.isNote:
            notes.append(element.pitch.midi)
        elif element.isChord:
            notes.extend(p.midi for p in element.pitches)

    return notes


def normalize_notes(notes):
    """
    Normalize pitch values using mean and standard deviation.
    """
    if not notes:
        return []
    mean_pitch = np.mean(notes)
    std_pitch = np.std(notes)
    normalized_notes = [(note - mean_pitch) / std_pitch for note in notes]
    return normalized_notes


def extract_features(notes):
    """
    Extract features: ATB, RTB, FTB.
    """
    if not notes:
        return np.zeros(128), np.zeros(255), np.zeros(255)

    atb = np.histogram(notes, bins=range(MIDI_MIN, MIDI_MAX + 2), density=True)[0]
    intervals = np.diff(notes)
    rtb = np.histogram(intervals, bins=range(-MIDI_MAX, MIDI_MAX + 2), density=True)[0]
    first_note = notes[0]
    ftb_intervals = [note - first_note for note in notes]
    ftb = np.histogram(
        ftb_intervals, bins=range(-MIDI_MAX, MIDI_MAX + 2), density=True
    )[0]
    return atb, rtb, ftb


def cosine_similarity(vector1, vector2):
    """
    Calculate cosine similarity between two vectors.
    """
    dot_product = np.dot(vector1, vector2)
    norm1 = np.linalg.norm(vector1)
    norm2 = np.linalg.norm(vector2)
    return dot_product / (norm1 * norm2) if norm1 != 0 and norm2 != 0 else 0


def calculate_similarity(query_features, database_features):
    """
    Compare query features with database features using cosine similarity.
    """
    similarities = []
    for db_features in database_features:
        weighted_similarity = sum(
            cosine_similarity(query_feature, db_feature) * weight
            for query_feature, db_feature, weight in zip(
                query_features, db_features, [0.4, 0.4, 0.2]
            )
        )
        similarities.append(weighted_similarity)
    return similarities


def query_by_humming(
    query_audio_file, database_files, threshold=0.8, result_dir="test/result/audio"
):
    """
    Find all matching MIDI files in the database for a given query audio file with a similarity score of 80% or higher.
    """
    query_midi_file = query_audio_file.replace(".wav", ".mid")
    convert_audio_to_midi(query_audio_file, query_midi_file)

    query_notes = process_midi_file(query_midi_file)
    normalized_query_notes = normalize_notes(query_notes)
    query_features = extract_features(normalized_query_notes)

    database_features = []
    for db_file in database_files:
        db_notes = process_midi_file(db_file)
        normalized_db_notes = normalize_notes(db_notes)
        database_features.append(extract_features(normalized_db_notes))

    similarities = calculate_similarity(query_features, database_features)

    matches = [
        (db_file, similarity)
        for db_file, similarity in zip(database_files, similarities)
        if similarity >= threshold
    ]
    matches.sort(key=lambda x: x[1], reverse=True)

    os.makedirs(result_dir, exist_ok=True)
    for rank, (match, similarity) in enumerate(matches, start=1):
        match_filename = os.path.join(result_dir, f"{rank}.mid")
        os.rename(match, match_filename)

    return matches


dataset_path = "/Users/Agung/Documents/wiwekaputera/ITB/semester-3/algeo/HatsuneMix-ue-/src/backend/database/audio"
midi_dataset_path = "/Users/Agung/Documents/wiwekaputera/ITB/semester-3/algeo/HatsuneMix-ue-/src/backend/database/midi_audio"

for genre_folder in os.listdir(dataset_path):
    genre_folder_path = os.path.join(dataset_path, genre_folder)
    if not os.path.isdir(genre_folder_path):
        continue
    midi_genre_folder_path = os.path.join(midi_dataset_path, genre_folder)
    os.makedirs(midi_genre_folder_path, exist_ok=True)
    for audio_file in os.listdir(genre_folder_path):
        if audio_file.endswith(".wav"):
            audio_file_path = os.path.join(genre_folder_path, audio_file)
            midi_file_path = os.path.join(
                midi_genre_folder_path, audio_file.replace(".wav", ".mid")
            )
            convert_audio_to_midi(audio_file_path, midi_file_path)

database_files = [
    os.path.join(dp, f)
    for dp, dn, filenames in os.walk(midi_dataset_path)
    for f in filenames
    if f.endswith(".mid")
]

query_audio_file = "test/query/audio/Cogitation of Epochs.mp3"

matches = query_by_humming(query_audio_file, database_files, threshold=0.95)

for match, similarity in matches:
    print(f"Match: {match} with similarity: {similarity}")
