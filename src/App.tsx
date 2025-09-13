import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TicketsPage } from './pages/TicketsPage';
import { DashboardPage } from './pages/DashboardPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

function App() {
  return (
    <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfileSettingsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
    </AuthProvider>
  );
}

export default App;