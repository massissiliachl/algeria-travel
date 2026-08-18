import React, { useEffect } from 'react';
import '../styles/premium.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SeoHead from '../components/SeoHead';
import HomeLanding from '../components/home/HomeLanding';
import { useLang } from '../hooks/useLangHook';

const Home = () => {
  const { t } = useLang();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page-root">
      <SeoHead
        title={t('seo_home_title')}
        description={t('seo_home_desc')}
        path="/"
        image="/images/hero.jpeg"
      />
      <Navbar variant="home" />
      <main>
        <HomeLanding />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
