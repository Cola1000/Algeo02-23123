import numpy as np
import pretty_midi
import librosa


def convert_audio_to_midi(audio_file, midi_file):
    """
    Convert an audio file to a MIDI file using librosa and PrettyMIDI.

    Parameters:
    audio_file (str): Path to the input audio file.
    midi_file (str): Path to the output MIDI file.
    """
    try:
        # Load the audio file
        y, sr = librosa.load(audio_file, sr=None)
    except Exception as e:
        print(f"Error loading audio file {audio_file}: {e}")
        return

    try:
        # Extract pitch and onset information
        pitches, magnitudes = librosa.core.piptrack(y=y, sr=sr)
        onsets = librosa.onset.onset_detect(y=y, sr=sr, units="time")

        # Create a PrettyMIDI object
        midi = pretty_midi.PrettyMIDI()
        instrument = pretty_midi.Instrument(program=0)

        # Create MIDI notes from the detected pitches and onsets
        for i, onset in enumerate(onsets):
            onset_frame = librosa.time_to_frames(onset, sr=sr)
            pitch = np.median(pitches[:, onset_frame])
            if pitch > 0:
                start_time = onset
                if i < len(onsets) - 1:
                    end_time = onsets[i + 1]
                else:
                    end_time = (
                        start_time + 0.5
                    )  # Set a default duration for the last note
                note = pretty_midi.Note(
                    velocity=100, pitch=int(pitch), start=start_time, end=end_time
                )
                instrument.notes.append(note)

        midi.instruments.append(instrument)

        # Write the MIDI file
        midi.write(midi_file)
        print(f"Successfully converted {audio_file} to {midi_file}")
    except Exception as e:
        print(f"Error converting {audio_file} to MIDI: {e}")


if __name__ == "__main__":
    audio_file = "test/query/audio/pop.00099.wav"
    midi_file = "test/query/audio/pop.00099.mid"
    convert_audio_to_midi(audio_file, midi_file)
