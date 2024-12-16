import os
import shutil
import zipfile
import rarfile
from typing import List
from fastapi import UploadFile
from pathlib import Path
import tempfile
import logging

# ====================================================================================
# Setup Logging
# ====================================================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ====================================================================================
# Constants
# ====================================================================================

# Define supported file extensions
AUDIO_EXTENSIONS = {".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a", ".wma"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"}
ARCHIVE_EXTENSIONS = {".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"}

# Define backend database directories
BASE_DIR = Path(__file__).resolve().parent.parent  # Points to 'backend/'
AUDIO_DIR = BASE_DIR / "database" / "audio"
PICTURE_DIR = BASE_DIR / "database" / "picture"

# Ensure the directories exist
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
PICTURE_DIR.mkdir(parents=True, exist_ok=True)

# ====================================================================================
# Utility Functions
# ====================================================================================


def is_audio_file(file_path: Path) -> bool:
    return file_path.suffix.lower() in AUDIO_EXTENSIONS


def is_image_file(file_path: Path) -> bool:
    return file_path.suffix.lower() in IMAGE_EXTENSIONS


def is_archive_file(file_path: Path) -> bool:
    return file_path.suffix.lower() in ARCHIVE_EXTENSIONS


def clear_directory(directory: Path) -> None:
    """
    Removes all files and subdirectories in the specified directory.
    """
    if not directory.exists():
        logger.warning(f"Directory {directory} does not exist. Creating it.")
        directory.mkdir(parents=True, exist_ok=True)
        return

    for item in directory.iterdir():
        try:
            if item.is_file() or item.is_symlink():
                item.unlink()
                logger.info(f"Deleted file: {item}")
            elif item.is_dir():
                shutil.rmtree(item)
                logger.info(f"Deleted directory and its contents: {item}")
        except Exception as e:
            logger.error(f"Failed to delete {item}. Reason: {e}")


def save_file(file: UploadFile, destination_dir: Path) -> None:
    """
    Saves an uploaded file to the specified directory.
    """
    destination_path = destination_dir / file.filename
    with destination_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    logger.info(f"Saved file {file.filename} to {destination_dir}")
    file.file.close()


def extract_archive(file_path: Path, extract_to: Path) -> None:
    """
    Extracts an archive file to the specified directory.
    Supports .zip and .rar formats.
    """
    if file_path.suffix.lower() == ".zip":
        try:
            with zipfile.ZipFile(file_path, "r") as zip_ref:
                zip_ref.extractall(extract_to)
            logger.info(f"Extracted {file_path.name} to {extract_to}")
        except zipfile.BadZipFile:
            logger.error(f"Failed to extract {file_path.name}: Bad ZIP file.")
    elif file_path.suffix.lower() == ".rar":
        try:
            with rarfile.RarFile(file_path, "r") as rar_ref:
                rar_ref.extractall(extract_to)
            logger.info(f"Extracted {file_path.name} to {extract_to}")
        except rarfile.BadRarFile:
            logger.error(
                f"Failed to extract {file_path.name}: Bad RAR file or 'unrar' not installed."
            )
        except rarfile.NeedFirstVolume:
            logger.error(
                f"Failed to extract {file_path.name}: Need first volume of multi-part archive."
            )
    else:
        logger.warning(f"Unsupported archive format: {file_path.suffix}")


def process_file(file_path: Path, audio_dir: Path, picture_dir: Path) -> None:
    """
    Processes a single file: saves audio/image or extracts archives.
    """
    if is_audio_file(file_path):
        shutil.move(str(file_path), audio_dir / file_path.name)
        logger.info(f"Moved audio file {file_path.name} to {audio_dir}")
    elif is_image_file(file_path):
        shutil.move(str(file_path), picture_dir / file_path.name)
        logger.info(f"Moved image file {file_path.name} to {picture_dir}")
    elif is_archive_file(file_path):
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            extract_archive(file_path, temp_path)
            # Recursively process extracted files
            for root, _, files in os.walk(temp_path):
                for name in files:
                    extracted_file = Path(root) / name
                    process_file(extracted_file, audio_dir, picture_dir)
    else:
        logger.warning(f"Unsupported file type: {file_path.name}")


def parse_uploaded_database(
    uploaded_files: List[UploadFile], overwrite: bool = False
) -> None:
    """
    Parses the uploaded database files.

    Parameters:
    - uploaded_files: List of UploadFile objects uploaded by the user.
    - overwrite: If True, existing files with the same name will be overwritten.
                 If False, files will be skipped if they already exist.
    """
    # Clear existing contents of audio and picture directories
    logger.info("Clearing existing contents of audio and picture directories.")
    clear_directory(AUDIO_DIR)
    clear_directory(PICTURE_DIR)

    # Create a temporary directory to store uploaded files
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        for file in uploaded_files:
            # Save the uploaded file to the temporary directory
            save_file(file, temp_path)

        # Process each file in the temporary directory
        for root, _, files in os.walk(temp_path):
            for name in files:
                file_path = Path(root) / name
                process_file(file_path, AUDIO_DIR, PICTURE_DIR)

    logger.info("Finished parsing uploaded database.")


# ====================================================================================
# Example Usage
# ====================================================================================

if __name__ == "__main__":
    # Example: Simulate uploading files using FastAPI's UploadFile
    import io
    from fastapi import UploadFile
    from typing import List

    def create_upload_file(filename: str, content: bytes) -> UploadFile:
        """
        Helper function to create a mock UploadFile.
        """
        file = UploadFile(filename=filename, file=io.BytesIO(content))
        return file

    # Simulate uploaded files
    uploaded = [
        create_upload_file("song1.mp3", b"Fake audio content"),
        create_upload_file("image1.jpg", b"Fake image content"),
        create_upload_file("archive1.zip", b"Fake zip content"),
        create_upload_file("document.pdf", b"Fake document content"),  # Unsupported
    ]

    # Parse the uploaded database
    parse_uploaded_database(uploaded, overwrite=False)
