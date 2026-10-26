import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { Language } from '../types/game';
import { TRANSLATIONS } from '../utils/translations';
import { jungleAudio } from '../utils/jungleAudio';

interface PauseModalProps {
  score: number;
  coins: number;
  lang: Language;
  isMuted: boolean;
  unclaimedMissionsCount: number;
  onResume: () => void;
  onRestart: () => void;
  onOpenMissions: () => void;
  onBackToMenu: () => void;
  onToggleMute: () => void;
  onToggleLang: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  coins,
  lang,
  isMuted,
  unclaimedMissionsCount,
  onResume,
  onRestart,
  onOpenMissions,
  onBackToMenu,
  onToggleMute,
  onToggleLang,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-stone-900/95 border-2 border-amber-400/80 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden flex flex-col gap-4 text-stone-100 animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-2xl font-black text-amber-300">{t.paused}</h2>

        {/* Current score */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 flex justify-around">
          <div>
            <div className="text-[10px] text-stone-400 font-semibold">{t.score}</div>
            <div className="text-lg font-bold text-amber-300 font-mono">{score}</div>
          </div>
          <div className="w-[1px] h-8 bg-stone-800" />
          <div>
            <div className="text-[10px] text-stone-400 font-semibold">🪙 {t.coins}</div>
            <div className="text-lg font-bold text-amber-400 font-mono">{coins}</div>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              jungleAudio.playClick();
              onToggleLang();
            }}
            className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            {lang === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
          </button>
          <button
            onClick={() => {
              onToggleMute();
            }}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 p-2 rounded-xl transition-all active:scale-95 cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* How to Play Rules */}
        <div className="bg-stone-950/50 border border-stone-800/80 rounded-xl p-3 text-left space-y-1.5 text-xs text-stone-300">
          <div className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">{t.instructions}</div>
          <p className="text-[11px] leading-relaxed text-stone-400">• {t.rule1}</p>
          <p className="text-[11px] leading-relaxed text-stone-400">• {t.rule2}</p>
          <p className="text-[11px] leading-relaxed text-stone-400">• {t.rule3}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={() => {
              jungleAudio.playClick();
              onResume();
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black py-3 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-stone-950" />
            <span>{t.resume}</span>
          </button>

          <button
            onClick={() => {
              jungleAudio.playClick();
              onOpenMissions();
            }}
            className="w-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🎯 {t.dailyMissions}</span>
            {unclaimedMissionsCount > 0 && (
              <span className="bg-red-500 text-white font-extrabold text-[10px] px-1.5 rounded-full animate-bounce">
                {unclaimedMissionsCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                jungleAudio.playClick();
                onRestart();
              }}
              className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.playAgain}</span>
            </button>
            <button
              onClick={() => {
                jungleAudio.playClick();
                onBackToMenu();
              }}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              title="Menu"
            >
              <Home className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
