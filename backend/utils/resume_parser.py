from PyPDF2 import PdfReader
from docx import Document
import os
import re
import spacy
import textstat
import unicodedata
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

# Load spaCy model once, with minimal components for consistency
nlp = spacy.load("en_core_web_sm", disable=["ner", "lemmatizer"])

def extract_text(file):
    """Extract text from PDF or DOCX file with normalization."""
    try:
        text = ""
        if file.filename.endswith(".pdf"):
            reader = PdfReader(file.file)
            text = "".join(page.extract_text() or "" for page in reader.pages)
        elif file.filename.endswith((".doc", ".docx")):
            file.file.seek(0)
            doc = Document(file.file)
            text = "\n".join(para.text for para in doc.paragraphs if para.text.strip())
        else:
            raise ValueError("Unsupported file format")

        # Normalize text to remove encoding issues and extra whitespace
        text = unicodedata.normalize("NFKD", text)
        text = re.sub(r'\s+', ' ', text.strip())
        if not text:
            raise ValueError("No text extracted from file")
        print(f"Extracted text (first 200 chars): {text[:200]}")  # Debug
        return text
    except Exception as e:
        raise Exception(f"Failed to parse resume: {str(e)}")

def compute_resume_score(text):
    """Compute professionalism score (0-100) with deterministic logic and issues."""
    try:
        score_dict = {
            "structure": 0,
            "grammar": 0,
            "readability": 0,
            "keywords": 0,
            "length": 0
        }

        # Structure: Count sections and bullets
        sections = len(re.findall(r"^(Education|Experience|Skills|Summary|Projects)\b", text, re.MULTILINE | re.IGNORECASE))
        bullets = len(re.findall(r"^\s*[-•]\s", text, re.MULTILINE))
        score_dict["structure"] = min((sections * 10 + bullets * 2), 20)

        # Grammar heuristic via spaCy (no external Java dependency)
        doc = nlp(text[:10000])
        grammar_errors = 0
        for sent in doc.sents:
            # penalize missing capitalization and missing period
            stripped = sent.text.strip()
            if stripped and not stripped[0].isupper():
                grammar_errors += 1
            if len(stripped) > 30 and not stripped.endswith(('.', '!', '?')):
                grammar_errors += 1
        score_dict["grammar"] = max(20 - min(grammar_errors, 20), 0)

        # Readability: Flesch-Kincaid
        readability = textstat.flesch_reading_ease(text)
        score_dict["readability"] = min(readability / 5, 20)

        # Keywords: Fixed list
        tech_keywords = ["python", "javascript", "react", "sql", "management", "node", "java", "docker", "kubernetes", "aws"]
        keywords_found = sum(1 for word in tech_keywords if word.lower() in text.lower())
        score_dict["keywords"] = min(keywords_found * 5, 20)

        # Length: Word count
        word_count = len(text.split())
        score_dict["length"] = 20 if 300 <= word_count <= 800 else max(20 - abs(word_count - 550) // 10, 0)

        total_score = sum(score_dict.values())
        total_score = int(min(max(total_score, 0), 100))

        # Build issue list
        issues = []
        if sections < 3:
            issues.append("Add standard sections: Summary, Experience, Education, Skills.")
        if bullets < 5:
            issues.append("Use bullet points to highlight achievements.")
        if grammar_errors > 0:
            issues.append(f"Fix capitalization and sentence punctuation in {grammar_errors} places.")
        if readability < 50:
            issues.append("Simplify sentences to improve readability.")
        if keywords_found < 3:
            issues.append("Include more role-relevant keywords.")
        if word_count < 300:
            issues.append("Resume is short; add details on projects/impact.")
        if word_count > 800:
            issues.append("Resume is long; trim to most relevant achievements.")

        return total_score, issues
    except Exception as e:
        raise Exception(f"Score computation failed: {str(e)}")


def generate_corrected_docx_preserving_layout(original_file, output_dir):
    """Light-touch corrections that keep layout: normalize spaces in runs, ensure minimal spacing, keep fonts when set."""
    try:
        original_file.file.seek(0)
        doc = Document(original_file.file)
        for p in doc.paragraphs:
            # normalize spacing inside each run, preserve bold/italic and font
            for run in p.runs:
                if run.text:
                    run.text = re.sub(r"\s+", " ", run.text)
                    run.text = re.sub(r"\.([A-Za-z])", r". \1", run.text)
            if p.paragraph_format.space_after is None:
                p.paragraph_format.space_after = Pt(2)

        os.makedirs(output_dir, exist_ok=True)
        safe_base = os.path.splitext(os.path.basename(original_file.filename))[0]
        out_name = f"updated-{safe_base}.docx"
        out_path = os.path.join(output_dir, out_name)
        doc.save(out_path)
        return out_path
    except Exception as e:
        raise Exception(f"Failed to generate corrected DOCX: {str(e)}")