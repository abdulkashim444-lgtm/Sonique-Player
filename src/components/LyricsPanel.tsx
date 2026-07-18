/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { LyricLine } from '../types';

interface LyricsPanelProps {
  lyrics: LyricLine[];
  currentTime: number;
  onSeek: (time: number) => void;
  themeColor: string;
}

export default function LyricsPanel({ lyrics, currentTime, onSeek, themeColor }: LyricsPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLButtonElement | null>(null);

  // Find current active lyric line index
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Auto-scroll to center the active lyric line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const activeEl = activeLineRef.current;
      const container = containerRef.current;

      const top = activeEl.offsetTop - container.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
      container.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, lyrics]);

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 font-medium font-sans">
        Instrumental - No Lyrics Available
      </div>
    );
  }

  return (
    <div
      id="lyrics-scroll-container"
      ref={containerRef}
      className="h-full overflow-y-auto px-4 py-32 space-y-6 scroll-smooth select-none relative"
      style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, white 25%, white 75%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, white 25%, white 75%, transparent 100%)' }}
    >
      {lyrics.map((line, idx) => {
        const isActive = idx === activeIndex;
        const isUpcoming = idx > activeIndex;

        return (
          <button
            key={idx}
            ref={isActive ? activeLineRef : null}
            onClick={() => onSeek(line.time)}
            className={`w-full text-left font-sans block transition-all duration-300 py-2 px-4 rounded-xl cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
              isActive
                ? 'text-2xl font-bold scale-102 font-sans tracking-tight opacity-100'
                : isUpcoming
                ? 'text-lg font-medium opacity-40 hover:opacity-75 hover:scale-101'
                : 'text-lg font-medium opacity-20 hover:opacity-50'
            }`}
            style={{
              color: isActive ? themeColor : 'inherit',
              textShadow: isActive ? `0 0 16px ${themeColor}50` : 'none',
              transformOrigin: 'left center'
            }}
          >
            {line.text}
          </button>
        );
      })}
    </div>
  );
}
