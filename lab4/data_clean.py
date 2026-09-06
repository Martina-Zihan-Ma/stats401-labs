import pandas as pd
import re
from transformers import pipeline

df = pd.read_csv("data/lab4_raw_tweets.csv")

print(df.head())
print("\nShape:")
print(df.shape)

print("\nColumns:")
print(df.columns)

print("\nInfo:")
print(df.info())

print("\nMissing values:")
print(df.isna().sum())

print("\nDuplicates:")
print(df.duplicated().sum())

# Clean duplicate tweet IDs
print("\nDuplicate tweet IDs:")
print(
    df.duplicated(
        subset=["tweetid"]
    ).sum()
)

df = df.drop_duplicates(
    subset=["tweetid"],
    keep="first"
)

# Parse dates
df["created"] = pd.to_datetime(
    df["created"],
    errors="coerce"
)

print("\nInvalid dates:")
print(df["created"].isna().sum())

df = df.dropna(
    subset=["created"]
)

# Create useful time variables
df["date"] = df["created"].dt.date
df["hour"] = df["created"].dt.hour
df["weekday"] = df["created"].dt.day_name()

# Check numeric values
print("\nNegative retweets:")
print((df["retweets"] < 0).sum())

print("\nNegative favorites:")
print((df["favorites"] < 0).sum())

print("\nNegative emoji counts:")
print((df["num.emojis"] < 0).sum())

# Treat impossible negative values as missing
df.loc[
    df["retweets"] < 0,
    "retweets"
] = pd.NA

df.loc[
    df["favorites"] < 0,
    "favorites"
] = pd.NA

df.loc[
    df["num.emojis"] < 0,
    "num.emojis"
] = pd.NA

# Clean source
df["source.r"] = (
    df["source.r"]
    .astype("string")
    .str.strip()
)

df["source.r"] = (
    df["source.r"]
    .fillna("Unknown")
)

# Clean tweet text
df["tweet_text_raw"] = (
    df["text"]
    .astype("string")
    .str.replace(
        r"\s+",
        " ",
        regex=True
    )
    .str.strip()
)

# Final inspection
print("\nCleaned shape:")
print(df.shape)

print("\nData types:")
print(df.dtypes)

print("\nMissing values after cleaning:")
print(df.isna().sum())

# Sample
df = df.sample(
    n=2000,
    random_state=401
).copy()

print("\nSampled shape:")
print(df.shape)

def prepare_for_roberta(text):

    text = str(text)

    text = re.sub(
        r"@\w+",
        "@user",
        text
    )

    text = re.sub(
        r"https?://\S+|www\.\S+",
        "http",
        text
    )

    return text.strip()


df["sentiment_text"] = (
    df["tweet_text_raw"]
    .fillna("")
    .apply(prepare_for_roberta)
)

sentiment_model = pipeline(
    "sentiment-analysis",
    model=(
        "cardiffnlp/"
        "twitter-roberta-base-sentiment-latest"
    ),
    top_k=None
)

results = sentiment_model(
    df["sentiment_text"].tolist(),
    truncation=True,
    batch_size=16
)

def scores_to_dict(scores):

    return {
        item["label"].lower(): item["score"]
        for item in scores
    }


score_dicts = [
    scores_to_dict(scores)
    for scores in results
]


df["sentiment_negative"] = [
    scores.get("negative", 0)
    for scores in score_dicts
]

df["sentiment_neutral"] = [
    scores.get("neutral", 0)
    for scores in score_dicts
]

df["sentiment_positive"] = [
    scores.get("positive", 0)
    for scores in score_dicts
]

def predicted_label(scores):

    return max(
        scores,
        key=scores.get
    ).capitalize()


df["sentiment"] = [
    predicted_label(scores)
    for scores in score_dicts
]

df["sentiment_score"] = (
    df["sentiment_positive"]
    - df["sentiment_negative"]
)

df["sentiment_confidence"] = df[[
    "sentiment_negative",
    "sentiment_neutral",
    "sentiment_positive"
]].max(axis=1)

print("\nSentiment counts:")
print(
    df["sentiment"]
    .value_counts()
)

print("\nSentiment preview:")
print(
    df[[
        "tweet_text_raw",
        "sentiment_negative",
        "sentiment_neutral",
        "sentiment_positive",
        "sentiment_score",
        "sentiment"
    ]].head(10)
)

vis_df = df[[
    "tweetid",
    "created",
    "date",
    "hour",
    "weekday",
    "text",
    "tweet_text_raw",
    "retweets",
    "favorites",
    "source.r",
    "hashtag",
    "num.emojis",
    "sentiment_negative",
    "sentiment_neutral",
    "sentiment_positive",
    "sentiment_score",
    "sentiment_confidence",
    "sentiment"
]].copy()


print("\nVisualization-ready shape:")
print(vis_df.shape)

print("\nMissing values:")
print(vis_df.isna().sum())

print("\nSentiment counts:")
print(vis_df["sentiment"].value_counts())


vis_df.to_csv(
    "data/lab4_clean_tweets.csv",
    index=False
)

print("\nSaved lab4_clean_tweets.csv")

