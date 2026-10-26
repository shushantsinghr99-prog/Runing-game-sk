import React from 'react';
import { Volume2, VolumeX, Pause, Play, Sparkles, Shield, Magnet, Zap, Target } from 'lucide-react';
import { Language, ActivePowerUp } from '../types/game';
import { TRANSLATIONS } from '../utils/translations';

interface GameHUDProps {
  score: number;
  coins: number;
  distance: number;
  highScore: number;
  activePowerUps: ActivePowerUp[];
  isMuted: boolean;
  isPaused: boolean;
  lang: Language;
  unclaimedMissionsCount?: number;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onToggleLang: () => void;
  onOpenMissions?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  coins,
  distance,
  highScore,
  activePowerUps,
  isMuted,
  isPaused,
  lang,
  unclaimedMissionsCount = 0,
  onToggleMute,
  onTogglePause,
  onToggleLang,
  onOpenMissions,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none p-3 sm:p-5 flex flex-col gap-3 select-none z-20">
      {/* Top Main HUD Bar */}
      <div className="w-full flex items-center justify-between">
        {/* Left: Coins & Distance */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-amber-950/80 border border-amber-500/40 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-lg backdrop-blur-sm pointer-events-auto">
            <span className="text-xl sm:text-2xl animate-bounce">🪙</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase leading-none">
                {t.coins}
              </span>
              <span className="text-amber-200 font-extrabold text-lg sm:text-xl font-mono leading-tight">
                {coins}
              </span>
            </div>
          </div>

          <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-lg backdrop-blur-sm pointer-events-auto">
            <span className="text-base sm:text-lg">🏃</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-300 font-semibold tracking-wider uppercase leading-none">
                {t.distance}
              </span>
              <span className="text-emerald-200 font-bold text-sm sm:text-base font-mono leading-tight">
                {distance} {t.meters}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Score & High Score */}
        <div className="bg-stone-950/80 border border-amber-400/40 rounded-2xl px-4 py-1.5 flex flex-col items-center shadow-xl backdrop-blur-sm pointer-events-auto">
          <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium">
            <span>🏆</span>
            <span>{t.highScore}: {highScore}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-100 font-mono tracking-wider drop-shadow-md">
            {score}
          </div>
        </div>

        {/* Right: Sound, Pause, Language Quick Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            onClick={onToggleLang}
            className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-600/50 rounded-xl px-2.5 py-2 text-xs font-bold transition-all shadow-md active:scale-95"
            title="Switch Language / भाषा बदलें"
          >
            {lang === 'hi' ? '🇮🇳 HI' : '🇬🇧 EN'}
          </button>

          <button
            onClick={onToggleMute}
            className="bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/60 rounded-xl p-2 transition-all shadow-md active:scale-95"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {onOpenMissions && (
            <button
              onClick={onOpenMissions}
              className="bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 rounded-xl p-2 transition-all shadow-md active:scale-95 relative"
              title={t.dailyMissions}
            >
              <Target className="w-5 h-5 text-amber-400" />
              {unclaimedMissionsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce">
                  {unclaimedMissionsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onTogglePause}
            className="bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/60 rounded-xl p-2 transition-all shadow-md active:scale-95"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-5 h-5 text-amber-400" /> : <Pause className="w-5 h-5 text-stone-300" />}
          </button>
        </div>
      </div>

      {/* Active Power-Ups Row */}
      {activePowerUps.length > 0 && (
        <div className="flex items-center gap-2 justify-center pointer-events-auto">
          {activePowerUps.map((pu) => {
            const remaining = Math.max(0, Math.ceil((pu.endTime - Date.now()) / 1000));
            let icon = <Magnet className="w-4 h-4 text-rose-400" />;
            let label = t.magnetActive;
            let badgeBg = 'bg-rose-950/90 border-rose-500/50 text-rose-200';

            if (pu.type === 'shield') {
              icon = <Shield className="w-4 h-4 text-sky-400" />;
              label = t.shieldActive;
              badgeBg = 'bg-sky-950/90 border-sky-500/50 text-sky-200';
            } else if (pu.type === 'multiplier') {
              icon = <Sparkles className="w-4 h-4 text-amber-400" />;
              label = t.multiplierActive;
              badgeBg = 'bg-amber-950/90 border-amber-500/50 text-amber-200';
            } else if (pu.type === 'boost') {
              icon = <Zap className="w-4 h-4 text-emerald-400" />;
              label = t.boostActive;
              badgeBg = 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200';
            }

            return (
              <div
                key={pu.type}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold shadow-lg ${badgeBg} animate-pulse`}
              >
                {icon}
                <span>{label}</span>
                <span className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-[11px] text-white">
                  {remaining}s
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
