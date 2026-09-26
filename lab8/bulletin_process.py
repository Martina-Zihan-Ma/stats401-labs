import re
import pandas as pd
import pdfplumber

pdf_path = "data/lab8_bulletin.pdf"
output_path = "data/bulletin_passages.csv"

records = []

current_chapter = ""
current_section = ""
current_subsection = ""
content_started = False
course_catalog_mode = False
in_course_table = False


def clean_line(line):
    return re.sub(r"\s+", " ", line).strip()


def is_chapter(line):
    return bool(
        re.match(
            r"^Part\s+\d+\s*:",
            line,
            re.IGNORECASE
        )
    )


def is_course_code(line):
    return bool(
        re.match(
            r"^[A-Z]{2,10}\s*\d{2,4}[A-Z]?\b",
            line
        )
    )


def is_prerequisite(line):
    lower = line.lower()

    prefixes = [
        "prerequisite",
        "prerequisites",
        "prerequisite(s)",
        "corequisite",
        "corequisites",
        "corequisite(s)"
    ]

    return any(
        lower.startswith(prefix)
        for prefix in prefixes
    )


def is_course_subject_heading(line):
    return bool(
        re.match(
            r"^Courses?\s+with\s+Course\s+Subject",
            line,
            re.IGNORECASE
        )
    )


def is_course_table_heading(line):
    return bool(
        re.match(
            r"^Course\s+Code\s+Course\s+Name\s+Course",
            line,
            re.IGNORECASE
        )
    ) or line.lower() == "credit"


def is_toc_line(line):
    if re.search(r"\.{3,}\s*\d+\s*$", line):
        return True

    return False


def is_page_number(line):
    return bool(
        re.fullmatch(
            r"\d+",
            line
        )
    )


def is_header_footer(line):
    upper = line.upper()

    if "DUKE KUNSHAN UNIVERSITY" in upper:
        return True

    if "UNDERGRADUATE BULLETIN" in upper:
        return True

    return False


def heading_score(line):
    words = line.split()

    if not words:
        return 0

    if len(words) > 10:
        return 0

    if line.endswith("."):
        return 0

    if line.endswith(","):
        return 0

    if line.endswith(";"):
        return 0

    if is_course_code(line):
        return 0

    if is_prerequisite(line):
        return 0

    if is_course_subject_heading(line):
        return 0

    if re.match(r"^[•\-]", line):
        return 0

    title_words = 0

    for word in words:
        cleaned = re.sub(
            r"[^A-Za-z]",
            "",
            word
        )

        if cleaned and cleaned[0].isupper():
            title_words += 1

    return title_words / len(words)


def is_section(line):
    if heading_score(line) < 0.8:
        return False

    words = line.split()

    if len(words) < 2:
        return False

    if ":" in line:
        return False

    return True


def is_subsection(line):
    if is_course_code(line):
        return False

    if is_prerequisite(line):
        return False

    if is_course_subject_heading(line):
        return False

    if re.match(r"^[•\-]", line):
        return False

    words = line.split()

    if len(words) < 2:
        return False

    if len(words) > 12:
        return False

    if line.endswith("."):
        return False

    if ":" not in line:
        return False

    return True


with pdfplumber.open(pdf_path) as pdf:

    for page_number, page in enumerate(
        pdf.pages,
        start=1
    ):

        text = page.extract_text()

        if not text:
            continue

        lines = [
            clean_line(line)
            for line in text.split("\n")
            if clean_line(line)
        ]

        cleaned_lines = []

        for line in lines:

            if is_page_number(line):
                continue

            if is_header_footer(line):
                continue

            cleaned_lines.append(line)

        if not cleaned_lines:
            continue

        toc_lines = sum(
            is_toc_line(line)
            for line in cleaned_lines
        )

        if toc_lines >= 3:
            continue

        current_text = []

        def save_passage():

            if not current_text:
                return

            if not content_started:
                current_text.clear()
                return

            passage = " ".join(
                current_text
            )

            passage = re.sub(
                r"\s+",
                " ",
                passage
            ).strip()

            if len(passage.split()) < 8:
                current_text.clear()
                return

            records.append({
                "chapter": current_chapter,
                "section": current_section,
                "subsection": current_subsection,
                "page": page_number,
                "text": passage
            })

            current_text.clear()

        for line in cleaned_lines:

            if is_toc_line(line):
                continue

            if is_chapter(line):

                save_passage()

                current_chapter = line
                current_section = re.sub(r"^Part\s+\d+\s*:\s*", "", line)
                current_subsection = ""
                content_started = True
                course_catalog_mode = False
                in_course_table = False

                continue

            if not content_started:
                continue

            if is_course_subject_heading(line):

                save_passage()

                current_section = "Course Descriptions"
                current_subsection = line
                course_catalog_mode = True
                in_course_table = False

                continue

            if is_course_table_heading(line):

                save_passage()
                in_course_table = True

                continue

            if in_course_table:

                if is_section(line):
                    save_passage()
                    current_section = line
                    current_subsection = ""
                    in_course_table = False

                continue

            if course_catalog_mode:

                if is_course_code(line):
                    save_passage()
                    current_text.append(line)
                    continue

                current_text.append(line)

                continue

            if is_course_code(line):

                save_passage()

                continue

            if is_section(line):

                save_passage()

                current_section = line
                current_subsection = ""

                continue

            if is_subsection(line):

                save_passage()

                current_subsection = line

                continue

            current_text.append(line)

            if (
                line.endswith(".")
                or line.endswith("?")
                or line.endswith("!")
            ):
                save_passage()

        save_passage()


df = pd.DataFrame(records)

raw_count = len(df)

df = df.dropna(
    subset=["text"]
)

df["text"] = (
    df["text"]
    .str.replace(
        r"\s+",
        " ",
        regex=True
    )
    .str.strip()
)

df = df.drop_duplicates(
    subset=["text"]
)

df["text_clean"] = (
    df["text"]
    .str.replace(
        r"\s+",
        " ",
        regex=True
    )
    .str.strip()
)

df["word_count"] = (
    df["text_clean"]
    .str.split()
    .str.len()
)

df = df[
    df["word_count"] >= 8
].copy()

df = df[
    ~df["text_clean"].str.startswith("--")
    & ~df["text_clean"].str.contains(
        "creative world who contribute",
        case=False,
        na=False
    )
].copy()

df = df.reset_index(
    drop=True
)

df["passage_id"] = [
    f"p{i:04d}"
    for i in range(
        1,
        len(df) + 1
    )
]

df = df[
    [
        "passage_id",
        "chapter",
        "section",
        "subsection",
        "page",
        "text",
        "text_clean",
        "word_count"
    ]
]

df.to_csv(
    output_path,
    index=False
)

print(
    "Raw passages:",
    raw_count
)

print(
    "Cleaned passages:",
    len(df)
)

print(
    "Average passage length:",
    df["word_count"].mean()
)

print(
    "Number of chapters:",
    df["chapter"].nunique()
)

print(
    "Number of sections:",
    df["section"].nunique()
)

print(
    "Number of subsections:",
    df["subsection"].nunique()
)

print("\nChapters:")

print(
    df["chapter"]
    .drop_duplicates()
    .to_string(index=False)
)

print("\nTop sections:")

print(
    df["section"]
    .value_counts()
    .head(20)
    .to_string()
)

print("\nFirst 20 passages:")

print(
    df[
        [
            "passage_id",
            "chapter",
            "section",
            "subsection",
            "page",
            "word_count"
        ]
    ]
    .head(20)
    .to_string(index=False)
)
