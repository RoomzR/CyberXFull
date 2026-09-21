import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { HomePage }           from './pages/HomePage';
import { Login }              from './pages/Login';
import { Register }           from './pages/Register';
import { Profile }            from './pages/Profile';
import { AdminLogin }         from './pages/admin/AdminLogin';
import { AdminTournaments }   from './pages/admin/AdminTournaments';
import { AdminTournamentForm} from './pages/admin/AdminTournamentForm';
import { AdminDashboard }     from './pages/admin/AdminDashboard';
import { ManagerDashboard }   from './pages/manager/ManagerDashboard';
import { ThreeClub }          from './components/ThreeClub';
import { LivePage }           from './pages/live/LivePage';
import { LiveServerPage }     from './pages/live/LiveServerPage';
import { MatchDetailPage }    from './pages/live/MatchDetailPage';
import { MatchesListPage }    from './pages/live/MatchesListPage';
import { LiveSetupPage }      from './pages/live/LiveSetupPage';
import { LiveControlPage }    from './pages/live/LiveControlPage';
import { GsiTestPage }        from './pages/GsiTestPage';
import { ProtectedRoute }     from './components/Auth/ProtectedRoute';
import { RoleBasedRoute }     from './components/Auth/RoleBasedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/3d-club"  element={<ThreeClub />} />
        <Route path="/live"     element={<LivePage />} />
        <Route path="/live/matches" element={<MatchesListPage />} />
        <Route path="/live/match/:id" element={<MatchDetailPage />} />
        <Route path="/live/control"
          element={
            <RoleBasedRoute roles={['Admin']}>
              <LiveControlPage />
            </RoleBasedRoute>
          } />
        <Route path="/live/control/setup"
          element={
            <RoleBasedRoute roles={['Admin']}>
              <LiveSetupPage />
            </RoleBasedRoute>
          } />
        <Route path="/live/control/gsi-test"
          element={
            <RoleBasedRoute roles={['Admin']}>
              <GsiTestPage />
            </RoleBasedRoute>
          } />
        <Route path="/live/setup" element={<Navigate to="/live/control/setup" replace />} />
        <Route path="/gsi-test" element={<Navigate to="/live/control/gsi-test" replace />} />
        <Route path="/live/:id" element={<LiveServerPage />} />

        {/* ── Player profile ── */}
        <Route path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* ── Manager ── */}
        <Route path="/manager"
          element={
            <RoleBasedRoute roles={['Manager', 'Admin']}>
              <ManagerDashboard />
            </RoleBasedRoute>
          } />

        {/* ── Admin ── */}
        <Route path="/admin-panel"
          element={
            <RoleBasedRoute roles={['Admin']}>
              <AdminDashboard />
            </RoleBasedRoute>
          } />

        {/* ── Legacy admin (API-key based) ── */}
        <Route path="/admin"                     element={<AdminLogin />} />
        <Route path="/admin/tournaments"         element={<AdminTournaments />} />
        <Route path="/admin/tournaments/new"     element={<AdminTournamentForm />} />
        <Route path="/admin/tournaments/:id"     element={<AdminTournamentForm />} />
      </Routes>
    </BrowserRouter>
  );
}
