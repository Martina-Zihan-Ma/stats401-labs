from __future__ import annotations

import argparse
import re
from pathlib import Path

import pandas as pd
import pdfplumber


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def is_page_number(text: str) -> bool:
    return bool(re.fullmatch(r"\d+", text))


def is_header_footer(text: str) -> bool:
    upper = text.upper()
    return "UNDERGRADUATE BULLETIN" in upper or ("DUKE KUNSHAN UNIVERSITY" in upper and len(text.split()) <= 5)


def is_course_code(text: str) -> bool:
    return bool(re.match(r"^[A-Z]{2,10}\s*\d{1,4}[A-Z]?\b", text))


def is_prerequisite(text: str) -> bool:
    return text.lower().startswith(("prerequisite:", "prerequisites:", "prerequisite(s):", "corequisite:"))


def is_table_fragment(text: str, fonts: set[str]) -> bool:
    return (
        "Palatino" in " ".join(fonts)
        and not is_course_code(text)
        and (bool(re.search(r"[$¥]\s*\d|\d{1,3}(?:,\d{3})", text)) or "(Kunshan)" in text)
        and len(text) < 220
    )


def page_lines(page):
    for line in page.extract_text_lines(return_chars=True):
        text = clean_text(line["text"])
        chars = line["chars"]
        if not text or not chars or is_page_number(text) or is_header_footer(text):
            continue
        yield text, max(char["size"] for char in chars), {char["fontname"] for char in chars}


def extract_bulletin(pdf_path: str | Path) -> pd.DataFrame:
    records = []
    chapter = section = subsection = ""
    buffer: list[str] = []
    buffer_page = None
    started = False

    def save():
        nonlocal buffer, buffer_page
        text = clean_text(" ".join(buffer))
        if started and section and not text.startswith("--") and len(text.split()) >= 8:
            records.append({"chapter": chapter, "section": section, "subsection": subsection, "page": buffer_page, "text": text})
        buffer, buffer_page = [], None

    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            if 3 <= page_number <= 9:
                continue
            for text, size, fonts in page_lines(page):
                bold = any("Bold" in font for font in fonts)
                if re.match(r"^Part\s+\d+\s*:", text) and size >= 15:
                    save()
                    chapter, section, subsection = text, re.sub(r"^Part\s+\d+\s*:\s*", "", text), ""
                    started = True
                    continue
                if not started:
                    continue
                if bold and size >= 13:
                    save()
                    section, subsection = text, ""
                    continue
                if section == "Course Descriptions" and is_course_code(text):
                    save()
                    buffer, buffer_page = [text], page_number
                    continue
                if bold and 11.5 <= size < 13 and not is_prerequisite(text) and not is_table_fragment(text, fonts):
                    save()
                    subsection = text
                    continue
                if is_table_fragment(text, fonts):
                    continue
                if buffer_page is None:
                    buffer_page = page_number
                buffer.append(text)
                if text.endswith((".", "?", "!")):
                    save()
            save()

    df = pd.DataFrame(records)
    if df.empty:
        return pd.DataFrame(columns=["passage_id", "chapter", "section", "subsection", "page", "text", "text_clean", "word_count"])
    df["text_clean"] = df["text"].map(clean_text)
    df["word_count"] = df["text_clean"].str.split().str.len()
    df = df.drop_duplicates(subset=["text_clean"])
    df = df[df["word_count"] >= 8].reset_index(drop=True)
    df.insert(0, "passage_id", [f"p{i:04d}" for i in range(1, len(df) + 1)])
    return df[["passage_id", "chapter", "section", "subsection", "page", "text", "text_clean", "word_count"]]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", default="data/lab8_bulletin.pdf")
    parser.add_argument("--output", default="data/bulletin_passages.csv")
    args = parser.parse_args()
    df = extract_bulletin(args.pdf)
    df.to_csv(args.output, index=False)
    print(f"Raw/cleaned passages: {len(df)}")
    print(f"Average passage length: {df.word_count.mean():.2f}")
    print(f"Formal sections: {df.section.nunique()}")


if __name__ == "__main__":
    main()
