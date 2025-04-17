from flask import Flask, jsonify
from pathlib import Path
import json
import os
from parser.spacy_extractor import extract_known_references
from parser.graph_builder import build_dependency_graph
from parser.subtitle_loader import load_subtitles_from_folder
from flask_cors import CORS

print("🚀 Starting backend...")
print("📂 Current working directory:", os.getcwd())

app = Flask(__name__)

CORS(app, origins=["https://tvref.vercel.app", "http://localhost:5173"],
     methods=["GET", "POST"],
     allowed_headers=["Content-Type", "Authorization"])

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_FILE = "graph.json"

def process_show(show_name: str):
    print(f"\n🔍 Processing show: {show_name}")
    show_dir = DATA_DIR / show_name
    output_path = show_dir / OUTPUT_FILE

    if output_path.exists() and output_path.stat().st_size > 0:
        try:
            print("📦 Cached graph.json found. Loading...")
            with open(output_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            print("⚠️ Invalid JSON in graph.json, regenerating...")

    all_references = []

    print("📜 Loading and parsing subtitles...")
    episode_blocks = load_subtitles_from_folder(f"data/{show_name}")
    print(f"📦 Found {len(episode_blocks)} episode(s)")

    count = 0
    skipped_blocks = 0
    skipped_episodes = 0

    for episode_id, blocks in episode_blocks.items():
        try:
            print(f"🎞️  Episode: {episode_id} with {len(blocks)} subtitle block(s), Subtitles remaining: {len(episode_blocks) - count}")

            for block in blocks:
                try:
                    if not block["text"].strip():
                        print("⚠️ Skipping empty or whitespace-only subtitle line.")
                        continue

                    refs = extract_known_references(block["text"], show_name, episode_id=episode_id)
                    if refs:
                        print(f"   🔗 Line [{block['index']}]: {block['text']} → {refs}")
                    all_references.extend(refs)

                except Exception as e:
                    skipped_blocks += 1
                    print(f"❌ Skipping block [{block['index']}] in episode {episode_id} due to error: {e}, totalskipped:{skipped_blocks}")

        except Exception as e:
            skipped_episodes += 1
            print(f"🛑 Skipping entire episode {episode_id} due to fatal error: {e}")

        count += 1

    print(f"✅ Finished parsing.")
    print(f"📉 Skipped {skipped_blocks} block(s) due to errors.")
    print(f"🎬 Skipped {skipped_episodes} episode(s) due to fatal errors.")

    print("🔗 Building dependency graph...")
    graph = build_dependency_graph(show_name, all_references)

    print(f"💾 Saving graph to {output_path}")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(graph, f, indent=2)

    print("✅ Graph generation complete.")
    return graph

@app.route("/shows")
def list_shows():
    shows = [d.name for d in DATA_DIR.iterdir() if d.is_dir()]
    print(f"📋 Listing shows: {shows}")
    return jsonify(shows)

@app.route("/graph/<show_name>")
def get_graph(show_name):
    try:
        graph = process_show(show_name)
        return jsonify(graph)
    except Exception as e:
        print(f"❌ Error processing graph: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/references/<show_name>")
def get_references(show_name):
    references_path = DATA_DIR / show_name / "references.json"
    if not references_path.exists():
        print(f"📭 No references.json found for {show_name}")
        return jsonify({"error": "References not found"}), 404

    try:
        print(f"📤 Returning references for {show_name}")
        with open(references_path, "r", encoding="utf-8") as f:
            references = json.load(f)
        return jsonify(references)
    except Exception as e:
        print(f"❌ Error reading references.json: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = os.getenv("PORT", 5000)
    print(f"🟢 Flask app is now running at http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=int(port), debug=True, use_reloader=False)
