import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RecruiterProfileEdit() {
  const [draft, setDraft] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('recruiterData');
    const user = raw ? JSON.parse(raw) : {};
    setDraft({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      company: user.company || '',
      website: user.website || '',
      industry: user.industry || '',
      size: user.size || '',
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('recruiterData', JSON.stringify(draft));
      // Optional: persist to backend if needed
      navigate('/recruiter-profile');
    } catch (e) {
      console.warn('Failed to save recruiter profile', e);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</motion.button>
      <h2 style={{ marginBottom: 12 }}>Edit Recruiter Profile</h2>
      <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <label>Name
          <input value={draft.name} onChange={e=>setDraft({ ...draft, name:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label>Email
          <input value={draft.email} onChange={e=>setDraft({ ...draft, email:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label>Phone
          <input value={draft.phone} onChange={e=>setDraft({ ...draft, phone:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label>Company
          <input value={draft.company} onChange={e=>setDraft({ ...draft, company:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label>Website
          <input value={draft.website} onChange={e=>setDraft({ ...draft, website:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label>Industry
          <input value={draft.industry} onChange={e=>setDraft({ ...draft, industry:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <label>Company Size
          <input value={draft.size} onChange={e=>setDraft({ ...draft, size:e.target.value })} style={{ width:'100%', padding:10, border:'1px solid #e2e8f0', borderRadius:10 }} />
        </label>
        <div style={{ gridColumn:'1 / -1', display:'flex', gap:10 }}>
          <button type="submit" style={{ background:'#4f46e5', color:'#fff', border:'none', borderRadius:10, padding:'10px 16px', fontWeight:700 }}>Save</button>
          <button type="button" onClick={()=>navigate('/recruiter-profile')} style={{ background:'#e0e7ef', border:'none', borderRadius:10, padding:'10px 16px', fontWeight:700 }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}


