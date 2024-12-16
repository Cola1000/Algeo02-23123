import os
import glob
import json
import shutil
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from typing import List
from backend.utils.database_parser import parse_uploaded_database, process_database
from fastapi.middleware.cors import CORSMiddleware
import logging
from pathlib import Path
from backend.APF2 import process_query

# ====================================================================================
# Setup Logging
# ====================================================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ====================================================================================
# Define Base Directory
# ====================================================================================

# BASE_DIR = backend/
BASE_DIR = Path(__file__).resolve().parent

# ====================================================================================
# Define Directories
# ====================================================================================

PICTURE_DIR = BASE_DIR / "database" / "picture"
AUDIO_DIR = BASE_DIR / "database" / "audio"

# Ensure directories exist
PICTURE_DIR.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# ====================================================================================
# Initialize FastAPI App
# ====================================================================================

app = FastAPI()

app.mount("/static", StaticFiles(directory=PICTURE_DIR), name="static")

# ====================================================================================
# CORS Configuration (Adjust Origins as Needed)
# ====================================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================================================================================
# Task Status Tracking
# ====================================================================================

TASK_STATUS = {}

# ====================================================================================
# Endpoint to Upload Dataset (Multiple Zip Files)
# ====================================================================================


@app.post("/upload-dataset/")
async def upload_dataset(
    zip_files: List[UploadFile] = File(...), *, background_tasks: BackgroundTasks
):
    logger.info("Received upload request with %d file(s).", len(zip_files))

    # Validate that all uploaded files are zip files
    for file in zip_files:
        if not file.filename.lower().endswith(".zip"):
            logger.error("Invalid file type detected: %s", file.filename)
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type for {file.filename}. Only .zip files are accepted.",
            )

    try:
        # Process uploaded zip files using the parser
        await parse_uploaded_database(zip_files)
        logger.info("All zip files uploaded and parsed successfully.")
    except Exception as e:
        logger.error("Error parsing uploaded zip files: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while parsing the uploaded files: {str(e)}",
        )

    # Generate a unique task ID
    task_id = str(uuid.uuid4())
    TASK_STATUS[task_id] = "Processing"

    # Define the background processing function with status updates
    async def processing_task():
        try:
            await process_database(
                db_dir_path=str(PICTURE_DIR),
                mapper_file=str(BASE_DIR / "database" / "mapper_all_img.json"),
                process_db=True,
            )
            TASK_STATUS[task_id] = "Completed"
            logger.info(f"Task {task_id} completed successfully.")
        except Exception as e:
            TASK_STATUS[task_id] = f"Failed: {str(e)}"
            logger.error(f"Task {task_id} failed. Reason: {e}")

    # Add database processing to background tasks
    background_tasks.add_task(processing_task)

    logger.info(f"Database processing has been scheduled with Task ID: {task_id}.")

    return {
        "status": "success",
        "detail": f"{len(zip_files)} zip file(s) uploaded and processing started.",
        "task_id": task_id,
    }


# ====================================================================================
# Endpoint to Check Task Status
# ====================================================================================


@app.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    """
    Endpoint to check the status of a background task.
    """
    status = TASK_STATUS.get(task_id, "Task ID not found.")
    return {"task_id": task_id, "status": status}


# Endpoint to search by image
@app.post("/search-image/")
async def search_image(query_image: UploadFile = File(...)):
    # Validate image format
    if not query_image.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Invalid image format.")

    # Define query directory and save the uploaded image
    query_dir = "backend/query/"
    os.makedirs(query_dir, exist_ok=True)

    image_path = os.path.join(query_dir, query_image.filename)
    try:
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(query_image.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {e}")

    # Locate the mapper JSON file
    mapper_dir = BASE_DIR / "database" / "mapper"
    mapper_files = glob.glob(str(mapper_dir / "*.json"))
    if not mapper_files:
        raise HTTPException(status_code=500, detail="Mapper JSON file not found.")

    mapper_file = mapper_files[0]  # Use the first found JSON file

    # Load the mapper JSON data
    try:
        with open(mapper_file, "r") as f:
            mapper = json.load(f)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500, detail=f"Invalid JSON format in mapper file: {e}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load mapper JSON: {e}")

    # Optional: Add debug statements to verify mapper structure
    print(f"Mapper Type: {type(mapper)}")  # Should output: <class 'list'>
    if len(mapper) > 0:
        print(f"First album keys: {mapper[0].keys()}")  # Should include 'imageSrc'

    # Define the result directory
    RESULT_DIR = BASE_DIR / "query_result"

    # Perform image search
    apf_results = process_query(
        query_image_path=image_path,
        result_directory=RESULT_DIR,
        mapper=mapper,  # Pass the loaded mapper data
        size=(60, 60),
    )

    return {"results": apf_results}


# Endpoint to search by audio
@app.post("/search-audio/")
async def search_audio(audio_file: UploadFile = File(...)):
    if not audio_file.filename.lower().endswith((".mp3", ".wav")):
        raise HTTPException(status_code=400, detail="Invalid audio format.")

    audio_path = os.path.join("src/backend/query/", audio_file.filename)
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)

    # Perform audio search
    # Example:
    # results = process_query_audio(audio_path)

    results = {
        "message": "Audio search functionality not implemented yet."
    }  # Placeholder

    return {"results": results}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
