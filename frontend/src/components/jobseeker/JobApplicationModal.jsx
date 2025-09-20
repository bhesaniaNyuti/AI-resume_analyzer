import React, { useState } from 'react';
import { FaTimes, FaUpload, FaFileAlt } from 'react-icons/fa';
import './JobApplicationModal.css';

const JobApplicationModal = ({ isOpen, onClose, job, onSubmit }) => {
  const [formData, setFormData] = useState({
    whyHire: '',
    careerImpact: '',
    keySkills: '',
    proudProject: '',
    resume: null
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          resume: 'Please upload a PDF or Word document (.pdf, .doc, .docx)'
        }));
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          resume: 'File size exceeds 5MB limit'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
      
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.whyHire.trim()) {
      newErrors.whyHire = 'This field is required';
    }
    
    if (!formData.careerImpact.trim()) {
      newErrors.careerImpact = 'This field is required';
    }
    
    if (!formData.keySkills.trim()) {
      newErrors.keySkills = 'This field is required';
    }
    
    if (!formData.proudProject.trim()) {
      newErrors.proudProject = 'This field is required';
    }
    
    // Validate resume
    if (!formData.resume) {
      newErrors.resume = 'Resume upload is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Check if job ID exists
    if (!job || !job._id) {
      console.error('Job ID is missing:', job);
      alert('Error: Job information is missing. Please try again.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('whyHire', formData.whyHire);
      formDataToSend.append('careerImpact', formData.careerImpact);
      formDataToSend.append('keySkills', formData.keySkills);
      formDataToSend.append('proudProject', formData.proudProject);
      formDataToSend.append('jobId', job._id);
      formDataToSend.append('seekerEmail', localStorage.getItem('jobSeekerData') ? JSON.parse(localStorage.getItem('jobSeekerData')).email : 'jobseeker@email.com');
      formDataToSend.append('recruiterEmail', job.recruiterEmail);
      
      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, ':', value);
      }
      
      // Add resume file if selected
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
        console.log('Added resume file:', formData.resume.name, 'Size:', formData.resume.size);
      } else {
        console.log('No resume file selected');
      }
      
      console.log('Job object:', job); // Debug log for job object
      console.log('Job ID:', job._id); // Debug log for job ID
      console.log('Submitting application data:', {
        whyHire: formData.whyHire,
        careerImpact: formData.careerImpact,
        keySkills: formData.keySkills,
        proudProject: formData.proudProject,
        resume: formData.resume ? formData.resume.name : 'No file',
        jobId: job._id,
        seekerEmail: localStorage.getItem('jobSeekerData') ? JSON.parse(localStorage.getItem('jobSeekerData')).email : 'jobseeker@email.com',
        recruiterEmail: job.recruiterEmail
      });
      
      await onSubmit(formDataToSend);
      
      // Reset form
      setFormData({
        whyHire: '',
        careerImpact: '',
        keySkills: '',
        proudProject: '',
        resume: null
      });
      
      onClose();
    } catch (error) {
      console.error('Application submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const removeResume = () => {
    setFormData(prev => ({
      ...prev,
      resume: null
    }));
    setErrors(prev => ({
      ...prev,
      resume: ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Applying to {job?.title}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Job Overview */}
        <div className="job-overview">
          <div className="company-info">
            <div className="company-logo">
              {job?.company?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="company-details">
              <h3>{job?.company}</h3>
              <p>{job?.location} • {job?.employmentType}</p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="application-form">
          {/* Why should we hire you */}
          <div className="form-group">
            <label className="form-label">
              Why should we hire you for this role? <span className="required">*</span>
            </label>
            <textarea
              value={formData.whyHire}
              onChange={(e) => handleInputChange('whyHire', e.target.value)}
              placeholder="Short answer explaining why you're the best fit for this role..."
              className={`form-input ${errors.whyHire ? 'error' : ''}`}
              rows="3"
            />
            {errors.whyHire && <span className="error-message">{errors.whyHire}</span>}
          </div>

          {/* Career impact */}
          <div className="form-group">
            <label className="form-label">
              How will this job role impact your career growth? <span className="required">*</span>
            </label>
            <textarea
              value={formData.careerImpact}
              onChange={(e) => handleInputChange('careerImpact', e.target.value)}
              placeholder="Brief explanation of how this role will help your career..."
              className={`form-input ${errors.careerImpact ? 'error' : ''}`}
              rows="3"
            />
            {errors.careerImpact && <span className="error-message">{errors.careerImpact}</span>}
          </div>

          {/* Key skills */}
          <div className="form-group">
            <label className="form-label">
              What key skills or strengths make you suitable for this position? <span className="required">*</span>
            </label>
            <textarea
              value={formData.keySkills}
              onChange={(e) => handleInputChange('keySkills', e.target.value)}
              placeholder="Highlight 2-3 skills that make you perfect for this role..."
              className={`form-input ${errors.keySkills ? 'error' : ''}`}
              rows="3"
            />
            {errors.keySkills && <span className="error-message">{errors.keySkills}</span>}
          </div>

          {/* Proud project */}
          <div className="form-group">
            <label className="form-label">
              Describe one project or achievement you are most proud of <span className="required">*</span>
            </label>
            <textarea
              value={formData.proudProject}
              onChange={(e) => handleInputChange('proudProject', e.target.value)}
              placeholder="2-3 lines about your proudest achievement..."
              className={`form-input ${errors.proudProject ? 'error' : ''}`}
              rows="3"
            />
            {errors.proudProject && <span className="error-message">{errors.proudProject}</span>}
          </div>

          {/* Resume Upload */}
          <div className="form-group">
            <label className="form-label">
              Upload Your Resume <span className="required">*</span>
            </label>
            <div className="resume-upload-area">
              {formData.resume ? (
                <div className="resume-preview">
                  <FaFileAlt className="file-icon" />
                  <div className="file-info">
                    <span className="file-name">{formData.resume.name}</span>
                    <span className="file-size">
                      {(formData.resume.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={removeResume}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    id="resume-upload"
                    className="file-input"
                  />
                  <label htmlFor="resume-upload" className="upload-label">
                    <FaUpload className="upload-icon" />
                    <span>Click to upload PDF/DOCX</span>
                    <small>Maximum file size: 5MB</small>
                  </label>
                </div>
              )}
            </div>
            {errors.resume && <span className="error-message">{errors.resume}</span>}
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationModal;
