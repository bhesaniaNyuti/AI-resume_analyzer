# Setup Guide

## Quick Start

### 1. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
MONGO_URI=mongodb://localhost:27017/ai-resume-analyzer
PORT=5000
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-resume-analyzer
PORT=5000
NODE_ENV=development
```

### 2. Install Dependencies

#### Backend (Node.js)
```bash
cd backend
npm install
```

#### Backend (Python)
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Windows (if installed as service, it should start automatically)
# Or use MongoDB Compass

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**MongoDB Atlas:**
- No local setup needed
- Use your connection string in `.env`

### 4. Start the Application

#### Option A: Start All Servers (Recommended)
```bash
# Terminal 1 - Backend (Node.js + FastAPI)
cd backend
npm install -g concurrently  # Install concurrently if not already installed
npm run start:all
```

#### Option B: Start Servers Separately

**Terminal 1 - Node.js Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - FastAPI Backend:**
```bash
cd backend
python -m uvicorn app:app --reload --port 8000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Node.js API**: http://localhost:5000
- **FastAPI**: http://localhost:8000

## Verification

### Test Backend APIs

1. **Node.js Backend:**
```bash
curl http://localhost:5000/api/test
```

2. **FastAPI Backend:**
```bash
curl http://localhost:8000/docs
```

### Test Frontend

1. Open http://localhost:5173
2. Register a new account (Job Seeker or Recruiter)
3. Test resume upload at `/resume-test`

## Common Issues

### MongoDB Connection Failed
- Check if MongoDB is running
- Verify connection string in `.env`
- Check network/firewall settings for MongoDB Atlas

### Python Dependencies Error
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`
- Download spaCy model: `python -m spacy download en_core_web_sm`

### Port Already in Use
- Change port in `.env` (Node.js) or `app.py` (FastAPI)
- Update frontend API URLs if ports change
- Kill process using the port:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
  - macOS/Linux: `lsof -ti:5000 | xargs kill`

### File Upload Fails
- Ensure `backend/uploads` directory exists
- Check file permissions
- Verify file size limits (5MB for resume analysis)

## Development Mode

### Backend (Node.js) - Auto-reload
```bash
cd backend
npm run dev
```

### Frontend - Hot Reload
```bash
cd frontend
npm run dev
```

### Backend (FastAPI) - Auto-reload
```bash
cd backend
python -m uvicorn app:app --reload --port 8000
```

## Production Setup

1. Set `NODE_ENV=production` in `.env`
2. Build frontend: `cd frontend && npm run build`
3. Use process manager (PM2) for Node.js server
4. Use Gunicorn for FastAPI server
5. Set up reverse proxy (Nginx)
6. Configure SSL certificates
7. Set up MongoDB backup strategy

## Next Steps

1. Register as a job seeker or recruiter
2. Upload a resume for analysis
3. Create job postings (recruiters)
4. Apply to jobs (job seekers)
5. Manage applications (recruiters)

## Support

If you encounter issues:
1. Check the troubleshooting section in README.md
2. Verify all prerequisites are installed
3. Check server logs for error messages
4. Ensure all environment variables are set correctly

