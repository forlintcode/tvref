import os
import re
import time
import zipfile
import shutil
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import NoSuchElementException

# Shows we want to download
target_shows = {
    "Two and a Half Men",
    "The Big Bang Theory",
    "The Simpsons",
    "Family Guy",
    "How I Met Your Mother",
    "Modern Family",
    "Gilmore Girls"
}

# Setup download directory
base_download_dir = os.path.join(os.getcwd(), "subtitles")

# Chrome options
chrome_options = Options()
chrome_options.add_experimental_option("prefs", {
    "download.prompt_for_download": False,
    "download.directory_upgrade": True,
    "safebrowsing.enabled": True,
})

# Set up Chrome
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

base_url = "https://www.tvsubtitles.net"

# Function to extract zip files
def extract_zip(zip_path, extract_to):
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        os.remove(zip_path)  # Remove the zip file after extraction
        print(f"✅ Extracted: {zip_path}")
    except Exception as e:
        print(f"❌ Error extracting {zip_path}: {e}")

# Loop through each target show
for show_title in target_shows:
    try:
        print(f"Starting download process for '{show_title}'...")

        # Reload top page for fresh DOM
        driver.get(f"{base_url}/top.html")
        time.sleep(2)

        # Find the link to the show by visible text
        show_link = driver.find_element(By.LINK_TEXT, show_title)
        show_href = show_link.get_attribute("href")
        show_name_folder = show_title.replace("_", " ")  # Replace underscores with spaces

        # Prepare folder
        download_dir = os.path.join(base_download_dir, show_name_folder)
        os.makedirs(download_dir, exist_ok=True)

        # Set dynamic download path
        driver.execute_cdp_cmd("Page.setDownloadBehavior", {
            "behavior": "allow",
            "downloadPath": download_dir,
        })

        # Visit show page (latest season page usually)
        driver.get(show_href)
        time.sleep(2)

        # Extract show ID and season number from the URL
        match = re.search(r"tvshow-(\d+)-(\d+)", show_href)
        if not match:
            print(f"❌ Could not parse show ID for {show_title}")
            continue
        show_id = match.group(1)
        current_season = int(match.group(2))

        # Loop through seasons from current season down to season 1
        for season in range(current_season, 0, -1):
            subtitle_page = f"{base_url}/subtitle-{show_id}-{season}-en.html"
            driver.get(subtitle_page)
            time.sleep(2)

            try:
                download_button = driver.find_element(By.XPATH, f'//a[@href="download-{show_id}-{season}-en.html"]')
                driver.execute_script("arguments[0].scrollIntoView();", download_button)
                time.sleep(1)
                download_button.click()
                print(f"✅ Downloaded: {show_title} - Season {season}")
                time.sleep(3)  # Wait for download to finish

            except NoSuchElementException:
                print(f"⚠️ Skipped {show_title} - Season {season} (No English subtitle page)")
            except Exception as e:
                print(f"❌ Error downloading {show_title} Season {season}: {e}")

        # Wait to ensure all downloads for the show are complete
        time.sleep(10)

        # After all seasons are downloaded, now extract the zip files
        downloaded_files = os.listdir(download_dir)
        zip_files = [f for f in downloaded_files if f.endswith('.zip')]

        for zip_file in zip_files:
            zip_path = os.path.join(download_dir, zip_file)
            season_folder = os.path.join(download_dir, "Extracted")
            os.makedirs(season_folder, exist_ok=True)
            extract_zip(zip_path, season_folder)  # Extract the zip file

        print(f"✅ All seasons downloaded and extracted for {show_title}")
        time.sleep(5)  # Time between each show

    except Exception as e:
        print(f"❌ Error processing show '{show_title}': {e}")

driver.quit()
print("All downloads and extractions complete.")
