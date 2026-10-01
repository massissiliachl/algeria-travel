import React, { useEffect } from 'react';
import '../styles/premium.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HomeLanding from '../components/home/HomeLanding';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page-root">
      <Navbar variant="home" />
      <main>
        <HomeLanding />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
