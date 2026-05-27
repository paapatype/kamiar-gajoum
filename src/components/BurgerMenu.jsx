import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function BurgerMenu({ open, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`menu-scrim ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`menu-panel ${open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="top">
          <button className="close" onClick={onClose} aria-label="Close menu">Close</button>
        </div>
        <nav>
          <Link to="/home">Gallery</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <div className="foot">Kamiar Gajoum</div>
      </aside>
    </>
  );
}
