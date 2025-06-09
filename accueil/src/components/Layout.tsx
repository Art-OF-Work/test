import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
  const location = useLocation();
  const [pageTransition, setPageTransition] = useState(false);

  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => {
      setPageTransition(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-grow ${pageTransition ? 'fade-in' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;