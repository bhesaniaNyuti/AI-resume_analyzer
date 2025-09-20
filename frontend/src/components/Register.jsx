import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FaUser, FaUserTie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Register.css';
const workExpOptions = [
  '0-1 years',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years',
];
const companySizes = [
  '1-10',
  '11-50',
  '51-200',
  '200+',
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [jobSeeker, setJobSeeker] = useState({
    name: '',
    email: '',
    workExp: '',
    password: '',
    confirm: '',
  });
  const [recruiter, setRecruiter] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    company: '',
    website: '',
    industry: '',
    size: '',
    agree: false,
  });
  const navigate = useNavigate();

  // Handlers for form fields
  const handleJobSeekerChange = e => {
    setJobSeeker({ ...jobSeeker, [e.target.name]: e.target.value });
  };
  const handleRecruiterChange = e => {
    const { name, value, type, checked } = e.target;
    setRecruiter({ ...recruiter, [name]: type === 'checkbox' ? checked : value });
  };
  return (
    <div className="register-bg">
      <motion.div className="register-card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <div className="register-logo-gradient">
          <span className="register-logo-text">NS</span>
        </div>
        <h2 className="register-title">Join NexSkill</h2>
        <p className="register-subtitle">Create your account to get started</p>
        <div className="register-stepper">
          <div className={`register-step ${step === 1 ? 'active' : ''}`}>1</div>
          <div className="register-step-line" />
          <div className={`register-step ${step === 2 ? 'active' : ''}`}>2</div>
          {role === 'recruiter' && <><div className="register-step-line" /><div className={`register-step ${step === 3 ? 'active' : ''}`}>3</div></>}
        </div>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="role-select"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="register-role-select"
            >
              <h3 className="register-role-title">I am a...</h3>
              <div className="register-role-options">
                <motion.div
                  className={`register-role-card ${role === 'jobseeker' ? 'selected' : ''}`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setRole('jobseeker'); setTimeout(() => setStep(2), 350); }}
                >
                  <FaUser className="register-role-icon blue" />
                  <div>
                    <div className="register-role-label">Job Seeker</div>
                    <div className="register-role-desc">Looking for the perfect job opportunity</div>
                  </div>
                </motion.div>
                <motion.div
                  className={`register-role-card ${role === 'recruiter' ? 'selected' : ''}`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setRole('recruiter'); setTimeout(() => setStep(2), 350); }}
                >
                  <FaUserTie className="register-role-icon purple" />
                  <div>
                    <div className="register-role-label">Company Recruiter</div>
                    <div className="register-role-desc">Hiring the best talent for your company</div>
                  </div>
                </motion.div>
              </div>
              <div className="register-signin-link">Already have an account? <a href="/login">Sign in</a></div>
            </motion.div>
          )}
          {step === 2 && role === 'jobseeker' && (
            <motion.form
              key="jobseeker-form"
              className="register-form register-form-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              onSubmit={async e => {
                e.preventDefault();
                try {
                  const res = await fetch('http://localhost:5000/api/register-jobseeker', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: jobSeeker.name,
                      email: jobSeeker.email,
                      workExp: jobSeeker.workExp,
                      password: jobSeeker.password,
                      confirm: jobSeeker.confirm,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    alert('Registration successful! Please login with your credentials.');
                    navigate('/login');
                  } else {
                    alert(data.error || 'Registration failed!');
                  }
                } catch (err) {
                  alert('Registration failed! Please try again.');
                }
              }}
            >
              <div className="register-form-title">Personal Information</div>
              <label>Full Name</label>
              <input name="name" value={jobSeeker.name} onChange={handleJobSeekerChange} required placeholder="Enter your full name" />
              <label>Email</label>
              <input name="email" type="email" value={jobSeeker.email} onChange={handleJobSeekerChange} required placeholder="Enter your email" />
              <label>Work Experience</label>
              <select name="workExp" value={jobSeeker.workExp} onChange={handleJobSeekerChange} required>
                <option value="">Select experience</option>
                {workExpOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <label>Password</label>
              <input name="password" type="password" value={jobSeeker.password} onChange={handleJobSeekerChange} required placeholder="Password" />
              <label>Confirm Password</label>
              <input name="confirm" type="password" value={jobSeeker.confirm} onChange={handleJobSeekerChange} required placeholder="Confirm password" />
              <div className="register-form-actions">
                <button type="button" className="register-btn secondary" onClick={() => setStep(1)}>Back</button>
                <button className="register-btn" type="submit">Submit</button>
              </div>
            </motion.form>
          )}
          {step === 2 && role === 'recruiter' && (
            <motion.form
              key="recruiter-form1"
              className="register-form register-form-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              onSubmit={e => { e.preventDefault(); setStep(3); }}
            >
              <div className="register-form-title">Personal Information</div>
              <label>Name</label>
              <input name="name" value={recruiter.name} onChange={handleRecruiterChange} required placeholder="Enter your name" />
              <label>Work Email</label>
              <input name="email" type="email" value={recruiter.email} onChange={handleRecruiterChange} required placeholder="Enter your work email" />
              <label>Phone Number</label>
              <input name="phone" type="tel" value={recruiter.phone} onChange={handleRecruiterChange} required placeholder="Enter your phone number" />
              <label>Password</label>
              <input name="password" type="password" value={recruiter.password} onChange={handleRecruiterChange} required placeholder="Password" />
              <label>Confirm Password</label>
              <input name="confirm" type="password" value={recruiter.confirm} onChange={handleRecruiterChange} required placeholder="Confirm password" />
              <div className="register-form-actions">
                <button type="button" className="register-btn secondary" onClick={() => setStep(1)}>Back</button>
                <button className="register-btn" type="submit">Next</button>
              </div>
            </motion.form>
          )}
          {step === 3 && role === 'recruiter' && (
            <motion.form
              key="recruiter-form2"
              className="register-form register-form-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              onSubmit={async e => {
                e.preventDefault();
                try {
                  const res = await fetch('http://localhost:5000/api/register-recruiter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: recruiter.name,
                      email: recruiter.email,
                      phone: recruiter.phone,
                      password: recruiter.password,
                      company: recruiter.company,
                      website: recruiter.website,
                      industry: recruiter.industry,
                      size: recruiter.size
                    }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    alert('Recruiter registration successful! Please login with your credentials.');
                    navigate('/login');
                  } else {
                    alert(data.error || 'Recruiter registration failed!');
                  }
                } catch (err) {
                  alert('Recruiter registration failed! Please try again.');
                }
              }}
            >
              <div className="register-form-title">Company Information</div>
              <label>Company Name</label>
              <input name="company" value={recruiter.company} onChange={handleRecruiterChange} required placeholder="Enter company name" />
              <label>Website</label>
              <input name="website" value={recruiter.website} onChange={handleRecruiterChange} required placeholder="Enter company website" />
              <label>Industry</label>
              <input name="industry" value={recruiter.industry} onChange={handleRecruiterChange} required placeholder="Enter industry" />
              <label>Company Size</label>
              <select name="size" value={recruiter.size} onChange={handleRecruiterChange} required>
                <option value="">Select size</option>
                {companySizes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <label className="register-checkbox">
                <input type="checkbox" name="agree" checked={recruiter.agree} onChange={handleRecruiterChange} required />
                <span>I agree to the <a href="#">Terms & Privacy Policy</a></span>
              </label>
              <div className="register-form-actions">
                <button type="button" className="register-btn secondary" onClick={() => setStep(2)}>Back</button>
                <button className="register-btn" type="submit">Submit</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
      {/* <SuccessStories /> removed as per user request */}
    </div>
  );
} 