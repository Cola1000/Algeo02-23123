import os
import random
import json


def create_mapper(audio_base_dir, picture_dir):
    # Get list of picture files
    picture_files = [
        f for f in os.listdir(picture_dir) if f.endswith((".png", ".jpg", ".jpeg"))
    ]

    # Get list of all audio files and their genres
    audio_files = []
    for genre in os.listdir(audio_base_dir):
        genre_dir = os.path.join(audio_base_dir, genre)
        if not os.path.isdir(genre_dir):
            continue
        for audio_file in os.listdir(genre_dir):
            if audio_file.endswith((".wav", ".mp3", ".flac", ".ogg")):
                audio_files.append((genre, audio_file))

    # Shuffle the lists to ensure randomness
    random.shuffle(audio_files)
    random.shuffle(picture_files)

    # Create the mapper
    mapper = []
    picture_index = 0
    picture_song_map = {pic: [] for pic in picture_files}
    assigned_songs = set()

    for genre, audio_file in audio_files:
        # Ensure each song is mapped only once
        if audio_file in assigned_songs:
            continue

        # Assign a picture to each song
        pic_name = picture_files[picture_index]

        # Ensure each song is unique for a picture
        while audio_file in picture_song_map[pic_name]:
            picture_index += 1
            if picture_index >= len(picture_files):
                random.shuffle(picture_files)
                picture_index = 0
            pic_name = picture_files[picture_index]

        picture_song_map[pic_name].append(audio_file)
        assigned_songs.add(audio_file)
        picture_index += 1

        # If we run out of pictures, reshuffle the pictures and start over
        if picture_index >= len(picture_files):
            random.shuffle(picture_files)
            picture_index = 0

        mapper.append({"genre": genre, "audio_file": audio_file, "pic_name": pic_name})

    return mapper


def create_album_structure(mapper):
    album_structure = []
    album_id = 1
    picture_album_map = {}

    for entry in mapper:
        pic_name = entry["pic_name"]
        audio_file = entry["audio_file"]

        if pic_name not in picture_album_map:
            picture_album_map[pic_name] = {
                "id": album_id,
                "title": f"Album {album_id}",
                "imageSrc": f"src/backend/database/picture/{pic_name}",
                "songs": [],
            }
            album_id += 1

        album = picture_album_map[pic_name]
        song_id = f"{album['id']}_{len(album['songs']) + 1}"
        album["songs"].append({"id": song_id, "file": audio_file})

    album_structure = list(picture_album_map.values())
    return album_structure


def create_mapper_multiple_images(audio_base_dir, picture_dir):
    # Get list of picture files
    picture_files = [
        f for f in os.listdir(picture_dir) if f.endswith((".png", ".jpg", ".jpeg"))
    ]

    # Get list of all audio files
    audio_files = []
    for genre in os.listdir(audio_base_dir):
        genre_dir = os.path.join(audio_base_dir, genre)
        if not os.path.isdir(genre_dir):
            continue
        for audio_file in os.listdir(genre_dir):
            if audio_file.endswith((".wav", ".mp3", ".flac", ".ogg")):
                audio_files.append((genre, audio_file))

    # Shuffle the lists to ensure randomness
    random.shuffle(audio_files)
    random.shuffle(picture_files)

    # Create the mapper
    mapper = []
    picture_index = 0
    song_index = 0
    num_songs = len(audio_files)
    num_pictures = len(picture_files)
    pictures_per_song = num_pictures // num_songs

    for pic_name in picture_files:
        genre, audio_file = audio_files[song_index]
        mapper.append({"genre": genre, "audio_file": audio_file, "pic_name": pic_name})

        picture_index += 1
        if picture_index % pictures_per_song == 0:
            song_index += 1
            if song_index >= num_songs:
                song_index = 0

    return mapper


def create_album_structure_multiple_images(mapper):
    album_structure = []
    album_id = 1
    picture_album_map = {}

    for entry in mapper:
        pic_name = entry["pic_name"]
        audio_file = entry["audio_file"]

        if pic_name not in picture_album_map:
            picture_album_map[pic_name] = {
                "id": album_id,
                "title": f"Album {album_id}",
                "imageSrc": f"src/backend/database/picture/{pic_name}",
                "songs": [],
            }
            album_id += 1

        album = picture_album_map[pic_name]
        song_id = f"{album['id']}_{len(album['songs']) + 1}"
        album["songs"].append({"id": song_id, "file": audio_file})

    album_structure = list(picture_album_map.values())
    return album_structure


def save_json(data, output_file):
    with open(output_file, "w") as f:
        json.dump(data, f, indent=4)
    print(f"Data saved to {output_file}")


if __name__ == "__main__":
    audio_base_dir = "src/backend/database/audio"
    picture_dir = "src/backend/database/picture"
    mapper_output_file = "src/backend/database/mapper.json"
    mapper_multiple_images_output_file = (
        "src/backend/database/mapper_multiple_images.json"
    )

    # Create the mapper
    mapper = create_mapper(audio_base_dir, picture_dir)

    # Create the album structure
    album_structure = create_album_structure(mapper)

    # Save the album structure to the mapper JSON file
    save_json(album_structure, mapper_output_file)

    # Create the mapper with multiple images per song
    mapper_multiple_images = create_mapper_multiple_images(audio_base_dir, picture_dir)

    # Create the album structure with multiple images per song
    album_structure_multiple_images = create_album_structure_multiple_images(
        mapper_multiple_images
    )

    # Save the album structure with multiple images per song to the mapper JSON file
    save_json(album_structure_multiple_images, mapper_multiple_images_output_file)
