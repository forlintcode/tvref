import requests
from bs4 import BeautifulSoup
import os
import time
import zipfile
from io import BytesIO

BASE_URL = "https://www.tvsubtitles.net"
headers = {"User-Agent": "Mozilla/5.0"}

known_shows = {
    "friends": 17,
    "breaking bad": 21,
    "the office us": 267,
    "game of thrones": 82,
} 


def find_show_url(show_name):
    show_id = known_shows.get(show_name.lower())
    if show_id:
        return f"{BASE_URL}/tvshow-{show_id}.html"
    print("❌ Show ID not found in known list.")
    return None

def download_and_extract_subtitle(url, season, episode, show_name, output_folder):
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")
    download_link = soup.find("a", string="Download English subtitle")
    if not download_link:
        return
    subtitle_url = BASE_URL + "/" + download_link["href"]
    r = requests.get(subtitle_url, headers=headers)

    try:
        with zipfile.ZipFile(BytesIO(r.content)) as z:
            for file in z.namelist():
                if file.endswith(".srt"):
                    filename = f"s{season:02d}e{episode:02d}.srt"
                    filepath = os.path.join(output_folder, filename)
                    with open(filepath, "wb") as f:
                        f.write(z.read(file))
                    print(f"✅ Saved: {filename}")
                    return
    except zipfile.BadZipFile:
        print(f"❌ Bad zip for S{season:02d}E{episode:02d}")

def scrape_show_to_flat_folder(show_url, show_name):
    output_folder = f"subs/{show_name}"
    os.makedirs(output_folder, exist_ok=True)

    res = requests.get(show_url, headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")
    season_links = soup.select("div#right_container div.season > a")
    
    for season_link in season_links:
        season_url = BASE_URL + "/" + season_link["href"]
        season_num = int(season_link.text.strip().split()[-1])
        res = requests.get(season_url, headers=headers)
        soup = BeautifulSoup(res.text, "html.parser")
        rows = soup.select("table#table5 tr")[1:]

        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 3:
                continue
            episode_num = int(cols[0].text.strip())
            ep_link = BASE_URL + "/" + cols[1].find("a")["href"]
            download_and_extract_subtitle(ep_link, season_num, episode_num, show_name, output_folder)
            time.sleep(1)

# 🔄 Wrapper function
def scrape_subtitles_for_show(show_name):
    show_url = find_show_url(show_name)
    if show_url:
        scrape_show_to_flat_folder(show_url, show_name)

# Example usage:
scrape_subtitles_for_show("The Office Us")
