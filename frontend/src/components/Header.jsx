import { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import NSLogo from '../assets/NSLogo.svg';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  
  const isRecruiterDashboard = location.pathname === '/recruiter-dashboard';
  const isJobSeekerDashboard = location.pathname === '/jobseeker-dashboard';
  const isProfile = location.pathname.startsWith('/profile') || location.pathname.startsWith('/recruiter-profile') || location.pathname.startsWith('/jobseeker-profile');
  const isLoggedIn = isRecruiterDashboard || isJobSeekerDashboard;

  // Get user data from localStorage based on current route
  useEffect(() => {
    if (isRecruiterDashboard) {
      const recruiterData = localStorage.getItem('recruiterData');
      if (recruiterData) {
        setUser(JSON.parse(recruiterData));
        setUserType('recruiter');
      }
    } else if (isJobSeekerDashboard) {
      const jobSeekerData = localStorage.getItem('jobSeekerData');
      if (jobSeekerData) {
        setUser(JSON.parse(jobSeekerData));
        setUserType('jobseeker');
      }
    }
  }, [isRecruiterDashboard, isJobSeekerDashboard]);

  return (
    <header className="nsf-header">
      <div className="nsf-header-inner">
        <Link to="/" className="nsf-logo-group">
          <img src={NSLogo} alt="NexSkill Logo" className="nsf-logo" />
          <span className="nsf-brand">NexSkill</span>
        </Link>
        {/* Navigation removed per request; keep only auth actions */}
        <div className="nsf-actions">
          {isLoggedIn && user ? (
            <div style={{ position: 'relative' }}>
              <div
                className="nsf-profile-summary"
                style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                onClick={() => setShowProfile(v => !v)}
              >
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" style={{ width: 38, height: 38, borderRadius: '50%' }} />
                ) : (
                  <FaUserCircle size={38} color="#8f7cff" />
                )}
                <div style={{ textAlign: 'right' }} onClick={(e) => { 
                  e.stopPropagation(); 
                  try {
                    const r = localStorage.getItem('recruiterData');
                    const s = localStorage.getItem('jobSeekerData');
                    if (r) {
                      window.location.href = '/recruiter-profile';
                    } else if (s) {
                      window.location.href = '/jobseeker-profile';
                    } else {
                      window.location.href = '/profile';
                    }
                  } catch (_) {
                    window.location.href = '/profile';
                  }
                }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
                  <div style={{ color: '#5a6473', fontSize: 13 }}>{user.email}</div>
                </div>
              </div>
              {showProfile && (
                <div
                  className="nsf-profile-dropdown"
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 4px 24px 0 rgba(44,62,80,0.13)',
                    padding: '1.2rem 1.5rem',
                    minWidth: 260,
                    zIndex: 100,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                    ) : (
                      <FaUserCircle size={44} color="#8f7cff" />
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</div>
                      <div style={{ color: '#5a6473', fontSize: 14 }}>{user.email}</div>
                    </div>
                  </div>
                  {userType === 'recruiter' && (
                    <>
                      <div style={{ fontSize: 15, marginBottom: 6 }}><b>Company:</b> {user.company}</div>
                      <div style={{ fontSize: 15, marginBottom: 6 }}><b>Phone:</b> {user.phone}</div>
                      <div style={{ fontSize: 15, marginBottom: 6 }}><b>Website:</b> {user.website}</div>
                      <div style={{ fontSize: 15, marginBottom: 6 }}><b>Industry:</b> {user.industry}</div>
                      <div style={{ fontSize: 15, marginBottom: 6 }}><b>Company Size:</b> {user.size}</div>
                    </>
                  )}
                  {userType === 'jobseeker' && (
                    <>
                      <div style={{ fontSize: 15, marginBottom: 6 }}><b>Work Experience:</b> {user.workExp}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {!isProfile && (
                <>
                  <Link to="/login" className="nsf-login">Login</Link>
                  <Link to="/register" className="nsf-register">Register</Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
} 