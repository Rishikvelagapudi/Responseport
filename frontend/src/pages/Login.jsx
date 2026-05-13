import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, KeyRound, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'admin') navigate('/admin-home');
      else if (res.data.user.role === 'ccrb') navigate('/station-home');
      else navigate('/station-home');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-sidebar" style={{ backgroundImage: `url('/images/WhatsApp%20Image%202026-03-31%20at%2012.25.22.jpeg')` }}>
        <div className="auth-sidebar-overlay">
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '150px', height: '150px', marginBottom: '2rem' }}>
            <div className="auth-pulse-ring" style={{ width: '100%', height: '100%', animationDelay: '0s' }}></div>
            <div className="auth-pulse-ring" style={{ width: '80%', height: '80%', animationDelay: '1s' }}></div>
            <img src="/logo.png" alt="Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', zIndex: 10, filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            response
            <br />
            <span style={{ color: 'var(--secondary)' }}>Portal</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', maxWidth: '400px', lineHeight: '1.6', fontWeight: 800, letterSpacing: '2px' }}>
            CONNECT. COMMUNICATE. RESPOND.
          </p>
        </div>
      </div>
      
      <div className="auth-content">
        <div className="auth-box animate-fade-in" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ background: '#fff', padding: '12px', borderRadius: '50%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            </div>
          </div>
          
          <h1 className="auth-title" style={{ color: 'var(--text-main)', fontSize: '2rem' }}>Authorized Login</h1>
          <p className="auth-subtitle">Enter your official credentials to access</p>
          
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--danger)', fontWeight: 500 }}>{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address (Official ID)</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@station.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Secure Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                  <KeyRound size={18} />
                </div>
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px', height: '54px', fontSize: '1.1rem' }}>
              <LogIn size={20} />
              {loading ? 'Authenticating...' : 'Secure Sign In'}
            </button>
          </form>
          
          <div style={{ marginTop: '30px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Don't have clearance? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Request Access</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
