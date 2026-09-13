import { useEffect, useState } from 'react';
import { api } from './api';

const labels = { pending: 'Pending review', approved: 'Approved', rejected: 'Rejected', expired: 'Expired' };

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    const form = mode === 'signup' ? { name, email, password } : { email, password };
    try {
      const response = await api(`/auth/${mode}`, { method: 'POST', body: form });
      onAuth(response);
    } catch (err) {
      setError(err.message);
    }
  }

  function fillDemo(role) {
    setMode('login');
    setError('');
    if (role === 'admin') {
      setEmail('admin@kycplatform.com');
      setPassword('Admin@123456');
    } else if (role === 'verifier') {
      setEmail('verifier@kycplatform.com');
      setPassword('Verifier@123456');
    } else {
      setEmail('demo.customer@example.com');
      setPassword('Customer@123456');
    }
  }

  return (
    <main className="auth">
      <section className="card">
        <p className="eyebrow">KYC PLATFORM DEMO</p>
        <h1>Verification Prototype</h1>
        <p className="muted">Sign in to test different roles (Customer, Verifier, Admin).</p>
        
        <div style={{ display: 'flex', gap: '6px', margin: '12px 0 16px 0', flexWrap: 'wrap' }}>
          <button type="button" className="secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => fillDemo('admin')}>
            Fill Admin
          </button>
          <button type="button" className="secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => fillDemo('verifier')}>
            Fill Verifier
          </button>
          <button type="button" className="secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => fillDemo('customer')}>
            Fill Customer
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <input
              required
              name="name"
              minLength="2"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            required
            name="email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            required
            name="password"
            type="password"
            minLength="8"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button>{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        <button className="link" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </section>
    </main>
  );
}


const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const baseUrl = rawBaseUrl.replace(/\/+$/, '');

async function viewFile(docId, token) {
  try {
    const response = await fetch(`${baseUrl}/documents/${docId}/file`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Could not retrieve file');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } catch (err) {
    alert(err.message);
  }
}

function Customer({ token }) {
  const [documents, setDocuments] = useState([]); const [message, setMessage] = useState('');
  const load = () => api('/documents/mine', { token }).then(({ documents: docs }) => setDocuments(docs)).catch((e) => setMessage(e.message));
  useEffect(load, []);
  async function upload(event) { event.preventDefault(); setMessage(''); const form = new FormData(event.currentTarget); try { await api('/documents', { method: 'POST', token, body: form, formData: true }); event.currentTarget.reset(); setMessage('Document submitted for review.'); load(); } catch (e) { setMessage(e.message); } }
  return <><header><div><p className="eyebrow">CUSTOMER PORTAL</p><h1>Your documents</h1></div><span className="pill">{documents.length} submitted</span></header><div className="grid"><section className="card"><h2>Upload a document</h2><form onSubmit={upload}><select name="documentType" required defaultValue=""><option value="" disabled>Choose document type</option><option value="passport">Passport</option><option value="national_id">National ID</option><option value="drivers_license">Driver's license</option><option value="proof_of_address">Proof of address</option></select><input name="expiryDate" type="date" /><input name="document" type="file" accept=".pdf,.jpg,.jpeg,.png" required /><button>Submit document</button></form>{message && <p className="notice">{message}</p>}</section><section className="card"><h2>Status</h2>{documents.length ? <div className="list">{documents.map((doc) => <article key={doc._id}><div><strong>{doc.documentType.replace('_', ' ')}</strong><small>Submitted {new Date(doc.createdAt).toLocaleDateString()}</small><button className="link" style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.85rem' }} onClick={() => viewFile(doc._id, token)}>View document ↗</button></div><span className={`status ${doc.status}`}>{labels[doc.status]}</span>{doc.rejectionReason && <small className="error">{doc.rejectionReason}</small>}</article>)}</div> : <p className="muted">No documents submitted yet.</p>}</section></div></>;
}

function Verifier({ token }) {
  const [documents, setDocuments] = useState([]); const [message, setMessage] = useState('');
  const load = () => api('/documents/review-queue', { token }).then(({ documents: docs }) => setDocuments(docs)).catch((e) => setMessage(e.message)); useEffect(load, []);
  async function review(id, status) { const rejectionReason = status === 'rejected' ? window.prompt('Reason for rejection:') : undefined; if (status === 'rejected' && !rejectionReason) return; try { await api(`/documents/${id}/review`, { method: 'PATCH', token, body: { status, rejectionReason } }); load(); } catch (e) { setMessage(e.message); } }
  return <><header><div><p className="eyebrow">VERIFIER WORKSPACE</p><h1>Review queue</h1></div><span className="pill">{documents.length} pending</span></header>{message && <p className="error">{message}</p>}<section className="card list">{documents.length ? documents.map((doc) => <article key={doc._id}><div><strong>{doc.documentType.replace('_', ' ')}</strong><small>{doc.customer.name} · {doc.customer.email}</small><button className="link" style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.85rem' }} onClick={() => viewFile(doc._id, token)}>View document ↗</button></div><div className="actions"><button className="secondary" onClick={() => review(doc._id, 'rejected')}>Reject</button><button onClick={() => review(doc._id, 'approved')}>Approve</button></div></article>) : <p className="muted">The queue is clear.</p>}</section></>;
}

function Admin({ token }) {
  const [stats, setStats] = useState({ totalDocuments: 0, byStatus: {} }); const [logs, setLogs] = useState([]); const [error, setError] = useState('');
  useEffect(() => { Promise.all([api('/admin/stats', { token }), api('/admin/audit-logs?limit=10', { token })]).then(([s, l]) => { setStats(s); setLogs(l.data); }).catch((e) => setError(e.message)); }, []);
  return <><header><div><p className="eyebrow">ADMIN DASHBOARD</p><h1>Platform overview</h1></div></header>{error ? <p className="error">{error}</p> : <><section className="metrics"><div className="card"><small>Total documents</small><strong>{stats.totalDocuments}</strong></div>{['pending', 'approved', 'rejected', 'expired'].map((s) => <div className="card" key={s}><small>{labels[s]}</small><strong>{stats.byStatus[s] || 0}</strong></div>)}</section><section className="card"><h2>Recent audit activity</h2><div className="list">{logs.map((log) => <article key={log._id}><div><strong>{log.action.replaceAll('_', ' ')}</strong><small>{log.actor?.name || 'System'} · {new Date(log.createdAt).toLocaleString()}</small></div><span className="status pending">{log.toStatus || 'recorded'}</span></article>)}{!logs.length && <p className="muted">No audit activity yet.</p>}</div></section></>}</>;
}

export default function App() { const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('kyc-session') || 'null')); function onAuth(data) { localStorage.setItem('kyc-session', JSON.stringify(data)); setSession(data); } if (!session) return <Auth onAuth={onAuth} />; const role = session.user.role; return <main className="shell"><nav><span>KYC /</span><span>{role}</span><button className="link" onClick={() => { localStorage.removeItem('kyc-session'); setSession(null); }}>Sign out</button></nav>{role === 'customer' ? <Customer token={session.token} /> : role === 'verifier' ? <Verifier token={session.token} /> : <Admin token={session.token} />}</main>; }

