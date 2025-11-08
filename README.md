# AI Resume Analyzer

A comprehensive full-stack application for resume analysis, job posting, and job application management. This platform helps job seekers improve their resumes with AI-powered analysis and connects them with recruiters.

## Features

### For Job Seekers
- **Resume Health Check**: Upload your resume and get instant AI-powered analysis
- **Resume Scoring**: Get a detailed score (0-100) with breakdowns on:
  - Grammar & Language
  - Structure & Format
  - Readability
  - Keywords & Skills
  - Contact Information
  - Achievements
  - Formatting & Presentation
  - Action Verbs
  - Quantification & Metrics
- **Improved Resume Downloads**: Download corrected and professionally formatted versions of your resume
- **Job Search**: Browse and apply to job postings
- **Application Tracking**: Track your job applications and their status
- **Profile Management**: Create and manage your professional profile

### For Recruiters
- **Job Posting**: Create and manage job postings
- **Application Management**: View and manage applications for your posted jobs
- **Application Status Tracking**: Update application status (pending, reviewed, shortlisted, rejected, hired)
- **Resume Downloads**: Download and review applicant resumes
- **Profile Management**: Manage company and recruiter profile

## Tech Stack

### Backend
- **Node.js/Express**: Main backend server for API endpoints, authentication, and database operations
- **Python/FastAPI**: Resume analysis service with NLP capabilities
- **MongoDB**: Database for storing users, jobs, and applications
- **Multer**: File upload handling
- **Bcrypt**: Password hashing

### Frontend
- **React**: Frontend framework
- **Vite**: Build tool and dev server
- **React Router**: Navigation
- **Framer Motion**: Animations
- **React Icons**: Icon library

### Resume Analysis
- **PyPDF2**: PDF text extraction
- **python-docx**: DOCX file handling
- **spaCy**: Natural language processing
- **textstat**: Readability analysis
- **NLTK**: Text processing

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-resume_analyzer
```

### 2. Backend Setup (Node.js)

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGO_URI=mongodb://localhost:27017/ai-resume-analyzer
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas, use:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-resume-analyzer
```

### 3. Backend Setup (Python/FastAPI)

```bash
cd backend
python -m venv venv
```

On Windows:
```bash
venv\Scripts\activate
```

On macOS/Linux:
```bash
source venv/bin/activate
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Download spaCy English model:
```bash
python -m spacy download en_core_web_sm
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Option 1: Run Servers Separately

#### Terminal 1 - Node.js Backend (Port 5000)
```bash
cd backend
npm start
```

#### Terminal 2 - Python/FastAPI Backend (Port 8000)
```bash
cd backend
python -m uvicorn app:app --reload --port 8000
```

#### Terminal 3 - React Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

### Option 2: Use Start Scripts

#### Start All Backend Services
```bash
cd backend
npm run start:all
```

#### Start Frontend
```bash
cd frontend
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/register-jobseeker` - Register a job seeker
- `POST /api/login-jobseeker` - Login as job seeker
- `POST /api/register-recruiter` - Register a recruiter
- `POST /api/login-recruiter` - Login as recruiter

### User Management
- `GET /api/user/:id` - Get user by ID
- `GET /api/user/email/:email` - Get user by email
- `PUT /api/jobseeker/profile` - Update job seeker profile
- `GET /api/recruiter/:id` - Get recruiter by ID
- `GET /api/recruiter/email/:email` - Get recruiter by email
- `PUT /api/recruiter/profile` - Update recruiter profile

### Jobs
- `GET /api/jobs` - Get all active jobs (with filters)
- `GET /api/jobs/:jobId` - Get job by ID
- `POST /api/jobs` - Create a new job posting
- `PATCH /api/jobs/:jobId` - Update a job
- `PATCH /api/jobs/:jobId/status` - Update job status
- `DELETE /api/jobs/:jobId` - Delete a job
- `GET /api/recruiter/:recruiterId/jobs` - Get jobs by recruiter

### Applications
- `POST /api/apply` - Submit a job application
- `GET /api/jobs/:jobId/applications` - Get applications for a job
- `GET /api/applications` - Get applications (with filters)
- `GET /api/recruiter/:recruiterEmail/applications` - Get all applications for a recruiter
- `PATCH /api/applications/:applicationId/status` - Update application status

### Resume Analysis
- `POST /api/analyze-resume` - Analyze a resume (FastAPI - Port 8000)
- `POST /api/clear-upload` - Clear current upload

## Project Structure

```
AI-resume_analyzer/
├── backend/
│   ├── app.py                 # FastAPI resume analysis server
│   ├── index.js               # Express.js main server
│   ├── package.json           # Node.js dependencies
│   ├── requirements.txt       # Python dependencies
│   ├── utils/
│   │   └── resume_parser.py  # Resume parsing and scoring logic
│   ├── uploads/               # Uploaded resume files
│   └── cache/                 # Cached analysis results
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Environment Variables

### Backend (.env)
- `MONGO_URI`: MongoDB connection string
- `PORT`: Node.js server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

### FastAPI
- Default port: 8000 (configured in app.py)
- CORS origins: http://localhost:5173, http://127.0.0.1:5173

## Usage

### Job Seeker Flow
1. Register/Login as a job seeker
2. Upload resume for analysis at `/resume-test`
3. Review resume score and suggestions
4. Download improved resume versions
5. Browse jobs and apply
6. Track application status

### Recruiter Flow
1. Register/Login as a recruiter
2. Create job postings
3. View applications for posted jobs
4. Download and review resumes
5. Update application status
6. Manage job postings (edit, close, delete)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally, or
- Check your MongoDB Atlas connection string
- Verify network access if using MongoDB Atlas

### Python Dependencies Issues
- Ensure you're using the correct Python version (3.8+)
- Activate the virtual environment before installing dependencies
- Download spaCy model: `python -m spacy download en_core_web_sm`

### Port Conflicts
- Change ports in `.env` (Node.js) or `app.py` (FastAPI) if ports are in use
- Update frontend API URLs if backend ports change

### File Upload Issues
- Check that `uploads` directory exists in backend
- Verify file size limits (5MB for resume analysis, 10MB for applications)
- Ensure proper file permissions

## Development

### Adding New Features
1. Backend: Add routes in `backend/index.js` or `backend/app.py`
2. Frontend: Create components in `frontend/src/components/`
3. Update API calls in frontend components
4. Test endpoints with Postman or similar tools

### Database Schema
- **Users**: Job seekers with profile information
- **Recruiters**: Recruiter and company information
- **Jobs**: Job postings with requirements
- **Applications**: Job applications with resume files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation
- Open an issue on GitHub

## Future Enhancements

- [ ] JWT-based authentication
- [ ] Email notifications
- [ ] Advanced resume parsing with AI/ML
- [ ] Resume comparison tools
- [ ] Job recommendation engine
- [ ] Interview scheduling
- [ ] Analytics dashboard

---

**Status**: Actively developed
