import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function JobEdit() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch job');
        const data = await res.json();
        setJob({
          title: data.title || '',
          description: data.description || '',
          requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills.join(', ') : (data.requiredSkills || ''),
          company: data.company || '',
          requiredQualification: data.requiredQualification || '',
          experienceRequired: data.experienceRequired || '',
          location: data.location || '',
          employmentType: data.employmentType || '',
          applicationDeadline: data.applicationDeadline ? data.applicationDeadline.substring(0,10) : '',
          contactInformation: data.contactInformation || '',
          recruiterEmail: data.recruiterEmail,
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...job };
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update job');
      navigate('/recruiter-dashboard');
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!job) return null;

  return (
    <div style={{ padding: 24 }}>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</motion.button>
      <h2 style={{ marginBottom: 12 }}>Edit Job</h2>
      <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <label>Title
          <input value={job.title} onChange={e=>setJob({ ...job, title:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label>Employment Type
          <select value={job.employmentType} onChange={e=>setJob({ ...job, employmentType:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }}>
            <option value="">Select type</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Internship">Internship</option>
          </select>
        </label>
        <label>Location
          <input value={job.location} onChange={e=>setJob({ ...job, location:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label>Experience Required
          <input value={job.experienceRequired} onChange={e=>setJob({ ...job, experienceRequired:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label>Company
          <input value={job.company} onChange={e=>setJob({ ...job, company:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label>Application Deadline
          <input type="date" value={job.applicationDeadline} onChange={e=>setJob({ ...job, applicationDeadline:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label style={{ gridColumn:'1 / -1' }}>Description
          <textarea value={job.description} onChange={e=>setJob({ ...job, description:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10, minHeight:120 }} />
        </label>
        <label style={{ gridColumn:'1 / -1' }}>Required Skills (comma separated)
          <input value={job.requiredSkills} onChange={e=>setJob({ ...job, requiredSkills:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label style={{ gridColumn:'1 / -1' }}>Contact Information
          <input value={job.contactInformation} onChange={e=>setJob({ ...job, contactInformation:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <div style={{ gridColumn:'1 / -1', display:'flex', gap:10 }}>
          <button type="submit" style={{ background:'#4f46e5', color:'#fff', border:'none', borderRadius:10, padding:'10px 16px', fontWeight:700 }}>Save</button>
          <button type="button" onClick={()=>navigate('/recruiter-dashboard')} style={{ background:'#e0e7ef', border:'none', borderRadius:10, padding:'10px 16px', fontWeight:700 }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
