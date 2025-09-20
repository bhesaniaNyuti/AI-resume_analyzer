import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('jobseeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = role === 'recruiter' ? '/api/login-recruiter' : '/api/login-jobseeker';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful - store user data
        if (role === 'recruiter') {
          localStorage.setItem('recruiterId', data.recruiter.id);
          localStorage.setItem('recruiterData', JSON.stringify(data.recruiter));
          navigate('/recruiter-dashboard');
        } else {
          localStorage.setItem('jobSeekerId', data.user.id);
          localStorage.setItem('jobSeekerData', JSON.stringify(data.user));
          navigate('/jobseeker-dashboard');
        }
      } else {
        // Login failed - show error popup
        setError(data.error || 'Login failed');
        alert(data.error || 'Password or username is incorrect');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="login-title">Login to NexSkill</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-role-select">
            <label>
              <input
                type="radio"
                name="role"
                value="jobseeker"
                checked={role === 'jobseeker'}
                onChange={() => setRole('jobseeker')}
              />
              Job Seeker
            </label>
            <label style={{ marginLeft: '18px' }}>
              <input
                type="radio"
                name="role"
                value="recruiter"
                checked={role === 'recruiter'}
                onChange={() => setRole('recruiter')}
              />
              Recruiter
            </label>
          </div>
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email" 
            required 
          />
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password" 
            required 
          />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>
      </div>
    </div>
  );
} 