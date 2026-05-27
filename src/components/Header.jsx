import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import DensitySlider from './DensitySlider.jsx';

const FILTERS = ['All', 'Oil', 'Pastel'];

export default function Header({
  filter,
  onFilterChange,
  visibleCount,
  onVisibleCountChange,
  onSliderDragChange,
  onOpenMenu,
  showSlider = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

  const handleFilter = (label) => {
    if (location.pathname !== '/home') {
      navigate('/home', { state: { filter: label.toLowerCase() } });
    }
    onFilterChange?.(label.toLowerCase());
  };

  // Measure the active button and slide the indicator under it.
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const active = nav.querySelector('button.active');
      if (!active) {
        setIndicator(prev => ({ ...prev, visible: false }));
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const btnRect = active.getBoundingClientRect();
      setIndicator({
        left: btnRect.left - navRect.left + btnRect.width / 2,
        width: btnRect.width,
        visible: true,
      });
    };
    measure();
    // Re-measure on resize and after webfont load (text width may change).
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => window.removeEventListener('resize', measure);
  }, [filter, location.pathname]);

  return (
    <header className="site-header">
      <Link to="/home" className="logo" aria-label="Kamiar Gajoum — home">
        <span>KAMIAR</span>
        <span>GAJOUM</span>
      </Link>

      <nav className="nav" aria-label="Categories" ref={navRef}>
        {FILTERS.map((label, i) => {
          const value = label.toLowerCase();
          const active = filter === value;
          return (
            <span key={label} className="nav-item">
              <button
                className={active ? 'active' : ''}
                onClick={() => handleFilter(label)}
                aria-pressed={active}
              >
                {label}
              </button>
              {i < FILTERS.length - 1 && <span className="sep">/</span>}
            </span>
          );
        })}
        <span
          className={`nav-indicator ${indicator.visible ? 'on' : ''}`}
          aria-hidden
          style={{ left: `${indicator.left}px` }}
        />
      </nav>

      <div className={`right ${showSlider ? 'has-slider' : ''}`}>
        {showSlider && (
          <DensitySlider
            value={visibleCount ?? 2}
            onChange={onVisibleCountChange}
            onDragChange={onSliderDragChange}
          />
        )}
        <button className="burger" aria-label="Open menu" onClick={onOpenMenu}>
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
