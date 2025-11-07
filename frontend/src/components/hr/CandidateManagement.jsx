import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CandidateManagement() {
  const [applications, setApplications] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    // Log the current user to help debug
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('👤 Current user:', payload);
        setDebugInfo(payload);
      } catch (e) {
        console.error('Could not decode token');
      }
    }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      console.log('📥 Fetching applications from HR dashboard...');
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Failed to fetch:', errorData);
        throw new Error(errorData.msg || 'Failed to fetch applications');
      }
      
      const data = await res.json();
      console.log('✅ Received applications:', data.length);
      console.log('📄 Applications data:', data);
      setApplications(data);
    } catch (error) {
      console.error('❌ Failed to fetch applications:', error);
      alert('Error loading applications: ' + error.message);
    }
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchApplications();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const deleteApplication = async (appId) => {
    if (!confirm('Delete this application?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/applications/${appId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchApplications();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const downloadResume = async (appId, filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/applications/download-resume/${appId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    }
  };

  const checkJobsAndApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch debug info
      const debugRes = await fetch(`${API_BASE}/api/applications/debug/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const debugData = await debugRes.json();
      
      console.log('🔍 DEBUG INFO:', debugData);
      console.log('📊 Total applications in DB:', debugData.totalApplications);
      console.log('🏢 Your jobs:', debugData.yourJobs);
      console.log('📋 Applications breakdown:', debugData.allApplications);
      
      const yourApps = debugData.allApplications.filter(a => a.isYourJob);
      
      alert(
        `Debug Results:\n\n` +
        `Total Applications in DB: ${debugData.totalApplications}\n` +
        `Your Job Posts: ${debugData.yourJobs}\n` +
        `Applications for YOUR jobs: ${yourApps.length}\n\n` +
        `Check browser console for detailed breakdown.`
      );
      
    } catch (error) {
      console.error('Debug check failed:', error);
      alert('Debug failed. Check console.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👥 Applications ({applications.length})</h2>
        <button 
          onClick={checkJobsAndApplications}
          style={{
            padding: '10px 20px',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔍 Debug: Check Jobs & Applications
        </button>
      </div>

      {debugInfo && (
        <div style={{ padding: '10px', background: '#e7f3ff', borderRadius: '5px', marginBottom: '15px', fontSize: '12px' }}>
          <strong>Debug Info:</strong> Logged in as {debugInfo.email} (Role: {debugInfo.role})
        </div>
      )}

      {applications.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px', marginTop: '20px' }}>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>No applications yet</p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Applications will appear here once candidates apply to your job posts.
            <br />
            Make sure you have active job posts to receive applications.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 15 }}>
          {applications.map(app => (
            <div key={app._id} style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3>{app.candidateId?.name}</h3>
                  <p><strong>Email:</strong> {app.candidateId?.email}</p>
                  <p><strong>Job:</strong> {app.jobId?.title}</p>
                  <p>
                    <strong>Resume:</strong>
                    <button
                      onClick={() => downloadResume(app._id, app.resumeFileName)}
                      style={{
                        marginLeft: 10,
                        padding: '5px 10px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: 5,
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      📥 Download
                    </button>
                  </p>
                  {app.coverLetter && <p><strong>Cover Letter:</strong> {app.coverLetter}</p>}
                  <p><strong>Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 5 }}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>

                  <button
                    onClick={() => deleteApplication(app._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: 5,
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}