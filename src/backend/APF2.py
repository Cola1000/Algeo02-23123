import os
import glob
import numpy as np
from PIL import Image, ImageOps
import shutil
import json

# ====================================================================================
# Constants
# ====================================================================================

SIMILARITY_THRESHOLD = 75.0

# Paths for storing processed data
PROCESSED_DATA_DIR = "src/backend/database/processed_data"
IMAGE_DB_PROJECTION_FILE = os.path.join(PROCESSED_DATA_DIR, "imageDB_projection.npz")
MEAN_FILE = os.path.join(PROCESSED_DATA_DIR, "mean.npy")
PRINCIPAL_COMPONENTS_FILE = os.path.join(PROCESSED_DATA_DIR, "principal_components.npy")
ORIGINAL_IMAGE_PATHS_FILE = os.path.join(PROCESSED_DATA_DIR, "original_image_paths.npy")

# ====================================================================================
# Step 1: Image Processing and Loading
# ====================================================================================


def convert_to_greyscale(image):
    image_array = np.array(image)
    greyscale_image = (
        0.2989 * image_array[:, :, 0]
        + 0.5870 * image_array[:, :, 1]
        + 0.1140 * image_array[:, :, 2]
    )
    return Image.fromarray(greyscale_image.astype(np.uint8))


def preprocess_image(image, size=(60, 60)):
    image = convert_to_greyscale(image)
    image = image.resize(size)
    return image


def load_image(image_path, size=(60, 60)):
    try:
        image = Image.open(image_path)
        image = preprocess_image(image, size)
        return np.array(image).flatten()
    except Exception as e:
        print(f"Error loading image {image_path}: {e}")
        return None


def augment_with_rotations(image, size=(60, 60)):
    rotations = [0, 90, 180, 270]
    augmented_images = []
    for angle in rotations:
        rotated_image = image.rotate(angle)
        augmented_images.append(
            np.array(preprocess_image(rotated_image, size)).flatten()
        )
    return augmented_images


def augment_with_flips(image, size=(60, 60)):
    flips = [image, ImageOps.mirror(image), ImageOps.flip(image)]
    augmented_images = []
    for flipped_image in flips:
        augmented_images.append(
            np.array(preprocess_image(flipped_image, size)).flatten()
        )
    return augmented_images


def augment_image(image, size=(60, 60)):
    augmented_images = augment_with_rotations(image, size)
    augmented_images += augment_with_flips(image, size)
    return augmented_images


def load_image_database(directory_path, size=(60, 60)):
    # Handle multiple image file extensions
    image_extensions = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}

    imageDB = []
    original_image_paths = []

    with os.scandir(directory_path) as entries:
        for entry in entries:
            if entry.is_file():
                _, ext = os.path.splitext(entry.name)
                if ext in image_extensions:
                    image_path = entry.path
                    try:
                        image = Image.open(image_path)
                        augmented_images = augment_image(image, size)
                        image.close()
                        imageDB.extend(augmented_images)
                        original_image_paths.extend(
                            [image_path] * len(augmented_images)
                        )
                    except Exception as e:
                        print(f"Error processing image {image_path}: {e}")

    imageDB = np.array(imageDB) if imageDB else np.array([])

    return imageDB, original_image_paths


# ====================================================================================
# Step 2: Data Centering (Standardization)
# ====================================================================================


def standardize_data(imageDB):
    mean = np.mean(imageDB, axis=0)
    imageDB_centered = imageDB - mean
    return imageDB_centered, mean


# ====================================================================================
# Step 3: PCA Computation Using Singular Value Decomposition (SVD)
# ====================================================================================


def compute_covariance_matrix(imageDB_centered):
    return np.cov(imageDB_centered, rowvar=False)


def perform_svd(covariance_matrix):
    U, S, Vt = np.linalg.svd(covariance_matrix)
    return U, S, Vt


def select_principal_components(U, S, threshold=0.95):
    """
    Select the top k principal components based on the cumulative variance threshold.
    """
    cumulative_variance = np.cumsum(S) / np.sum(S)
    k = np.argmax(cumulative_variance >= threshold) + 1
    print(
        f"Selected {k} principal components based on {threshold*100}% variance threshold."
    )
    return U[:, :k]


def project_data(X_centered, principal_components):
    return np.dot(X_centered, principal_components)


# ====================================================================================
# Step 4: Similarity Computation
# ====================================================================================


def process_query_image(query_image_path, mean, size=(60, 60)):
    try:
        query_image = Image.open(query_image_path)
        query_image = preprocess_image(query_image, size)
        query_image_centered = np.array(query_image).flatten() - mean
        return query_image_centered
    except Exception as e:
        print(f"Error processing query image {query_image_path}: {e}")
        return None


def project_query_image(query_image_centered, principal_components):
    return np.dot(query_image_centered, principal_components)


def compute_euclidean_distances(query_projection, dataset_projections):
    distances = np.linalg.norm(dataset_projections - query_projection, axis=1)
    return distances


def sort_by_similarity(distances, image_paths):
    indices = np.argsort(distances)
    sorted_image_paths = [image_paths[i] for i in indices]
    sorted_distances = [distances[i] for i in indices]
    return sorted_image_paths, sorted_distances


# ====================================================================================
# Database Processing
# ====================================================================================


def process_database(db_dir_path, process_db=True, size=(60, 60), threshold=0.95):
    """
    threshold (float): Variance threshold for selecting principal components.
    """
    if not process_db and os.path.exists(IMAGE_DB_PROJECTION_FILE):
        print("Loading existing database projections...")
        data = np.load(IMAGE_DB_PROJECTION_FILE)
        imageDB_projection = data["imageDB_projection"]
        mean = np.load(MEAN_FILE)
        principal_components = np.load(PRINCIPAL_COMPONENTS_FILE)
        original_image_paths = np.load(ORIGINAL_IMAGE_PATHS_FILE, allow_pickle=True)
        original_image_paths = original_image_paths.tolist()
    else:
        print("Processing database images...")
        # Load and preprocess database images
        imageDB, original_image_paths = load_image_database(db_dir_path, size)
        if imageDB.size == 0:
            print("No images loaded.")
            return None, None, None, None

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
        print("Database processing complete and data saved.")

    return imageDB_projection, mean, principal_components, original_image_paths


# ====================================================================================
# Step 6: Retrieval and Output
# ====================================================================================


def save_matches(sorted_image_paths, sorted_distances, mapper, result_directory):
    # Prepare result directories
    result_audio_dir = os.path.join(result_directory, "audio")
    result_picture_dir = os.path.join(result_directory, "picture")
    os.makedirs(result_audio_dir, exist_ok=True)
    os.makedirs(result_picture_dir, exist_ok=True)

    # Clear existing contents
    for directory in [result_audio_dir, result_picture_dir]:
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")

    # Map to hold the best (minimum) distance for each original image
    original_image_best_distance = {}

    for path, distance in zip(sorted_image_paths, sorted_distances):
        if path not in original_image_best_distance:
            original_image_best_distance[path] = distance
        else:
            if distance < original_image_best_distance[path]:
                original_image_best_distance[path] = distance

    # Calculate similarity percentages based on best distances
    distances = list(original_image_best_distance.values())
    if not distances:
        print("No images to process.")
        return

    min_distance = min(distances)
    max_distance = max(distances)
    distance_range = (
        max_distance - min_distance if max_distance != min_distance else 1
    )  # Prevent division by zero

    similarity_percentages = {}
    for path, distance in original_image_best_distance.items():
        if distance_range == 0:
            similarity_percentage = 100.0
        else:
            similarity_percentage = round(
                ((max_distance - distance) / distance_range) * 100, 2
            )
        similarity_percentages[path] = similarity_percentage

    # Filter images based on similarity threshold
    filtered_images = [
        (path, sim_percent)
        for path, sim_percent in similarity_percentages.items()
        if sim_percent >= SIMILARITY_THRESHOLD
    ]

    if not filtered_images:
        print(
            f"No matches found with similarity percentage >= {SIMILARITY_THRESHOLD}%."
        )
        return

    # Sort the filtered images by similarity percentage descending
    filtered_images.sort(key=lambda x: x[1], reverse=True)

    # Prepare list for APF_result.json
    apf_results = []
    similarity_rank = 1

    for path, similarity_percentage in filtered_images:
        # Copy the image to the result directory
        destination_image_path = os.path.join(
            result_picture_dir, f"{similarity_rank}.jpg"
        )
        try:
            shutil.copy(path, destination_image_path)
            print(f"Copied {path} to {destination_image_path}")
        except Exception as e:
            print(f"Error copying image {path}: {e}")
            continue  # Skip to next if copying fails

        # Find the corresponding album for the image
        album_found = False
        for album in mapper:
            if album["imageSrc"].endswith(os.path.basename(path)):
                # Copy corresponding audio files
                for song in album["songs"]:
                    audio_file_path = os.path.join(
                        "src/backend/database/audio", song["file"]
                    )
                    destination_audio_path = os.path.join(
                        result_audio_dir,
                        f"{similarity_rank}_{os.path.basename(song['file'])}",
                    )
                    try:
                        shutil.copy(audio_file_path, destination_audio_path)
                        print(f"Copied {audio_file_path} to {destination_audio_path}")
                    except Exception as e:
                        print(f"Error copying audio file {audio_file_path}: {e}")

                # Prepare APF_result.json entry
                apf_entry = {
                    "similarity_rank": similarity_rank,
                    "similarity_percentage": similarity_percentage,
                    "id": album["id"],
                    "title": album["title"],
                    "imageSrc": album["imageSrc"],
                    "songs": album["songs"],
                }
                apf_results.append(apf_entry)
                album_found = True
                break  # Assuming one album per image

        if not album_found:
            print(f"No matching album found for image {path}")

        similarity_rank += 1

    # Save APF_result.json
    apf_result_path = "src/backend/query_result/APF_result.json"
    try:
        os.makedirs(os.path.dirname(apf_result_path), exist_ok=True)
        with open(apf_result_path, "w") as f:
            json.dump(apf_results, f, indent=4)
        print(f"Saved APF_result.json to {apf_result_path}")
    except Exception as e:
        print(f"Error saving APF_result.json: {e}")

    return apf_results  # Return the list of matched results


# ====================================================================================
# Step 7: Query Processing Function
# ====================================================================================


def process_query(
    query_image_path,
    result_directory,
    mapper,
    size=(60, 60),
):
    # Load the saved database projections and related data
    if not os.path.exists(IMAGE_DB_PROJECTION_FILE):
        print("Database projections not found. Please process the database first.")
        return []

    data = np.load(IMAGE_DB_PROJECTION_FILE)
    imageDB_projection = data["imageDB_projection"]
    mean = np.load(MEAN_FILE)
    principal_components = np.load(PRINCIPAL_COMPONENTS_FILE)
    original_image_paths = np.load(ORIGINAL_IMAGE_PATHS_FILE, allow_pickle=True)
    original_image_paths = original_image_paths.tolist()

    # Process the query image
    query_image_centered = process_query_image(query_image_path, mean, size)
    if query_image_centered is None:
        print("Failed to process the query image.")
        return []

    query_projection = project_query_image(query_image_centered, principal_components)

    # Compute Euclidean distances between the query image and dataset images
    distances = compute_euclidean_distances(query_projection, imageDB_projection)

    # Sort the dataset images by similarity to the query image
    sorted_image_paths, sorted_distances = sort_by_similarity(
        distances, original_image_paths
    )

    # Save the matches to the result directories and APF_result.json with similarity >= threshold
    apf_results = save_matches(
        sorted_image_paths, sorted_distances, mapper, result_directory
    )

    return apf_results


# ====================================================================================
# Main Function
# ====================================================================================


def main():
    db_dir_path = "src/backend/database/picture/"
    result_directory = "test/result"
    query_image_path = "test/query/picture/test_pic_7.jpg"
    mapper_file = "src/backend/database/mapper_all_img.json"

    # Load the mapper
    try:
        with open(mapper_file, "r") as f:
            mapper = json.load(f)
    except Exception as e:
        print(f"Error loading mapper file {mapper_file}: {e}")
        return

    # New DB = True, else False
    process_db = False

    # Process or load the database
    imageDB_projection, mean, principal_components, original_image_paths = (
        process_database(db_dir_path, process_db=process_db)
    )
    if imageDB_projection is None:
        print("Failed to process or load the database.")
        return

    # Process the query image
    print("Processing query image...\n")
    apf_results = process_query(query_image_path, result_directory, mapper)

    if apf_results:
        # Print the matched image paths above SIMILARITY_THRESHOLD
        print(f"\nMatched Image Paths (Similarity >= {SIMILARITY_THRESHOLD}%):")
        for entry in apf_results:
            print(
                f"Rank {entry['similarity_rank']}: {entry['imageSrc']} (Similarity: {entry['similarity_percentage']}%)"
            )
    else:
        print(
            f"No matches found with similarity percentage >= {SIMILARITY_THRESHOLD}%."
        )


if __name__ == "__main__":
    main()
