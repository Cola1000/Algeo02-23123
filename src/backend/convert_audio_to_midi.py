import os
from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH
import librosa
import soundfile as sf


def convert_audio_to_midi(audio_file, midi_file):
    """
    Convert an audio file to a MIDI file using basic_pitch.

    Parameters:
    audio_file (str): Path to the input audio file.
    midi_file (str): Path to the output MIDI file.
    """
    try:
        # Load the audio file using librosa to handle various formats
        y, sr = librosa.load(audio_file, sr=None)
        temp_wav_file = audio_file.rsplit(".", 1)[0] + "_temp.wav"
        sf.write(temp_wav_file, y, sr)

        output_directory = os.path.dirname(midi_file)
        predict_and_save(
            audio_path_list=[temp_wav_file],
            output_directory=output_directory,
            save_midi=True,
            sonify_midi=False,
            save_model_outputs=False,
            save_notes=False,
            model_or_model_path=ICASSP_2022_MODEL_PATH,
        )

        # Rename the output file to match the original file name
        base_name = os.path.basename(audio_file).rsplit(".", 1)[0] + "_temp_basic_pitch.mid"
        output_path = os.path.join(output_directory, base_name)

        # Process validation
        if os.path.exists(output_path):
            os.rename(output_path, midi_file)
            print(f"Successfully converted {audio_file} to {midi_file}")
        else:
            print(f"Error: Expected output file {output_path} not found.")

        # Remove the temporary WAV file
        os.remove(temp_wav_file)
    except Exception as e:
        print(f"Error converting {audio_file} to MIDI: {e}")


if __name__ == "__main__":
    audio_file = "test/query/audio/pop.00099.wav"
    midi_file = audio_file.rsplit(".", 1)[0] + ".mid"
    convert_audio_to_midi(audio_file, midi_file)
