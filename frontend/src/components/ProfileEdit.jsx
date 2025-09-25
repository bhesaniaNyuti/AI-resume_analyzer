import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProfileEdit() {
  const [draft, setDraft] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('jobSeekerData');
    const user = raw ? JSON.parse(raw) : {};
    setDraft({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      workExp: user.workExp || '',
      education: user.education || '',
      institute: user.institute || '',
      gradYear: user.gradYear || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
      portfolio: user.portfolio || '',
      summary: user.summary || '',
      avatarUrl: user.avatarUrl || '',
    });
  }, []);

  const save = async () => {
    const payload = {
      ...draft,
      skills: draft.skills ? draft.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    // Save locally for immediate UI
    localStorage.setItem('jobSeekerData', JSON.stringify(payload));
    // Persist to backend (best-effort)
    try {
      await fetch('http://localhost:5000/api/jobseeker/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // Non-blocking
      console.warn('Failed to persist profile to backend:', e);
    }
    navigate('/profile');
  };

  return (
    <div style={{ padding: 24, background: 'linear-gradient(180deg,#f5f7ff 0%,#eef2ff 100%)', minHeight: '100vh' }}>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => navigate(-1)} style={{ marginBottom: 16, background: '#eef2ff', border: '1px solid #c7d2fe', padding: '8px 14px', borderRadius: 10, cursor: 'pointer' }}>← Back</motion.button>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Edit Profile</h2>
            <div style={{ width: 220 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>Completeness</div>
              <div style={{ background: '#e5e7eb', height: 6, borderRadius: 6 }}>
                <div style={{ width: `${Math.min(100, ['name','email','phone','location','workExp','education','institute','gradYear'].filter(k => draft[k] && String(draft[k]).trim()).length / 8 * 100)}%`, height: '100%', borderRadius: 6, background: 'linear-gradient(90deg,#8b5cf6,#6366f1)' }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
            {['name','email','phone','location','workExp','education','institute','gradYear','portfolio'].map((key) => (
              <label key={key} style={{ display: 'grid', gap: 6, fontSize: 12, color: '#475569' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>{key.replace(/^[a-z]/, c=>c.toUpperCase())}</span>
                <input value={draft[key] || ''} onChange={(e)=>setDraft(prev=>({...prev,[key]:e.target.value}))} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }} />
              </label>
            ))}
            <label style={{ display: 'grid', gap: 6, fontSize: 12, color: '#475569' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Avatar URL</span>
              <input value={draft.avatarUrl || ''} onChange={(e)=>setDraft(prev=>({...prev,avatarUrl:e.target.value}))} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }} />
            </label>
            <label style={{ gridColumn: '1 / -1', display: 'grid', gap: 6, fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Skills (comma separated)</span>
              <input value={draft.skills || ''} onChange={(e)=>setDraft(prev=>({...prev,skills:e.target.value}))} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }} />
            </label>
            <label style={{ gridColumn: '1 / -1', display: 'grid', gap: 6, fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Summary</span>
              <textarea rows={5} value={draft.summary || ''} onChange={(e)=>setDraft(prev=>({...prev,summary:e.target.value}))} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => navigate('/profile')} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 10, cursor: 'pointer' }}>Cancel</motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={save} style={{ background: 'linear-gradient(90deg,#8b5cf6,#6366f1)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, cursor: 'pointer', boxShadow: '0 10px 30px rgba(99,102,241,0.35)' }}>Save Changes</motion.button>
          </div>
        </motion.section>

        <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18, position: 'sticky', top: 18, height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ede9fe', display: 'grid', placeItems: 'center', color: '#5b21b6', fontWeight: 800, overflow: 'hidden' }}>
              {draft.avatarUrl ? (
                <img src={draft.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : ((draft.name || 'U').charAt(0).toUpperCase())}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{draft.name || 'Your Name'}</div>
              <div style={{ color: '#475569' }}>{draft.email || 'you@example.com'}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            <PreviewRow label="Phone" value={draft.phone || '—'} />
            <PreviewRow label="Location" value={draft.location || '—'} />
            <PreviewRow label="Work Exp" value={draft.workExp || '—'} />
            <PreviewRow label="Education" value={draft.education || '—'} />
            <PreviewRow label="Institute" value={draft.institute || '—'} />
            <PreviewRow label="Grad Year" value={draft.gradYear || '—'} />
            <PreviewRow label="Portfolio" value={draft.portfolio || '—'} />
            <div style={{ marginTop: 8, color: '#334155' }}>{draft.summary || 'Your short professional summary will appear here.'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {(draft.skills || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 8).map((s, i) => (
                <span key={i} style={{ background: '#eef2ff', color: '#4338ca', padding: '6px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{s}</span>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
      <div style={{ color: '#64748b', fontWeight: 700 }}>{label}</div>
      <div style={{ color: '#1f2937' }}>{value}</div>
    </div>
  );
}
