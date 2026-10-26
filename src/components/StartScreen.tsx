import React from 'react';
import { Play, Sparkles, User, Sun, Sunset, Moon, Volume2, VolumeX, Target } from 'lucide-react';
import { CharacterId, JungleTheme, Language } from '../types/game';
import { TRANSLATIONS } from '../utils/translations';
import { CHARACTER_SKINS } from '../utils/characters';

interface StartScreenProps {
  lang: Language;
  characterId: CharacterId;
  theme: JungleTheme;
  isMuted: boolean;
  highScore: number;
  totalCoins: number;
  unclaimedMissionsCount: number;
  onStart: () => void;
  onOpenShop: () => void;
  onOpenMissions: () => void;
  onSelectTheme: (theme: JungleTheme) => void;
  onToggleLang: () => void;
  onToggleMute: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  lang,
  characterId,
  theme,
  isMuted,
  highScore,
  totalCoins,
  unclaimedMissionsCount,
  onStart,
  onOpenShop,
  onOpenMissions,
  onSelectTheme,
  onToggleLang,
  onToggleMute,
}) => {
  const t = TRANSLATIONS[lang];
  const currentChar = CHARACTER_SKINS.find((c) => c.id === characterId) || CHARACTER_SKINS[0];

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-emerald-950/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-stone-900/95 border-2 border-amber-400 rounded-3xl p-6 sm:p-7 text-center shadow-2xl relative overflow-hidden flex flex-col gap-4 text-stone-100">
        {/* Decorative jungle corner glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Toggles */}
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleLang}
            className="bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/40 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <span>{lang === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 English'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-xl p-2 transition-all active:scale-95"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>🌴 3D JUNGLE RUN</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight drop-shadow-md">
            {t.gameTitle}
          </h1>
          <p className="text-emerald-300/90 text-sm font-medium">
            {t.swipeInstructions}
          </p>
        </div>

        {/* Controls Card (honoring user's prompt) */}
        <div className="bg-emerald-950/70 border border-emerald-600/40 rounded-2xl p-3.5 text-center space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm font-bold">
            <div className="bg-stone-900/80 border border-stone-700 rounded-xl py-2 px-1">
              <div className="text-amber-400 text-lg">⬅️ ➡️</div>
              <div className="text-stone-200 mt-0.5">{lang === 'hi' ? 'मुड़ो' : 'Turn'}</div>
            </div>
            <div className="bg-stone-900/80 border border-stone-700 rounded-xl py-2 px-1">
              <div className="text-amber-400 text-lg">⬆️</div>
              <div className="text-stone-200 mt-0.5">{lang === 'hi' ? 'जंप (कूदें)' : 'Jump'}</div>
            </div>
            <div className="bg-stone-900/80 border border-stone-700 rounded-xl py-2 px-1">
              <div className="text-amber-400 text-lg">⬇️</div>
              <div className="text-stone-200 mt-0.5">{lang === 'hi' ? 'स्लाइड' : 'Slide'}</div>
            </div>
          </div>
          <div className="text-[11px] text-emerald-300/80 font-mono">
            {t.keyboardHint}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center justify-around bg-stone-950/60 border border-stone-800 rounded-2xl py-2.5 px-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🏆</span>
            <div className="text-left">
              <div className="text-[10px] text-stone-400 font-semibold">{t.highScore}</div>
              <div className="text-sm font-mono font-bold text-amber-300">{highScore}</div>
            </div>
          </div>
          <div className="w-[1px] h-6 bg-stone-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🪙</span>
            <div className="text-left">
              <div className="text-[10px] text-stone-400 font-semibold">{t.totalVault}</div>
              <div className="text-sm font-mono font-bold text-amber-400">{totalCoins}</div>
            </div>
          </div>
        </div>

        {/* Character & Atmosphere Quick Config */}
        <div className="flex items-center justify-between gap-2">
          {/* Character Badge / Shop Trigger */}
          <button
            onClick={onOpenShop}
            className="flex-1 bg-stone-800/90 hover:bg-stone-700/90 border border-stone-700 rounded-2xl p-2.5 flex items-center justify-between text-left transition-all active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-stone-400 font-medium">{t.characters}</div>
                <div className="text-xs font-bold text-stone-200">
                  {lang === 'hi' ? currentChar.nameHi : currentChar.nameEn}
                </div>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>

          {/* Theme Selector Pill */}
          <div className="flex items-center bg-stone-800/90 border border-stone-700 rounded-2xl p-1 gap-1">
            <button
              onClick={() => onSelectTheme('day')}
              className={`p-2 rounded-xl transition-all ${
                theme === 'day' ? 'bg-amber-500 text-stone-950 font-bold shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
              title={t.dayTheme}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTheme('sunset')}
              className={`p-2 rounded-xl transition-all ${
                theme === 'sunset' ? 'bg-orange-500 text-stone-950 font-bold shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
              title={t.sunsetTheme}
            >
              <Sunset className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTheme('night')}
              className={`p-2 rounded-xl transition-all ${
                theme === 'night' ? 'bg-indigo-600 text-stone-100 font-bold shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
              title={t.nightTheme}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary START Button (Authentic Hindi text from user) */}
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-lg sm:text-xl py-3.5 px-6 rounded-2xl shadow-xl shadow-amber-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-stone-950" />
          <span>{t.tapToStart}</span>
        </button>

        {/* Action Buttons: Daily Missions & Shop */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMissions}
            className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer relative"
          >
            <Target className="w-4 h-4 text-amber-400" />
            <span>🎯 {t.dailyMissions}</span>
            {unclaimedMissionsCount > 0 && (
              <span className="bg-red-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full animate-bounce">
                {unclaimedMissionsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenShop}
            className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>⚡ {t.shop}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
