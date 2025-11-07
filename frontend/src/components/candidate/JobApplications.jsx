import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function JobApplications() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
    if (window.incrementFeatureCounter) {
      window.incrementFeatureCounter('jobs');
    }
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/my-applications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (jobId) => {
    if (!resumeFile) {
      alert('Please upload your resume');
      return;
    }

    try {
      console.log('📝 Submitting application for job:', jobId);
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('coverLetter', coverLetter);

      const res = await fetch(`${API_BASE}/api/applications/${jobId}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      const responseData = await res.json();
      console.log('📥 Application response:', responseData);

      if (res.ok) {
        console.log('✅ Application submitted successfully');
        alert('Application submitted successfully');
        setSelectedJob(null);
        setCoverLetter('');
        setResumeFile(null);
        fetchMyApplications();
      } else {
        console.error('❌ Application failed:', responseData);
        alert(responseData.msg || responseData.error || 'Failed to apply');
      }
    } catch (err) {
      console.error('❌ Application error:', err);
      alert('An error occurred while submitting your application');
    }
  };

  const deleteApplication = async (appId) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/applications/${appId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchMyApplications();
        alert('Application deleted');
      } else {
        alert('Failed to delete application');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const hasApplied = (jobId) => {
    return applications.some(app => app?.jobId?._id === jobId);
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.iconCircle}>💼</div>
        <h1 style={styles.title}>Job Opportunities</h1>
        <p style={styles.subtitle}>Browse and apply to available positions</p>
      </div>

      {/* Statistics Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{jobs.length}</div>
            <div style={styles.statLabel}>Available Jobs</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📝</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{applications.length}</div>
            <div style={styles.statLabel}>My Applications</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>
              {applications.filter(a => a.status === 'pending').length}
            </div>
            <div style={styles.statLabel}>Pending</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✓</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>
              {applications.filter(a => a.status === 'accepted' || a.status === 'shortlisted').length}
            </div>
            <div style={styles.statLabel}>Accepted</div>
          </div>
        </div>
      </div>

      {/* Available Jobs Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <span style={{ fontSize: 28, marginRight: 10 }}>🔍</span>
          Available Positions
        </h2>
        <div style={styles.jobsGrid}>
          {jobs.map(job => (
            <div key={job._id} style={styles.jobCard}>
              <div style={styles.jobHeader}>
                <div>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <div style={styles.jobMeta}>
                    <span style={styles.metaItem}>
                      <span style={{ fontSize: 16 }}>📍</span> {job.location}
                    </span>
                    <span style={styles.metaItem}>
                      <span style={{ fontSize: 16 }}>💰</span> {job.salary}
                    </span>
                  </div>
                </div>
                {hasApplied(job._id) && (
                  <div style={styles.appliedBadge}>
                    <span style={{ fontSize: 18 }}>✓</span>
                    Applied
                  </div>
                )}
              </div>

              <p style={styles.jobDescription}>{job.description}</p>

              <div style={styles.skillsSection}>
                <div style={styles.skillsLabel}>Required Skills:</div>
                <div style={styles.skillsContainer}>
                  {(Array.isArray(job.skills) ? job.skills : [job.skills]).map((skill, idx) => (
                    <span key={idx} style={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={styles.jobActions}>
                {job.jdFileName && (
                  <a
                    href={`${API_BASE}/api/jobs/${job._id}/download-jd`}
                    download
                    style={styles.downloadButton}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(23, 162, 184, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: 16 }}>📄</span>
                    Download JD
                  </a>
                )}

                {!hasApplied(job._id) && (
                  <button
                    onClick={() => setSelectedJob(selectedJob === job._id ? null : job._id)}
                    style={{
                      ...styles.applyButton,
                      background: selectedJob === job._id 
                        ? 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    <span style={{ fontSize: 16 }}>
                      {selectedJob === job._id ? '✕' : '📤'}
                    </span>
                    {selectedJob === job._id ? 'Cancel' : 'Apply Now'}
                  </button>
                )}
              </div>

              {selectedJob === job._id && (
                <div style={styles.applicationForm}>
                  <h4 style={styles.formTitle}>Submit Your Application</h4>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      <span style={{ fontSize: 16, marginRight: 6 }}>📎</span>
                      Upload Resume (PDF)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      style={styles.fileInput}
                    />
                    {resumeFile && (
                      <div style={styles.fileSelected}>
                        ✓ {resumeFile.name}
                      </div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      <span style={{ fontSize: 16, marginRight: 6 }}>✍️</span>
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      placeholder="Tell us why you're a great fit for this position..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      style={styles.textarea}
                    />
                  </div>

                  <button
                    onClick={() => handleApply(job._id)}
                    disabled={!resumeFile}
                    style={{
                      ...styles.submitButton,
                      opacity: resumeFile ? 1 : 0.6,
                      cursor: resumeFile ? 'pointer' : 'not-allowed'
                    }}
                    onMouseOver={(e) => {
                      if (resumeFile) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      if (resumeFile) {
                        e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                      }
                    }}
                  >
                    <span style={{ fontSize: 18 }}>✓</span>
                    Submit Application
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* My Applications Section */}
      {applications.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ fontSize: 28, marginRight: 10 }}>📋</span>
            My Applications
          </h2>
          <div style={styles.applicationsGrid}>
            {applications.map(app => (
              <div key={app._id} style={styles.applicationCard}>
                <div style={styles.applicationHeader}>
                  <div>
                    <h3 style={styles.applicationTitle}>
                      {app?.jobId?.title || 'Unknown Job'}
                    </h3>
                    <div style={styles.applicationMeta}>
                      Applied on {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    background: 
                      app.status === 'pending' ? 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)' : 
                      app.status === 'shortlisted' ? 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' : 
                      app.status === 'accepted' ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : 
                      'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                  }}>
                    {app.status?.toUpperCase()}
                  </div>
                </div>

                <div style={styles.applicationActions}>
                  {app.resumeFileName && (
                    <a
                      href={`${API_BASE}/api/applications/download-resume/${app._id}`}
                      download
                      style={styles.resumeButton}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(23, 162, 184, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ fontSize: 16 }}>📄</span>
                      View Resume
                    </a>
                  )}
                  <button
                    onClick={() => deleteApplication(app._id)}
                    style={styles.deleteButton}
                    onMouseOver={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontSize: 16 }}>🗑️</span>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: 40,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
    color: 'white',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 40,
    margin: '0 auto 20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 42,
    fontWeight: 700,
    margin: '0 0 10px 0',
    color: 'white',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
  },
  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
    marginBottom: 40,
  },
  statCard: {
    background: 'white',
    borderRadius: 16,
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 15,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  statIcon: {
    fontSize: 36,
    width: 60,
    height: 60,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#2d3748',
    lineHeight: 1,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
    fontWeight: 500,
  },
  section: {
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: 'white',
    marginBottom: 25,
    display: 'flex',
    alignItems: 'center',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
    gap: 25,
  },
  jobCard: {
    background: 'white',
    borderRadius: 16,
    padding: 25,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#2d3748',
    margin: '0 0 8px 0',
  },
  jobMeta: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: 14,
    color: '#718096',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  appliedBadge: {
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  },
  jobDescription: {
    fontSize: 15,
    color: '#4a5568',
    lineHeight: 1.6,
    marginBottom: 15,
  },
  skillsSection: {
    marginBottom: 20,
  },
  skillsLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#718096',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
  },
  jobActions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  downloadButton: {
    flex: 1,
    minWidth: 'fit-content',
    padding: '10px 20px',
    background: 'white',
    color: '#17a2b8',
    border: '2px solid #17a2b8',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyButton: {
    flex: 1,
    minWidth: 'fit-content',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applicationForm: {
    marginTop: 20,
    padding: 25,
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: 12,
    border: '2px solid #667eea',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#2d3748',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#4a5568',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
  },
  fileInput: {
    width: '100%',
    padding: 12,
    border: '2px dashed #cbd5e0',
    borderRadius: 8,
    fontSize: 14,
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  fileSelected: {
    marginTop: 10,
    padding: '8px 12px',
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: 'white',
    borderRadius: 6,
    fontSize: 13,
    display: 'inline-block',
  },
  textarea: {
    width: '100%',
    padding: 12,
    border: '2px solid #cbd5e0',
    borderRadius: 8,
    fontSize: 14,
    minHeight: 100,
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  submitButton: {
    width: '100%',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  applicationsGrid: {
    display: 'grid',
    gap: 20,
  },
  applicationCard: {
    background: 'white',
    borderRadius: 16,
    padding: 25,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  applicationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 20,
  },
  applicationTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#2d3748',
    margin: '0 0 8px 0',
  },
  applicationMeta: {
    fontSize: 14,
    color: '#718096',
  },
  statusBadge: {
    padding: '8px 16px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700,
    color: 'white',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  applicationActions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  resumeButton: {
    flex: 1,
    minWidth: 'fit-content',
    padding: '10px 20px',
    background: 'white',
    color: '#17a2b8',
    border: '2px solid #17a2b8',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButton: {
    flex: 1,
    minWidth: 'fit-content',
    padding: '10px 20px',
    background: 'white',
    color: '#dc3545',
    border: '2px solid #dc3545',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
};
