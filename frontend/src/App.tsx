import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { YearProvider } from './contexts/YearContext';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';
import Finance from './pages/Finance';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import Package from './pages/Package';
import Attendance from './pages/Attendance';
import AttendanceDashboard from './pages/AttendanceDashboard';
import ClassHistory from './pages/ClassHistory';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <YearProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/finance"
              element={
                <AuthGuard>
                  <Finance />
                </AuthGuard>
              }
            />
            <Route
              path="/members"
              element={
                <AuthGuard>
                  <Members />
                </AuthGuard>
              }
            />
            <Route
              path="/members/:id"
              element={
                <AuthGuard>
                  <MemberDetail />
                </AuthGuard>
              }
            />
            <Route
              path="/package"
              element={
                <AuthGuard>
                  <Package />
                </AuthGuard>
              }
            />
            <Route
              path="/attendance"
              element={
                <AuthGuard>
                  <Attendance />
                </AuthGuard>
              }
            />
            <Route
              path="/attendance-dashboard"
              element={
                <AuthGuard>
                  <AttendanceDashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/classes"
              element={
                <AuthGuard>
                  <ClassHistory />
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              }
            />
            <Route path="/" element={<Navigate to="/finance" replace />} />
            <Route path="*" element={<Navigate to="/finance" replace />} />
          </Routes>
        </YearProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
