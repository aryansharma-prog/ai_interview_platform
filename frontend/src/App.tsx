import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/routes/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

import Landing from '@/pages/landing/Landing';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

import Dashboard from '@/pages/dashboard/Dashboard';
import InterviewSetup from '@/pages/interview/InterviewSetup';
import InterviewSession from '@/pages/interview/InterviewSession';
import LiveInterviewRoom from '@/pages/interview/LiveInterviewRoom';
import InterviewResult from '@/pages/interview/InterviewResult';
import SkillMap from '@/pages/skills/SkillMap';
import LearningPaths from '@/pages/learning/LearningPaths';
import PracticeSession from '@/pages/learning/PracticeSession';
import Analytics from '@/pages/analytics/Analytics';
import Profile from '@/pages/profile/Profile';
import Bookmarks from '@/pages/bookmarks/Bookmarks';
import AdminPanel from '@/pages/admin/AdminPanel';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        {/* Full-screen dedicated live interview environment */}
        <Route path="/interview/live/:id" element={<LiveInterviewRoom />} />

        {/* Dashboard layout wrapped pages */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview/new" element={<InterviewSetup />} />
          <Route path="/interview/session/:id" element={<LiveInterviewRoom />} />
          <Route path="/interview/result/:id" element={<InterviewResult />} />
          <Route path="/skills" element={<SkillMap />} />
          <Route path="/learning" element={<LearningPaths />} />
          <Route path="/practice/:skillName" element={<PracticeSession />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
