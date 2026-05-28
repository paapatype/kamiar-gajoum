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

        {/* Galleries grouped — each shown once with the years it hosted him. */}
        <section className="gallery-list">
          {data.galleries.map((g) => (
            <div className="gallery-card" key={g.gallery}>
              <div className="gallery-card-head">
                {g.logo ? (
                  <img className="gallery-logo" src={g.logo} alt={`${g.gallery} logo`} loading="lazy" />
                ) : (
                  <span className="gallery-logo-fallback">{g.gallery}</span>
                )}
              </div>
              <div className="gallery-card-body">
                <h2 className="gallery-name">{g.gallery}</h2>
                {g.location && <p className="gallery-location">{g.location}</p>}
                <div className="gallery-years" aria-label="Years hosted">
                  {g.years.map((y) => (
                    <span className="year-chip" key={y}>{y}</span>
                  ))}
                </div>
                {g.note && <p className="gallery-note">{g.note}</p>}
              </div>
            </div>
          ))}
        </section>

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
