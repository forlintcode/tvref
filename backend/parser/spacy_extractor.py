import spacy
from spacy.matcher import PhraseMatcher
import json
from pathlib import Path
from .semantic_matcher import find_semantic_matches  # 🧠 Semantic matcher

# 📦 Load spaCy model
print("🔄 Loading spaCy model...")
nlp = spacy.load("en_core_web_sm")

# 📁 Set paths
current_dir = Path(__file__).resolve().parent  # parser/
data_dir = current_dir.parent / "data"
json_path = data_dir / "known_titles.json"

# 📥 Load known titles with start and end years
print(f"📥 Loading known_titles from: {json_path}")
with open(json_path, "r", encoding="utf-8") as f:
    all_title_objects = json.load(f)  # list of dicts with title, start_year, end_year

# 🚫 Common ambiguous one-word titles we want to avoid
ambiguous_titles = {
    "it", "up", "you", "on", "go", "us", "me", "she", "he", "i",
    "lost", "friends", "the office", "dark", "frozen"
}

# 🧹 Normalize & filter titles
def is_valid_title(title):
    title_clean = title.lower().strip()
    return (
        len(title_clean) > 2
        and title_clean not in nlp.Defaults.stop_words
        and title_clean not in ambiguous_titles
    )

valid_title_objects = [
    {
        "title": entry["title"].lower().strip(),
        "start_year": entry["start_year"],
        "end_year": entry["end_year"]
    }
    for entry in all_title_objects
    if is_valid_title(entry["title"])
]

normalized_titles = [entry["title"] for entry in valid_title_objects]
print(f"✅ Valid titles after filtering: {len(normalized_titles)}")

# 🔍 Helper: Get end year of a given show
def get_end_year_for(show_name):
    for entry in all_title_objects:
        if entry["title"] == show_name.lower().strip():
            return entry.get("end_year")
    return None

# 💾 Save reference to references.json
def save_reference(referenced_show, source_show, line, episode_id=None):
    references_path = data_dir / source_show / "references.json"
    try:
        with open(references_path, "r", encoding="utf-8") as f:
            all_refs = json.load(f)
    except FileNotFoundError:
        all_refs = {}

    if referenced_show not in all_refs:
        all_refs[referenced_show] = []

    new_entry = {
        "source": source_show,
        "episode": episode_id,
        "line": line
    }

    if new_entry not in all_refs[referenced_show]:
        all_refs[referenced_show].append(new_entry)
        print(f"   💾 Saved reference to {referenced_show} in episode {episode_id}")
    else:
        print(f"   ⚠️ Skipped duplicate reference for {referenced_show} in episode {episode_id}")

    with open(references_path, "w", encoding="utf-8") as f:
        json.dump(all_refs, f, indent=2, ensure_ascii=False)

# 🧠 Cache for filtered matchers
matcher_cache = {}

def get_filtered_matcher(source_show, end_year):
    key = (source_show.lower().strip(), end_year)
    if key in matcher_cache:
        return matcher_cache[key]

    print(f"🆕 Building matcher for '{source_show}' (end_year={end_year})")

    candidate_titles = [
        entry["title"]
        for entry in valid_title_objects
        if entry["start_year"] <= end_year and entry["title"] != key[0]
    ]

    temp_matcher = PhraseMatcher(nlp.vocab)
    temp_patterns = [nlp.make_doc(title) for title in candidate_titles]
    temp_matcher.add("FILTERED_REFERENCES", temp_patterns)

    matcher_cache[key] = temp_matcher
    return temp_matcher

# 🧠 Main extraction function
def extract_known_references(text, source_show, episode_id=None):
    doc = nlp(text.lower())
    references = []

    end_year = get_end_year_for(source_show) or 9999
    matcher = get_filtered_matcher(source_show, end_year)

    matches = matcher(doc)

    for _, start, end in matches:
        matched_text = doc[start:end].text
        references.append(matched_text)
        print(f"🔗 Found reference (phrase): {matched_text}")

        # 💾 Save reference
        save_reference(
            referenced_show=matched_text,
            source_show=source_show,
            line=text.strip(),
            episode_id=episode_id
        )

    # 🔍 Semantic matcher
    semantic_matches = find_semantic_matches(text, exclude_show=source_show, source_end_year=end_year)
    for match in semantic_matches:
        show = match["show"]
        quote = match["quote"]
        score = match["score"]

        print(f"🧠 Found reference (semantic): '{quote}' → {show} (score={score})")
        references.append(show)

        # 💾 Save reference
        save_reference(
            referenced_show=show,
            source_show=source_show,
            line=text.strip(),
            episode_id=episode_id
        )

    if len(references) > 0:
        print(f"✅ Finished episode {episode_id}: {len(references)} reference(s) found.")
    return references
