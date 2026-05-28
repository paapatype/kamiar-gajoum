import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Enter from './pages/Enter.jsx';
import Home from './pages/Home.jsx';
import ArtworkDetail from './pages/ArtworkDetail.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Travel from './pages/Travel.jsx';
import Exhibitions from './pages/Exhibitions.jsx';
import BurgerMenu from './components/BurgerMenu.jsx';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Enter />} />
        <Route path="/home" element={<Home onOpenMenu={() => setMenuOpen(true)} />} />
        <Route path="/work/:slug" element={<ArtworkDetail onOpenMenu={() => setMenuOpen(true)} />} />
        <Route path="/about" element={<About onOpenMenu={() => setMenuOpen(true)} />} />
        <Route path="/travel" element={<Travel onOpenMenu={() => setMenuOpen(true)} />} />
        <Route path="/exhibitions" element={<Exhibitions onOpenMenu={() => setMenuOpen(true)} />} />
        <Route path="/contact" element={<Contact onOpenMenu={() => setMenuOpen(true)} />} />
      </Routes>
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
