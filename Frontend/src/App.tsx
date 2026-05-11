
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VoteProvider, useVote } from './contexts/VoteContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Vote from './pages/Vote';
import Results from './pages/Results';

const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { account, isAdmin, isInitializing } = useVote();

  if (isInitializing) return <div className="flex justify-center items-center h-screen">Loading application...</div>;

  if (!account) return <Navigate to="/" replace />;

  if (adminOnly && !isAdmin) return <Navigate to="/vote" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <VoteProvider>
      <Router>
        <div className="min-h-screen bg-background text-white font-sans">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/vote" element={
                <ProtectedRoute>
                  <Vote />
                </ProtectedRoute>
              } />
              <Route path="/results" element={<Results />} />
            </Routes>
          </div>
        </div>
      </Router>
    </VoteProvider>
  );
}

export default App;
