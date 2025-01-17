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
from backend.MIR_PCA import *

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
MAPPER_FILE = BASE_DIR / "database" / "mapper" / "mapper.json"
PICTURE_DIR = BASE_DIR / "database" / "picture"
AUDIO_DIR = BASE_DIR / "database" / "audio"
MIDI_AUDIO_DIR = BASE_DIR / "database" / "midi_audio"


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
        convert_dataset_to_midi(
            dataset_path=str(AUDIO_DIR), midi_dataset_path=str(MIDI_AUDIO_DIR)
        )
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
                mapper_file=str(BASE_DIR / "database" / "mapper" / "mapper.json"),
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


@app.get("/check-datasets/")
async def check_datasets():
    datasets_present = {"images": False, "audios": False, "mapper": False}

    # Check if mapper.json exists
    if not MAPPER_FILE.exists():
        return datasets_present

    try:
        with open(MAPPER_FILE, "r") as f:
            mapper = json.load(f)
    except json.JSONDecodeError:
        return datasets_present
    except Exception:
        return datasets_present

    # Check if mapper has entries
    if not isinstance(mapper, list) or len(mapper) == 0:
        return datasets_present

    # Verify images
    all_images_exist = True
    for album in mapper:
        image_src = album.get("imageSrc", "")
        if not image_src:
            all_images_exist = False
            print("Missing imageSrc in album:", album)
            break
        image_path = Path(image_src)

        # If image_src is a relative path, make it absolute based on project root
        if not image_path.is_absolute():
            image_path = Path.cwd().parent / image_src

        if not image_path.exists():
            all_images_exist = False
            print(f"Image file missing: {image_path}")
            print(f"Image file missing: {image_path}")
            print("Missing imageSrc in album:", album)
            print("Missing audio file in song:", song)
            break
    datasets_present["images"] = all_images_exist

    # Verify audios
    all_audios_exist = True
    for album in mapper:
        songs = album.get("songs", [])
        for song in songs:
            audio_path = AUDIO_DIR / song.get("file", "")
            if not audio_path.exists():
                all_audios_exist = False
                break
        if not all_audios_exist:
            break
    datasets_present["audios"] = all_audios_exist

    # Mapper is present if mapper.json is loaded and has entries
    datasets_present["mapper"] = True

    return datasets_present


@app.get("/api/uploaded-images")
async def get_uploaded_images():
    if not MAPPER_FILE.exists():
        raise HTTPException(status_code=404, detail="Mapper file not found.")

    try:
        with open(MAPPER_FILE, "r") as f:
            mapper = json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, detail="Invalid JSON format in mapper file."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    images = []
    for album in mapper:
        image_src = album.get("imageSrc")
        if image_src:
            image_filename = Path(image_src).name
            image_url = f"http://localhost:8000/static/{image_filename}"
            images.append(
                {
                    "id": album.get("id"),
                    "title": album.get("title"),
                    "imageSrc": image_url,
                    "songs": album.get("songs", []),
                }
            )

    return {"uploaded_images": images}


@app.get("/api/uploaded-audios")
async def get_uploaded_audios():
    if not MAPPER_FILE.exists():
        raise HTTPException(status_code=404, detail="Mapper file not found.")

    try:
        with open(MAPPER_FILE, "r") as f:
            mapper = json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, detail="Invalid JSON format in mapper file."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    audios = []
    for album in mapper:
        album_id = album.get("id")
        album_title = album.get("title")
        songs = album.get("songs", [])
        for song in songs:
            audio_file = song.get("file")
            if audio_file:
                audio_filename = Path(audio_file).name
                audio_url = f"http://localhost:8000/static/{audio_filename}"
                audios.append(
                    {
                        "id": song.get("id"),
                        "title": song.get("title", f"Song {song.get('id')}"),
                        "file": audio_url,
                        "albumId": album_id,
                        "albumTitle": album_title,
                    }
                )

    return {"uploaded_audios": audios}


@app.get("/api/uploaded-mapper")
async def get_uploaded_mapper():
    if not MAPPER_FILE.exists():
        raise HTTPException(status_code=404, detail="Mapper file not found.")

    try:
        with open(MAPPER_FILE, "r") as f:
            mapper = json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, detail="Invalid JSON format in mapper file."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"uploaded_mapper": mapper}


# Endpoint to search by image
@app.post("/search-image/")
async def search_image(query_image: UploadFile = File(...)):
    if not query_image.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Invalid image format.")

    # Define query directory and save the uploaded image
    image_query_dir = "backend/query/"
    os.makedirs(image_query_dir, exist_ok=True)

    image_path = os.path.join(image_query_dir, query_image.filename)
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
async def search_audio(query_audio: UploadFile = File(...)):
    if not query_audio.filename.lower().endswith((".mid", ".mp3", ".wav")):
        raise HTTPException(status_code=400, detail="Invalid audio format.")

    audio_query_dir = "backend/query/"
    os.makedirs(audio_query_dir, exist_ok=True)

    audio_path = os.path.join(audio_query_dir, query_audio.filename)
    try:
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(query_audio.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save audio: {e}")

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

    # QUERYING
    # Get the list of MIDI files for querying
    database_files = [
        os.path.join(MIDI_DATASET_PATH, f)
        for f in os.listdir(MIDI_DATASET_PATH)
        if f.endswith(".mid")
    ]

    if not database_files:
        print(
            f"No MIDI files found in {MIDI_DATASET_PATH}. Please convert the dataset first."
        )
        return

    # Debugging statement
    print(f"Loaded {len(database_files)} MIDI files for querying.")

    # Query by humming
    print("Processing query audio and retrieving similar MIDI files...\n")
    pca_model = load_pca_model(MIDI_AUDIO_DIR)
    # matches = query_by_humming(
    #     audio_path, database_files, threshold=SIMILARITY_THRESHOLD
    # )

    mir_results = query_by_humming(
        audio_path,
        database_files,
        mapper,
        pca_model,
        threshold=SIMILARITY_THRESHOLD,
        result_dir=RESULT_DIR,
    )

    # Save the matches to the result directories and MIR_result.json
    # mir_results = save_matches(matches, mapper, result_dir=RESULT_DIR)

    return {"results": mir_results}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
