from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from utils.resume_parser import extract_text, compute_resume_score, generate_corrected_docx_preserving_layout
import os
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.post("/api/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    try:
        # Validate basic constraints
        if hasattr(file, 'size') and file.size and file.size > 5 * 1024 * 1024:
            raise ValueError("File size exceeds 5MB")
        if not (file.filename.endswith('.pdf') or file.filename.endswith('.doc') or file.filename.endswith('.docx')):
            raise ValueError("Unsupported file format")

        text = extract_text(file)
        score, issues = compute_resume_score(text)

        # Try to produce an updated file that preserves original layout
        updated_docx_path: Optional[str] = None
        updated_pdf_path: Optional[str] = None
        try:
            updated_docx_path = generate_corrected_docx_preserving_layout(file, uploads_dir)
        except Exception as gen_err:
            print(f"DOCX regeneration failed: {gen_err}")

        # Attempt PDF conversion if DOCX exists and converter available
        public_url = None
        if updated_docx_path and os.path.exists(updated_docx_path):
            try:
                from docx2pdf import convert as docx2pdf_convert
                base, _ = os.path.splitext(updated_docx_path)
                updated_pdf_path = base + ".pdf"
                docx2pdf_convert(updated_docx_path, updated_pdf_path)
                if os.path.exists(updated_pdf_path):
                    public_url = f"/uploads/{os.path.basename(updated_pdf_path)}"
                else:
                    public_url = f"/uploads/{os.path.basename(updated_docx_path)}"
            except Exception as conv_err:
                print(f"PDF conversion failed: {conv_err}")
                public_url = f"/uploads/{os.path.basename(updated_docx_path)}" if updated_docx_path else None

        print(f"Final score for {file.filename}: {score}")
        return {"score": score, "issues": issues, "updated_resume_url": public_url}
    except Exception as e:
        print(f"Error processing {file.filename}: {str(e)}")
        return {"error": f"Resume analysis failed: {str(e)}"}