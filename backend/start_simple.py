#!/usr/bin/env python3
"""
Simple Resume Analyzer Backend
Run this script to start the backend server
"""

import uvicorn
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting Simple Resume Analyzer Backend...")
    print("Backend will be available at: http://127.0.0.1:8000")
    print("API documentation at: http://127.0.0.1:8000/docs")
    print("Press Ctrl+C to stop the server")
    
    uvicorn.run(
        "simple_app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )






