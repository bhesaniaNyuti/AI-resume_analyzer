import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

// This will be populated from localStorage when component mounts
const defaultRecruiter = {
  name: '',
  email: '',
  company: '',
};

export default function AddJob() {
  const navigate = useNavigate();
  const [recruiter, setRecruiter] = useState(defaultRecruiter);
  const [job, setJob] = useState({
    title: '',
    description: '',
    skills: '',
    company: '',
    qualification: '', 
    experience: '',
    location: '',
    employmentType: '',
    deadline: '',
    contact: '',
  });

  // Get recruiter data from localStorage when component mounts
  useEffect(() => {
    const storedRecruiterData = localStorage.getItem('recruiterData');
    if (storedRecruiterData) {
      const recruiterData = JSON.parse(storedRecruiterData);
      setRecruiter(recruiterData);
      setJob(prev => ({
        ...prev,
        company: recruiterData.company || '',
        contact: recruiterData.email || ''
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare the job data to match your backend schema
      const jobData = {
        title: job.title,
        employmentType: job.employmentType,
        location: job.location,
        experienceRequired: job.experience,
        company: job.company,
        applicationDeadline: job.deadline,
        description: job.description,
        requiredSkills: job.skills,
        requiredQualification: job.qualification,
        contactInformation: job.contact,
        recruiterEmail: recruiter.email // Use the recruiter's email from the component
      };

      // Validate required fields
      if (!jobData.title || !jobData.employmentType || !jobData.location || !jobData.company || !jobData.description || !jobData.recruiterEmail) {
        alert('Please fill in all required fields');
        return;
      }

      console.log('Sending job data to backend:', jobData);

      // Send the job data to your backend
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post job');
      }

      const result = await response.json();
      console.log('Job posted successfully:', result);
      
      alert('Job posted successfully!');
      navigate('/recruiter-dashboard');
    } catch (error) {
      console.error('Error posting job:', error);
      alert(`Failed to post job: ${error.message}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #eaf3fa 0%, #f7f6fd 100%)', padding: '2rem 0' }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/recruiter-dashboard')}
            style={{ background: '#fff', border: 'none', borderRadius: 12, padding: '0.8rem', cursor: 'pointer', boxShadow: '0 2px 12px 0 rgba(44,62,80,0.07)' }}
          >
            <FaArrowLeft color="#0099e6" size={20} />
          </motion.button>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>Post New Job</h1>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 8px 32px 0 rgba(44,62,80,0.10)',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#23272f' }}>
                Job Title *
              </label>
              <input
                required
                value={job.title}
                onChange={(e) => setJob({ ...job, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 12,
                  border: '1.5px solid #e0e7ef',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                placeholder="e.g., Senior React Developer"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#23272f' }}>
                Employment Type *
              </label>
              <select
                required
                value={job.employmentType}
                onChange={(e) => setJob({ ...job, employmentType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 12,
                  border: '1.5px solid #e0e7ef',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
              >
                <option value="">Select type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#23272f' }}>
                Location *
              </label>
              <input
                required
                value={job.location}
                onChange={(e) => setJob({ ...job, location: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 12,
                  border: '1.5px solid #e0e7ef',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                placeholder="e.g., New York, NY"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#23272f' }}>
                Experience Required
              </label>
              <input
                value={job.experience}
                onChange={(e) => setJob({ ...job, experience: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 12,
                  border: '1.5px solid #e0e7ef',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                placeholder="e.g., 3-5 years"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#23272f' }}>
                Company *
              </label>
              <input
                required
                value={job.company}
                onChange={(e) => setJob({ ...job, company: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 12,
                  border: '1.5px solid #e0e7ef',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#23272f' }}>
                Application Deadline
              </label>
              <input
                type="date"
                value={job.deadline}
                onChange={(e) => setJob({ ...job, deadline: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 12,
                  border: '1.5px solid #e0e7ef',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#23272f' }}>
              Job Description *
            </label>
            <textarea
              required
              value={job.description}
              onChange={(e) => setJob({ ...job, description: e.target.value })}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: 12,
                border: '1.5px solid #e0e7ef',
                fontSize: 16,
                outline: 'none',
                transition: 'border 0.2s',
                minHeight: 120,
                resize: 'vertical',
              }}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#23272f' }}>
              Required Skills (comma separated)
            </label>
            <input
              value={job.skills}
              onChange={(e) => setJob({ ...job, skills: e.target.value })}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: 12,
                border: '1.5px solid #e0e7ef',
                fontSize: 16,
                outline: 'none',
                transition: 'border 0.2s',
              }}
              placeholder="e.g., React, JavaScript, Node.js, MongoDB"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#23272f' }}>
              Required Qualification
            </label>
            <input
              value={job.qualification}
              onChange={(e) => setJob({ ...job, qualification: e.target.value })}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: 12,
                border: '1.5px solid #e0e7ef',
                fontSize: 16,
                outline: 'none',
                transition: 'border 0.2s',
              }}
              placeholder="e.g., Bachelor's degree in Computer Science"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#23272f' }}>
              Contact Information
            </label>
            <input
              value={job.contact}
              onChange={(e) => setJob({ ...job, contact: e.target.value })}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: 12,
                border: '1.5px solid #e0e7ef',
                fontSize: 16,
                outline: 'none',
                transition: 'border 0.2s',
              }}
              placeholder="Email or phone for applications"
            />
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 16 }}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/recruiter-dashboard')}
              style={{
                background: '#e0e7ef',
                color: '#23272f',
                fontWeight: 600,
                fontSize: 16,
                border: 'none',
                borderRadius: 12,
                padding: '0.8rem 2rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'linear-gradient(90deg, #0099e6 0%, #19c37d 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                border: 'none',
                borderRadius: 12,
                padding: '0.8rem 2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FaSave /> Post Job
            </motion.button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
} 