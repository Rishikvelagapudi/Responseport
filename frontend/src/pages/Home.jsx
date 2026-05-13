import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Info, FileText, PenTool, BarChart3, Bell, ChevronLeft, ChevronRight,
  ShieldCheck, User, LayoutDashboard
} from 'lucide-react';
import Logo from '../components/Logo';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const galleryImages = [
    '/gallery-1.png',
    '/gallery-2.png',
    '/hero-building.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
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
          <button className="login-btn" onClick={() => navigate('/login')}>
            <User size={18} /> Login
          </button>
        </div>
      </header>


      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-slogan">CONNECT. COMMUNICATE. RESPOND.</div>
          <h1 className="hero-title">Response Port</h1>
          <p className="hero-subtitle">
            Powering Police Stations. Connecting Officers.
          </p>
          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={() => navigate('/login')}>Get Started</button>
            <button className="btn-hero-secondary">Learn More</button>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <FileText size={32} color="#1e3a8a" />
          </div>
          <div className="feature-text">
            <h3>Access & Submit Forms</h3>
            <p>Easily access, view, and submit hosted forms from your dashboard.</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <PenTool size={32} color="#1e3a8a" />
          </div>
          <div className="feature-text">
            <h3>Create Custom Forms</h3>
            <p>Design custom forms tailored to police needs with our intuitive form builder.</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <BarChart3 size={32} color="#1e3a8a" />
          </div>
          <div className="feature-text">
            <h3>Track & Manage Submissions</h3>
            <p>Monitor form submissions, analyze data, and stay elegantly organized.</p>
          </div>
        </div>
      </section>

      {/* Info Grid Section */}
      <section className="info-grid">
        {/* About Response Port */}
        <div className="info-card">
          <div className="info-card-header">
            <Info size={18} />
            <h3>About Response Port</h3>
          </div>
          <div className="about-card">
            <p className="about-text">
              Response Port is a centralized system that enables stations to submit reports, track activities, and facilitate seamless communication with real-time insights.
            </p>
            <div className="key-highlights">
              <div className="highlight-item"><ShieldCheck size={14} color="#3b82f6" /> Real-time Submissions</div>
              <div className="highlight-item"><ShieldCheck size={14} color="#3b82f6" /> Secure & Reliable</div>
              <div className="highlight-item"><ShieldCheck size={14} color="#3b82f6" /> Advanced Analytics</div>
              <div className="highlight-item"><ShieldCheck size={14} color="#3b82f6" /> Role-based Access</div>
            </div>
          </div>
        </div>

        {/* Station Gallery */}
        <div className="info-card">
          <div className="info-card-header">
            <LayoutDashboard size={18} />
            <h3>Station Gallery</h3>
          </div>
          <div className="gallery-container">
            {galleryImages.map((img, idx) => (
              <div 
                key={idx}
                className="gallery-slide"
                style={{ 
                  backgroundImage: `url(${img})`,
                  opacity: currentSlide === idx ? 1 : 0,
                  zIndex: currentSlide === idx ? 2 : 1
                }}
              ></div>
            ))}
            <button className="gallery-nav-btn gallery-prev" onClick={prevSlide}><ChevronLeft size={20} /></button>
            <button className="gallery-nav-btn gallery-next" onClick={nextSlide}><ChevronRight size={20} /></button>
            
            {/* Dots */}
            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
              {galleryImages.map((_, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    width: '8px', height: '8px', borderRadius: '50%', 
                    background: currentSlide === idx ? '#fff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentSlide(idx)}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="info-card">
          <div className="info-card-header">
            <Bell size={18} />
            <h3>Announcements</h3>
          </div>
          <div className="announcements-list">
            <div className="announcement-item">
              <div className="announcement-meta">
                <span className="announcement-title">System Maintenance</span>
                <span className="announcement-date">22 May 2025</span>
              </div>
              <p className="announcement-text">System maintenance scheduled from 02:00 AM to 04:00 AM.</p>
            </div>
            <div className="announcement-item">
              <div className="announcement-meta">
                <span className="announcement-title">Training Session</span>
                <span className="announcement-date">20 May 2025</span>
              </div>
              <p className="announcement-text">Training session for officers on new features rollout.</p>
            </div>
            <div className="announcement-item">
              <div className="announcement-meta">
                <span className="announcement-title">Profile Update</span>
                <span className="announcement-date">18 May 2025</span>
              </div>
              <p className="announcement-text">Important: Update your profile and contact details.</p>
            </div>
          </div>
          <a href="#" className="view-all-link" style={{ fontSize: '0.8rem', textAlign: 'right', display: 'block', color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>View All</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-main">
          <div className="footer-copy">© 2025 Response Port. All Rights Reserved.</div>
          <div className="footer-official">This is an official Andhra Pradesh Police Department Portal</div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <span style={{opacity: 0.3}}>|</span>
            <a href="#">Terms of Use</a>
            <span style={{opacity: 0.3}}>|</span>
            <a href="#">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
