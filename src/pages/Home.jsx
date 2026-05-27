import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import artworks from '../data/artwork.json';

const FILTER_FADE_MS = 480; // duration of the fade-out/fade-in cycle

export default function Home({ onOpenMenu }) {
  const location = useLocation();
  const initialFilter = location.state?.filter ?? 'all';
  // `filter` reflects the active button instantly (so the indicator slides).
  // `displayFilter` controls which paintings the grid actually renders; it
  // updates only after the fade-out has finished, so the swap is invisible.
  const [filter, setFilter] = useState(initialFilter);
  const [displayFilter, setDisplayFilter] = useState(initialFilter);
  const [filterFading, setFilterFading] = useState(false);

  const [cols, setCols] = useState(2);
  const [sliderActive, setSliderActive] = useState(false);
  const [colsTransitioning, setColsTransitioning] = useState(false);
  const prevCols = useRef(cols);

  useEffect(() => {
    if (location.state?.filter) setFilter(location.state.filter);
  }, [location.state?.filter]);

  // Filter transition state machine: when `filter` changes, fade out, swap
  // the rendered items, then fade back in.
  useEffect(() => {
    if (filter === displayFilter) return;
    setFilterFading(true);
    const fadeOut = setTimeout(() => {
      setDisplayFilter(filter);
      // Wait a frame so the new items mount in the faded state, then drop
      // the class to fade them in.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setFilterFading(false));
      });
    }, FILTER_FADE_MS);
    return () => clearTimeout(fadeOut);
  }, [filter, displayFilter]);

  // Blur the gallery whenever the column count snaps to a new stop.
  useEffect(() => {
    if (prevCols.current !== cols) {
      prevCols.current = cols;
      setColsTransitioning(true);
      const t = setTimeout(() => setColsTransitioning(false), 900);
      return () => clearTimeout(t);
    }
  }, [cols]);

  const items = useMemo(() => {
    if (displayFilter === 'all') return artworks;
    return artworks.filter(a => a.category === displayFilter);
  }, [displayFilter]);

  const isReflowing = sliderActive || colsTransitioning;

  return (
    <div className="page fade-enter">
      <Header
        filter={filter}
        onFilterChange={setFilter}
        visibleCount={cols}
        onVisibleCountChange={setCols}
        onSliderDragChange={setSliderActive}
        onOpenMenu={onOpenMenu}
      />
      <main className="gallery-wrap">
      <div
        className={`gallery ${isReflowing ? 'reflowing' : ''} ${filterFading ? 'filter-fading' : ''}`}
        style={{ ['--cols']: cols }}
      >
        {items.map((a, i) => {
          const sold = a.availability.toLowerCase() === 'sold';
          return (
            <div className="card" key={a.id}>
              <Link to={`/work/${a.slug}`} className="card-body" aria-label={a.title}>
                <div className="image-wrap">
                  <img
                    src={a.image}
                    alt={a.title}
                    loading={i < cols * 2 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </div>
                <div className="meta">
                  <span className={`pill ${sold ? 'sold' : ''}`}>{a.availability}</span>
                  <span className="title">{a.title}</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      </main>
      <Footer onOpenMenu={onOpenMenu} currentFilter={filter} />
    </div>
  );
}
