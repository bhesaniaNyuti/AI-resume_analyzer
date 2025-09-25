import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaEdit, FaPlus, FaSearch, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { generateGreeting } from '../utils/greetingGenerator';

const recruiter = {
  name: 'Alex Morgan',
  email: 'alex.morgan@company.com',
  profilePhoto: '', // leave blank for default icon
};

// Empty array - will be populated with real data from backend
const mockJobs = [];

const statusColors = {
  Active: '#19c37d',
  Paused: '#ffc107',
  Closed: '#e74c3c',
};

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(mockJobs);
  
  // Add CSS for spin animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [expandedJob, setExpandedJob] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedJobId, setAnalyzedJobId] = useState(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState({});
  const [showApplications, setShowApplications] = useState({});
  const [newJob, setNewJob] = useState({
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

  // Fetch user data and jobs from localStorage and backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserData = localStorage.getItem('recruiterData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUser(userData);
          
          // Update newJob with user data
          setNewJob(prev => ({
            ...prev,
            company: userData.company || '',
            contact: userData.email || ''
          }));

          // Fetch real jobs from backend
          const response = await fetch(`http://localhost:5000/api/recruiter/${userData.id}/jobs`);
          if (response.ok) {
            const realJobs = await response.json();
            setJobs(realJobs.map(job => ({
              id: job._id,
              title: job.title,
              status: job.status,
              description: job.description,
              resumes: 0, // Will be updated when applications are implemented
              topResumes: []
            })));
            
            // Fetch applications for each job to get total count
            for (const job of realJobs) {
              try {
                const appsResponse = await fetch(`http://localhost:5000/api/jobs/${job._id}/applications`);
                if (appsResponse.ok) {
                  const apps = await appsResponse.json();
                  setApplications(prev => ({ ...prev, [job._id]: apps }));
                }
              } catch (error) {
                console.error('Error fetching applications for job:', job._id, error);
              }
            }
          }
        } else {
          // Fallback to mock data if no stored data
          setUser(recruiter);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      // Delete from backend
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recruiterEmail: user.email })
      });

      if (response.ok) {
        // Remove from local state
        setJobs(jobs.filter(job => job.id !== id));
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job');
    }
  };

  const handleExpand = (id) => {
    setExpandedJob(expandedJob === id ? null : id);
  };

  const handleAnalyze = (jobId) => {
    setAnalyzing(true);
    setAnalyzedJobId(jobId);
    setTimeout(() => {
      setAnalyzing(false);
    }, 1800);
  };

  // Fetch applications for a specific job
  const fetchApplications = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/applications`);
      if (response.ok) {
        const apps = await response.json();
        console.log('Fetched applications for job:', jobId, apps);
        // Debug each application's resume data
        apps.forEach((app, index) => {
          console.log(`Application ${index}:`, {
            id: app._id,
            resumeFileName: app.resumeFileName,
            resumePath: app.resumePath,
            resumePathType: typeof app.resumePath,
            resumePathLength: app.resumePath ? app.resumePath.length : 0
          });
        });
        setApplications(prev => ({ ...prev, [jobId]: apps }));
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // Toggle applications view for a job
  const toggleApplications = (jobId) => {
    if (!applications[jobId]) {
      fetchApplications(jobId);
    }
    setShowApplications(prev => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  // Download resume
  const downloadResume = (filename, resumePath) => {
    console.log('downloadResume called with:', { filename, resumePath });
    if (resumePath) {
      // Extract just the filename if resumePath contains a full path
      let cleanResumePath = resumePath;
      if (resumePath.includes('uploads\\') || resumePath.includes('uploads/')) {
        cleanResumePath = resumePath.split(/[\\\/]/).pop(); // Get the last part after any slash or backslash
        console.log('Extracted clean filename from path:', cleanResumePath);
      }
      
      // Encode the filename to handle special characters like parentheses
      const encodedFilename = encodeURIComponent(cleanResumePath);
      const downloadUrl = `http://localhost:5000/api/resume/${encodedFilename}`;
      console.log('Downloading resume:', { filename, resumePath, cleanResumePath, downloadUrl });
      window.open(downloadUrl, '_blank');
    } else {
      console.error('No resumePath provided for download');
    }
  };

  const handleAddJob = (e) => {
    e.preventDefault();
    setJobs([
      ...jobs,
      {
        id: Date.now(),
        title: newJob.title,
        status: 'Active',
        description: newJob.description,
        resumes: 0,
        topResumes: [],
        ...newJob,
      },
    ]);
    setShowAddJob(false);
    setNewJob({
      title: '', description: '', skills: '', company: user?.company || '', qualification: '', experience: '', location: '', employmentType: '', deadline: '', contact: user?.email || '',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #eaf3fa 0%, #f7f6fd 100%)' }}
    >
      {/* Removed internal navigation bar here */}

      {/* Welcome Section & Stats */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        style={{ padding: '2.5rem 3rem 1.5rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>{loading ? 'Loading...' : generateGreeting(user)}</h2>
          <div style={{ color: '#5a6473', fontSize: 18, marginTop: 8 }}>Here’s a quick overview of your hiring activity</div>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6, type: 'spring', stiffness: 120 }}
          style={{ display: 'flex', gap: 32 }}
        >
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px 0 rgba(44,62,80,0.07)', padding: '1.2rem 2.2rem', minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 28, color: '#0099e6' }}>{jobs.length}</div>
            <div style={{ color: '#5a6473', fontSize: 15 }}>Jobs Posted</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px 0 rgba(44,62,80,0.07)', padding: '1.2rem 2.2rem', minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 28, color: '#8f7cff' }}>{Object.values(applications).reduce((total, apps) => total + (apps?.length || 0), 0)}</div>
            <div style={{ color: '#5a6473', fontSize: 15 }}>Total Applications</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Job Post Management */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        style={{ padding: '1.5rem 3rem 2.5rem 3rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Your Job Posts</h3>
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.97 }}
            style={{ background: 'linear-gradient(90deg, #0099e6 0%, #8f7cff 100%)', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 12, padding: '0.7rem 2.1rem', cursor: 'pointer', boxShadow: '0 2px 12px 0 rgba(108,99,255,0.13)' }}
            onClick={() => navigate('/add-job')}
          >
            <FaPlus style={{ marginRight: 8 }} /> Post New Job
          </motion.button>
        </div>
        {/* Add Job Modal */}
        <AnimatePresence>
          {showAddJob && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.18)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setShowAddJob(false)}
            >
              <motion.form
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 8px 32px 0 rgba(44,62,80,0.18)',
                  padding: '2.2rem 2.5rem',
                  minWidth: 380,
                  maxWidth: '90vw',
                  zIndex: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}
                onClick={e => e.stopPropagation()}
                onSubmit={handleAddJob}
              >
                <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 8 }}>Add New Job Post</h2>
                <label>Job Title
                  <input required value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #e0e7ef', marginTop: 4 }} />
                </label>
                <label>Job Description
                  <textarea required value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #e0e7ef', marginTop: 4, minHeight: 60 }} />
                </label>
                <label>Required Skills (comma separated)
                  <input value={newJob.skills} onChange={e => setNewJob({ ...newJob, skills: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #e0e7ef', marginTop: 4 }} />
                </label>
                <label>Company Detail
                  <input value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #e0e7ef', marginTop: 4 }} />
                </label>
                <label>Required Qualification
                  <input value={newJob.qualification} onChange={e => setNewJob({ ...newJob, qualification: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #e0e7ef', marginTop: 4 }} />
                </label>
                <label>Experience
                  <input value={newJob.experience} onChange={e => setNewJob({ ...newJob, experience: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #e0e7ef', marginTop: 4 }} />
                </label>
                <label>Location
                  <input value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #e0e7ef', marginTop: 4 }} />
                </label>
                <label>Employment Type
                  <select required value={newJob.employmentType} onChange={e => setNewJob({ ...newJob, employmentType: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #e0e7ef', marginTop: 4 }}>
                    <option value="">Select type</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </label>
                <label>Application Deadline
                  <input type="date" value={newJob.deadline} onChange={e => setNewJob({ ...newJob, deadline: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #e0e7ef', marginTop: 4 }} />
                </label>
                <label>Recruiter Contact Info
                  <input value={newJob.contact} onChange={e => setNewJob({ ...newJob, contact: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #e0e7ef', marginTop: 4 }} />
                </label>
                <button type="submit" style={{ background: 'linear-gradient(90deg, #0099e6 0%, #19c37d 100%)', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 10, padding: '0.7rem 2.1rem', cursor: 'pointer', marginTop: 8 }}>Add</button>
                <button type="button" onClick={() => setShowAddJob(false)} style={{ background: '#e0e7ef', color: '#23272f', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 10, padding: '0.7rem 2.1rem', cursor: 'pointer', marginTop: 8 }}>Cancel</button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {jobs.map(job => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px 0 rgba(44,62,80,0.07)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 22 }}>{job.title}</div>
                <span style={{ background: statusColors[job.status], color: '#fff', borderRadius: 8, padding: '0.2rem 0.9rem', fontWeight: 600, fontSize: 15 }}>{job.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ background: '#eaf6ff', color: '#0099e6', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                  onClick={() => handleExpand(job.id)}
                >
                  More Details {expandedJob === job.id ? <FaChevronUp /> : <FaChevronDown />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ background: '#f3eaff', color: '#8f7cff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                  onClick={() => navigate(`/edit-job/${job.id}`)}
                >
                  <FaEdit /> Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ background: '#ffeaea', color: '#e74c3c', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                  onClick={() => handleDelete(job.id)}
                >
                  <FaTrash /> Delete
                </motion.button>
              </div>
              {/* Animated Details Section */}
              <AnimatePresence>
                {expandedJob === job.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{ position: 'absolute', left: 0, top: '100%', width: '100%', background: '#f7fbff', borderRadius: 12, boxShadow: '0 2px 12px 0 rgba(44,62,80,0.07)', padding: '1.5rem 2rem', marginTop: 12, zIndex: 10 }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Job Description</div>
                    <div style={{ color: '#23272f', fontSize: 16, marginBottom: 18 }}>{job.description}</div>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Total Applications: <span style={{ color: '#0099e6', fontWeight: 700 }}>{applications[job.id]?.length || 0}</span></div>
                    
                    {/* View Applications Button */}
                    <motion.button
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ background: 'linear-gradient(90deg, #8f7cff 0%, #6C63FF 100%)', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 10, padding: '0.6rem 1.7rem', cursor: 'pointer', marginBottom: 18, marginTop: 8, marginRight: 12 }}
                      onClick={() => toggleApplications(job.id)}
                    >
                      <FaEye style={{ marginRight: 8 }} />
                      {showApplications[job.id] ? 'Hide Applications' : 'View Applications'}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ background: 'linear-gradient(90deg, #0099e6 0%, #19c37d 100%)', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 10, padding: '0.6rem 1.7rem', cursor: 'pointer', marginBottom: 18, marginTop: 8 }}
                      onClick={() => handleAnalyze(job.id)}
                      disabled={analyzing && analyzedJobId === job.id}
                    >
                      {analyzing && analyzedJobId === job.id ? (
                        <span><FaSearch className="spin" style={{ marginRight: 8 }} />Analyzing...</span>
                      ) : (
                        <span><FaSearch style={{ marginRight: 8 }} />Analyze All Resumes</span>
                      )}
                    </motion.button>
                    <AnimatePresence>
                      {analyzedJobId === job.id && !analyzing && job.topResumes.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          style={{ marginTop: 12 }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Top 10 Resumes (ATS Match)</div>
                          <ol style={{ paddingLeft: 20 }}>
                            {job.topResumes.map((resume, idx) => (
                              <li key={idx} style={{ marginBottom: 4, fontSize: 15 }}>
                                <span style={{ fontWeight: 600 }}>{resume.name}</span> — <span style={{ color: '#19c37d', fontWeight: 700 }}>{resume.score}% match</span>
                              </li>
                            ))}
                          </ol>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Applications Section */}
                    <AnimatePresence>
                      {showApplications[job.id] && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          style={{ marginTop: 20, padding: '1rem', background: '#f8f9ff', borderRadius: 12, border: '1px solid #e6e4ff' }}
                        >
                          <h4 style={{ margin: '0 0 16px 0', color: '#2d3748', fontSize: 18 }}>Applications ({applications[job.id]?.length || 0})</h4>
                          
                          {applications[job.id] && applications[job.id].length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {applications[job.id].map((app, index) => (
                                <div key={app._id || index} style={{ 
                                  background: '#fff', 
                                  padding: '16px', 
                                  borderRadius: 8, 
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div>
                                      <div style={{ fontWeight: 600, color: '#2d3748', marginBottom: 4 }}>
                                        {app.seekerEmail}
                                      </div>
                                      <div style={{ fontSize: 14, color: '#718096', marginBottom: 8 }}>
                                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                      {app.resumeFileName && (
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => downloadResume(app.resumeFileName, app.resumePath)}
                                          style={{
                                            background: '#0099e6',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 6,
                                            padding: '8px 12px',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                          }}
                                        >
                                          <FaDownload size={12} />
                                          Download Resume
                                        </motion.button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Application Details */}
                                  <div style={{ fontSize: 14, color: '#4a5568' }}>
                                    {app.whyHire && (
                                      <div style={{ marginBottom: 8 }}>
                                        <strong>Why Hire:</strong> {app.whyHire}
                                      </div>
                                    )}
                                    {app.keySkills && (
                                      <div style={{ marginBottom: 8 }}>
                                        <strong>Key Skills:</strong> {app.keySkills}
                                      </div>
                                    )}
                                    {app.careerImpact && (
                                      <div style={{ marginBottom: 8 }}>
                                        <strong>Career Impact:</strong> {app.careerImpact}
                                      </div>
                                    )}
                                    {app.proudProject && (
                                      <div style={{ marginBottom: 8 }}>
                                        <strong>Proud Project:</strong> {app.proudProject}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>
                              No applications received yet for this job.
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
} 