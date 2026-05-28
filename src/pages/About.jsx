import { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import portraits from '../data/portraits.json';

// How long each photo holds before cross-fading to the next.
const SLIDE_MS = 15000;

export default function About({ onOpenMenu }) {
  const [filter, setFilter] = useState('all');
  // Track both the active slide and the one it's fading from. The outgoing
  // photo stays fully opaque *beneath* the incoming one (which fades in on
  // top), so the frame is never empty mid-transition — a seamless, premium
  // cross-fade with no flash through the white background.
  const [[active, prev], setSlide] = useState([0, -1]);

  useEffect(() => {
    if (portraits.length <= 1) return;
    const id = setInterval(() => {
      setSlide(([a]) => [(a + 1) % portraits.length, a]);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, []);

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
          {portraits.map((src, i) => (
            <img
              key={src}
              className={`about-slide ${i === active ? 'active' : i === prev ? 'prev' : ''}`}
              src={src}
              alt="Kamiar Gajoum"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              aria-hidden={i === active ? undefined : true}
            />
          ))}
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
