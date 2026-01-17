import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import HolographicBackground from './components/HolographicBackground';
import { useAuth } from './context/AuthContext';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Browse = lazy(() => import('./pages/Browse'));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'));
const SubmitRecipe = lazy(() => import('./pages/SubmitRecipe'));
const Auth = lazy(() => import('./pages/Auth'));

const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="loading-bar"></div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
          <Route path="/" element={<ProtectedRoute><PageWrapper><Home /></PageWrapper></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><PageWrapper><Browse /></PageWrapper></ProtectedRoute>} />
          <Route path="/recipe/:id" element={<ProtectedRoute><PageWrapper><RecipeDetail /></PageWrapper></ProtectedRoute>} />
          <Route path="/submit" element={<ProtectedRoute><PageWrapper><SubmitRecipe /></PageWrapper></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="page-transition-wrapper"
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <Router>
      <HolographicBackground />
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 70px)', position: 'relative', zIndex: 1 }}>
        <AnimatedRoutes />
      </main>
    </Router>
  );
}

export default App;
