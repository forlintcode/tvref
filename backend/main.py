from pathlib import Path
from parser.subtitle_loader import load_subtitles_from_folder
from parser.spacy_extractor import extract_known_references
from parser.graph_builder import build_dependency_graph

if __name__ == "__main__":
    folder_path = Path("data/friends")
    subtitle_text = load_subtitles_from_folder(folder_path)

    references = extract_known_references(subtitle_text)
    graph = build_dependency_graph("Friends", references)

    print("📺 Found references in Friends:")
    for edge in graph.edges():
        print(f"  {edge[0]} --> {edge[1]}")
