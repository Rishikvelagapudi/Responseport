import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  FileText, Activity, ShieldAlert, ArrowRight, LayoutDashboard, Search, Clock, 
  CheckCircle, Calendar, Play, List, ArrowLeft, LogOut, ChevronRight,
  Bell, Info, Shield, BarChart3, User, Home, Users, Settings, Mail, HelpCircle
} from 'lucide-react';
import Logo from '../components/Logo';
import './AdminHome.css';

const AnalogClock = ({ time }) => {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secDeg = (seconds / 60) * 360;
  const minDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourDeg = (hours / 12) * 360 + (minutes / 60) * 30;

  return (
    <div className="simple-analog-clock">
      <div className="simple-hand hour-hand" style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}></div>
      <div className="simple-hand min-hand" style={{ transform: `translateX(-50%) rotate(${minDeg}deg)` }}></div>
      <div className="simple-hand sec-hand" style={{ transform: `translateX(-50%) rotate(${secDeg}deg)` }}></div>
      <div className="clock-center-dot"></div>
      
      {/* Numbers */}
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: `translate(-50%, -50%) rotate(${(i + 1) * 30}deg) translateY(-60px) rotate(-${(i + 1) * 30}deg)`,
            fontSize: '0.7rem',
            fontWeight: '800',
            color: '#1e293b'
          }}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
};

const AdminHome = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const [cases, setCases] = useState([]);
  const [mandatoryForms, setMandatoryForms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [graphFilter, setGraphFilter] = useState('7d');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, [user.token]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [casesRes, mandatoryRes, sessionsRes] = await Promise.all([
        axios.get('/api/admin/cases', config),
        axios.get('/api/mandatory/all', config).catch(() => ({ data: [] })),
        axios.get('/api/admin/sessions', config).catch(() => ({ data: [] }))
      ]);
      setCases(casesRes.data);
      setMandatoryForms(mandatoryRes.data);
      setSessions(sessionsRes.data);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getGraphData = () => {
    let days = 7;
    if (graphFilter === '7d') days = 7;
    if (graphFilter === '1w') days = 7;
    if (graphFilter === '1m') days = 30;

    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      
      const countNormal = cases.filter(c => new Date(c.createdAt).toDateString() === dateStr).length;
      const countMandatory = mandatoryForms.filter(f => new Date(f.createdAt).toDateString() === dateStr).length;
      const totalCount = countNormal + countMandatory;
      
      data.push({
        name: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        submissions: totalCount, 
        fullDate: dateStr
      });
    }
    return data;
  };

  const chartData = getGraphData();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
         <div className="auth-pulse-ring" style={{ width: '60px', height: '60px', border: '3px solid #1e3a8a' }}></div>
      </div>
    );
  }

  return (
    <div className="admin-home-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <img src="/gov-emblem.png" alt="Emblem of India" className="gov-emblem" />
          <div className="brand-text">
            <span className="brand-title">RESPONSE PORT</span>
            <span className="brand-subtitle">ADMIN PORTAL</span>
            <span className="gov-text">Andhra Pradesh Police Department</span>
          </div>
        </div>
        <div className="header-center">
          <img src="/ap-emblem.png" alt="Andhra Pradesh Emblem" className="ap-emblem" />
        </div>
        <div className="header-right">
          <div className="gov-label">
            <div className="gov-label-hi">ఆంధ్రప్రదేశ్ పోలీస్ విభాగం</div>
            <div className="gov-label-en">Andhra Pradesh Police Department</div>
          </div>
          <img src="/indian-flag.png" alt="Indian Flag" className="gov-flag" />
          <button className="login-btn" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="admin-nav">
        <ul className="nav-links">
          <li className="nav-item active"><Home size={18} /> Home</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="admin-hero">
        <div className="hero-content">
          <div className="welcome-wrapper">
            <div className="welcome-text-side">
              <h1 className="hero-title">Welcome To Response Port</h1>
              <p className="hero-subtitle">
                A Unified Platform for Efficient Reporting, Monitoring & Communication Across All Stations
              </p>
            </div>
            <div className="welcome-image-side">
              <img src="/officer-welcome.png" alt="Officer Salute" className="officer-welcome-img" />
            </div>
          </div>
          <div className="hero-actions">
            <button className="action-card" onClick={() => navigate('/admin')}>
              <div className="action-card-icon"><FileText size={28} /></div>
              <div className="action-card-text">
                <h3>New Submissions</h3>
                <p>View latest submissions</p>
              </div>
            </button>
            <button className="action-card green" onClick={() => navigate('/admin')}>
              <div className="action-card-icon"><LayoutDashboard size={28} /></div>
              <div className="action-card-text">
                <h3>Admin Centre</h3>
                <p>Manage portal activities</p>
              </div>
            </button>
          </div>
        </div>

        <div className="tv-container">
          <div className="tv-panel">
            <video 
              src="/videos/WhatsApp%20Video%202026-04-15%20at%2019.53.58.mp4" 
              autoPlay loop muted playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            
            {/* HUD Overlays */}
            <div className="hud-corner top-left"></div>
            <div className="hud-corner top-right"></div>
            <div className="hud-corner bottom-left"></div>
            <div className="hud-corner bottom-right"></div>
            <div className="hud-target"></div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <div className="dashboard-grid">
        {/* Date & Time */}
        <div className="dash-card">
          <div className="card-header">
            <Calendar size={18} />
            <h3>Date & Time</h3>
          </div>
          <div className="datetime-display">
            <div className="time-val">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).split(' ')[0]}
              <span>{currentTime.toLocaleTimeString('en-US', { hour12: true }).split(' ')[1]}</span>
            </div>
            <div className="date-val">
              <span className="day-name">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</span>
              <span className="full-date">{currentTime.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Analog Clock */}
        <div className="dash-card">
          <div className="card-header">
            <Clock size={18} />
            <h3>Analog Clock</h3>
          </div>
          <div className="analog-clock-container">
            <AnalogClock time={currentTime} />
          </div>
        </div>

        {/* Recent Form Activity (Announcements Section) */}
        <div className="dash-card">
          <div className="card-header">
            <Bell size={18} />
            <h3>Recent Form Activity</h3>
          </div>
          <div className="announcements-list">
            {sessions.slice(0, 3).map((session, idx) => {
              const responseCount = cases.filter(c => c.sessionId?._id === session._id).length;
              return (
                <div key={idx} className="announcement-item" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: '800', color: 'var(--primary-blue)', fontSize: '0.9rem' }}>{session.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                      {new Date(session.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Activity size={14} color="#3b82f6" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>{responseCount} Responses</span>
                  </div>
                </div>
              );
            })}
            {sessions.length === 0 && <div className="announcement-item">No active forms found.</div>}
          </div>
          <a href="#" className="view-all-link" onClick={() => navigate('/admin')}>View Admin Centre</a>
        </div>

        {/* Submissions Overview */}
        <div className="dash-card overview-card">
          <div className="card-header">
            <Activity size={18} />
            <h3>Submissions Overview</h3>
          </div>
          <div className="filter-row">
            <span className="filter-label">Filter Period:</span>
            <div className="filter-options">
              <button className={`filter-opt ${graphFilter === '7d' ? 'active' : ''}`} onClick={() => setGraphFilter('7d')}>Past 7 Days</button>
              <button className={`filter-opt ${graphFilter === '1w' ? 'active' : ''}`} onClick={() => setGraphFilter('1w')}>Past 1 Week</button>
              <button className={`filter-opt ${graphFilter === '1m' ? 'active' : ''}`} onClick={() => setGraphFilter('1m')}>Past 1 Month</button>
            </div>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#1e3a8a" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSub)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* About Card */}
        <div className="dash-card">
          <div className="card-header">
            <Info size={18} />
            <h3>About Response Port</h3>
          </div>
          <div className="about-card">
            <p className="about-text">
              Response Port is a centralized system that enables stations to submit reports, track activities, and facilitate seamless communication with real-time insights.
            </p>
            <div className="key-highlights">
              <h4>Key Highlights</h4>
              <div className="highlight-item"><FileText size={14} /> Real-time Submissions</div>
              <div className="highlight-item"><Shield size={14} /> Secure & Reliable</div>
              <div className="highlight-item"><BarChart3 size={14} /> Advanced Analytics</div>
              <div className="highlight-item"><Users size={14} /> Role-based Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="admin-footer">
        <div className="footer-main">
          <div className="footer-copy">© 2025 Response Port. All Rights Reserved.</div>
          <div className="footer-official">This is an official Andhra Pradesh Police Department Portal</div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <span>|</span>
            <a href="#">Terms of Use</a>
            <span>|</span>
            <a href="#">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminHome;
