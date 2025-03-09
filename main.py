from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import time
import os
from urllib.parse import urlparse
from typing import List
import pandas as pd
from codecarbon import EmissionsTracker
from dotenv import load_dotenv


# Load environment variables
load_dotenv()

app = FastAPI()

# Load GitHub Token from environment variables
GITHUB_TOKEN = "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"
if not GITHUB_TOKEN:
    raise HTTPException(status_code=500, detail="GitHub Token not set in environment variables.")

# Hardcoded absolute path for Windows
file_path = r"C:\Users\rahul\OneDrive\Desktop\fastapi\emissions.csv"

# Verify file existence at startup
if not os.path.exists(file_path):
    raise HTTPException(status_code=500, 
                      detail=f"File not found at {file_path}. Please verify the path and file existence.")

class RepoRequest(BaseModel):
    repo_url: str

def fetch_files(api_url: str, file_urls: List[str] = None) -> List[str]:
    """Recursively fetch Python and JavaScript files from GitHub repository."""
    if file_urls is None:
        file_urls = []

    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    while True:
        response = requests.get(api_url, headers=headers)

        if response.status_code == 403:
            print("Rate limit exceeded. Retrying in 60 seconds...")
            time.sleep(60)
            continue

        if response.status_code == 200:
            items = response.json()
            for item in items:
                if item["type"] == "file" and item["name"].endswith((".py", ".js")):
                    file_urls.append(item["download_url"])
                elif item["type"] == "dir":
                    time.sleep(1)  # Prevent rate limiting
                    fetch_files(item["url"], file_urls)
            break
        else:
            print(f"Failed to fetch contents from {api_url} (Status: {response.status_code})")
            break

    return file_urls

@app.post("/extract")
def extract_files(request: RepoRequest):
    """Extract and process files from GitHub repo with emissions tracking"""
    # Debugging output
    print(f"Current working directory: {os.getcwd()}")
    print(f"Looking for emissions file at: {file_path}")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=500, 
                          detail=f"File not found at {file_path}. Verify path: {os.path.abspath(file_path)}")

    parsed_url = urlparse(request.repo_url)
    path_parts = parsed_url.path.strip("/").split("/")

    if len(path_parts) < 2:
        raise HTTPException(status_code=400, detail="Invalid GitHub repository URL")

    repo_owner, repo_name = path_parts[:2]
    api_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents/"

    file_urls = fetch_files(api_url)
    emission_records = []

    for url in file_urls:
        _, file_extension = os.path.splitext(url)
        language = "JavaScript" if file_extension == ".js" else "Python" if file_extension == ".py" else "Unknown"

        response = requests.get(url)
        if response.status_code == 200:
            code = response.text

            # Carbon tracking
            tracker = EmissionsTracker(allow_multiple_runs=True)
            tracker.start()

            if language == "Python":
                try:
                    exec(code, {"__builtins__": {}})
                except Exception as e:
                    print(f"⚠️ Error executing Python script: {e}")

            emissions = tracker.stop()
            print(f"💨 Estimated Carbon Emission: {emissions} kg CO2 for {language} file {url}")
            emission_records.append({"url": url, "language": language, "emissions": emissions})
        else:
            print(f"Failed to fetch {url}. Status Code: {response.status_code}")

    try:
        emissions_df = pd.read_csv(file_path)
        print("Successfully read emissions CSV file")
        
        # Verify required columns
        required_columns = ["emissions", "cpu_power", "ram_power", "energy_consumed"]
        missing_columns = [col for col in required_columns if col not in emissions_df.columns]
        
        if missing_columns:
            raise HTTPException(status_code=500, 
                              detail=f"Missing columns in CSV: {', '.join(missing_columns)}. Found columns: {', '.join(emissions_df.columns)}")

        # Calculate averages
        average_values = emissions_df[required_columns].mean().to_dict()
        
    except Exception as e:
        raise HTTPException(status_code=500, 
                          detail=f"Error processing CSV data: {str(e)}")

    return {
        "file_urls": file_urls,
        "emission_averages": average_values,
        "csv_path": file_path,
        "csv_exists": os.path.exists(file_path)
    }