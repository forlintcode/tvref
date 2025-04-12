import os
from pathlib import Path
import re

def parse_srt_blocks(srt_content):
    blocks = srt_content.strip().split("\n\n")
    parsed_blocks = []

    for block in blocks:
        lines = block.strip().split("\n")
        if len(lines) >= 3:
            try:
                index = int(lines[0].strip())
                time_range = lines[1].strip()
                text = " ".join(line.strip() for line in lines[2:])
                start, end = time_range.split(" --> ")
                parsed_blocks.append({
                    "index": index,
                    "start": start,
                    "end": end,
                    "text": text
                })
            except Exception:
                continue
    return parsed_blocks

def parse_microdvd_blocks(sub_content, fps=25.0):
    pattern = re.compile(r"\{(\d+)\}\{(\d+)\}(.*)")
    parsed_blocks = []
    index = 1

    for line in sub_content.strip().splitlines():
        match = pattern.match(line.strip())
        if match:
            start_frame, end_frame, text = match.groups()
            start_time = float(start_frame) / fps
            end_time = float(end_frame) / fps
            parsed_blocks.append({
                "index": index,
                "start": f"{start_time:.2f}s",
                "end": f"{end_time:.2f}s",
                "text": text.strip()
            })
            index += 1
    return parsed_blocks

def parse_csv_timestamp_blocks(sub_content):
    # Format: 00:04:00.02,00:04:01.90\nLine text
    pattern = re.compile(r"(\d{2}:\d{2}:\d{2}\.\d{2}),(\d{2}:\d{2}:\d{2}\.\d{2})")
    lines = sub_content.strip().splitlines()
    parsed_blocks = []
    index = 1

    i = 0
    while i < len(lines) - 1:
        match = pattern.match(lines[i].strip())
        if match:
            start, end = match.groups()
            i += 1
            text_lines = []
            while i < len(lines) and not pattern.match(lines[i].strip()):
                text_lines.append(lines[i].strip().replace("[br]", " "))
                i += 1
            parsed_blocks.append({
                "index": index,
                "start": start,
                "end": end,
                "text": " ".join(text_lines)
            })
            index += 1
        else:
            i += 1
    return parsed_blocks

def detect_format(content):
    if re.search(r"\{\d+\}\{\d+\}", content):
        return "microdvd"
    elif re.search(r"\d{2}:\d{2}:\d{2},\d{2}", content):
        return "srt"
    elif re.search(r"\d{2}:\d{2}:\d{2}\.\d{2},\d{2}:\d{2}:\d{2}\.\d{2}", content):
        return "csv"
    return "unknown"

def extract_episode_id(filename):
    return Path(filename).stem

def load_subtitles_from_folder(folder_relative_path):
    project_root = Path(__file__).resolve().parent.parent
    folder_path = project_root / folder_relative_path

    subtitle_data = {}

    for filename in os.listdir(folder_path):
        if filename.endswith(".srt") or filename.endswith(".sub"):
            file_path = folder_path / filename
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            except UnicodeDecodeError:
                try:
                    with open(file_path, "r", encoding="latin-1") as f:
                        content = f.read()
                except Exception as e:
                    print(f"❌ Skipping unreadable file: {filename} — {e}")
                    continue

            episode_id = extract_episode_id(filename)
            file_format = detect_format(content)

            if file_format == "srt":
                blocks = parse_srt_blocks(content)
            elif file_format == "microdvd":
                blocks = parse_microdvd_blocks(content)
            elif file_format == "csv":
                blocks = parse_csv_timestamp_blocks(content)
            else:
                print(f"⚠️ Unknown subtitle format for {filename}, skipping.")
                continue

            subtitle_data[episode_id] = blocks
            print(f"🎞️  Episode: {filename} with {len(blocks)} subtitle block(s) [{file_format}]")

    return subtitle_data
