import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import artworks from '../data/artwork.json';

// How many matches to show at once (the list scrolls if there are more).
const MAX_RESULTS = 12;

export default function BurgerMenu({ open, onClose }) {
  const [query, setQuery] = useState('');

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

  // Reset the search whenever the menu closes, so it reopens clean.
  useEffect(() => { if (!open) setQuery(''); }, [open]);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return [];
    // Match by painting title; rank titles that *start* with the query first.
    return artworks
      .filter((a) => a.title.toLowerCase().includes(q))
      .sort((a, b) => {
        const as = a.title.toLowerCase().startsWith(q) ? 0 : 1;
        const bs = b.title.toLowerCase().startsWith(q) ? 0 : 1;
        return as - bs || a.title.localeCompare(b.title);
      });
  }, [q]);

  const shown = matches.slice(0, MAX_RESULTS);

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

        <div className="menu-search">
          <input
            type="search"
            className="menu-search-input"
            placeholder="Search paintings"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search paintings by title"
            autoComplete="off"
            spellCheck="false"
          />
          {q && (
            <div className="menu-search-results" role="listbox" aria-label="Search results">
              {shown.length === 0 ? (
                <p className="menu-search-empty">No paintings found</p>
              ) : (
                <>
                  {shown.map((a) => {
                    const sold = a.availability.toLowerCase() === 'sold';
                    return (
                      <Link
                        key={a.id}
                        to={`/work/${a.slug}`}
                        className="search-result"
                        role="option"
                        onClick={onClose}
                      >
                        <span className="search-result-thumb">
                          <img src={a.image} alt="" loading="lazy" />
                        </span>
                        <span className="search-result-meta">
                          <span className="search-result-title">{a.title}</span>
                          <span className={`search-result-status ${sold ? 'sold' : ''}`}>
                            {a.availability}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                  {matches.length > shown.length && (
                    <p className="menu-search-more">
                      +{matches.length - shown.length} more — keep typing to narrow
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <nav>
          <Link to="/travel">Travel</Link>
          <Link to="/exhibitions">Exhibitions</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <div className="foot">Kamiar Gajoum</div>
      </aside>
    </>
  );
}
