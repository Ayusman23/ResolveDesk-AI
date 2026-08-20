import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientPortal from './pages/ClientPortal';
import DeveloperKanban from './pages/DeveloperKanban';
import ManagerAnalytics from './pages/ManagerAnalytics';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080A10] text-slate-900 dark:text-[#EDF1F7] flex flex-col font-sans antialiased selection:bg-[#22E6B8] selection:text-[#080A10] transition-colors duration-200">
              <Navbar />
              <main className="flex-1 flex flex-col">
                <Routes>
                  {/* Public Landing & Auth Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Role-Protected Enterprise Application Routes */}
                  <Route
                    path="/client"
                    element={
                      <ProtectedRoute allowedRoles={['client', 'developer', 'manager']}>
                        <ClientPortal />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/developer"
                    element={
                      <ProtectedRoute allowedRoles={['developer', 'manager']}>
                        <DeveloperKanban />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/manager"
                    element={
                      <ProtectedRoute allowedRoles={['manager']}>
                        <ManagerAnalytics />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all redirect to Landing */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
