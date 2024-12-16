# src/backend/utils/database_parser.py

import os
import shutil
import zipfile
import rarfile  # Requires 'rarfile' package and 'unrar' utility installed
import json
from typing import List
from fastapi import UploadFile
from pathlib import Path
import tempfile
import logging
import numpy as np
from PIL import Image  # For image validation
from backend.APF2 import *

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

# Processed Data Directory and Files
PROCESSED_DATA_DIR = BASE_DIR / "database" / "processed_data"
IMAGE_DB_PROJECTION_FILE = PROCESSED_DATA_DIR / "image_db_projection.npz"
MEAN_FILE = PROCESSED_DATA_DIR / "mean.npy"
PRINCIPAL_COMPONENTS_FILE = PROCESSED_DATA_DIR / "principal_components.npy"
ORIGINAL_IMAGE_PATHS_FILE = PROCESSED_DATA_DIR / "original_image_paths.npy"

# Ensure the directories exist
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
PICTURE_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

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
    Extracts a given archive file to the specified directory.
    Supports .zip and .rar formats.
    """
    try:
        if file_path.suffix.lower() == ".zip":
            with zipfile.ZipFile(file_path, "r") as zip_ref:
                zip_ref.extractall(extract_to)
        elif file_path.suffix.lower() == ".rar":
            with rarfile.RarFile(file_path) as rar_ref:
                rar_ref.extractall(extract_to)
        else:
            logger.warning(f"Unsupported archive format: {file_path.suffix}")
            return
        logger.info(f"Extracted {file_path.name} to {extract_to}")
    except rarfile.NeedFirstVolume:
        logger.error(
            f"Failed to extract {file_path.name}: Need first volume of multi-part archive."
        )
    except Exception as e:
        logger.error(f"Failed to extract {file_path.name}: {e}")

    # Remove '._' resource fork files after extraction
    for root, _, files in os.walk(extract_to):
        for name in files:
            if name.startswith("._"):
                resource_file = Path(root) / name
                try:
                    resource_file.unlink()
                    logger.info(f"Deleted resource file: {resource_file}")
                except Exception as e:
                    logger.error(f"Failed to delete {resource_file}. Reason: {e}")


def validate_image(file_path: Path) -> bool:
    """
    Validates if the file is a valid image.
    """
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except Exception:
        return False


def process_file(file_path: Path, audio_dir: Path, picture_dir: Path) -> None:
    """
    Processes a single file: saves audio/image or extracts archives.
    Skips macOS resource fork files prefixed with '._' and invalid images.
    """
    # Skip macOS resource fork files
    if file_path.name.startswith("._"):
        logger.warning(f"Skipping resource file: {file_path.name}")
        return

    if is_audio_file(file_path):
        shutil.move(str(file_path), audio_dir / file_path.name)
        logger.info(f"Moved audio file {file_path.name} to {audio_dir}")
    elif is_image_file(file_path):
        if validate_image(file_path):
            shutil.move(str(file_path), picture_dir / file_path.name)
            logger.info(f"Moved image file {file_path.name} to {picture_dir}")
        else:
            logger.error(f"Invalid image file skipped: {file_path.name}")
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


async def parse_uploaded_database(uploaded_files: List[UploadFile]) -> None:
    """
    Parses the uploaded database zip files.
    Clears existing audio and picture directories before processing.

    Parameters:
    - uploaded_files: List of UploadFile objects uploaded by the user.
    """
    # Clear existing contents of audio and picture directories
    logger.info("Clearing existing contents of audio and picture directories.")
    clear_directory(AUDIO_DIR)
    clear_directory(PICTURE_DIR)

    # Create a temporary directory to store uploaded zip files
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        for file in uploaded_files:
            # Save each zip file to the temporary directory
            save_file(file, temp_path)

        # Process each zip file
        for root, _, files in os.walk(temp_path):
            for name in files:
                file_path = Path(root) / name
                logger.info(f"Processing uploaded file: {file_path.name}")
                process_file(file_path, AUDIO_DIR, PICTURE_DIR)

    logger.info("Finished parsing uploaded database.")


async def process_database(
    db_dir_path: str,
    mapper_file: str,
    process_db: bool = True,
    size: tuple = (60, 60),
    threshold: float = 0.95,
):
    """
    Processes the uploaded database.

    Parameters:
    - db_dir_path (str): Path to the picture directory.
    - mapper_file (str): Path to the mapper JSON file.
    - process_db (bool): Whether to process the database or load existing projections.
    - size (tuple): Image size for processing.
    - threshold (float): Variance threshold for selecting principal components.
    """
    IMAGE_DB_PROJECTION_FILE = PROCESSED_DATA_DIR / "image_db_projection.npz"
    MEAN_FILE = PROCESSED_DATA_DIR / "mean.npy"
    PRINCIPAL_COMPONENTS_FILE = PROCESSED_DATA_DIR / "principal_components.npy"
    ORIGINAL_IMAGE_PATHS_FILE = PROCESSED_DATA_DIR / "original_image_paths.npy"

    if not process_db and IMAGE_DB_PROJECTION_FILE.exists():
        logger.info("Loading existing database projections...")
        data = np.load(IMAGE_DB_PROJECTION_FILE)
        imageDB_projection = data["imageDB_projection"]
        mean = np.load(MEAN_FILE)
        principal_components = np.load(PRINCIPAL_COMPONENTS_FILE)
        original_image_paths = np.load(
            ORIGINAL_IMAGE_PATHS_FILE, allow_pickle=True
        ).tolist()
    else:
        logger.info("Processing database images...")
        # Load and preprocess database images
        imageDB, original_image_paths = load_image_database(db_dir_path, size)
        if imageDB.size == 0:
            logger.error("No images loaded.")
            return

        # Standardize the data
        imageDB_centered, mean = standardize_data(imageDB)

        # Compute the covariance matrix
        covariance_matrix = compute_covariance_matrix(imageDB_centered)

        # Perform SVD
        U, S, Vt = perform_svd(covariance_matrix)

        # Select the principal components
        principal_components = select_principal_components(U, S, threshold)

        # Project imageDB_centered onto the principal components
        imageDB_projection = project_data(imageDB_centered, principal_components)

        # Save the data
        os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
        np.savez_compressed(
            IMAGE_DB_PROJECTION_FILE, imageDB_projection=imageDB_projection
        )
        np.save(MEAN_FILE, mean)
        np.save(PRINCIPAL_COMPONENTS_FILE, principal_components)
        np.save(ORIGINAL_IMAGE_PATHS_FILE, original_image_paths)
        logger.info("Database processing complete and data saved.")

    # Additional processing can be done here if needed
    # For example, handling queries or further analysis

    return imageDB_projection, mean, principal_components, original_image_paths
