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
  const [downloadUrls, setDownloadUrls] = useState({});
  const [sections, setSections] = useState({});
  const [scoreBreakdown, setScoreBreakdown] = useState({});
  const [professionalismScore, setProfessionalismScore] = useState(null);
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
      
      console.log('Uploading resume:', resume.name, 'Size:', resume.size);
      console.log('API endpoint: http://127.0.0.1:8000/api/analyze-resume');
      
      const res = await fetch('http://127.0.0.1:8000/api/analyze-resume', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it automatically with boundary for FormData
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      // Check if response is ok before parsing JSON
      if (!res.ok) {
        let errorMessage = `Server error: ${res.status} ${res.statusText}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (e) {
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      console.log('Resume analysis response:', data); // Debug logging
      
      if (data.success !== false) {
        setScore(data.score);
        setProfessionalismScore(data.professionalism_score || null);
        setIssues(Array.isArray(data.issues) ? data.issues : []);
        setUpdatedResumeUrl(data.updated_resume_url || '');
        setDownloadUrls(data.download_urls || {});
        setSections(data.sections || {});
        setHasAnalyzed(true);
        console.log('Download URLs set:', data.download_urls); // Debug logging
      } else {
        setError(data.error || data.message || 'Resume analysis failed');
      }
    } catch (err) {
      console.error('Resume analysis error:', err);
      let errorMessage = 'Resume analysis failed: ';
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMessage += 'Cannot connect to server. Please ensure the FastAPI server is running on http://127.0.0.1:8000';
      } else if (err.message.includes('CORS')) {
        errorMessage += 'CORS error. Please check server CORS configuration.';
      } else {
        errorMessage += err.message;
      }
      setError(errorMessage);
    }
    setLoading(false);
  };

  // Helpers for visualization colors similar to homepage widget
  const getScoreColor = (value) => {
    if (value >= 80) return '#4CAF50';
    if (value >= 60) return '#FF9800';
    return '#F44336';
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
        // Persist minimal application record locally for profile page (user-specific)
        const existing = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        const userEmail = user?.email;
        
        // Only add if this user hasn't applied to this job yet
        if (!existing.some(j => (j.id === job._id || j._id === job._id) && j.seekerEmail === userEmail)) {
          existing.push({
            id: job._id,
            _id: job._id,
            title: job.title,
            company: job.company,
            status: 'Pending',
            seekerEmail: userEmail,
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem('appliedJobs', JSON.stringify(existing));
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.alreadyApplied) {
          setError('You have already applied for this job.');
          setAppliedJobId(job._id);
        } else {
          setError(errorData.error || 'Failed to apply');
        }
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
          <div className="resume-analysis-results">
            <div className="analysis-header">
              <div className="score-panel">
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-number">{score}</span>
                    <span className="score-total">/100</span>
                  </div>
                  <div className="score-label">Resume Health Score</div>
                </div>
              </div>

              {professionalismScore && (
                <div className="breakdown">
                  <h4>Professionalism Breakdown</h4>
                  <div className="breakdown-grid">
                    {[
                      { key: 'grammar', label: 'Grammar & Language', max: 20 },
                      { key: 'structure', label: 'Structure & Format', max: 25 },
                      { key: 'readability', label: 'Readability', max: 15 },
                      { key: 'keywords', label: 'Keywords & Skills', max: 15 },
                      { key: 'contact_info', label: 'Contact Information', max: 10 },
                      { key: 'achievements', label: 'Achievements', max: 5 },
                      { key: 'formatting', label: 'Formatting & Presentation', max: 10 },
                      { key: 'action_verbs', label: 'Action Verbs', max: 5 },
                      { key: 'quantification', label: 'Quantification & Metrics', max: 5 },
                    ].map(item => (
                      <div className="breakdown-item" key={item.key}>
                        <span>{item.label}</span>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{
                              width: `${Math.min(100, (professionalismScore[item.key] / item.max) * 100)}%`,
                              backgroundColor: getScoreColor((professionalismScore[item.key] / item.max) * 100)
                            }}
                          ></div>
                          <span className="breakdown-score">{Math.round(professionalismScore[item.key])}/{item.max}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Debug information */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
                <strong>Debug Info:</strong><br/>
                Download URLs: {JSON.stringify(downloadUrls)}<br/>
                Updated Resume URL: {updatedResumeUrl}
              </div>
            )}

            {/* Download Section */}
            <div className="download-section">
              <h4>Download Enhanced Resume</h4>
              {Object.keys(downloadUrls).length > 0 ? (
                <div className="download-buttons">
                  {downloadUrls.corrected_pdf && (
                    <a
                      href={`${backendBaseUrl}${downloadUrls.corrected_pdf}`}
                      target="_blank"
                      rel="noreferrer"
                      className="download-btn corrected"
                    >
                      📄 Corrected PDF
                    </a>
                  )}
                  {downloadUrls.professional_pdf && (
                    <a
                      href={`${backendBaseUrl}${downloadUrls.professional_pdf}`}
                      target="_blank"
                      rel="noreferrer"
                      className="download-btn professional"
                    >
                      ✨ Professional PDF
                    </a>
                  )}
                  {downloadUrls.corrected_docx && !downloadUrls.corrected_pdf && (
                    <a
                      href={`${backendBaseUrl}${downloadUrls.corrected_docx}`}
                      target="_blank"
                      rel="noreferrer"
                      className="download-btn corrected"
                    >
                      📄 Corrected DOCX
                    </a>
                  )}
                  {downloadUrls.professional_docx && !downloadUrls.professional_pdf && (
                    <a
                      href={`${backendBaseUrl}${downloadUrls.professional_docx}`}
                      target="_blank"
                      rel="noreferrer"
                      className="download-btn professional"
                    >
                      ✨ Professional DOCX
                    </a>
                  )}
                  {downloadUrls.simple_txt && (
                    <a
                      href={`${backendBaseUrl}${downloadUrls.simple_txt}`}
                      target="_blank"
                      rel="noreferrer"
                      className="download-btn corrected"
                    >
                      📄 Analysis Report (TXT)
                    </a>
                  )}
                </div>
              ) : updatedResumeUrl ? (
                <div className="download-buttons">
                  <a
                    href={updatedResumeUrl.startsWith('http') ? updatedResumeUrl : `${backendBaseUrl}${updatedResumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="download-btn corrected"
                  >
                    📄 Download Updated Resume
                  </a>
                </div>
              ) : (
                <div className="no-downloads">
                  <p>Resume processing in progress... Please wait a moment and refresh.</p>
                </div>
              )}
            </div>

            {Object.keys(sections).length > 0 && (
              <div className="sections-preview">
                <h4>Resume Sections Detected</h4>
                <div className="sections-grid">
                  {sections.contact && Object.keys(sections.contact).length > 0 && (
                    <div className="section-item">
                      <span className="section-icon">📧</span>
                      <span className="section-name">Contact Info</span>
                    </div>
                  )}
                  {sections.summary && (
                    <div className="section-item">
                      <span className="section-icon">📝</span>
                      <span className="section-name">Summary</span>
                    </div>
                  )}
                  {sections.experience && sections.experience.length > 0 && (
                    <div className="section-item">
                      <span className="section-icon">💼</span>
                      <span className="section-name">Experience ({sections.experience.length})</span>
                    </div>
                  )}
                  {sections.education && sections.education.length > 0 && (
                    <div className="section-item">
                      <span className="section-icon">🎓</span>
                      <span className="section-name">Education ({sections.education.length})</span>
                    </div>
                  )}
                  {sections.skills && sections.skills.length > 0 && (
                    <div className="section-item">
                      <span className="section-icon">🛠️</span>
                      <span className="section-name">Skills ({sections.skills.length})</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {issues.length > 0 && (
              <div className="suggestions-section">
                <h4>Improvement Suggestions</h4>
                <div className="suggestions-list">
                  {issues.map((issue, idx) => (
                    <div key={idx} className="suggestion-item">
                      <span className="suggestion-icon">💡</span>
                      <span className="suggestion-text">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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