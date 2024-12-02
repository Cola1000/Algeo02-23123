import os
import numpy as np
import pretty_midi
import librosa
import soundfile as sf
from convert_audio_to_midi import convert_audio_to_midi


def custom_linspace(start, stop, num):
    samples = []
    step = (stop - start) / (num - 1)
    for i in range(num):
        samples.append(start + i * step)
    return samples


def calculate_histogram(data, bins, value_range):
    hist = [0] * bins
    bin_edges = custom_linspace(value_range[0], value_range[1], bins + 1)
    for value in data:
        for i in range(bins):
            if bin_edges[i] <= value < bin_edges[i + 1]:
                hist[i] += 1
                break
        if value == value_range[1]:
            hist[-1] += 1
    return hist, bin_edges


def load_midi(file_path, target_channel=0):
    midi_data = pretty_midi.PrettyMIDI(file_path)
    for instrument in midi_data.instruments:
        if not instrument.is_drum:
            return instrument.notes
    raise ValueError(f"No non-drum instrument found in the MIDI file {file_path}")


def windowing(notes, window_size=40, step_size=8):
    windows = []
    for i in range(0, len(notes) - window_size + 1, step_size):
        windows.append(notes[i : i + window_size])
    return windows


def normalize_tempo_pitch(notes):
    pitches = np.array([note.pitch for note in notes])
    mean_pitch = np.mean(pitches)
    std_pitch = np.std(pitches)
    normalized_pitches = (pitches - mean_pitch) / std_pitch
    return normalized_pitches


def normalize_histogram(hist):
    total = np.sum(hist)
    if total > 0:
        return hist / total
    return hist


def extract_features(notes):
    pitches = normalize_tempo_pitch(notes)
    atb_hist, _ = calculate_histogram(pitches, bins=128, value_range=(0, 127))
    atb_hist = normalize_histogram(atb_hist)
    intervals = np.diff(pitches)
    rtb_hist, _ = calculate_histogram(intervals, bins=255, value_range=(-127, 127))
    rtb_hist = normalize_histogram(rtb_hist)
    first_tone_diff = pitches - pitches[0]
    ftb_hist, _ = calculate_histogram(
        first_tone_diff, bins=255, value_range=(-127, 127)
    )
    ftb_hist = normalize_histogram(ftb_hist)
    return atb_hist, rtb_hist, ftb_hist


def dot_product(vec1, vec2):
    return sum(x * y for x, y in zip(vec1, vec2))


def norm(vec):
    return sum(x * x for x in vec) ** 0.5


def cosine_similarity(vec1, vec2):
    dot_prod = dot_product(vec1, vec2)
    norm_vec1 = norm(vec1)
    norm_vec2 = norm(vec2)
    if norm_vec1 == 0 or norm_vec2 == 0:
        return 0
    return dot_prod / (norm_vec1 * norm_vec2)


def query_by_humming(
    query_audio_file,
    database_files,
    window_size=40,
    step_size=8,
    threshold=0.8,
    result_dir="test/result/audio",
):
    query_midi_file = query_audio_file.replace(".wav", ".mid")
    convert_audio_to_midi(query_audio_file, query_midi_file)

    query_notes = load_midi(query_midi_file, target_channel=0)
    query_windows = windowing(query_notes, window_size=window_size, step_size=step_size)

    query_features = []
    for window in query_windows:
        query_features.append(extract_features(window))

    matches = []

    for db_file in database_files:
        db_notes = load_midi(db_file, target_channel=0)
        db_windows = windowing(db_notes, window_size=window_size, step_size=step_size)

        for window in db_windows:
            db_features = extract_features(window)
            for qf in query_features:
                similarity = cosine_similarity(
                    np.concatenate(qf), np.concatenate(db_features)
                )
                if similarity >= threshold:
                    matches.append((db_file, similarity))

    matches.sort(key=lambda x: x[1], reverse=True)

    os.makedirs(result_dir, exist_ok=True)
    for rank, (match, similarity) in enumerate(matches, start=1):
        match_filename = os.path.join(result_dir, f"{rank}.mid")
        os.rename(match, match_filename)

    return matches


dataset_path = "/Users/Agung/Documents/wiwekaputera/ITB/semester-3/algeo/HatsuneMix-ue-/src/backend/database/audio"
midi_dataset_path = "/Users/Agung/Documents/wiwekaputera/ITB/semester-3/algeo/HatsuneMix-ue-/src/backend/database/midi_audio"

# for genre_folder in os.listdir(dataset_path):
#     genre_folder_path = os.path.join(dataset_path, genre_folder)
#     midi_genre_folder_path = os.path.join(midi_dataset_path, genre_folder)
#     os.makedirs(midi_genre_folder_path, exist_ok=True)
#     for audio_file in os.listdir(genre_folder_path):
#         if audio_file.endswith(".wav"):
#             audio_file_path = os.path.join(genre_folder_path, audio_file)
#             midi_file_path = os.path.join(
#                 midi_genre_folder_path, audio_file.replace(".wav", ".mid")
#             )
#             convert_audio_to_midi(audio_file_path, midi_file_path)

database_files = [
    os.path.join(dp, f)
    for dp, dn, filenames in os.walk(midi_dataset_path)
    for f in filenames
    if f.endswith(".mid")
]

query_audio_file = "/Users/Agung/Documents/wiwekaputera/ITB/semester-3/algeo/HatsuneMix-ue-/test/query/audio/pop.00099.wav"

matches = query_by_humming(
    query_audio_file, database_files, window_size=40, step_size=8, threshold=0.8
)

for match, similarity in matches:
    print(f"Match: {match} with similarity: {similarity}")
