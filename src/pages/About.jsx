import { useState } from 'react';
import Header from '../components/Header.jsx';

export default function About({ onOpenMenu }) {
  const [filter, setFilter] = useState('all');
  return (
    <div className="page fade-enter is-about">
      <Header
        filter={filter}
        onFilterChange={setFilter}
        onOpenMenu={onOpenMenu}
        showSlider={false}
      />
      <article className="about-page">
        <span className="eyebrow">About</span>
        <h1 className="about-name">KAMIAR GAJOUM</h1>
        <figure className="about-portrait">
          <img
            src="portraits/kamiar.jpg"
            alt="Portrait of Kamiar Gajoum"
            loading="eager"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </figure>
        <div className="about-body">
          <p>
            Kamiar Gajoum has always been interested in the arts since childhood.
            During his formative years Kamiar Gajoum took a liking to theatre,
            acting, and modelling. Even in his young years, he always enjoyed
            drawing and sketching as a regular activity.
          </p>
          <p>
            Kamiar's talent towards the fine art was recognized when his stepfather
            Kal Gajoum was introduced into his life. With this opportunity at age
            9, Kamiar was able to pursue his dream career as a painter. Similar to
            the master and pupil relationship during classical times, Kamiar was
            mentored by Kal, refining his craft and growing in confidence as he
            developed his own painterly voice.
          </p>
          <p>
            Today his paintings — across oil and pastel — depict the rhythm of
            European boulevards, the quiet of Asian cities at night, and the
            timeless atmosphere of Venetian canals. Each work is one of a kind.
          </p>
        </div>
      </article>
    </div>
  );
}
