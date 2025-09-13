// import { Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './contexts/AuthContext';
// import { Header } from './components/Header';
// import { Footer } from './components/Footer';
// import { HomePage } from './pages/HomePage';
// import { LoginPage } from './pages/LoginPage';
// import { RegisterPage } from './pages/RegisterPage';
// import { TicketsPage } from './pages/TicketsPage';
// import { DashboardPage } from './pages/DashboardPage';
// import ProfileSettingsPage from './pages/ProfileSettingsPage';

// function App() {
//   return (
//     <AuthProvider>
//         <div className="min-h-screen flex flex-col">
//           <Header />
//           <main className="flex-1">
//             <Routes>
//               <Route path="/" element={<HomePage />} />
//               <Route path="/login" element={<LoginPage />} />
//               <Route path="/register" element={<RegisterPage />} />
//               <Route path="/tickets" element={<TicketsPage />} />
//               <Route path="/dashboard" element={<DashboardPage />} />
//               <Route path="/profile" element={<ProfileSettingsPage />} />
//             </Routes>
//           </main>
//           <Footer />
//         </div>
//     </AuthProvider>
//   );
// }

// export default App;

// App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TicketsPage } from './pages/TicketsPage';
import { DashboardPage } from './pages/DashboardPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* Auth routes - redirect to dashboard if already logged in */}
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <ProtectedRoute requireAuth={false}>
                <RegisterPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/tickets" 
            element={
              <ProtectedRoute>
                <TicketsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfileSettingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Role-based protected route example */}
          {/* <Route 
            path="/admin" 
            element={
              <RoleProtectedRoute allowedRoles={['organizer']}>
                <AdminPage />
              </RoleProtectedRoute>
            } 
          /> */}
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;