import { Link, useNavigate } from 'react-router-dom';

const FILTERS = ['All', 'Oil', 'Pastel'];

export default function Footer({ onOpenMenu, currentFilter = 'all' }) {
  const navigate = useNavigate();
  // Smart: show only the filters the visitor hasn't explored yet.
  const remaining = FILTERS.filter(f => f.toLowerCase() !== currentFilter.toLowerCase());

  return (
    <footer className="site-footer">
      <div className="footer-row">
        <nav className="left" aria-label="Categories">
          {remaining.map((label, i) => (
            <span key={label} className="nav-item">
              <button
                onClick={() => navigate('/home', { state: { filter: label.toLowerCase() } })}
              >
                {label}
              </button>
              {i < remaining.length - 1 && <span className="sep">/</span>}
            </span>
          ))}
        </nav>
        <Link to="/home" className="logo" aria-label="Kamiar Gajoum">
          KAMIAR GAJOUM
        </Link>
        <div className="right">
          <button className="burger" aria-label="Open menu" onClick={onOpenMenu}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <small className="copyright">© {new Date().getFullYear()} Kamiar Gajoum. All rights reserved.</small>
    </footer>
  );
}
