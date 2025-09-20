 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JobSeekerDashboard.css';
import { generateGreeting } from '../../utils/greetingGenerator';
import { FaMapPin, FaBriefcase, FaRupeeSign, FaFilter, FaStar } from 'react-icons/fa';

const JobSeekerDashboard = () => {
  const [resume, setResume] = useState(null);
  const [score, setScore] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [appliedJobId, setAppliedJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatedResumeUrl, setUpdatedResumeUrl] = useState('');
  const backendBaseUrl = 'http://127.0.0.1:8000';
  const [issues, setIssues] = useState([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({
    experience: '',
    location: '',
    domain: '',
    employmentType: ''
  });
  
  // Available filter options
  const experienceOptions = ['0-2 years', '2-5 years', '5-10 years', '10+ years'];
  const employmentTypeOptions = ['Full Time', 'Part Time', 'Internship', 'Contract'];
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [expandedSkills, setExpandedSkills] = useState({});
  const navigate = useNavigate();

  // Fetch user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('jobSeekerData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setUser(userData);
    } else {
      setUser({ name: 'Job Seeker', email: 'jobseeker@email.com' });
    }
    setUserLoading(false);
  }, []);

  // Fetch all jobs on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then(res => res.json())
      .then(data => {
        setAllJobs(data);
        setFilteredJobs(data);
        
        // Extract unique locations and domains for filters
        const locations = [...new Set(data.map(job => job.location).filter(Boolean))];
        const domains = [...new Set(data.map(job => job.company).filter(Boolean))];
        setAvailableLocations(locations);
        setAvailableDomains(domains);
      })
      .catch(() => setError('Failed to load jobs'));
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    let filtered = allJobs;
    
    if (filters.experience) {
      filtered = filtered.filter(job => {
        if (!job.experienceRequired) return false;
        
        const jobExp = job.experienceRequired.toLowerCase();
        const filterExp = filters.experience.toLowerCase();
        
        // Extract numeric values from experience string
        const extractYears = (expStr) => {
          // Look for patterns like "2-3 years", "5+ years", "1 year", "fresher", etc.
          const yearPatterns = [
            /(\d+)-(\d+)\s*years?/i,           // "2-3 years"
            /(\d+)\+\s*years?/i,               // "5+ years"
            /(\d+)\s*years?/i,                 // "3 years"
            /(\d+)\s*-\s*(\d+)\s*years?/i,    // "2 - 3 years"
            /fresher/i,                         // "fresher"
            /entry\s*level/i,                   // "entry level"
            /junior/i,                          // "junior"
            /(\d+)\s*months?/i,                // "6 months"
            /(\d+)\s*-\s*(\d+)\s*months?/i    // "6-12 months"
          ];
          
          for (let pattern of yearPatterns) {
            const match = expStr.match(pattern);
            if (match) {
              if (pattern.source.includes('fresher') || pattern.source.includes('entry') || pattern.source.includes('junior')) {
                return { min: 0, max: 1 };
              } else if (pattern.source.includes('months')) {
                const months = parseInt(match[1]);
                const years = months / 12;
                if (match[2]) {
                  const maxMonths = parseInt(match[2]);
                  const maxYears = maxMonths / 12;
                  return { min: years, max: maxYears };
                }
                return { min: 0, max: years };
              } else if (pattern.source.includes('+')) {
                return { min: parseInt(match[1]), max: 50 }; // Assume max 50 years
              } else if (match[2]) {
                return { min: parseInt(match[1]), max: parseInt(match[2]) };
              } else {
                const year = parseInt(match[1]);
                return { min: year, max: year };
              }
            }
          }
          
          // If no pattern matches, return null
          return null;
        };
        
        const jobYears = extractYears(jobExp);
        if (!jobYears) return false;
        
        // Apply filter based on experience range
        if (filterExp === '0-2 years') {
          return jobYears.max <= 2;
        } else if (filterExp === '2-5 years') {
          return jobYears.min >= 2 && jobYears.max <= 5;
        } else if (filterExp === '5-10 years') {
          return jobYears.min >= 5 && jobYears.max <= 10;
        } else if (filterExp === '10+ years') {
          return jobYears.min >= 10;
        }
        
        return false;
      });
    }
    
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location && job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.domain) {
      filtered = filtered.filter(job => 
        job.company && job.company.toLowerCase().includes(filters.domain.toLowerCase())
      );
    }
    
    if (filters.employmentType) {
      filtered = filtered.filter(job => 
        job.employmentType && job.employmentType === filters.employmentType
      );
    }
    
    setFilteredJobs(filtered);
  }, [filters, allJobs]);

  // Handle resume upload with validation
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
        setResume(null);
      } else if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        setResume(null);
      } else {
        setError('');
        setResume(file);
      }
    } else {
      setError('No file selected');
      setResume(null);
    }
  };

  // Analyze resume
  const handleAnalyzeResume = async () => {
    if (!resume) {
      setError('Please select a valid resume file');
      return;
    }
    if (hasAnalyzed) {
      setError('Resume already analyzed. Upload a new file to re-run.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', resume);
      const res = await fetch('http://127.0.0.1:8000/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setScore(data.score);
        setIssues(Array.isArray(data.issues) ? data.issues : []);
        setUpdatedResumeUrl(data.updated_resume_url || '');
        setHasAnalyzed(true);
      } else {
        setError(data.error || 'Resume analysis failed');
      }
    } catch (err) {
      setError('Resume analysis failed: ' + err.message);
    }
    setLoading(false);
  };

  // Apply to job
  const handleApply = async (job) => {
    setLoading(true);
    setError('');
    try {
      const body = {
        jobId: job._id,
        seekerId: user?.id || 'dummySeekerId',
        seekerEmail: user?.email || 'jobseeker@email.com',
        recruiterEmail: job.recruiterEmail || 'recruiter@email.com',
      };
      const res = await fetch('http://localhost:5000/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setAppliedJobId(job._id);
      } else {
        setError('Failed to apply');
      }
    } catch (err) {
      setError('Failed to apply: ' + err.message);
    }
    setLoading(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      experience: '',
      location: '',
      domain: '',
      employmentType: ''
    });
  };

  // Get time ago string
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} Hour${diffInHours !== 1 ? 's' : ''} Ago`;
    } else if (diffInHours < 48) {
      return '1 Day Ago';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} Days Ago`;
    }
  };

  // Handle job card click to open details page
  const handleJobCardClick = (job) => {
    navigate(`/job-details/${job._id}`, { 
      state: { jobData: job } 
    });
  };

  // Toggle skills expansion for a specific job
  const toggleSkillsExpansion = (jobId, e) => {
    e.stopPropagation(); // Prevent job card click
    setExpandedSkills(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="profile">
          <div className="avatar">JS</div>
          <div>
            <h2>{userLoading ? 'Loading...' : generateGreeting(user)}</h2>
            <p>Here's a quick overview of your job search activity</p>
          </div>
        </div>
        <div className="stats">
          <div className="stat-box">
            <span className="stat-number">{filteredJobs.length}</span>
            <span className="stat-label">Jobs Available</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{appliedJobId ? 1 : 0}</span>
            <span className="stat-label">Jobs Applied</span>
          </div>
        </div>
      </header>

      {/* Resume Analysis Section */}
      <section className="resume-section">
        <h3>Analyze Your Resume</h3>
        <div className="resume-upload">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeChange}
            id="resume-upload"
        />
          <label htmlFor="resume-upload" className="file-upload-label">
            Choose File
          </label>
        <button
          onClick={handleAnalyzeResume}
          disabled={!resume || loading}
          className="analyze-btn"
        >
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
        </div>
        {score !== null && (
          <div className="score-box">
            Your Resume Score: <b>{score}</b>/100
          </div>
        )}
        {issues.length > 0 && (
          <div className="score-box" style={{ marginTop: '10px' }}>
            <div style={{ fontWeight: 'bold' }}>Suggestions:</div>
            <ul>
              {issues.map((it, idx) => (
                <li key={idx}>{it}</li>
              ))}
            </ul>
          </div>
        )}
        {updatedResumeUrl && (
          <div className="score-box" style={{ marginTop: '10px' }}>
            <a
              href={updatedResumeUrl.startsWith('http') ? updatedResumeUrl : `${backendBaseUrl}${updatedResumeUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              Download updated resume
            </a>
          </div>
        )}
        {error && <div className="error">{error}</div>}
      </section>

      {/* Main Content with Sidebar */}
      <div className="main-content">
        {/* Left Sidebar - Filters */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <FaFilter />
            <h3>Filters</h3>
            <button onClick={clearFilters} className="clear-filters">
              Clear All
            </button>
          </div>
          
          {/* Experience Filter */}
          <div className="filter-group">
            <label>Experience Level</label>
            <select
              value={filters.experience}
              onChange={(e) => setFilters({...filters, experience: e.target.value})}
            >
              <option value="">All Experience Levels</option>
              {experienceOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="filter-group">
            <label>Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            >
              <option value="">All Locations</option>
              {availableLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Domain/Company Filter */}
          <div className="filter-group">
            <label>Company/Domain</label>
            <select
              value={filters.domain}
              onChange={(e) => setFilters({...filters, domain: e.target.value})}
            >
              <option value="">All Companies</option>
              {availableDomains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>

          {/* Employment Type Filter */}
          <div className="filter-group">
            <label>Employment Type</label>
            <select
              value={filters.employmentType}
              onChange={(e) => setFilters({...filters, employmentType: e.target.value})}
            >
              <option value="">All Types</option>
              {employmentTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="filter-results">
            <p>{filteredJobs.length} jobs found</p>
          </div>
        </aside>

        {/* Right Content - Job Cards */}
        <main className="jobs-content">
          <div className="jobs-header">
            <h3>Available Jobs</h3>
            <div className="jobs-count">
              Showing {filteredJobs.length} of {allJobs.length} jobs
            </div>
          </div>

          {error && !score && <div className="error">{error}</div>}
          
                      <div className="jobs-grid">
              {filteredJobs.map(job => (
                <div 
                  className="job-card" 
                  key={job._id}
                  onClick={() => handleJobCardClick(job)}
                >
                  {/* Job Header */}
                  <div className="job-header">
                    <div className="job-title">{job.title}</div>
                  </div>

                  {/* Company Info */}
                  <div className="company-info">
                    <div className="company-logo">
                      {job.company?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="company-details">
                      <div className="company-name">{job.company}</div>
                      <div className="company-rating">
                        <FaStar className="star" />
                        <span>4.2</span>
                        <span className="reviews">(2.5k Reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="job-details">
                    <div className="detail-item">
                      <FaBriefcase />
                      <span>{job.experienceRequired || 'Experience not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <FaRupeeSign />
                      <span>Salary not disclosed</span>
                    </div>
                    <div className="detail-item">
                      <FaMapPin />
                      <span>{job.location}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="job-skills">
                      {Array.isArray(job.requiredSkills) 
                        ? (expandedSkills[job._id] 
                            ? job.requiredSkills.map((skill, index) => (
                                <span key={index} className="skill-tag">{skill}</span>
                              ))
                            : job.requiredSkills.slice(0, 3).map((skill, index) => (
                                <span key={index} className="skill-tag">{skill}</span>
                              ))
                          )
                        : (expandedSkills[job._id]
                            ? job.requiredSkills.split(',').map((skill, index) => (
                                <span key={index} className="skill-tag">{skill.trim()}</span>
                              ))
                            : job.requiredSkills.split(',').slice(0, 3).map((skill, index) => (
                                <span key={index} className="skill-tag">{skill.trim()}</span>
                              ))
                          )
                      }
                      {Array.isArray(job.requiredSkills) 
                        ? job.requiredSkills.length > 3 && (
                            <span 
                              className="skill-more clickable"
                              onClick={(e) => toggleSkillsExpansion(job._id, e)}
                            >
                              {expandedSkills[job._id] ? 'Show Less' : `+${job.requiredSkills.length - 3} more`}
                            </span>
                          )
                        : job.requiredSkills.split(',').length > 3 && (
                            <span 
                              className="skill-more clickable"
                              onClick={(e) => toggleSkillsExpansion(job._id, e)}
                            >
                              {expandedSkills[job._id] ? 'Show Less' : `+${job.requiredSkills.split(',').length - 3} more`}
                            </span>
                          )
                      }
                    </div>
                  )}

                  {/* Posted Date */}
                  <div className="job-posted">
                    {getTimeAgo(job.createdAt)}
                  </div>
            </div>
          ))}
        </div>

          {filteredJobs.length === 0 && (
            <div className="no-jobs">
              <h3>No jobs found</h3>
              <p>Try adjusting your filters or check back later for new opportunities.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;