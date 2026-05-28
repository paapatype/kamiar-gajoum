import { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import travel from '../data/travel.json';

export default function Travel({ onOpenMenu }) {
  const [filter, setFilter] = useState('all');

  return (
    <div className="page fade-enter is-travel">
      <Header
        filter={filter}
        onFilterChange={setFilter}
        onOpenMenu={onOpenMenu}
        showSlider={false}
      />

      <article className="travel-page">
        <header className="travel-intro">
          <span className="eyebrow">Travel Studies</span>
          <h1 className="travel-title">On Location</h1>
          <p className="travel-lede">
            Long before a canvas is finished in the studio, the work begins on
            the street — sketching, painting, and studying architecture and
            light in cities across the world.
          </p>
        </header>

        {travel.hero && (
          <figure className="travel-hero">
            <img src={travel.hero} alt="Kamiar Gajoum working on location" loading="eager" />
          </figure>
        )}

        {travel.regions.map((r) => (
          <section className="travel-region" key={r.region}>
            <div className="travel-region-head">
              <h2 className="travel-region-name">{r.region}</h2>
              <p className="travel-region-text">{r.text}</p>
            </div>

            {r.images.length > 0 && (
              <div className="travel-grid">
                {r.images.map((img) => (
                  <figure className="travel-figure" key={img.src}>
                    <div className="travel-image-wrap">
                      <img src={img.src} alt={img.place} loading="lazy" decoding="async" />
                    </div>
                    <figcaption className="travel-place">{img.place}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        ))}
      </article>

      <Footer onOpenMenu={onOpenMenu} />
    </div>
  );
}
