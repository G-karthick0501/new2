// frontend/src/pages/Home.jsx - PREMIUM DESIGN
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/home.css";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  
  function getRoleBasedDashboard(role) {
    const dashboards = {
      'candidate': '/candidate-dashboard',
      'hr': '/hr-dashboard',
      'admin': '/admin-dashboard'
    };
    return dashboards[role] || '/dashboard';
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      'candidate': '#3B82F6',
      'hr': '#10B981',
      'admin': '#F59E0B'
    };
    return colors[role] || '#666';
  };

  return (
    <div className="home-wrapper">
      {/* Main Content */}
      <div className="home-container">
        {isAuthenticated() ? (
          <>
            {/* Authenticated Hero */}
            <section className="hero authenticated-hero">
              <div className="ai-badge">
                <span className="badge-icon">✨</span>
                <span>Powered by Advanced AI</span>
              </div>

              <h1 className="hero-title">
                Welcome Back,
                <span className="highlight"> {user?.name || 'User'}</span>
              </h1>

              <p className="hero-subtitle">
                Continue your journey towards landing your dream role with AI-powered guidance
              </p>

              <div className="cta-section">
                <Link 
                  to={getRoleBasedDashboard(user?.role)} 
                  className="btn btn-primary btn-large"
                >
                  <span>Go to Dashboard</span>
                  <span className="btn-arrow">→</span>
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">13</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">5</div>
                  <div className="stat-label">Companies</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">AI Support</div>
                </div>
              </div>
            </section>

            {/* Authenticated Quick Actions */}
            <section className="features-section auth-features">
              <h2 className="section-title">Everything You Need to Succeed</h2>
              <p className="section-subtitle">Comprehensive tools designed to give you a competitive edge in your career journey.</p>
              
              <div className="features-grid">
                <div className="feature-card premium">
                  <div className="feature-icon large">📊</div>
                  <h3>Resume Optimizer</h3>
                  <p>Get smart, personalized resume suggestions instantly.</p>
                </div>
                <div className="feature-card premium">
                  <div className="feature-icon large">🎤</div>
                  <h3>Mock Interviews</h3>
                  <p>Practice with AI-powered interviews and get instant feedback.</p>
                </div>
                <div className="feature-card premium">
                  <div className="feature-icon large">💻</div>
                  <h3>Coding Challenges</h3>
                  <p>Sharpen your coding skills with automated evaluation.</p>
                </div>
                <div className="feature-card premium">
                  <div className="feature-icon large">📈</div>
                  <h3>Career Analytics</h3>
                  <p>Track your career growth and interview readiness.</p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Unauthenticated Hero */}
            <section className="hero landing-hero">
              <div className="ai-badge">
                <span className="badge-icon">✨</span>
                <span>Powered by Advanced AI</span>
              </div>

              <h1 className="hero-title">
                Land Your Dream Job
                <br />
                <span className="gradient-text">With AI-Powered Prep</span>
              </h1>

              <p className="hero-subtitle landing-subtitle">
                Transform your job search with smart resume tips, realistic mock interviews, and personalized career guidance. Join thousands who've accelerated their careers.
              </p>

              <div className="cta-section landing-cta">
                <Link to="/signup" className="btn btn-primary btn-large">
                  <span>Start Free Trial</span>
                  <span className="btn-arrow">→</span>
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Watch Demo
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">97%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">5</div>
                  <div className="stat-label">Companies</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">AI Support</div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="cta-full-section">
              <div className="cta-content">
                <h2>Ready to Transform Your Career?</h2>
                <p>Join thousands of successful candidates who've landed their dream jobs.</p>
                <Link to="/signup" className="btn btn-primary btn-large">
                  <span>Start Your Free Trial ✓</span>
                </Link>
                <p className="cta-subtext">No credit card required – Get started in 2 minutes</p>
              </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
              <h2 className="section-title">Everything You Need to Succeed</h2>
              <p className="section-subtitle">Comprehensive tools designed to give you a competitive edge in your job search.</p>
              
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">�</div>
                  <h3>AI Resume Optimizer</h3>
                  <p>Get smart, personalized resume suggestions instantly.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎤</div>
                  <h3>Mock Interviews</h3>
                  <p>Practice with AI-powered interviews and get instant feedback.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">💻</div>
                  <h3>Coding Challenges</h3>
                  <p>Sharpen your coding skills with automated evaluation.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">�</div>
                  <h3>Career Analytics</h3>
                  <p>Track your career growth and interview readiness.</p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 AI Recruitment Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}