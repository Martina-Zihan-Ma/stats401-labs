from pathlib import Path
import tempfile
import unittest

import pandas as pd
from lab8.bulletin_process import extract_bulletin


class SemanticOutputTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.extracted_corpus = extract_bulletin("data/lab8_bulletin.pdf")

    def test_extractor_assigns_known_false_headings_to_real_sections(self):
        corpus = self.extracted_corpus
        forbidden = {
            "(Kunshan) (Kunshan)",
            "Joint Entrance Exam (JEE); or",
            "Credit (CR/NC) Grading System.)",
            "\uf0a7 Intl-admissions@dukekunshan.edu.cn (Duke Kunshan International Admissions)",
            "Undergraduate Degree.)",
        }
        self.assertFalse(corpus["section"].isin(forbidden).any())
        self.assertTrue(((corpus["chapter"] == "Part 4: Admission, Scholarships and Financial Aid") & (corpus["section"] == "Application Requirements")).any())
        self.assertTrue(((corpus["chapter"] == "Part 5: Financial Information") & (corpus["section"] == "Estimated Expenses")).any())
        self.assertTrue(((corpus["chapter"] == "Part 6: Academic Procedures and Information") & (corpus["section"] == "Grading and Grade Requirements") & (corpus["subsection"].str.contains("Credit/No Credit", na=False))).any())

    def test_extractor_joins_wrapped_formal_section_titles_and_tracks_raw_count(self):
        corpus = self.extracted_corpus
        title = "Academic Warning, Probation, and Suspension for Students in the Classes of 2022-2024"
        self.assertNotIn("of 2022-2024", set(corpus["section"]))
        self.assertTrue(((corpus["chapter"] == "Part 6: Academic Procedures and Information") & (corpus["section"] == title)).any())
        self.assertGreater(corpus.attrs["raw_count"], len(corpus))

    def test_extractor_keeps_course_descriptions_as_a_formal_section(self):
        corpus = self.extracted_corpus
        courses = corpus[corpus["section"] == "Course Descriptions"]
        self.assertGreater(len(courses), 650)
        named_subsections = courses["subsection"].fillna("").str.strip()
        named_subsections = named_subsections[named_subsections.ne("")]
        self.assertTrue(named_subsections.str.startswith("Courses with Course Subject:").all())
        self.assertFalse(courses["text"].str.fullmatch(r"Course Code Course Name Course Credit", na=False).any())
    def test_corpus_excludes_course_table_fragments_and_false_sections(self):
        corpus = pd.read_csv("data/bulletin_passages.csv")
        false_sections = {
            "Course Code Course Name Course",
            "Chinese as Second Language Courses",
            "Elementary Complex Functions, Analytic Functions, Complex Integrals, Taylor Series, Laurent"
        }

        self.assertFalse(corpus["section"].isin(false_sections).any())

    def test_every_passage_has_a_formal_section(self):
        corpus = pd.read_csv("data/bulletin_passages.csv")

        self.assertFalse(corpus["section"].isna().any())
        self.assertFalse(corpus["section"].str.strip().eq("").any())

    def test_corpus_excludes_known_broken_extraction_fragments(self):
        corpus = pd.read_csv("data/bulletin_passages.csv")

        self.assertFalse(corpus["text"].str.startswith("--").any())
        self.assertFalse(corpus["text"].str.contains("creative world who contribute", case=False).any())

    def test_each_passage_has_five_distinct_nonself_neighbors(self):
        embedding = pd.read_csv("data/lab8_embedding_map.csv")

        for row in embedding.itertuples():
            neighbors = row.nearest_neighbors.split("|")
            self.assertEqual(len(neighbors), 5)
            self.assertEqual(len(set(neighbors)), 5)
            self.assertNotIn(row.passage_id, neighbors)

    def test_visualization_exports_preserve_semantic_and_structural_fields(self):
        embedding_path = Path("data/lab8_embedding_map.csv")
        matrix_path = Path("data/lab8_topic_section_matrix.csv")

        self.assertTrue(embedding_path.exists())
        self.assertTrue(matrix_path.exists())

        embedding = pd.read_csv(embedding_path)
        matrix = pd.read_csv(matrix_path)

        self.assertTrue({
            "passage_id", "chapter", "section", "subsection", "page", "text",
            "word_count", "cluster", "cluster_name", "x", "y"
        }.issubset(embedding.columns))
        self.assertTrue({"section", "cluster_name", "count"}.issubset(matrix.columns))
        self.assertEqual(len(embedding), len(pd.read_csv("data/bulletin_passages.csv")))
        self.assertTrue(embedding[["x", "y"]].notna().all().all())
        self.assertEqual(matrix["count"].sum(), len(embedding))
