from pathlib import Path
import unittest

import pandas as pd


class SemanticOutputTests(unittest.TestCase):
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
