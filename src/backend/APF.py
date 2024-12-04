import os
import glob
import numpy as np
from PIL import Image, ImageOps, ImageEnhance
import shutil
import json


# Step 1: Image Processing and Loading
def convert_to_greyscale(image):
    """
    Convert an image to greyscale.
    """
    image_array = np.array(image)
    greyscale_image = (
        0.2989 * image_array[:, :, 0]
        + 0.5870 * image_array[:, :, 1]
        + 0.1140 * image_array[:, :, 2]
    )
    return Image.fromarray(greyscale_image.astype(np.uint8))


def preprocess_image(image, size=(60, 60)):
    """
    Preprocess an image: convert to greyscale, normalize rotation, resize, and equalize.
    """
    # Convert to greyscale
    image = convert_to_greyscale(image)

    # Normalize rotation by rotating to the smallest bounding box
    image = ImageOps.exif_transpose(image)

    # Resize image to a standard size
    image = image.resize(size)

    # Histogram equalization to handle lighting variations and improve contrast
    # This step adjusts the intensity distribution of the image to enhance contrast
    image = ImageOps.equalize(image)

    return image


def load_image(image_path, size=(60, 60)):
    """
    Load and preprocess an image from a file path.
    """
    try:
        image = Image.open(image_path)
        image = preprocess_image(image, size)
        return np.array(image).flatten()
    except Exception as e:
        print(f"Error loading image {image_path}: {e}")
        return None


def augment_with_rotations(image, size=(60, 60)):
    """
    Augment an image with rotations (0, 90, 180, 270 degrees).
    """
    rotations = [0, 90, 180, 270]
    augmented_images = []
    for angle in rotations:
        rotated_image = image.rotate(angle)
        augmented_images.append(
            np.array(preprocess_image(rotated_image, size)).flatten()
        )
    return augmented_images


def augment_with_flips(image, size=(60, 60)):
    """
    Augment an image with horizontal and vertical flips.
    """
    flips = [image, ImageOps.mirror(image), ImageOps.flip(image)]
    augmented_images = []
    for flipped_image in flips:
        augmented_images.append(
            np.array(preprocess_image(flipped_image, size)).flatten()
        )
    return augmented_images


def augment_with_color_jitter(image, size=(60, 60)):
    """
    Augment an image with color jittering (brightness, contrast, sharpness).
    """
    enhancers = [
        ImageEnhance.Brightness(image),
        ImageEnhance.Contrast(image),
        ImageEnhance.Sharpness(image),
    ]
    factors = [0.8, 1.2]  # Jitter factors
    augmented_images = []
    for enhancer in enhancers:
        for factor in factors:
            jittered_image = enhancer.enhance(factor)
            augmented_images.append(
                np.array(preprocess_image(jittered_image, size)).flatten()
            )
    return augmented_images


def augment_image(image, size=(60, 60)):
    """
    Apply all augmentations (rotations, flips, color jittering) to an image.
    """
    augmented_images = augment_with_rotations(image, size)
    augmented_images += augment_with_flips(image, size)
    augmented_images += augment_with_color_jitter(image, size)
    return augmented_images


def load_image_database(directory_path, size=(60, 60)):
    """
    Load and preprocess all images in the specified directory.
    """
    image_paths = glob.glob(os.path.join(directory_path, "*.jpg"))
    imageDB = []
    original_image_paths = []
    for image_path in image_paths:
        image = Image.open(image_path)
        augmented_images = augment_image(image, size)
        imageDB.extend(augmented_images)
        original_image_paths.extend([image_path] * len(augmented_images))
    imageDB = np.array(imageDB)
    return imageDB, original_image_paths


# Step 2: Data Centering (Standardization)
def standardize_data(imageDB):
    """
    Standardize the image data by centering it around the mean.
    """
    mean = np.mean(imageDB, axis=0)
    imageDB_centered = imageDB - mean
    return imageDB_centered, mean


# Step 3: PCA Computation Using Singular Value Decomposition (SVD)
def compute_covariance_matrix(imageDB):
    """
    Compute the covariance matrix of the image data.
    """
    return np.cov(imageDB, rowvar=False)


def perform_svd(covariant_matrix):
    """
    Perform Singular Value Decomposition (SVD) on the covariance matrix.
    """
    U, S, Vt = np.linalg.svd(covariant_matrix)
    return U, S, Vt


def select_principal_components(U, k):
    """
    Select the top k principal components from the U matrix.
    """
    return U[:, :k]


def project_data(X_centered, principal_components):
    """
    Project the centered data onto the principal components.
    """
    return np.dot(X_centered, principal_components)


# Step 4: Similarity Computation
def process_query_image(query_image_path, mean, size=(60, 60)):
    """
    Process a query image: load, preprocess, and center it.
    """
    query_image = Image.open(query_image_path)
    query_image = preprocess_image(query_image, size)
    query_image_centered = np.array(query_image).flatten() - mean
    return query_image_centered


def project_query_image(query_image_centered, principal_components):
    """
    Project the centered query image onto the principal components.
    """
    return np.dot(query_image_centered, principal_components)


def compute_euclidean_distances(query_projection, dataset_projections):
    """
    Compute the Euclidean distances between the query image projection and the dataset projections.
    """
    distances = np.linalg.norm(dataset_projections - query_projection, axis=1)
    return distances


def sort_by_similarity(distances, image_paths, max_results=10):
    """
    Sort the dataset images by similarity to the query image, ensuring unique images.
    """
    indices = np.argsort(distances)
    unique_image_paths = []
    seen_images = set()
    for i in indices:
        image_path = image_paths[i]
        if image_path not in seen_images:
            unique_image_paths.append(image_path)
            seen_images.add(image_path)
        if len(unique_image_paths) >= max_results:
            break
    return unique_image_paths


# Step 5: Retrieval and Output
def process_query(
    query_image_path,
    imageDB,
    original_image_paths,
    result_directory,
    mapper,
    size=(60, 60),
):
    """
    Process the query image and retrieve similar images and their corresponding songs.
    """
    # Standardize the data
    imageDB_centered, mean = standardize_data(imageDB)

    # Compute the covariance matrix
    covariant_matrix = compute_covariance_matrix(imageDB_centered)

    # Perform SVD
    U, S, Vt = perform_svd(covariant_matrix)

    # Determine the optimal number of principal components
    cumulative_variance = np.cumsum(S) / np.sum(S)
    threshold = 0.95
    k = np.argmax(cumulative_variance >= threshold) + 1

    # Select the top k principal components
    principal_components = select_principal_components(U, k)

    # Project imageDB_centered onto the principal components
    imageDB_projection = project_data(imageDB_centered, principal_components)

    # Process the query image
    query_image_centered = process_query_image(query_image_path, mean, size)
    query_projection = project_query_image(query_image_centered, principal_components)

    # Compute Euclidean distances between the query image and dataset images
    distances = compute_euclidean_distances(query_projection, imageDB_projection)

    # Sort the dataset images by similarity to the query image
    sorted_image_paths = sort_by_similarity(distances, original_image_paths)

    # Copy the top 10 most similar images to the result folder
    os.makedirs(result_directory, exist_ok=True)
    result_audio_dir = os.path.join(result_directory, "audio")
    os.makedirs(result_audio_dir, exist_ok=True)
    result_picture_dir = os.path.join(result_directory, "picture")
    os.makedirs(result_picture_dir, exist_ok=True)

    for i, path in enumerate(sorted_image_paths, 1):
        destination_path = os.path.join(result_picture_dir, f"{i}.jpg")
        shutil.copy(path, destination_path)
        print(f"Copied {path} to {destination_path}")

        # Find the corresponding songs for the image
        for album in mapper:
            if album["imageSrc"].endswith(os.path.basename(path)):
                for song in album["songs"]:
                    audio_file_path = os.path.join(
                        "src/backend/database/audio", song["file"]
                    )
                    destination_audio_path = os.path.join(
                        result_audio_dir, f"{i}_{os.path.basename(song['file'])}"
                    )
                    shutil.copy(audio_file_path, destination_audio_path)
                    print(f"Copied {audio_file_path} to {destination_audio_path}")

    return sorted_image_paths


def main():
    directory_path = "src/backend/database/picture/"
    result_directory = "test/result"
    query_image_path = "test/query/picture/test_pic_7.jpg"
    mapper_file = "src/backend/database/mapper_all_img.json"

    # Load the mapper
    with open(mapper_file, "r") as f:
        mapper = json.load(f)

    # Load and preprocess images
    print("Loading and preprocessing images...")
    imageDB, original_image_paths = load_image_database(directory_path)
    print(
        f"Loaded {len(imageDB)} images (including rotations, flips, and color jittering)."
    )

    # Process the query image and retrieve similar images and their corresponding songs
    print(
        "Processing query image and retrieving similar images and their corresponding songs..."
    )
    sorted_image_paths = process_query(
        query_image_path, imageDB, original_image_paths, result_directory, mapper
    )

    # Print the sorted image paths
    print("Sorted Image Paths by Similarity:")
    for i, path in enumerate(sorted_image_paths, 1):
        print(f"{i}. {path}")


if __name__ == "__main__":
    main()
