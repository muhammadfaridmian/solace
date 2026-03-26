import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { RantPage } from './pages/RantPage';
import { JournalPage } from './pages/JournalPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { CompanionPage } from './pages/CompanionPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { useStore } from './store/useStore';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const location = useLocation();
  const { theme, mood, fetchEntries, clearAllEntries } = useStore();
  const { initialize, user } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle data sync based on user state
  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      clearAllEntries();
    }
  }, [user, fetchEntries, clearAllEntries]);

  // Initialize theme and mood on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = `mood-${mood}`;
  }, [theme, mood]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public auth routes (no layout/nav) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/rant" element={<RantPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/companion" element={<CompanionPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
