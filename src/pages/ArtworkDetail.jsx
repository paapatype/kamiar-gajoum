import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import artworks from '../data/artwork.json';

export default function ArtworkDetail({ onOpenMenu }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const artwork = useMemo(() => artworks.find(a => a.slug === slug), [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  // Close lightbox on Escape, lock body scroll while open.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setLightboxOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen]);

  const moreFromGallery = useMemo(() => {
    if (!artwork) return [];
    return artworks
      .filter(a => a.category === artwork.category && a.slug !== artwork.slug)
      .slice(0, 9);
  }, [artwork]);

  if (!artwork) {
    return (
      <div className="page">
        <Header
          filter={filter}
          onFilterChange={setFilter}
          onOpenMenu={onOpenMenu}
          showSlider={false}
        />
        <div className="text-page">
          <h1>Not found</h1>
          <p className="body">This artwork could not be located.</p>
          <Link to="/home" className="gallery-back">gallery</Link>
        </div>
      </div>
    );
  }

  const sold = artwork.availability.toLowerCase() === 'sold';
  const galleryLink = artwork.url ? (
    <a
      href={artwork.url}
      className="gallery-back"
      target="_blank"
      rel="noreferrer"
      aria-label={`View ${artwork.title} on the Vancouver Fine Art Gallery site`}
    >
      view gallery page <span className="arrow" aria-hidden>→</span>
    </a>
  ) : (
    <Link to="/home" className="gallery-back">
      view gallery page <span className="arrow" aria-hidden>→</span>
    </Link>
  );

  return (
    <div className="page fade-enter">
      <Header
        filter={filter}
        onFilterChange={(v) => navigate('/home', { state: { filter: v } })}
        onOpenMenu={onOpenMenu}
        showSlider={false}
      />

      <section className="detail">
        <div className="image-side">
          <button
            type="button"
            className="image-tap"
            onClick={() => setLightboxOpen(true)}
            aria-label={`Zoom ${artwork.title}`}
          >
            <img src={artwork.image} alt={artwork.title} loading="eager" />
          </button>
          {/* Desktop: link sits directly under the painting */}
          <div className="image-side-link desktop-only">{galleryLink}</div>
        </div>
        <div className="info-side">
          <span className={`pill ${sold ? 'sold' : ''}`}>{artwork.availability}</span>
          <h1>{artwork.title}</h1>
          <div className="caption">
            <span className="caption-line">
              {[artwork.medium ? artwork.medium.toUpperCase() : null, artwork.year]
                .filter(Boolean).join(', ')}
            </span>
            {artwork.dimensions && (
              <span className="caption-dim">{artwork.dimensions}</span>
            )}
          </div>
          {/* Mobile: link sits at the bottom of the info column */}
          <div className="info-side-link mobile-only">{galleryLink}</div>
        </div>
      </section>

      {moreFromGallery.length > 0 && (
        <section className="more-gallery">
          <div className="more-gallery-grid">
            {moreFromGallery.map(a => {
              const aSold = a.availability.toLowerCase() === 'sold';
              return (
                <Link to={`/work/${a.slug}`} className="more-card" key={a.id}>
                  <div className="more-image-wrap">
                    <img src={a.image} alt={a.title} loading="lazy" />
                  </div>
                  <span className={`more-pill ${aSold ? 'sold' : ''}`}>{a.availability}</span>
                  <span className="more-title">{a.title}</span>
                </Link>
              );
            })}
          </div>
          <div className="more-actions">
            <Link
              to="/home"
              state={{ filter: artwork.category }}
              className="more-view-link"
            >
              view more <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      )}

      <Footer onOpenMenu={onOpenMenu} currentFilter={artwork.category} />

      {lightboxOpen && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={artwork.title}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="lightbox-close"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            aria-label="Close"
          >
            ×
          </button>
          <img
            className="lightbox-img"
            src={artwork.image}
            alt={artwork.title}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
