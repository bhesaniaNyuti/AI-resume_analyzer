# Troubleshooting Resume Analysis "Failed to Fetch" Error

## Common Issues and Solutions

### Issue 1: FastAPI Server Not Running

**Symptoms:**
- "Failed to fetch" error in browser console
- Network error in browser dev tools
- Cannot connect to http://127.0.0.1:8000

**Solution:**
1. Start the FastAPI server:
   ```bash
   cd backend
   start-fastapi-server.bat
   ```
   
2. Verify server is running:
   - Open browser: http://127.0.0.1:8000/docs
   - You should see the Swagger UI documentation
   - Or check: http://127.0.0.1:8000/health

3. Check server logs for errors

### Issue 2: CORS (Cross-Origin Resource Sharing) Error

**Symptoms:**
- "CORS policy" error in browser console
- Request blocked by browser
- Error: "Access to fetch at 'http://127.0.0.1:8000/api/analyze-resume' from origin 'http://localhost:5173' has been blocked by CORS policy"

**Solution:**
1. Check CORS configuration in `backend/app.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. Ensure your frontend URL matches one of the allowed origins
3. If using a different port, add it to `allow_origins`

### Issue 3: Port Already in Use

**Symptoms:**
- Error: "Address already in use"
- Server fails to start
- Port 8000 is occupied

**Solution:**
1. Find process using port 8000:
   ```bash
   netstat -ano | findstr :8000
   ```

2. Kill the process (replace PID with actual process ID):
   ```bash
   taskkill /PID <PID> /F
   ```

3. Or change the port in `app.py` and update frontend URL

### Issue 4: Virtual Environment Not Activated

**Symptoms:**
- Module not found errors
- `uvicorn` command not found
- Import errors

**Solution:**
1. Activate virtual environment:
   ```bash
   cd backend
   venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install spaCy model:
   ```bash
   python -m spacy download en_core_web_sm
   ```

### Issue 5: File Upload Issues

**Symptoms:**
- "File size exceeds limit" error
- "Invalid file type" error
- File not being sent

**Solution:**
1. Check file size (max 5MB)
2. Check file type (PDF, DOC, DOCX only)
3. Verify FormData is being created correctly:
   ```javascript
   const formData = new FormData();
   formData.append('file', resumeFile);
   ```

### Issue 6: Server Error (500 Internal Server Error)

**Symptoms:**
- Server responds but with error status
- Error in server logs
- "Resume analysis failed" message

**Solution:**
1. Check server console for error messages
2. Verify all dependencies are installed:
   - PyPDF2
   - python-docx
   - spacy
   - textstat
3. Check if spaCy model is downloaded
4. Verify uploads directory exists and is writable

## Step-by-Step Diagnosis

### Step 1: Verify Server is Running

```bash
# Test server health
curl http://127.0.0.1:8000/health

# Should return: {"status":"healthy","service":"resume-analyzer"}
```

### Step 2: Test API Endpoint

```bash
# Test with a sample file (replace with actual file path)
curl -X POST http://127.0.0.1:8000/api/analyze-resume -F "file=@resume.pdf"
```

### Step 3: Check Browser Console

1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages
4. Go to Network tab
5. Try uploading resume
6. Check the request/response

### Step 4: Check Server Logs

Look at the FastAPI server console for:
- Request received messages
- Error stack traces
- File processing errors

## Quick Fix Checklist

- [ ] FastAPI server is running on port 8000
- [ ] Virtual environment is activated
- [ ] All dependencies are installed
- [ ] spaCy model is downloaded
- [ ] CORS is configured correctly
- [ ] Frontend is using correct API URL
- [ ] File is valid (PDF/DOC/DOCX, < 5MB)
- [ ] uploads directory exists
- [ ] No firewall blocking connection
- [ ] Browser console shows no CORS errors

## Testing the Connection

### Test 1: Health Check
```bash
curl http://127.0.0.1:8000/health
```

### Test 2: Root Endpoint
```bash
curl http://127.0.0.1:8000/
```

### Test 3: API Documentation
Open in browser: http://127.0.0.1:8000/docs

### Test 4: Test Upload (from frontend)
1. Open browser developer tools
2. Go to Network tab
3. Upload a resume from Job Seeker Dashboard
4. Check the request details
5. Check response status and body

## Common Error Messages and Solutions

### "Failed to fetch"
- **Cause:** Server not running or not accessible
- **Solution:** Start FastAPI server and verify it's accessible

### "CORS policy blocked"
- **Cause:** CORS not configured correctly
- **Solution:** Update CORS middleware in app.py

### "NetworkError"
- **Cause:** Server not reachable
- **Solution:** Check server is running and firewall settings

### "500 Internal Server Error"
- **Cause:** Server-side error
- **Solution:** Check server logs for detailed error message

### "File too large"
- **Cause:** File exceeds 5MB limit
- **Solution:** Use a smaller file or increase limit

### "Invalid file type"
- **Cause:** File is not PDF, DOC, or DOCX
- **Solution:** Convert file to supported format

## Still Having Issues?

1. Check server logs for detailed error messages
2. Check browser console for client-side errors
3. Verify all environment variables are set correctly
4. Ensure Python version is 3.8 or higher
5. Try restarting both frontend and backend servers
6. Clear browser cache and try again

## Contact Information

If you're still experiencing issues after trying these solutions, please provide:
- Error message from browser console
- Error message from server logs
- Steps to reproduce the issue
- Browser and version
- Operating system

