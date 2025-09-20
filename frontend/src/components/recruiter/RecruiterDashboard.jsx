import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiSearch, FiFilter, FiDownload, FiEye } from 'react-icons/fi'
import './RecruiterDashboard.css'

const RecruiterDashboard = () => {
  const [resumes, setResumes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSkill, setFilterSkill] = useState('')

  // Mock data for demonstration
  const mockResumes = [
    {
      id: 1,
      name: 'John Doe',
      position: 'Frontend Developer',
      skills: ['React', 'JavaScript', 'CSS', 'HTML'],
      score: 85,
      uploadDate: '2024-01-15',
      status: 'Analyzed'
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'Full Stack Developer',
      skills: ['React', 'Node.js', 'Python', 'MongoDB'],
      score: 92,
      uploadDate: '2024-01-14',
      status: 'Analyzed'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      position: 'Backend Developer',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      score: 78,
      uploadDate: '2024-01-13',
      status: 'Processing'
    }
  ]

  const handleFileUpload = (e) => {
    // TODO: Implement file upload logic
    console.log('Files to upload:', e.target.files)
  }

  const filteredResumes = mockResumes.filter(resume => {
    const matchesSearch = resume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resume.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSkill = !filterSkill || resume.skills.includes(filterSkill)
    return matchesSearch && matchesSkill
  })

  return (
    <div className="recruiter-dashboard">
      <div className="dashboard-header">
        <h1>Recruiter Dashboard</h1>
        <p>Manage and analyze candidate resumes</p>
      </div>

      <div className="dashboard-content">
        <div className="upload-section">
          <motion.div
            className="upload-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3>Upload New Resumes</h3>
            <div className="upload-area">
              <FiUpload className="upload-icon" />
              <p>Drag and drop resumes or click to browse</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={handleFileUpload}
                className="file-input"
              />
            </div>
          </motion.div>
        </div>

        <div className="filters-section">
          <motion.div
            className="filters"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-box">
              <FiFilter className="filter-icon" />
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
              >
                <option value="">All Skills</option>
                <option value="React">React</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Node.js">Node.js</option>
              </select>
            </div>
          </motion.div>
        </div>

        <div className="resumes-section">
          <h3>Resume Analysis Results ({filteredResumes.length})</h3>
          <div className="resumes-grid">
            {filteredResumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                className="resume-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="resume-header">
                  <h4>{resume.name}</h4>
                  <div className={`score ${resume.score >= 80 ? 'high' : resume.score >= 60 ? 'medium' : 'low'}`}>
                    {resume.score}%
                  </div>
                </div>
                <p className="position">{resume.position}</p>
                <div className="skills">
                  {resume.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
                <div className="resume-footer">
                  <span className="upload-date">{resume.uploadDate}</span>
                  <div className="actions">
                    <button className="action-btn">
                      <FiEye />
                    </button>
                    <button className="action-btn">
                      <FiDownload />
                    </button>
                  </div>
                </div>
                <div className={`status ${resume.status.toLowerCase()}`}>
                  {resume.status}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecruiterDashboard
