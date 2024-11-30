import os
import glob
import numpy as np
from PIL import Image, ImageOps
import shutil

def convert_to_greyscale(image):
    image_array = np.array(image)
    greyscale_image = (
        0.2989 * image_array[:, :, 0] +
        0.5870 * image_array[:, :, 1] +
        0.1140 * image_array[:, :, 2]
    )
    return Image.fromarray(greyscale_image.astype(np.uint8))

def preprocess_image(image, size=(60, 60)):
    # Convert to greyscale
    image = convert_to_greyscale(image)
    
    # Boleh ga?
    # Normalize rotation by rotating to the smallest bounding box
    image = ImageOps.exif_transpose(image)
    
    # Resize image to a standard size
    image = image.resize(size)
    
    # Boleh ga?
    # Histogram equalization to handle lighting variations
    image = ImageOps.equalize(image)
    
    return image

def load_image(image_path, size=(60, 60)):
    image = Image.open(image_path)
    image = preprocess_image(image, size)
    return np.array(image).flatten()

# Boleh ga?
def augment_with_rotations(image, size=(60, 60)):
    rotations = [0, 90, 180, 270]
    augmented_images = []
    for angle in rotations:
        rotated_image = image.rotate(angle)
        augmented_images.append(np.array(preprocess_image(rotated_image, size)).flatten())
    return augmented_images

def standardize_data(imageDB):
    mean = np.mean(imageDB, axis=0)
    imageDB_centered = imageDB - mean
    return imageDB_centered, mean

def compute_covariance_matrix(imageDB):
    return np.cov(imageDB, rowvar=False)

def perform_svd(covariant_matrix):
    U, S, Vt = np.linalg.svd(covariant_matrix)
    return U, S, Vt

def select_principal_components(U, k):
    return U[:, :k]

def project_data(X_centered, principal_components):
    return np.dot(X_centered, principal_components)

def process_query_image(query_image_path, mean, size=(60, 60)):
    query_image = Image.open(query_image_path)
    query_image = preprocess_image(query_image, size)
    query_image_centered = np.array(query_image).flatten() - mean
    return query_image_centered

def project_query_image(query_image_centered, principal_components):
    return np.dot(query_image_centered, principal_components)

def compute_euclidean_distances(query_projection, dataset_projections):
    distances = np.linalg.norm(dataset_projections - query_projection, axis=1)
    return distances

def sort_by_similarity(distances, image_paths, max_results=10):
    indices = np.argsort(distances)
    sorted_image_paths = [image_paths[i] for i in indices[:max_results]]
    return sorted_image_paths

# Testing
import os
import glob

# Define the directory path
directory_path = "src/backend/database/picture/"

# Use glob to find all image files in the directory
image_paths = glob.glob(os.path.join(directory_path, "*.jpg"))

# Load and preprocess images
print("Loading and preprocessing images...")
imageDB = []
augmented_image_paths = []
for image_path in image_paths:
    image = Image.open(image_path)
    augmented_images = augment_with_rotations(image)
    imageDB.extend(augmented_images)
    augmented_image_paths.extend([image_path] * len(augmented_images))

imageDB = np.array(imageDB)
print(f"Loaded {len(imageDB)} images (including rotations).")
print(f"Image shape: {imageDB.shape}")

# Standardize the data
print("Standardizing data...")
imageDB_centered, mean = standardize_data(imageDB)
print(f"Mean shape: {mean.shape}")
print(f"Centered data shape: {imageDB_centered.shape}")

# Compute the covariance matrix
print("Computing covariance matrix...")
covariant_matrix = compute_covariance_matrix(imageDB_centered)
print(f"Covariance matrix shape: {covariant_matrix.shape}")

# Perform SVD
print("Performing SVD...")
U, S, Vt = perform_svd(covariant_matrix)
print(f"U shape: {U.shape}")
print(f"S shape: {S.shape}")
print(f"Vt shape: {Vt.shape}")

# Plot cumulative variance explained
cumulative_variance = np.cumsum(S) / np.sum(S)

# Determine the optimal number of principal components
threshold = 0.95
k = np.argmax(cumulative_variance >= threshold) + 1
print(f"Optimal number of principal components (k) to retain {threshold*100}% variance: {k}")

# Select the top k principal components
print(f"Selecting top {k} principal components...")
principal_components = select_principal_components(U, k)
print(f"Principal components shape: {principal_components.shape}")

# Project imageDB_centered onto the principal components
print("Projecting data onto principal components...")
imageDB_projection = project_data(imageDB_centered, principal_components)
print(f"Projected data shape: {imageDB_projection.shape}")

# Query image processing
query_image_path = "test/query/picture/test_pic_7.jpg"
print("Processing query image...")
query_image_centered = process_query_image(query_image_path, mean)
print(f"Query image centered shape: {query_image_centered.shape}")

# Project the query image onto the principal components
print("Projecting query image onto principal components...")
query_projection = project_query_image(query_image_centered, principal_components)
print(f"Query projection shape: {query_projection.shape}")

# Compute Euclidean distances between the query image and dataset images
print("Computing Euclidean distances...")
distances = compute_euclidean_distances(query_projection, imageDB_projection)
print(f"Distances: {distances}")

# Sort the dataset images by similarity to the query image
print("Sorting images by similarity...")
sorted_image_paths = sort_by_similarity(distances, augmented_image_paths)

# Print the sorted image paths
print("Sorted Image Paths by Similarity:")
for i, path in enumerate(sorted_image_paths, 1):
    print(f"{i}. {path}")

# Copy the top 10 most similar images to the result folder
result_directory = "test/result/picture"
os.makedirs(result_directory, exist_ok=True)

for i, path in enumerate(sorted_image_paths, 1):
    destination_path = os.path.join(result_directory, f"{i}.jpg")
    shutil.copy(path, destination_path)
    print(f"Copied {path} to {destination_path}")
