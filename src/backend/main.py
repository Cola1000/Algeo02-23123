from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import json
from APF import (
    process_query_image,
    compute_covariance_matrix,
    perform_svd,
    select_principal_components,
    project_data,
)
from MIR import (
    process_query_audio,  # Import from MIR.py
)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update if frontend URL changes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint to upload dataset
@app.post("/upload-dataset/")
async def upload_dataset(zip_file: UploadFile = File(...)):
    if zip_file.content_type != "application/zip":
        raise HTTPException(status_code=400, detail="Invalid file type. Only zip files are accepted.")
    
    upload_path = os.path.join("src/backend/database/", zip_file.filename)
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(zip_file.file, buffer)
    
    # TODO: Add your dataset processing logic here
    # Example:
    # imageDB, original_image_paths = load_image_database(upload_path)
    
    return {"filename": zip_file.filename, "status": "uploaded and processed"}

# Endpoint to search by image
@app.post("/search-image/")
async def search_image(query_image: UploadFile = File(...)):
    if not query_image.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Invalid image format.")
    
    image_path = os.path.join("src/backend/query/", query_image.filename)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(query_image.file, buffer)
    
    # Perform image search
    # Example:
    # mean, size = load_precomputed_values()
    # results = process_query_image(image_path, mean, size)
    
    results = {"message": "Image search functionality not implemented yet."}  # Placeholder
    
    return {"results": results}

# Endpoint to search by audio
@app.post("/search-audio/")
async def search_audio(audio_file: UploadFile = File(...)):
    if not audio_file.filename.lower().endswith(('.mp3', '.wav')):
        raise HTTPException(status_code=400, detail="Invalid audio format.")
    
    audio_path = os.path.join("src/backend/query/", audio_file.filename)
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)
    
    # Perform audio search
    # Example:
    # results = process_query_audio(audio_path)
    
    results = {"message": "Audio search functionality not implemented yet."}  # Placeholder
    
    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)