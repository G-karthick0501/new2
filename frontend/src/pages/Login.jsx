import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import GoogleOAuth from "../components/GoogleOAuth";

const API_BASE = "http://localhost:5000/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function getRoleBasedDashboard(role) {
    const dashboards = {
      'candidate': '/candidate-dashboard',
      'hr': '/hr-dashboard', 
      'admin': '/admin-dashboard'
    };
    return dashboards[role] || '/candidate-dashboard';
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!form.email || !form.password) {
      setMsg("Email and password are required");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.msg || "Error");
        return;
      }
      
      // Use the auth context to login
      login(data.user, data.token);
      
      // Redirect to role-appropriate dashboard
      navigate(getRoleBasedDashboard(data.user.role));
      
    } catch {
      setMsg("Network error");
    }
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.loginCard}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <span style={{ fontSize: 48 }}>🔐</span>
          </div>
          <h1 style={styles.title}>Welcome Back!</h1>
          <p style={styles.subtitle}>Sign in to continue your journey</p>
        </div>
      
        {/* Google Sign-In Button */}
        <div style={styles.googleSection}>
          <GoogleOAuth />
        </div>
      
        {/* Divider */}
        <div style={styles.dividerContainer}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>OR</span>
          <div style={styles.dividerLine}></div>
        </div>
      
        {/* Regular Login Form */}
        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📧</span>
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={onChange}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🔒</span>
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        
          <button 
            type="submit"
            style={styles.submitButton}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
          >
            <span style={{ fontSize: 20, marginRight: 8 }}>🚀</span>
            Sign In
          </button>
        </form>
      
        {/* Error Message */}
        {msg && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{msg}</span>
          </div>
        )}
      
        {/* Sign Up Link */}
        <div style={styles.signupSection}>
          <span style={styles.signupText}>Don't have an account?</span>
          <a 
            href="/signup" 
            style={styles.signupLink}
            onMouseOver={(e) => {
              e.target.style.color = '#764ba2';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#667eea';
            }}
          >
            Sign up here
          </a>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div style={styles.bgCircle1}></div>
      <div style={styles.bgCircle2}></div>
      <div style={styles.bgCircle3}></div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  loginCard: {
    background: 'white',
    borderRadius: 24,
    padding: 50,
    maxWidth: 480,
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: 35,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    margin: 0,
  },
  googleSection: {
    marginBottom: 25,
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: '30px 0',
    gap: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
  },
  dividerText: {
    color: '#a0aec0',
    fontWeight: 600,
    fontSize: 14,
    padding: '0 10px',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
    fontWeight: 600,
    color: '#2d3748',
    marginBottom: 8,
    gap: 8,
  },
  labelIcon: {
    fontSize: 18,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: 12,
    fontSize: 16,
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  submitButton: {
    width: '100%',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  errorBox: {
    background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
    border: '2px solid #f5c6cb',
    borderRadius: 12,
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    animation: 'shake 0.5s ease',
  },
  errorIcon: {
    fontSize: 20,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: 500,
    flex: 1,
  },
  signupSection: {
    textAlign: 'center',
    marginTop: 25,
    paddingTop: 25,
    borderTop: '1px solid #e2e8f0',
  },
  signupText: {
    color: '#718096',
    fontSize: 15,
    marginRight: 8,
  },
  signupLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 15,
    transition: 'color 0.3s ease',
  },
  // Decorative background elements
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    top: -200,
    right: -200,
    zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    bottom: -150,
    left: -150,
    zIndex: 0,
  },
  bgCircle3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.06)',
    top: '50%',
    left: '10%',
    transform: 'translateY(-50%)',
    zIndex: 0,
  },
};