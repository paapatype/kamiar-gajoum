// Density slider — continuous-drag thumb that snaps the column count to the
// nearest stop. The thumb glides freely under the cursor (the input has 1000
// micro-steps), but the gallery only ever shows STOPS[i] columns. The parent
// is notified when the snapped count changes, and also receives onDragChange
// so it can dim/blur the gallery while the user is actively dragging.

import { useEffect, useRef, useState } from 'react';

const STOPS = [1, 2, 3, 4];

export default function DensitySlider({ value, onChange, onDragChange }) {
  const lastIndex = STOPS.length - 1;
  const initial = Math.max(0, STOPS.indexOf(value)) / Math.max(1, lastIndex);
  const [pos, setPos] = useState(initial);

  const snappedIndex = lastIndex === 0 ? 0 : Math.round(pos * lastIndex);
  const snapped = STOPS[snappedIndex];

  const lastEmitted = useRef(snapped);
  useEffect(() => {
    if (lastEmitted.current !== snapped) {
      lastEmitted.current = snapped;
      onChange?.(snapped);
    }
  }, [snapped, onChange]);

  const pct = pos * 100;
  const setDragging = (b) => onDragChange?.(b);

  return (
    <div className="density" role="group" aria-label="Gallery density">
      <div className="track" style={{ ['--pct']: `${pct}%` }}>
        <span className="track-fill" aria-hidden />
        <span className="track-rest" aria-hidden />
        <span className="thumb" aria-hidden />
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={Math.round(pos * 1000)}
          aria-label="Number of paintings per row"
          aria-valuetext={`${snapped} paintings per row`}
          onInput={(e) => setPos(Number(e.target.value) / 1000)}
          onChange={(e) => setPos(Number(e.target.value) / 1000)}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
          onBlur={() => setDragging(false)}
        />
      </div>
    </div>
  );
}
