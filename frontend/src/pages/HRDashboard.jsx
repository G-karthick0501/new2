// src/pages/HRDashboard.jsx
import { useState,useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import DashboardLayout from "../components/shared/DashboardLayout";
import Overview from "../components/hr/Overview";
import CandidateManagement from "../components/hr/CandidateManagement";
import JobManagement from "../components/hr/JobManagement";
// import InterviewManagement from "../components/hr/InterviewManagement";
// import Analytics from "../components/hr/Analytics";
import InterviewResultsHR from "../components/hr/InterviewResultsHR";
export default function HRDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleTabChange = (event) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'candidates', label: '👥 Candidates' },
    { id: 'jobs', label: '💼 Job Posts' },
    { id: 'interviews', label: '🎤 Interview Analytics' }
    
  ];

  return (
    <DashboardLayout
      title="HR Dashboard"
      subtitle={`Manage your recruitment pipeline, <strong>${user?.name}</strong>! 💼`}
      activeTab={activeTab} 
      tabs={tabs}
      onTabChange={setActiveTab}
      accentColor="#28a745"
    >
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'candidates' && <CandidateManagement />}
      {activeTab === 'jobs' && <JobManagement />}
      {activeTab === 'interviews' && <InterviewResultsHR />}
      
    </DashboardLayout>
  );
}