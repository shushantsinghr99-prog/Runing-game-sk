import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, ShoppingBag, Home, Target } from 'lucide-react';
import { Language } from '../types/game';
import { TRANSLATIONS } from '../utils/translations';

interface GameOverModalProps {
  score: number;
  coins: number;
  highScore: number;
  isNewHigh: boolean;
  lang: Language;
  unclaimedMissionsCount: number;
  onRestart: () => void;
  onOpenShop: () => void;
  onOpenMissions: () => void;
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  coins,
  highScore,
  isNewHigh,
  lang,
  unclaimedMissionsCount,
  onRestart,
  onOpenShop,
  onOpenMissions,
  onBackToMenu,
}) => {
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (isNewHigh) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24'],
        });
      } catch {}
    }
  }, [isNewHigh]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-stone-900/95 border-2 border-amber-400 rounded-3xl p-6 sm:p-7 text-center shadow-2xl relative overflow-hidden flex flex-col gap-5 text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Title */}
        <div className="space-y-1">
          {isNewHigh && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-wider animate-bounce">
              <Trophy className="w-3.5 h-3.5" />
              <span>{t.newHighScore}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-black text-red-500 tracking-tight drop-shadow-md">
            {t.gameOver}
          </h1>
          <p className="text-stone-400 text-xs font-medium">
            {lang === 'hi' ? 'जंगल ने आपको पकड़ लिया!' : 'The jungle caught up with you!'}
          </p>
        </div>

        {/* Score & Coins Summary Card */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
            <span className="text-stone-400 text-sm font-medium">{t.score}</span>
            <span className="text-2xl font-black text-amber-300 font-mono">{score}</span>
          </div>
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
            <span className="text-stone-400 text-sm font-medium flex items-center gap-1.5">
              <span>🪙</span> {t.coins}
            </span>
            <span className="text-xl font-bold text-amber-400 font-mono">+{coins}</span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-stone-400 text-xs font-medium flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> {t.highScore}
            </span>
            <span className="text-sm font-bold text-stone-300 font-mono">{highScore}</span>
          </div>
        </div>

        {/* Primary Restart Button (Authentic Hindi text from user) */}
        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-lg py-3.5 px-6 rounded-2xl shadow-xl shadow-amber-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>{t.tapToRetry}</span>
        </button>

        {/* Secondary Navigation (Missions, Shop & Menu) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMissions}
            className="flex-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl py-2.5 px-2 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer relative"
          >
            <Target className="w-4 h-4 text-amber-400" />
            <span>🎯 {t.dailyMissions}</span>
            {unclaimedMissionsCount > 0 && (
              <span className="bg-red-500 text-white font-extrabold text-[10px] px-1.5 rounded-full animate-bounce">
                {unclaimedMissionsCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenShop}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl py-2.5 px-3 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>{t.shop}</span>
          </button>
          <button
            onClick={onBackToMenu}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl py-2.5 px-3 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            title="Menu"
          >
            <Home className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
