const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response for favicon
});

// Debug route to list uploads directory
app.get('/api/uploads', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    res.json({ 
      uploadsDirectory: uploadsDir,
      files: files,
      count: files.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read uploads directory' });
  }
});

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working',
    timestamp: new Date().toISOString(),
    uploadsDir: path.join(__dirname, 'uploads'),
    uploadsExists: fs.existsSync(path.join(__dirname, 'uploads'))
  });
});

// Test route to debug filename processing
app.get('/api/debug-filename/:filename', (req, res) => {
  const { filename } = req.params;
  const decodedFilename = decodeURIComponent(filename);
  
  res.json({
    originalFilename: filename,
    decodedFilename: decodedFilename,
    filenameLength: decodedFilename.length,
    containsParentheses: decodedFilename.includes('('),
    containsSpaces: decodedFilename.includes(' '),
    containsBackslashes: decodedFilename.includes('\\'),
    containsForwardSlashes: decodedFilename.includes('/'),
    containsPathTraversal: decodedFilename.includes('..'),
    uploadsDir: path.join(__dirname, 'uploads'),
    fileExists: fs.existsSync(path.join(__dirname, 'uploads', decodedFilename))
  });
});

// Debug route to check database applications
app.get('/api/debug-applications', async (req, res) => {
  try {
    const applications = await Application.find({}).select('resumeFileName resumePath').limit(10);
    res.json({
      applications: applications,
      count: applications.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Clean up existing applications with wrong resumePath format
app.post('/api/fix-resume-paths', async (req, res) => {
  try {
    const applications = await Application.find({});
    let fixedCount = 0;
    
    for (const app of applications) {
      if (app.resumePath && (app.resumePath.includes('uploads\\') || app.resumePath.includes('uploads/'))) {
        const cleanPath = app.resumePath.split(/[\\\/]/).pop();
        app.resumePath = cleanPath;
        await app.save();
        fixedCount++;
        console.log(`Fixed application ${app._id}: ${app.resumePath} -> ${cleanPath}`);
      }
    }
    
    res.json({
      message: `Fixed ${fixedCount} applications`,
      fixedCount: fixedCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fix applications: ' + err.message });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB limit
  fileFilter: function (req, file, cb) {
    console.log('Processing file:', file.originalname, 'with mimetype:', file.mimetype);
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log('File type rejected:', file.mimetype);
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB connected');
  
  // Update existing applications to have seekerId field
  try {
    const Application = mongoose.model('Application');
    await Application.updateMany(
      { seekerId: { $exists: false } },
      { $set: { seekerId: 'anonymous' } }
    );
    console.log('Updated existing applications with seekerId');
  } catch (e) {
    console.log('No existing applications to update or error:', e.message);
  }
}).catch(err => console.error('MongoDB connection error:', err));

  
// Placeholder JobSeeker model
const jobSeekerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, index: true, unique: false },
  workExp: String,
  password: String,
  // Extended profile fields
  phone: String,
  location: String,
  education: String,
  institute: String,
  gradYear: String,
  skills: [String],
  portfolio: String,
  summary: String,
  avatarUrl: String,
}, { timestamps: true });
const JobSeeker = mongoose.model('User', jobSeekerSchema, 'users');

// Recruiter model
const recruiterSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  company: String,
  website: String,
  industry: String,
  size: String,
});
const Recruiter = mongoose.model('Recruiter', recruiterSchema, 'recruiters');

// Job model
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  employmentType: { type: String, required: true },
  location: { type: String, required: true },
  experienceRequired: String,
  company: { type: String, required: true },
  applicationDeadline: Date,
  description: { type: String, required: true },
  requiredSkills: [String], // Array of skills
  requiredQualification: String,
  contactInformation: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true }, // Reference to recruiter
  recruiterEmail: { type: String, required: true }, // For easy querying
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Job = mongoose.model('Job', jobSchema, 'jobs');

// Pre-save middleware to update updatedAt
jobSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Application model
const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  seekerId: { type: String, required: false, default: 'anonymous' }, // Make it truly optional
  seekerEmail: { type: String, required: true },
  recruiterEmail: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'], default: 'pending' },
  // New application form fields
  whyHire: String,
  careerImpact: String,
  keySkills: String,
  proudProject: String,
  resumeFileName: String,
  resumePath: String,
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Force schema update by dropping and recreating the model
let Application;
try {
  // Try to get existing model
  Application = mongoose.model('Application');
  // Delete the model to force recreation
  delete mongoose.models.Application;
} catch (e) {
  // Model doesn't exist, that's fine
}

// Create new model with updated schema
Application = mongoose.model('Application', applicationSchema, 'applications');

// Register Job Seeker endpoint
app.post('/api/register-jobseeker', async (req, res) => {
  try {
    console.log('Register request body:', req.body); // Debug log
    const { name, email, workExp, password } = req.body;
    
    // Check if user already exists
    const existingUser = await JobSeeker.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newJobSeeker = new JobSeeker({ 
      name, 
      email, 
      workExp, 
      password: hashedPassword 
    });
    await newJobSeeker.save();
    res.status(201).json({ message: 'Job seeker registered successfully' });
  } catch (err) {
    console.error('Registration error:', err); // Debug log
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login Job Seeker endpoint
app.post('/api/login-jobseeker', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    // Find user by email
    const user = await JobSeeker.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Password or username is incorrect' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password or username is incorrect' });
    }
    
    // Login successful
    res.json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        workExp: user.workExp
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Upsert Job Seeker profile details (from Profile Edit)
app.put('/api/jobseeker/profile', async (req, res) => {
  try {
    const {
      email,
      name,
      phone,
      location,
      workExp,
      education,
      institute,
      gradYear,
      skills,
      portfolio,
      summary,
      avatarUrl
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Normalize skills to array
    const skillsArray = Array.isArray(skills)
      ? skills
      : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    const update = {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(location !== undefined && { location }),
      ...(workExp !== undefined && { workExp }),
      ...(education !== undefined && { education }),
      ...(institute !== undefined && { institute }),
      ...(gradYear !== undefined && { gradYear }),
      ...(portfolio !== undefined && { portfolio }),
      ...(summary !== undefined && { summary }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      skills: skillsArray,
    };

    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const updated = await JobSeeker.findOneAndUpdate({ email }, update, options);
    res.json({ message: 'Profile saved', user: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Register Recruiter endpoint
app.post('/api/register-recruiter', async (req, res) => {
  try {
    const { name, email, phone, password, company, website, industry, size } = req.body;
    // Check if recruiter already exists
    const existingRecruiter = await Recruiter.findOne({ email });
    if (existingRecruiter) {
      return res.status(400).json({ error: 'Recruiter with this email already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newRecruiter = new Recruiter({
      name,
      email,
      phone,
      password: hashedPassword,
      company,
      website,
      industry,
      size
    });
    await newRecruiter.save();
    res.status(201).json({ message: 'Recruiter registered successfully' });
  } catch (err) {
    console.error('Recruiter registration error:', err);
    res.status(500).json({ error: 'Recruiter registration failed' });
  }
});

// Login Recruiter endpoint
app.post('/api/login-recruiter', async (req, res) => {
  try {
    const { email, password } = req.body;
    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter) {
      return res.status(401).json({ error: 'Password or username is incorrect' });
    }
    const isPasswordValid = await bcrypt.compare(password, recruiter.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password or username is incorrect' });
    }
    res.json({
      message: 'Login successful',
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        company: recruiter.company
      }
    });
  } catch (err) {
    console.error('Recruiter login error:', err);
    res.status(500).json({ error: 'Recruiter login failed' });
  }
});

// Recruiter creates a job post
app.post('/api/jobs', async (req, res) => {
  try {
    const {
      title,
      employmentType,
      location,
      experienceRequired,
      company,
      applicationDeadline,
      description,
      requiredSkills,
      requiredQualification,
      contactInformation,
      recruiterEmail
    } = req.body;

    // Validate required fields
    if (!title || !employmentType || !location || !company || !description || !recruiterEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find recruiter by email to get the ID
    const recruiter = await Recruiter.findOne({ email: recruiterEmail });
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }

    // Convert skills string to array if it's a comma-separated string
    const skillsArray = typeof requiredSkills === 'string' 
      ? requiredSkills.split(',').map(skill => skill.trim()).filter(skill => skill)
      : requiredSkills || [];

    // Parse application deadline if provided
    let deadline = null;
    if (applicationDeadline) {
      deadline = new Date(applicationDeadline);
      if (isNaN(deadline.getTime())) {
        return res.status(400).json({ error: 'Invalid application deadline format' });
      }
    }

    const newJob = new Job({
      title,
      employmentType,
      location,
      experienceRequired,
      company,
      applicationDeadline: deadline,
      description,
      requiredSkills: skillsArray,
      requiredQualification,
      contactInformation,
      postedBy: recruiter._id,
      recruiterEmail,
      status: 'active'
    });

    await newJob.save();
    
    res.status(201).json({ 
      message: 'Job posted successfully',
      jobId: newJob._id,
      job: newJob
    });
  } catch (err) {
    console.error('Job post error:', err);
    res.status(500).json({ error: 'Job post failed: ' + err.message });
  }
});

// Get all active job posts (for job seekers)
app.get('/api/jobs', async (req, res) => {
  try {
    const { status = 'active', location, employmentType, company } = req.query;
    
    let query = { status: 'active' };
    
    // Add filters if provided
    if (location) query.location = { $regex: location, $options: 'i' };
    if (employmentType) query.employmentType = employmentType;
    if (company) query.company = { $regex: company, $options: 'i' };
    
    const jobs = await Job.find(query)
      .populate('postedBy', 'name company')
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (err) {
    console.error('Fetch jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get jobs posted by a specific recruiter
app.get('/api/recruiter/:recruiterId/jobs', async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const jobs = await Job.find({ postedBy: recruiterId })
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (err) {
    console.error('Fetch recruiter jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch recruiter jobs' });
  }
});

// Get a specific job by ID
app.get('/api/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId)
      .populate('postedBy', 'name company website industry size');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (err) {
    console.error('Fetch job error:', err);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Update a job (recruiter edit)
app.patch('/api/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    // Normalize skills
    if (typeof update.requiredSkills === 'string') {
      update.requiredSkills = update.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    }
    const job = await Job.findByIdAndUpdate(jobId, update, { new: true });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job updated', job });
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Update job status (close, reopen, etc.)
app.patch('/api/jobs/:jobId/status', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, recruiterEmail } = req.body;
    
    // Verify the recruiter owns this job
    const job = await Job.findOne({ _id: jobId, recruiterEmail });
    if (!job) {
      return res.status(403).json({ error: 'Not authorized to modify this job' });
    }
    
    job.status = status;
    job.updatedAt = new Date();
    await job.save();
    
    res.json({ message: 'Job status updated successfully', job });
  } catch (err) {
    console.error('Update job status error:', err);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

// Delete a job
app.delete('/api/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { recruiterEmail } = req.body;
    
    // Verify the recruiter owns this job
    const job = await Job.findOne({ _id: jobId, recruiterEmail });
    if (!job) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }
    
    // Delete the job
    await Job.findByIdAndDelete(jobId);
    
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Jobseeker applies to a job
app.post('/api/apply', upload.any(), async (req, res) => {
  try {
    console.log('=== APPLICATION SUBMISSION DEBUG ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Content-Type header:', req.headers['content-type']);
    console.log('=====================================');
    
    // Extract data from request body
    console.log('Extracting data from req.body:', req.body);
    
    // Check if req.body is empty or undefined
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('Request body is empty or undefined');
      return res.status(400).json({ error: 'Request body is empty. Please check if FormData is being sent correctly.' });
    }
    
    const { 
      jobId, 
      seekerEmail, 
      recruiterEmail, 
      whyHire, 
      careerImpact, 
      keySkills, 
      proudProject 
    } = req.body;
    
    console.log('Extracted values:');
    console.log('- jobId:', jobId);
    console.log('- seekerEmail:', seekerEmail);
    console.log('- recruiterEmail:', recruiterEmail);
    console.log('- whyHire:', whyHire);
    console.log('- careerImpact:', careerImpact);
    console.log('- keySkills:', keySkills);
    console.log('- proudProject:', proudProject);
    
    // Validate required fields
    if (!jobId) {
      console.error('Missing jobId in request body:', req.body);
      return res.status(400).json({ error: 'Job ID is required' });
    }
    if (!seekerEmail) {
      console.error('Missing seekerEmail in request body:', req.body);
      return res.status(400).json({ error: 'Seeker email is required' });
    }
    if (!recruiterEmail) {
      console.error('Missing recruiterEmail in request body:', req.body);
      return res.status(400).json({ error: 'Recruiter email is required' });
    }
    
    // Validate jobId format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid Job ID format' });
    }
    
    // Check if this user has already applied for this job
    const existingApplication = await Application.findOne({
      jobId: jobId,
      seekerEmail: seekerEmail
    });
    
    if (existingApplication) {
      console.log('User has already applied for this job:', {
        jobId: jobId,
        seekerEmail: seekerEmail,
        existingApplicationId: existingApplication._id
      });
      return res.status(400).json({ 
        error: 'You have already applied for this job.',
        alreadyApplied: true,
        applicationId: existingApplication._id
      });
    }
    
    // Create application data
    const applicationData = {
      jobId,
      seekerId: 'anonymous', // Explicitly set to avoid schema issues
      seekerEmail,
      recruiterEmail,
      whyHire: whyHire || '',
      careerImpact: careerImpact || '',
      keySkills: keySkills || '',
      proudProject: proudProject || '',
      resumeFileName: req.files && req.files.length > 0 ? req.files[0].originalname : null,
      resumePath: req.files && req.files.length > 0 ? req.files[0].filename : null // Use filename instead of path
    };
    
    console.log('Creating application with data:', applicationData); // Debug log
    
    try {
      const newApp = new Application(applicationData);
      console.log('Application model created:', newApp); // Debug log
      console.log('Application schema validation:', newApp.validateSync()); // Check for validation errors
      
      await newApp.save();
      console.log('Application saved successfully:', newApp._id); // Debug log
    } catch (saveError) {
      console.error('Error saving application:', saveError);
      console.error('Validation errors:', saveError.errors); // Show specific validation errors
      throw saveError;
    }
    
    // Here you would notify the recruiter (e.g., email, dashboard flag)
    res.status(201).json({ message: 'Applied to job successfully, recruiter notified.' });
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ error: 'Application failed: ' + err.message });
  }
});

// Resume analysis (dummy score)
app.post('/api/analyze-resume', async (req, res) => {
  try {
    // For now, just return a random score (simulate analysis)
    const score = Math.floor(Math.random() * 41) + 60; // 60-100
    res.json({ score });
  } catch (err) {
    res.status(500).json({ error: 'Resume analysis failed' });
  }
});

// Download resume file
app.get('/api/resume/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename parameter
    if (!filename) {
      return res.status(400).json({ error: 'Filename parameter is required' });
    }
    
    // Decode the filename to handle special characters like parentheses
    const decodedFilename = decodeURIComponent(filename);
    console.log('Resume download request for filename:', filename);
    console.log('Decoded filename:', decodedFilename);
    console.log('Filename length:', decodedFilename.length);
    console.log('Filename contains parentheses:', decodedFilename.includes('('));
    console.log('Filename contains spaces:', decodedFilename.includes(' '));
    
    // Extract just the filename if a full path is provided
    let cleanFilename = decodedFilename;
    if (decodedFilename.includes('uploads\\') || decodedFilename.includes('uploads/')) {
      cleanFilename = decodedFilename.split(/[\\\/]/).pop(); // Get the last part after any slash or backslash
      console.log('Extracted clean filename:', cleanFilename);
    }
    
    // Ensure the filename is safe and doesn't contain path traversal
    // Allow safe characters like parentheses, spaces, hyphens, etc.
    // Only block actual path traversal attempts
    if (cleanFilename.includes('..') || cleanFilename.includes('/') || cleanFilename.includes('\\')) {
      console.error('Path traversal detected in filename:', cleanFilename);
      return res.status(400).json({ error: 'Invalid filename - path traversal detected' });
    }
    
    const filePath = path.join(__dirname, 'uploads', cleanFilename);
    console.log('Full file path:', filePath);
    console.log('Current directory:', __dirname);
    console.log('Absolute uploads path:', path.resolve(__dirname, 'uploads'));
    console.log('Normalized file path:', path.normalize(filePath));
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      console.error('Original filename:', filename);
      console.error('Decoded filename:', decodedFilename);
      console.error('Uploads directory contents:', fs.readdirSync(path.join(__dirname, 'uploads')));
      
      // Try alternative path constructions
      const altPath1 = path.resolve(__dirname, 'uploads', decodedFilename);
      const altPath2 = path.normalize(path.join(__dirname, 'uploads', decodedFilename));
      console.error('Alternative path 1:', altPath1, 'exists:', fs.existsSync(altPath1));
      console.error('Alternative path 2:', altPath2, 'exists:', fs.existsSync(altPath2));
      
      return res.status(404).json({ 
        error: 'Resume file not found',
        filename: decodedFilename,
        path: filePath,
        alternativePaths: [altPath1, altPath2]
      });
    }
    
    console.log('File found, starting download...');
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${decodedFilename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('Resume download error:', err);
    res.status(500).json({ error: 'Failed to download resume' });
  }
});

// Get applications for a specific job
app.get('/api/jobs/:jobId/applications', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Validate jobId format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid Job ID format' });
    }
    
    const applications = await Application.find({ jobId })
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (err) {
    console.error('Fetch applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get recruiter profile by ID
app.get('/api/recruiter/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findById(id);
    
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    
    res.json({
      id: recruiter._id,
      name: recruiter.name,
      email: recruiter.email,
      company: recruiter.company,
      phone: recruiter.phone,
      website: recruiter.website,
      industry: recruiter.industry,
      size: recruiter.size
    });
  } catch (err) {
    console.error('Fetch recruiter error:', err);
    res.status(500).json({ error: 'Failed to fetch recruiter profile' });
  }
});

// Get user profile by ID
app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await JobSeeker.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      workExp: user.workExp,
      phone: user.phone,
      location: user.location,
      education: user.education,
      institute: user.institute,
      gradYear: user.gradYear,
      skills: user.skills,
      portfolio: user.portfolio,
      summary: user.summary,
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get user profile by email
app.get('/api/user/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await JobSeeker.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      workExp: user.workExp,
      phone: user.phone,
      location: user.location,
      education: user.education,
      institute: user.institute,
      gradYear: user.gradYear,
      skills: user.skills,
      portfolio: user.portfolio,
      summary: user.summary,
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    console.error('Fetch user by email error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get recruiter profile by email
app.get('/api/recruiter/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const recruiter = await Recruiter.findOne({ email });
    
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    
    res.json({
      id: recruiter._id,
      name: recruiter.name,
      email: recruiter.email,
      company: recruiter.company,
      phone: recruiter.phone,
      website: recruiter.website,
      industry: recruiter.industry,
      size: recruiter.size
    });
  } catch (err) {
    console.error('Fetch recruiter by email error:', err);
    res.status(500).json({ error: 'Failed to fetch recruiter profile' });
  }
});

// Get applications by seeker email
app.get('/api/applications', async (req, res) => {
  try {
    const { seekerEmail, recruiterEmail, jobId, status } = req.query;
    
    let query = {};
    if (seekerEmail) query.seekerEmail = seekerEmail;
    if (recruiterEmail) query.recruiterEmail = recruiterEmail;
    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ error: 'Invalid Job ID format' });
      }
      query.jobId = jobId;
    }
    if (status) query.status = status;
    
    const applications = await Application.find(query)
      .populate('jobId', 'title company location employmentType experienceRequired')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (err) {
    console.error('Fetch applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Check if user has applied to a specific job
app.get('/api/check-application/:jobId/:seekerEmail', async (req, res) => {
  try {
    const { jobId, seekerEmail } = req.params;
    
    // Validate jobId format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid Job ID format' });
    }
    
    // Decode email if it's URL encoded
    const decodedEmail = decodeURIComponent(seekerEmail);
    
    const application = await Application.findOne({
      jobId: jobId,
      seekerEmail: decodedEmail
    });
    
    res.json({
      hasApplied: !!application,
      application: application || null
    });
  } catch (err) {
    console.error('Check application error:', err);
    res.status(500).json({ error: 'Failed to check application status' });
  }
});

// Update application status
app.patch('/api/applications/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, recruiterEmail } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }
    
    // Find application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Verify recruiter owns the job (optional check)
    if (recruiterEmail) {
      const job = await Job.findById(application.jobId);
      if (job && job.recruiterEmail !== recruiterEmail) {
        return res.status(403).json({ error: 'Not authorized to update this application' });
      }
    }
    
    // Update status
    application.status = status;
    application.updatedAt = new Date();
    await application.save();
    
    res.json({ 
      message: 'Application status updated successfully', 
      application 
    });
  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Get all applications for a recruiter (across all their jobs)
app.get('/api/recruiter/:recruiterEmail/applications', async (req, res) => {
  try {
    const { recruiterEmail } = req.params;
    const { status, jobId } = req.query;
    
    let query = { recruiterEmail };
    if (status) query.status = status;
    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ error: 'Invalid Job ID format' });
      }
      query.jobId = jobId;
    }
    
    const applications = await Application.find(query)
      .populate('jobId', 'title company location employmentType experienceRequired')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (err) {
    console.error('Fetch recruiter applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update recruiter profile
app.put('/api/recruiter/profile', async (req, res) => {
  try {
    const {
      email,
      name,
      phone,
      company,
      website,
      industry,
      size
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const update = {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(company !== undefined && { company }),
      ...(website !== undefined && { website }),
      ...(industry !== undefined && { industry }),
      ...(size !== undefined && { size }),
    };

    const options = { upsert: false, new: true };
    const updated = await Recruiter.findOneAndUpdate({ email }, update, options);
    
    if (!updated) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    
    res.json({ message: 'Profile saved', recruiter: updated });
  } catch (err) {
    console.error('Update recruiter profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)); 