import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiFileText, FiTrendingUp, FiUsers } from 'react-icons/fi'
import './Home.css'

const Home = () => {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    // TODO: Implement file upload logic
    console.log('Files to upload:', files)
  }

  return (
    <div className="home">
      <div className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">
            AI-Powered Resume Analysis
          </h1>
          <p className="hero-subtitle">
            Get instant insights into resume quality, skills matching, and optimization suggestions
          </p>
        </motion.div>

        <motion.div
          className="upload-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FiUpload className="upload-icon" />
            <h3>Upload Resume</h3>
            <p>Drag and drop your resume here, or click to browse</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              className="file-input"
            />
          </div>
        </motion.div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Our AI Analyzer?</h2>
          <div className="features-grid">
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <FiFileText className="feature-icon" />
              <h3>Smart Parsing</h3>
              <p>Advanced AI extracts and analyzes all resume sections with high accuracy</p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FiTrendingUp className="feature-icon" />
              <h3>Performance Insights</h3>
              <p>Get detailed metrics on resume strength and areas for improvement</p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <FiUsers className="feature-icon" />
              <h3>Recruiter Tools</h3>
              <p>Powerful dashboard for recruiters to analyze and compare candidates</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
