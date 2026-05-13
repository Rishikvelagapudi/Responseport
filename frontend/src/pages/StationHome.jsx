import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { 
  Shield, ShieldCheck, Activity, Globe, Lock, Users, FileText, 
  ChevronRight, ArrowRight, Play, Server, Database, ShieldAlert
} from 'lucide-react';
import './StationHomeNew.css';

const StationHome = () => {
  const { logout, user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="station-home-container">
      {/* Navigation */}
      <nav className={`home-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <Logo type="official" size={32} />
            <div className="logo-text">
              <span className="brand-name">RESPONSE PORT</span>
              <span className="brand-tag">STATION PORTAL</span>
            </div>
          </div>
          <div className="nav-actions">
            <div className="network-status">
              <div className="status-dot"></div>
              <span>NETWORK SECURE</span>
            </div>
            <Link to="/station" className="enter-portal-btn">
              ENTER COMMAND CENTER <ArrowRight size={18} />
            </Link>
            <button onClick={logout} className="logout-icon-btn">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="gov-badge">
            <img src="/logo.png" alt="AP Police" className="gov-logo" />
            <span>ANDHRA PRADESH POLICE DEPARTMENT</span>
          </div>
          <h1 className="hero-title">
            <span className="accent">CONNECT.</span> COMMUNICATE. <span className="accent">RESPOND.</span>
          </h1>
          <p className="hero-subtitle">
            The advanced command and control portal for official police station monitoring, 
            data synchronization, and mandatory departmental reporting.
          </p>
          <div className="hero-btns">
            <Link to="/station" className="btn-primary-hero">
              LAUNCH DASHBOARD <Activity size={20} />
            </Link>
            <button className="btn-secondary-hero">
              SYSTEM STATUS <Server size={20} />
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="hero-visuals">
          <div className="radar-circle"></div>
          <div className="radar-circle secondary"></div>
          <div className="data-nodes"></div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="stats-strip">
        <div className="strip-container">
          <div className="strip-item">
            <div className="strip-val">128+</div>
            <div className="strip-lbl">STATIONS ONLINE</div>
          </div>
          <div className="strip-divider"></div>
          <div className="strip-item">
            <div className="strip-val">2.4k</div>
            <div className="strip-lbl">SYNCED REPORTS</div>
          </div>
          <div className="strip-divider"></div>
          <div className="strip-item">
            <div className="strip-val">0.02s</div>
            <div className="strip-lbl">LATENCY</div>
          </div>
          <div className="strip-divider"></div>
          <div className="strip-item">
            <div className="strip-val">AES-256</div>
            <div className="strip-lbl">ENCRYPTION</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="section-title">INTEGRATED MODULES</h2>
            <p className="section-desc">A comprehensive suite of tools designed for the modern police force.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card-home">
              <div className="feature-icon-home"><Activity size={32} /></div>
              <h3>REAL-TIME ANALYTICS</h3>
              <p>Monitor station activity, response timelines, and submission metrics in a centralized dashboard.</p>
            </div>
            <div className="feature-card-home">
              <div className="feature-icon-home"><FileText size={32} /></div>
              <h3>DYNAMIC FORM ENGINE</h3>
              <p>Create and host custom forms to collect data from any station within the jurisdiction instantly.</p>
            </div>
            <div className="feature-card-home">
              <div className="feature-icon-home"><ShieldCheck size={32} /></div>
              <h3>MANDATORY REPORTING</h3>
              <p>Standardized daily reporting for accidents, charge sheets, and missing cases with automated sync.</p>
            </div>
            <div className="feature-card-home">
              <div className="feature-icon-home"><Users size={32} /></div>
              <h3>PERSONNEL MGMT</h3>
              <p>Manage your station profile and staff directory with official designation and role assignments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <Logo type="official" size={40} />
              <div className="logo-text">
                <span className="brand-name">RESPONSE PORT</span>
                <span className="brand-tag">OFFICIAL GOVERNMENT PORTAL</span>
              </div>
            </div>
            <div className="footer-links-grid">
              <div className="footer-col">
                <h4>RESOURCES</h4>
                <Link to="#">User Manual</Link>
                <Link to="#">System FAQ</Link>
                <Link to="#">Contact Support</Link>
              </div>
              <div className="footer-col">
                <h4>LEGAL</h4>
                <Link to="#">Privacy Policy</Link>
                <Link to="#">Terms of Use</Link>
                <Link to="#">Official Circulars</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Andhra Pradesh Police Department. All Rights Reserved. Managed by CCRB.</p>
            <div className="footer-badges">
              <div className="badge-item"><Lock size={12}/> SECURE</div>
              <div className="badge-item"><Globe size={12}/> STATE-WIDE</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Simple Logout Icon Button since I can't import everything easily
const LogOut = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

export default StationHome;
