import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { RegisteredMemberRoute } from './features/auth/components/RegisteredMemberRoute';
import { AccountSettingsRoute } from './features/auth/components/AccountSettingsRoute';
import { AdminProtectedRoute } from './features/auth/components/AdminProtectedRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { MembershipManagementPage } from './features/admin/pages/MembershipManagementPage';
import { RolesManagementPage } from './features/admin/pages/RolesManagementPage';
import { EventsPage } from './features/events/pages/EventsPage';
import { MembersPage } from './features/members/pages/MembersPage';
import { PartyBuilderPage } from './features/party-builder/pages/PartyBuilderPage';
import { AccountSettingsPage } from './features/account/pages/AccountSettingsPage';
import { RecipesPage } from './features/recipes/pages/RecipesPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route element={<RegisteredMemberRoute />}>
              <Route path="/eventos" element={<AppLayout><EventsPage /></AppLayout>} />
              <Route path="/miembros" element={<AppLayout><MembersPage /></AppLayout>} />
              <Route path="/party-builder" element={<AppLayout><PartyBuilderPage /></AppLayout>} />
              <Route path="/recetas" element={<AppLayout><RecipesPage /></AppLayout>} />
            </Route>
            <Route element={<AccountSettingsRoute />}>
              <Route path="/cuenta" element={<AppLayout><AccountSettingsPage /></AppLayout>} />
            </Route>
            <Route element={<AdminProtectedRoute />}>
              <Route
                path="/admin/membership"
                element={<AppLayout><MembershipManagementPage /></AppLayout>}
              />
              <Route path="/admin/roles" element={<AppLayout><RolesManagementPage /></AppLayout>} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
