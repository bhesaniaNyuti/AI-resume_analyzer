import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const navigate = useNavigate();
  const [summary, _setSummary] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [role, setRole] = useState('jobseeker');

  // Initialize user/role once on mount to avoid re-renders loops
  useEffect(() => {
    const currentRole = localStorage.getItem('currentUserRole');
    if (currentRole === 'recruiter') {
      const recruiter = localStorage.getItem('recruiterData');
      if (recruiter) {
        setUser(JSON.parse(recruiter));
        setRole('recruiter');
      }
    } else if (currentRole === 'jobseeker') {
      const seeker = localStorage.getItem('jobSeekerData');
      if (seeker) {
        setUser(JSON.parse(seeker));
        setRole('jobseeker');
      }
    } else {
      const seeker = localStorage.getItem('jobSeekerData');
      const recruiter = localStorage.getItem('recruiterData');
      if (recruiter) {
        setUser(JSON.parse(recruiter));
        setRole('recruiter');
      } else if (seeker) {
        setUser(JSON.parse(seeker));
        setRole('jobseeker');
      }
    }
  }, []);

  // Load applications when we know the user
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const current = user || (localStorage.getItem('currentUserRole') === 'recruiter' ? JSON.parse(localStorage.getItem('recruiterData') || '{}') : JSON.parse(localStorage.getItem('jobSeekerData') || '{}'));
        const email = current?.email;
        if (email) {
          const res = await fetch(`http://localhost:5000/api/applications?seekerEmail=${encodeURIComponent(email)}`);
          if (res.ok) {
            const data = await res.json();
            const normalized = Array.isArray(data) ? data.map((a) => ({
              id: a._id || a.id,
              title: a.title || a.jobTitle || a.job?.title,
              company: a.company || a.companyName || a.job?.company,
              location: a.location || a.job?.location,
              status: a.status || 'Pending',
              createdAt: a.createdAt || a.appliedAt || new Date().toISOString(),
            })) : [];
            if (normalized.length) {
              setAppliedJobs(normalized);
              return;
            }
          }
        }
      } catch {
        // ignore and fall back to localStorage
      }
      // Fallback to localStorage but filter by user email
      const stored = localStorage.getItem('appliedJobs');
      if (stored) {
        try {
          const allApplications = JSON.parse(stored);
          const userEmail = JSON.parse(seeker || recruiter || '{}')?.email;
          // Only show applications for the current user
          const userApplications = userEmail 
            ? allApplications.filter(app => app.seekerEmail === userEmail)
            : allApplications;
          setAppliedJobs(userApplications);
        } catch {
          setAppliedJobs([]);
        }
      }
    };
    loadApplications();
  }, [user]);

  const chip = (text, hue) => (
    <motion.span whileHover={{ scale: 1.06 }} style={{ background: `hsla(${hue}, 90%, 95%, 1)`, color: `hsl(${hue}, 55%, 35%)`, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
      {text}
    </motion.span>
  );

  const Section = ({ title, children }) => (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ background: 'var(--glass-bg)', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18, boxShadow: 'var(--card-shadow)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#1f2a44' }}>{title}</h3>
      </div>
      {children}
    </motion.section>
  );

  const completeness = (() => {
    if (!user) return 0;
    const fields = role === 'recruiter'
      ? ['name','email','phone','company','website','industry','size']
      : ['name','email','phone','location','workExp','education','skills'];
    const filled = fields.filter((f) => user[f] && String(user[f]).trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  })();

  const handleWithdraw = (id) => {
    const next = appliedJobs.map((a) => a.id === id ? { ...a, status: 'Withdrawn' } : a);
    setAppliedJobs(next);
    localStorage.setItem('appliedJobs', JSON.stringify(next));
  };

  const openEdit = () => {
    if (!user) return;
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
    });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    const normalized = {
      ...user,
      ...draft,
      skills: draft.skills ? draft.skills.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(user?.skills) ? user.skills : []),
    };
    let success = false;
    try {
      const endpoint = role === 'recruiter' ? 'http://localhost:5000/api/recruiter/profile' : 'http://localhost:5000/api/jobseeker/profile';
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...normalized, email: user?.email }),
      });
      const data = await res.json();
      if (res.ok) {
        const next = role === 'recruiter' ? data.recruiter : data.user;
        setUser(next);
        localStorage.setItem(role === 'recruiter' ? 'recruiterData' : 'jobSeekerData', JSON.stringify(next));
        setIsEditing(false);
        success = true;
        return;
      }
    } finally {
      if (!success) {
        setUser(normalized);
        localStorage.setItem(role === 'recruiter' ? 'recruiterData' : 'jobSeekerData', JSON.stringify(normalized));
        setIsEditing(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 24, background: 'transparent', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* floating glow accents (kept behind content, subtle) */}
      <motion.span style={{ position:'absolute', top:80, right:120, width:180, height:180, borderRadius:'50%', background:'#c7d2fe', filter:'blur(80px)', opacity:0.18, pointerEvents:'none', zIndex:0 }} animate={{ x:[0,10,0] }} transition={{ duration:10, repeat:Infinity, repeatType:'mirror' }} />
      <motion.span style={{ position:'absolute', bottom:60, left:120, width:220, height:220, borderRadius:'50%', background:'#a7f3d0', filter:'blur(90px)', opacity:0.1, pointerEvents:'none', zIndex:0 }} animate={{ y:[0,-12,0] }} transition={{ duration:12, repeat:Infinity, repeatType:'mirror' }} />

      <motion.button whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }} onClick={() => navigate(-1)} style={{ marginBottom: 16, background: '#eef2ff', border: '1px solid #c7d2fe', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', position:'relative', zIndex:1 }}>← Back</motion.button>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ background: 'var(--glass-bg)', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, marginBottom: 18, boxShadow: 'var(--card-shadow)' }}
      >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 22, boxShadow: '0 6px 18px rgba(0,0,0,0.18)' }}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#1f2a44' }}>{user?.name || 'User'}</div>
            <div style={{ color: '#475569' }}>{user?.email}</div>
            {role !== 'recruiter' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {user?.workExp && chip(user.workExp, 265)}
                {user?.location && chip(user.location, 235)}
              </div>
            )}
          </div>
            <motion.button onClick={openEdit} whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }} style={{ background: 'linear-gradient(90deg, #0099e6 0%, #6C63FF 100%)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px rgba(108,99,255,0.13)' }}>Edit Profile</motion.button>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Profile Completeness {completeness}%</div>
          <div style={{ background: '#e5e7eb', height: 6, borderRadius: 6 }}>
            <div style={{ width: `${completeness}%`, height: '100%', borderRadius: 6, background: 'var(--primary-gradient)' }} />
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18, position:'relative', zIndex:1 }}>
        {/* Left column */}
        <div style={{ display: 'grid', gap: 18 }}>
          <Section title="About You">
            <div style={{ color: '#334155', lineHeight: 1.7, marginBottom: 10 }}>
              {user?.summary || summary || 'Write about yourself in 2–3 lines.'}
            </div>
            {/* Summary generation button removed per request */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
              {user?.education && (
                <Card title="Education" value={user.education} />
              )}
              {user?.skills && (
                <Card title="Top Skills" value={Array.isArray(user.skills) ? user.skills.join(', ') : user.skills} />
              )}
            </div>
          </Section>

          {role !== 'recruiter' && (
            <Section title="Applications">
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                {(appliedJobs.length ? appliedJobs : []).map((j, idx) => (
                    <motion.div key={idx} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.35 }} style={{ background: 'var(--glass-bg)', border: '1px solid #e2e8f0', borderRadius: 16, padding: 14, display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, boxShadow: 'var(--card-shadow)' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#ede9fe', color: '#5b21b6', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                          {(j.company || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{j.title}</div>
                          <div style={{ color: '#475569' }}>{j.company}{j.location ? ` • ${j.location}` : ''}</div>
                          {j.createdAt && (
                            <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Applied on {new Date(j.createdAt).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusPill status={j.status} />
                        {appliedJobs.length > 0 && j.status !== 'Withdrawn' && (
                          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} onClick={() => handleWithdraw(j.id)} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: 999, fontWeight: 700, color: '#64748b' }}>Withdraw</motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'grid', gap: 18 }}>
          {role === 'recruiter' ? (
            <>
              <Section title="Company Info">
                <Item label="Company" value={user?.company || '—'} />
                <Item label="Website" value={user?.website || '—'} />
                <Item label="Industry" value={user?.industry || '—'} />
                <Item label="Company Size" value={user?.size || '—'} />
              </Section>
              <Section title="Contact">
                <Item label="Email" value={user?.email} />
                <Item label="Phone" value={user?.phone || '—'} />
              </Section>
            </>
          ) : (
            <>
              <Section title="Contact">
                <Item label="Email" value={user?.email} />
                <Item label="Phone" value={user?.phone || '—'} />
                <Item label="Location" value={user?.location || '—'} />
                <Item label="Portfolio" value={user?.portfolio || '—'} />
              </Section>
              <Section title="Education">
                <Item label="Highest Qualification" value={user?.education || '—'} />
                <Item label="Institute" value={user?.institute || '—'} />
                <Item label="Graduation Year" value={user?.gradYear || '—'} />
              </Section>
            </>
          )}
        </div>
      </div>
      <EditModal open={isEditing} draft={draft} setDraft={setDraft} onClose={() => setIsEditing(false)} onSave={saveEdit} />
    </motion.div>
  );
}

function Card({ title, value }) {
  return (
    <motion.div whileHover={{ y: -2 }} style={{ background: 'var(--glass-bg)', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, boxShadow: 'var(--card-shadow)' }}>
      <div style={{ fontWeight: 700, color: '#1f2a44', marginBottom: 6 }}>{title}</div>
      <div style={{ color: '#475569' }}>{value}</div>
    </motion.div>
  );
}

function Item({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 8, alignItems: 'center', padding: '6px 0' }}>
      <div style={{ color: '#64748b', fontWeight: 700 }}>{label}</div>
      <div style={{ color: '#1f2937' }}>{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const text = status || 'Pending';
  const palette = text === 'Accepted' ? ['#ecfdf5', '#065f46'] : text === 'Rejected' ? ['#fef2f2', '#991b1b'] : ['#eef2ff', '#4338ca'];
  return (
    <div style={{ background: palette[0], color: palette[1], padding: '6px 12px', borderRadius: 999, fontWeight: 700 }}>
      {text}
    </div>
  );
}

// Inline edit modal
// Minimal styles without external CSS to keep scope limited
// Rendered at bottom to avoid affecting layout
function EditModal({ open, draft, setDraft, onClose, onSave }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', display: 'grid', placeItems: 'center', zIndex: 9999 }}>
      <div style={{ width: 'min(720px, 92vw)', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Edit Profile</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {['name','email','phone','location','workExp','education','institute','gradYear','portfolio'].map((key) => (
            <label key={key} style={{ display: 'grid', gap: 6, fontSize: 12, color: '#475569' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>{key.replace(/^[a-z]/, c=>c.toUpperCase())}</span>
              <input value={draft[key] || ''} onChange={(e)=>setDraft(prev=>({...prev,[key]:e.target.value}))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }} />
            </label>
          ))}
          <label style={{ gridColumn: '1 / -1', display: 'grid', gap: 6, fontSize: 12 }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>Skills (comma separated)</span>
            <input value={draft.skills || ''} onChange={(e)=>setDraft(prev=>({...prev,skills:e.target.value}))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }} />
          </label>
          <label style={{ gridColumn: '1 / -1', display: 'grid', gap: 6, fontSize: 12 }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>Summary</span>
            <textarea rows={4} value={draft.summary || ''} onChange={(e)=>setDraft(prev=>({...prev,summary:e.target.value}))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }} />
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 10, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onSave} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer' }}>Save</button>
        </div>
      </div>
    </div>
  );
}
