import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import artworks from '../data/artwork.json';

// Curated subset for the entrance strip — favouring signature, recognisable
// pieces. The list mirrors the desktop reference.
const PREFERRED_TITLES = [
  'Arc de Triomphe Pose',
  'Place De La Concorde Night',
  'Venetian Balcony',
  'Place de la Concorde',
  'Pont Alexandre',
  'Pont Alexandre II',
  'Boulevard Saint-Germain',
  'Vintage Venice',
  'An Evening in Venice',
  'Venetian Canal II',
  'Mansei Bridge',
  'Asakusa & Skytree',
];

const PIXELS_PER_SECOND = 32;  // slow, premium glide — matches the desktop marquee feel
const RESUME_DELAY      = 800; // ms after the user stops interacting
const INITIAL_DELAY     = 1400;// ms before the glide starts

export default function Enter() {
  const navigate = useNavigate();
  const stripRef = useRef(null);

  const strip = useMemo(() => {
    const byTitle = new Map(artworks.map(a => [a.title, a]));
    const picked = [];
    for (const t of PREFERRED_TITLES) {
      const a = byTitle.get(t);
      if (a) picked.push(a);
    }
    if (picked.length < 10) {
      for (const a of artworks) {
        if (a.category === 'oil' && !picked.includes(a)) picked.push(a);
        if (picked.length >= 12) break;
      }
    }
    return [...picked, ...picked];
  }, []);

  // Mobile auto-glide: continuous slow scroll using rAF. When the user
  // touches the strip, the glide pauses and CSS scroll-snap snaps to the
  // nearest painting; 800ms after they release, the glide resumes.
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    if (!isMobile) return;

    let rafId = null;
    let lastTs = null;
    let pos = 0;             // fractional position kept in JS — scrollLeft
                              // rounds to integer pixels each frame which
                              // would otherwise stall a sub-pixel glide.
    let resumeTimer = null;
    let initialTimer = null;
    let interacting = false;

    const tick = (ts) => {
      if (interacting) { rafId = null; return; }
      if (lastTs == null) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      const half = el.scrollWidth / 2;
      pos += PIXELS_PER_SECOND * dt;
      // Seamless loop — the duplicated second half is identical to the
      // first, so wrapping is invisible.
      if (pos >= half) pos -= half;
      el.scrollLeft = pos;

      rafId = requestAnimationFrame(tick);
    };

    const startAuto = () => {
      stopAuto();
      // Disable snap so the glide is continuous, not a snap-to-snap slideshow.
      el.style.scrollSnapType = 'none';
      // Sync from the element (so a user-swiped position is the starting
      // point for the next glide).
      pos = el.scrollLeft;
      lastTs = null;
      rafId = requestAnimationFrame(tick);
    };
    const stopAuto = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      lastTs = null;
      // Restore CSS-defined snap so the user's swipe lands cleanly.
      el.style.scrollSnapType = '';
    };

    const onStart = () => {
      interacting = true;
      stopAuto();
      if (resumeTimer)  { clearTimeout(resumeTimer);  resumeTimer = null; }
      if (initialTimer) { clearTimeout(initialTimer); initialTimer = null; }
    };
    const onEnd = () => {
      interacting = false;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAuto, RESUME_DELAY);
    };

    el.addEventListener('touchstart',   onStart, { passive: true });
    el.addEventListener('touchend',     onEnd,   { passive: true });
    el.addEventListener('touchcancel',  onEnd,   { passive: true });
    el.addEventListener('pointerdown',  onStart);
    el.addEventListener('pointerup',    onEnd);
    el.addEventListener('pointercancel',onEnd);

    initialTimer = setTimeout(startAuto, INITIAL_DELAY);

    return () => {
      stopAuto();
      if (resumeTimer)  clearTimeout(resumeTimer);
      if (initialTimer) clearTimeout(initialTimer);
      el.removeEventListener('touchstart',   onStart);
      el.removeEventListener('touchend',     onEnd);
      el.removeEventListener('touchcancel',  onEnd);
      el.removeEventListener('pointerdown',  onStart);
      el.removeEventListener('pointerup',    onEnd);
      el.removeEventListener('pointercancel',onEnd);
    };
  }, []);

  return (
    <div className="enter-page">
      <div className="enter-strip" ref={stripRef}>
        <div className="enter-track" style={{ ['--items']: strip.length }}>
          {strip.map((a, i) => (
            <div className="frame" key={`${a.id}-${i}`}>
              <img src={a.image} alt={a.title} loading="eager" decoding="async" />
            </div>
          ))}
        </div>
      </div>
      <div className="enter-bar">
        <div className="name">KAMIAR GAJOUM</div>
        <button className="enter-btn" onClick={() => navigate('/home')} aria-label="Enter site">
          <span className="label">enter site</span>
          <span className="arrow" aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
