import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaMapPin, FaBriefcase, FaRupeeSign, FaCalendarAlt, FaBuilding, FaStar, FaArrowLeft, FaClock } from 'react-icons/fa';
import './JobDetails.css';
import JobApplicationModal from './JobApplicationModal';

const JobDetails = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Get job data from navigation state or fetch from API
    if (location.state?.jobData) {
      setJob(location.state.jobData);
      setLoading(false);
    } else {
      // Fetch job data from API if not passed via state
      fetchJobDetails();
    }
  }, [jobId, location.state]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
      if (response.ok) {
        const jobData = await response.json();
        setJob(jobData);
      } else {
        setError('Job not found');
      }
    } catch (err) {
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setIsModalOpen(true);
  };

  const handleApplicationSubmit = async (formData) => {
    setApplying(true);
    try {
      console.log('Sending application data:', formData); // Debug log
      console.log('FormData instance:', formData instanceof FormData); // Debug log
      
      // Check if it's FormData (file upload) or JSON
      const isFormData = formData instanceof FormData;
      
      const requestConfig = {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' }, // Don't set Content-Type for FormData
        body: isFormData ? formData : JSON.stringify(formData),
      };
      
      console.log('Request config:', requestConfig); // Debug log
      
      const response = await fetch('http://localhost:5000/api/apply', requestConfig);

      if (response.ok) {
        setApplied(true);
        alert('Application submitted successfully!');
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply');
      }
    } catch (err) {
      alert(`Failed to apply: ${err.message}`);
      throw err; // Re-throw to prevent modal from closing
    } finally {
      setApplying(false);
    }
  };

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

  if (loading) {
    return (
      <div className="job-details-container">
        <div className="loading">Loading job details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-details-container">
        <div className="error-message">
          <h2>Job Not Found</h2>
          <p>{error || 'The job you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/jobseeker-dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-container">
      {/* Header */}
      <div className="job-details-header">
        <button onClick={() => navigate('/jobseeker-dashboard')} className="back-btn">
          <FaArrowLeft /> Back to Jobs
        </button>
        <div className="posted-time">
          <FaClock /> {getTimeAgo(job.createdAt)}
        </div>
      </div>

      {/* Main Job Card */}
      <div className="job-details-card">
        {/* Job Title and Company */}
        <div className="job-header-section">
          <div className="company-logo">
            {job.company?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div className="job-title-section">
            <h1 className="job-title">{job.title}</h1>
            <div className="company-info">
              <span className="company-name">{job.company}</span>
              <div className="company-rating">
                <FaStar className="star" />
                <span>4.2</span>
                <span className="reviews">(2.5k Reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Job Details */}
        <div className="key-details">
          <div className="detail-item">
            <FaBriefcase />
            <div>
              <label>Experience Required</label>
              <span>{job.experienceRequired || 'Not specified'}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <FaMapPin />
            <div>
              <label>Location</label>
              <span>{job.location}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <FaBuilding />
            <div>
              <label>Employment Type</label>
              <span>{job.employmentType}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <FaCalendarAlt />
            <div>
              <label>Application Deadline</label>
              <span>
                {job.applicationDeadline 
                  ? new Date(job.applicationDeadline).toLocaleDateString()
                  : 'No deadline specified'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="job-description-section">
          <h3>Job Description</h3>
          <div className="description-content">
            {job.description}
          </div>
        </div>

        {/* Required Skills */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="skills-section">
            <h3>Required Skills</h3>
            <div className="skills-grid">
              {Array.isArray(job.requiredSkills) 
                ? job.requiredSkills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))
                : job.requiredSkills.split(',').map((skill, index) => (
                    <span key={index} className="skill-tag">{skill.trim()}</span>
                  ))
              }
            </div>
          </div>
        )}

        {/* Required Qualification */}
        {job.requiredQualification && (
          <div className="qualification-section">
            <h3>Required Qualification</h3>
            <p>{job.requiredQualification}</p>
          </div>
        )}

        {/* Contact Information */}
        {job.contactInformation && (
          <div className="contact-section">
            <h3>Contact Information</h3>
            <p>{job.contactInformation}</p>
          </div>
        )}

        {/* Apply Button */}
        <div className="apply-section">
          <button
            className={`apply-btn ${applied ? 'applied' : ''}`}
            onClick={handleApply}
            disabled={applied || applying}
          >
            {applied ? 'Applied ✓' : 'Apply Now'}
          </button>
          {applied && (
            <p className="applied-message">
              Your application has been submitted successfully!
            </p>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <JobApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          job={job}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
};

export default JobDetails;
