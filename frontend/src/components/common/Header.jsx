import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Header.css'

const Header = () => {
  return (
    <motion.header 
      className="header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>AI Resume Analyzer</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/recruiter" className="nav-link">Recruiter Dashboard</Link>
        </nav>
      </div>
    </motion.header>
  )
}

export default Header
