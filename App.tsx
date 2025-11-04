import React, { useState } from 'react';
import Header from './components/Header.tsx';
import WorkspaceManager from './components/WorkspaceManager.tsx';
import Login from './components/Login.tsx';

function App() {
  const [viewMode, setViewMode] = useState<'login' | 'guest' | 'authed'>('login');

  const handleLoginSuccess = () => {
    setViewMode('authed');
  };
  
  const handleViewReports = () => {
      setViewMode('guest');
  };

  const handleLogout = () => {
    setViewMode('login');
  };

  const handleBackToLogin = () => {
    setViewMode('login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header isAuthenticated={viewMode === 'authed'} onLogout={handleLogout} />
      {viewMode === 'login' ? (
        <Login onLoginSuccess={handleLoginSuccess} onViewReports={handleViewReports} />
      ) : (
        <WorkspaceManager isGuest={viewMode === 'guest'} onBackToLogin={handleBackToLogin} />
      )}
      <footer className="bg-white mt-auto py-4 px-8 border-t">
          <p className="text-center text-sm text-gray-500">
              Cube Quality Analysis Report &copy; {new Date().getFullYear()}. For demonstration purposes only.
          </p>
      </footer>
    </div>
  );
}

export default App;