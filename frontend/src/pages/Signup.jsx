import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import GoogleOAuth from "../components/GoogleOAuth";

const API_BASE = "http://localhost:5000/api";

export default function Signup() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "candidate" 
  });
  const [msg, setMsg] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!form.name || !form.email || !form.password || !form.role) {
      setMsg("All fields are required");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.msg || "Error");
        return;
      }
      setMsg("Registered successfully! Redirecting...");
      
      // Auto-login after successful registration
      setTimeout(async () => {
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          login(loginData.user, loginData.token);
          navigate(getRoleBasedDashboard(loginData.user.role));
        }
      }, 1000);
      
      setForm({ name: "", email: "", password: "", role: "candidate" });
    } catch {
      setMsg("Network error");
    }
  }

  function getRoleBasedDashboard(role) {
    const dashboards = {
      'candidate': '/candidate-dashboard',
      'hr': '/hr-dashboard', 
      'admin': '/admin-dashboard'
    };
    return dashboards[role] || '/dashboard';
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.signupCard}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <span style={{ fontSize: 48 }}>✨</span>
          </div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Start your journey with us today</p>
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
      
        {/* Regular Signup Form */}
        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>👤</span>
              Full Name
            </label>
            <input
              name="name"
              placeholder="Enter your full name"
              value={form.name}
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
              placeholder="Create a secure password"
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
        
          {/* Role Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🎭</span>
              I am a:
            </label>
            <div style={styles.roleContainer}>
              <div
                onClick={() => setForm({ ...form, role: 'candidate' })}
                style={{
                  ...styles.roleCard,
                  ...(form.role === 'candidate' ? styles.roleCardActive : {})
                }}
                onMouseOver={(e) => {
                  if (form.role !== 'candidate') {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (form.role !== 'candidate') {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={styles.roleIcon}>💼</div>
                <div style={styles.roleTitle}>Job Candidate</div>
                <div style={styles.roleDesc}>Looking for opportunities</div>
              </div>

              <div
                onClick={() => setForm({ ...form, role: 'hr' })}
                style={{
                  ...styles.roleCard,
                  ...(form.role === 'hr' ? styles.roleCardActive : {})
                }}
                onMouseOver={(e) => {
                  if (form.role !== 'hr') {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (form.role !== 'hr') {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={styles.roleIcon}>👔</div>
                <div style={styles.roleTitle}>HR Manager</div>
                <div style={styles.roleDesc}>Recruiting talent</div>
              </div>

              <div
                onClick={() => setForm({ ...form, role: 'admin' })}
                style={{
                  ...styles.roleCard,
                  ...(form.role === 'admin' ? styles.roleCardActive : {})
                }}
                onMouseOver={(e) => {
                  if (form.role !== 'admin') {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (form.role !== 'admin') {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={styles.roleIcon}>⚙️</div>
                <div style={styles.roleTitle}>Administrator</div>
                <div style={styles.roleDesc}>System management</div>
              </div>
            </div>
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
            Create Account
          </button>
        </form>
      
        {/* Message Box */}
        {msg && (
          <div style={msg?.includes("successfully") ? styles.successBox : styles.errorBox}>
            <span style={styles.messageIcon}>
              {msg?.includes("successfully") ? '✓' : '⚠️'}
            </span>
            <span style={styles.messageText}>{msg}</span>
          </div>
        )}
      
        {/* Login Link */}
        <div style={styles.loginSection}>
          <span style={styles.loginText}>Already have an account?</span>
          <a 
            href="/login" 
            style={styles.loginLink}
            onMouseOver={(e) => {
              e.target.style.color = '#764ba2';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#667eea';
            }}
          >
            Login here
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
  signupCard: {
    background: 'white',
    borderRadius: 24,
    padding: 50,
    maxWidth: 550,
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    zIndex: 1,
    maxHeight: '90vh',
    overflowY: 'auto',
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
  roleContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },
  roleCard: {
    padding: '16px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: 12,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'white',
  },
  roleCardActive: {
    borderColor: '#667eea',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#2d3748',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 11,
    color: '#718096',
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
  successBox: {
    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
    border: '2px solid #c3e6cb',
    borderRadius: 12,
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
  },
  messageIcon: {
    fontSize: 20,
  },
  messageText: {
    fontSize: 14,
    fontWeight: 500,
    flex: 1,
    color: '#2d3748',
  },
  loginSection: {
    textAlign: 'center',
    marginTop: 25,
    paddingTop: 25,
    borderTop: '1px solid #e2e8f0',
  },
  loginText: {
    color: '#718096',
    fontSize: 15,
    marginRight: 8,
  },
  loginLink: {
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