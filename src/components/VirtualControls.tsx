import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../types/game';
import { TRANSLATIONS } from '../utils/translations';

interface VirtualControlsProps {
  lang: Language;
  onAction: (action: 'left' | 'right' | 'jump' | 'slide') => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({ lang, onAction }) => {
  const t = TRANSLATIONS[lang];
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 select-none pointer-events-auto flex flex-col items-center">
      {/* Collapse / Expand Toggle Button (Skill Directive 5) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700/60 rounded-full px-3 py-1 text-[11px] font-semibold flex items-center gap-1 shadow-md mb-1.5 backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
        title="Toggle Controls"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'hi' ? 'कंट्रोल दिखाएं' : 'Show Controls'}</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            <span>{lang === 'hi' ? 'छुपाएं' : 'Hide Controls'}</span>
          </>
        )}
      </button>

      {/* Dock Buttons */}
      {!isCollapsed && (
        <div className="bg-stone-950/80 border border-stone-800/80 rounded-3xl p-2 sm:p-2.5 flex items-center gap-3 sm:gap-6 shadow-2xl backdrop-blur-xs animate-in slide-in-from-bottom-2 duration-150">
          {/* Steer Lanes Left / Right */}
          <div className="flex items-center gap-2">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onAction('left');
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-900 border border-stone-700/80 active:bg-amber-500 active:text-stone-950 active:scale-90 text-stone-200 flex flex-col items-center justify-center shadow-lg transition-transform cursor-pointer"
              title="Steer Left"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[9px] font-bold text-stone-400 mt-0.5 leading-none">
                {lang === 'hi' ? 'बाएं' : 'LEFT'}
              </span>
            </button>

            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onAction('right');
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-900 border border-stone-700/80 active:bg-amber-500 active:text-stone-950 active:scale-90 text-stone-200 flex flex-col items-center justify-center shadow-lg transition-transform cursor-pointer"
              title="Steer Right"
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[9px] font-bold text-stone-400 mt-0.5 leading-none">
                {lang === 'hi' ? 'दाएं' : 'RIGHT'}
              </span>
            </button>
          </div>

          <div className="w-[1px] h-8 bg-stone-800" />

          {/* Jump / Slide Actions */}
          <div className="flex items-center gap-2">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onAction('jump');
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-950/80 border border-emerald-600/70 active:bg-emerald-500 active:text-stone-950 active:scale-90 text-emerald-300 flex flex-col items-center justify-center shadow-lg transition-transform cursor-pointer"
              title="Jump"
            >
              <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[9px] font-bold text-emerald-400 mt-0.5 leading-none">
                {lang === 'hi' ? 'जंप' : 'JUMP'}
              </span>
            </button>

            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onAction('slide');
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-950/80 border border-amber-600/70 active:bg-amber-500 active:text-stone-950 active:scale-90 text-amber-300 flex flex-col items-center justify-center shadow-lg transition-transform cursor-pointer"
              title="Slide"
            >
              <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[9px] font-bold text-amber-400 mt-0.5 leading-none">
                {lang === 'hi' ? 'स्लाइड' : 'SLIDE'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
