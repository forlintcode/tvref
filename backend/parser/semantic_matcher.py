# semantic_matcher.py

from sentence_transformers import SentenceTransformer, util
import json
from pathlib import Path

# Load the model
print("🧠 Loading SentenceTransformer model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load iconic quotes dataset
data_path = Path(__file__).resolve().parent.parent / "data" / "iconic_quotes.json"
print(f"📥 Loading iconic quotes from: {data_path}")
with open(data_path, "r", encoding="utf-8") as f:
    quotes_data = json.load(f)  # list of {"quote": "...", "show": "..."}

print(f"✅ Loaded {len(quotes_data)} iconic quotes.")

# Precompute embeddings
quotes = [entry["quote"] for entry in quotes_data if "quote" in entry and entry["quote"].strip()]

if not quotes:
    raise ValueError("🚨 No quotes found in iconic_quotes.json! Check for empty or malformed entries.")
quote_embeddings = model.encode(quotes, convert_to_tensor=True)
def find_semantic_matches(text, top_k=3, threshold=0.7, exclude_show=None, source_end_year=None):
    """Find the top-k most similar quotes in the dataset, ensuring they started before the given end year."""
    if not text.strip():
        print("⚠️ Skipping empty or whitespace-only subtitle line.")
        return []
    input_embedding = model.encode(text, convert_to_tensor=True)
    ...

    input_embedding = model.encode(text, convert_to_tensor=True)
    scores = util.cos_sim(input_embedding, quote_embeddings)[0]

    top_results = []
    
    # Loop through all scores, breaking when we find a score < threshold
    for idx in scores.argsort(descending=True):  # Iterating over all results sorted by score
        score = scores[idx].item()

        # If the score is below the threshold, break early
        if score < threshold:
            break

        show_name = quotes_data[idx]["show"].lower().strip()
        start_year = quotes_data[idx].get("start_year")  # Assuming 'start_year' is in the data

        # Print the current show date and comparison logic only if the score is above the threshold
        if start_year:
            print(f"📅 Checking show: {show_name} (start year: {start_year}) against source end year: {source_end_year}")

        # Exclude shows based on provided conditions
        if exclude_show and show_name == exclude_show.lower().strip():
            print(f"❌ Excluding show '{show_name}' as it matches the exclusion filter.")
            continue
        
        if source_end_year and start_year and start_year > source_end_year:
            print(f"❌ Excluding show '{show_name}' because it started after source end year ({start_year}).")
            continue  # Skip shows that started after the given end year

        # Print that we're adding the quote to the results
        print(f"✅ Adding quote from '{show_name}' with score {score:.3f}")

        top_results.append({
            "quote": quotes_data[idx]["quote"],
            "show": quotes_data[idx]["show"],
            "score": round(score, 3)
        })

        # If we have found enough matches, break out of the loop
        if len(top_results) >= top_k:
            print(f"🎯 Found top {top_k} matches, stopping the search.")
            break

    return top_results

