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
            src="portraits/_B3R4947.jpg"
            alt="Portrait of Kamiar Gajoum"
            loading="eager"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </figure>
        <div className="about-body">
          <p>
            Kamiar Gajoum has been drawn to the arts since childhood. In his
            formative years he took a liking to theatre, acting, and modelling,
            and even as a boy he enjoyed drawing and sketching as a regular
            activity.
          </p>
          <p>
            Kamiar's talent for fine art was recognized when his stepfather, Kal
            Gajoum, came into his life. With this opportunity, at the age of nine,
            Kamiar was able to begin pursuing his dream of becoming a painter —
            much like the master-and-pupil relationships of classical times.
            Beyond painting itself, he was taught important skills and techniques
            applicable across all painting mediums. He grew to love oil paint, and
            it has become the primary medium of his work. Kamiar uses a combination
            of brush and palette knife, with layering and glazing to create vibrant
            colours and rich textural elements. Each painting is unique, and the
            techniques he uses reflect its subject.
          </p>
          <p>
            Working alongside his master in the studio, the foundation of his early
            paintings was heavily influenced by classical art. By learning and
            applying restoration techniques, he gained the flexibility to assist
            and collaborate on his master's artworks. A blend of baroque,
            renaissance, and European art gave Kamiar a strong foundation in
            classical techniques and subject matter.
          </p>
          <p>
            Gradually, his interests and studies shifted towards impressionism and
            contemporary subjects. With a grounding in the classical masters and a
            love for the technique and colours of impressionism, Kamiar seeks to
            capture the balance between representational reality and impressionistic
            feeling.
          </p>
          <p>
            Kamiar began with joint exhibitions alongside his stepfather, holding
            sold-out shows internationally. Since 2017, his solo exhibitions have
            been equally successful. He has built a loyal base of Canadian and
            international collectors, and has visited every city and location
            depicted in his work — fortunate to have travelled and lived in many
            countries, whose culture and atmosphere are reflected in his pieces.
          </p>
        </div>
      </article>
    </div>
  );
}
