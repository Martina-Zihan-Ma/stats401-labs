import os

os.environ.setdefault("NUMBA_CACHE_DIR", "/private/tmp/lab8_numba_cache")

import numpy as np
import pandas as pd
import umap
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

input_path = "data/bulletin_passages.csv"
embedding_output_path = "data/lab8_embedding_map.csv"
matrix_output_path = "data/lab8_topic_section_matrix.csv"
summary_path = "data/lab8_corpus_summary.csv"

df = pd.read_csv(input_path)
raw_count = int(pd.read_csv(summary_path).loc[0, "raw_passages"]) if os.path.exists(summary_path) else len(df)

df = df.dropna(subset=["text"]).drop_duplicates(subset=["text"]).copy()
df["section"] = df["section"].fillna("Unspecified Section")
df["text_clean"] = df["text"].str.replace(r"\s+", " ", regex=True).str.strip()
df["word_count"] = df["text_clean"].str.split().str.len()
df = df[df["word_count"] >= 8].reset_index(drop=True)

passages_by_section = (
    df.groupby(["chapter", "section"])
    .size()
    .reset_index(name="passage_count")
    .sort_values("passage_count", ascending=False)
)

average_length_by_section = (
    df.groupby(["chapter", "section"])["word_count"]
    .mean()
    .reset_index(name="average_word_count")
    .sort_values("average_word_count", ascending=False)
)

passages_by_section.to_csv("data/passages_by_section.csv", index=False)
average_length_by_section.to_csv("data/average_length_by_section.csv", index=False)

model = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
embeddings = model.encode(df["text_clean"].tolist(), normalize_embeddings=True)

reducer = umap.UMAP(
    n_components=2,
    n_neighbors=15,
    min_dist=0.15,
    metric="cosine",
    random_state=401
)
coords = reducer.fit_transform(embeddings)

kmeans = KMeans(n_clusters=8, random_state=401, n_init="auto")
df["cluster"] = kmeans.fit_predict(embeddings)
df["x"] = coords[:, 0]
df["y"] = coords[:, 1]

neighbors = NearestNeighbors(n_neighbors=7, metric="cosine").fit(embeddings)
neighbor_indices = neighbors.kneighbors(embeddings, return_distance=False)
df["nearest_neighbors"] = [
    "|".join([
        df.iloc[index]["passage_id"]
        for index in row
        if df.iloc[index]["passage_id"] != df.iloc[position]["passage_id"]
    ][:5])
    for position, row in enumerate(neighbor_indices)
]

vectorizer = TfidfVectorizer(stop_words="english", max_features=3000)
tfidf = vectorizer.fit_transform(df["text_clean"])
terms = np.array(vectorizer.get_feature_names_out())

labels = {}
for cluster in sorted(df["cluster"].unique()):
    scores = tfidf[(df["cluster"] == cluster).to_numpy()].mean(axis=0).A1
    labels[cluster] = " / ".join(terms[np.argsort(scores)[-3:][::-1]])

topic_names = {
    0: "Quantitative, Data and Computing",
    1: "Arts, Media and Digital Practice",
    2: "Academic Community and Student Support",
    3: "Academic Calendar and Attendance",
    4: "China, Language and Global Education",
    5: "Academic Procedures and Student Life",
    6: "Politics, Culture and Public Policy",
    7: "Academic Credits and Graduation"
}

labels = {cluster: topic_names[cluster] for cluster in labels}
df["cluster_name"] = df["cluster"].map(labels)

output_columns = [
    "passage_id", "chapter", "section", "subsection", "page", "text",
    "word_count", "cluster", "cluster_name", "x", "y", "nearest_neighbors"
]
df[output_columns].to_csv(embedding_output_path, index=False)

matrix_df = (
    df.groupby(["section", "cluster_name"])
    .size()
    .reset_index(name="count")
)
matrix_df.to_csv(matrix_output_path, index=False)

print("Raw passages:", raw_count)
print("Cleaned passages:", len(df))
print("Average passage length:", round(df["word_count"].mean(), 2))
print("Number of formal sections:", df.loc[df["section"] != "Unspecified Section", "section"].nunique())
print("Embedding model: all-MiniLM-L6-v2")
print("UMAP: n_neighbors=15, min_dist=0.15, metric=cosine, random_state=401")
print("Clustering: KMeans, n_clusters=8, random_state=401")

for cluster in sorted(df["cluster"].unique()):
    print("\nCLUSTER", cluster, labels[cluster])
    for text in df.loc[df["cluster"] == cluster, "text_clean"].head(5):
        print("-", text)
