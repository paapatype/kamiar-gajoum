import { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import data from '../data/exhibitions.json';

export default function Exhibitions({ onOpenMenu }) {
  const [filter, setFilter] = useState('all');

  return (
    <div className="page fade-enter">
      <Header
        filter={filter}
        onFilterChange={setFilter}
        onOpenMenu={onOpenMenu}
        showSlider={false}
      />

      <article className="exhibitions-page">
        <header className="exhibitions-intro">
          <span className="eyebrow">Exhibitions</span>
          <h1 className="exhibitions-title">Galleries &amp; Shows</h1>
          <p className="exhibitions-lede">
            Kamiar Gajoum's work has been shown across Canada and abroad. Several
            galleries have hosted his work over multiple years — a continuing
            relationship rather than a one-off showing.
          </p>
        </header>

        {/* Galleries that have represented / hosted the work — a logo strip.
            Logos render muted and lift to full colour on hover; a gallery with
            no logo file falls back to a styled wordmark. */}
        {data.galleries.length > 0 && (
          <section className="gallery-strip" aria-label="Represented by">
            {data.galleries.map((g) => (
              <div className="gallery-mark" key={g.gallery}>
                {g.logo ? (
                  <img className="gallery-logo" src={g.logo} alt={`${g.gallery} logo`} loading="lazy" />
                ) : (
                  <span className="gallery-logo-fallback">{g.gallery}</span>
                )}
                <span className="gallery-mark-meta">
                  <span className="gallery-mark-name">{g.gallery}</span>
                  {g.location && <span className="gallery-mark-loc">{g.location}</span>}
                </span>
              </div>
            ))}
          </section>
        )}

        {/* Full reverse-chronological exhibition history. */}
        {data.history && data.history.length > 0 && (
          <section className="exhibition-history">
            <h2 className="exhibition-history-title">Selected Exhibitions</h2>
            <ol className="history-list">
              {data.history.map((row) => (
                <li className="history-row" key={row.year}>
                  <span className="history-year">{row.year}</span>
                  <ul className="history-venues">
                    {row.items.map((it, i) => (
                      <li className="history-venue" key={i}>
                        {it.venue && <span className="venue-name">{it.venue}</span>}
                        {it.location && <span className="venue-loc">{it.location}</span>}
                        {it.note && <span className="venue-note">{it.note}</span>}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Photographic record of openings and installations. */}
        {data.photos.length > 0 && (
          <section className="exhibition-photos">
            <h2 className="exhibition-photos-title">From the openings</h2>
            <div className="exhibition-grid">
              {data.photos.map((p) => (
                <figure className="exhibition-figure" key={p.src}>
                  <div className="exhibition-image-wrap">
                    <img src={p.src} alt={p.caption || 'Exhibition view'} loading="lazy" decoding="async" />
                  </div>
                  {p.caption && <figcaption className="exhibition-caption">{p.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer onOpenMenu={onOpenMenu} />
    </div>
  );
}
