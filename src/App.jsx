import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PostDetail from './pages/PostDetail';
import Explore from './pages/Explore';
import Connections from './pages/Connections';
import Notifications from './pages/Notifications';
import { DarkModeProvider } from './contexts/DarkModeContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-white mb-2">ThinkSync</h2>
          <p className="text-gray-400">Connecting thoughts...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <DarkModeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/login" 
                element={
                  <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Login setIsAuthenticated={setIsAuthenticated} />
                  </motion.div>
                } 
              />
              <Route 
                path="/" 
                element={
                  isAuthenticated ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Navbar setIsAuthenticated={setIsAuthenticated} />
                      <Home />
                    </motion.div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/profile" 
                element={
                  isAuthenticated ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Navbar setIsAuthenticated={setIsAuthenticated} />
                      <Profile />
                    </motion.div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/settings" 
                element={
                  isAuthenticated ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Navbar setIsAuthenticated={setIsAuthenticated} />
                      <Settings />
                    </motion.div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/post/:id" 
                element={
                  isAuthenticated ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Navbar setIsAuthenticated={setIsAuthenticated} />
                      <PostDetail />
                    </motion.div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/explore" 
                element={
                  isAuthenticated ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Navbar setIsAuthenticated={setIsAuthenticated} />
                      <Explore />
                    </motion.div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/connections" 
                element={
                  isAuthenticated ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Navbar setIsAuthenticated={setIsAuthenticated} />
                      <Connections />
                    </motion.div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  isAuthenticated ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Navbar setIsAuthenticated={setIsAuthenticated} />
                      <Notifications />
                    </motion.div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </DarkModeProvider>
  );
}

export default App;