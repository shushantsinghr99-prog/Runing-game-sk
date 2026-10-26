import React, { useState } from 'react';
import { X, User, Zap, Shield, Magnet, Sparkles, Check, Lock } from 'lucide-react';
import { CharacterId, Language, Upgrades } from '../types/game';
import { TRANSLATIONS } from '../utils/translations';
import { CHARACTER_SKINS } from '../utils/characters';
import { jungleAudio } from '../utils/jungleAudio';

interface ShopModalProps {
  lang: Language;
  totalCoins: number;
  characterId: CharacterId;
  unlockedCharacters: CharacterId[];
  upgrades: Upgrades;
  onClose: () => void;
  onSelectCharacter: (id: CharacterId) => void;
  onUnlockCharacter: (id: CharacterId, cost: number) => void;
  onUpgradePowerUp: (type: 'magnet' | 'shield' | 'multiplier' | 'boost', cost: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  lang,
  totalCoins,
  characterId,
  unlockedCharacters,
  upgrades,
  onClose,
  onSelectCharacter,
  onUnlockCharacter,
  onUpgradePowerUp,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'characters' | 'upgrades'>('characters');

  const getUpgradeCost = (level: number) => {
    return (level + 1) * 75;
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-lg font-black text-amber-300 leading-tight">{t.shop}</h2>
              <div className="flex items-center gap-1 text-xs text-amber-400 font-mono">
                <span>🪙 {t.totalVault}:</span>
                <span className="font-bold">{totalCoins}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              jungleAudio.playClick();
              onClose();
            }}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-stone-800 bg-stone-950/30 p-1.5 gap-1.5">
          <button
            onClick={() => {
              jungleAudio.playClick();
              setActiveTab('characters');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.characters}</span>
          </button>
          <button
            onClick={() => {
              jungleAudio.playClick();
              setActiveTab('upgrades');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'upgrades'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{t.upgrades}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {activeTab === 'characters' && (
            <div className="space-y-3">
              {CHARACTER_SKINS.map((char) => {
                const isUnlocked = unlockedCharacters.includes(char.id);
                const isSelected = characterId === char.id;
                const canAfford = totalCoins >= char.cost;

                return (
                  <div
                    key={char.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                        : 'bg-stone-950/60 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Color Preview Swatch */}
                      <div
                        className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-inner relative overflow-hidden"
                        style={{
                          backgroundColor: `#${char.colors.shirt.toString(16).padStart(6, '0')}`,
                          borderColor: `#${(char.colors.hat || char.colors.accent).toString(16).padStart(6, '0')}`,
                        }}
                      >
                        <span className="text-xl">🏃</span>
                      </div>

                      <div className="text-left">
                        <div className="text-sm font-bold text-stone-100 flex items-center gap-2">
                          <span>{lang === 'hi' ? char.nameHi : char.nameEn}</span>
                          {isSelected && (
                            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                              {t.equipped}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-400 text-xs mt-0.5 line-clamp-1">
                          {lang === 'hi' ? char.descriptionHi : char.descriptionEn}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800">
                          <Check className="w-4 h-4" />
                          <span>{t.equipped}</span>
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => {
                            jungleAudio.playClick();
                            onSelectCharacter(char.id);
                          }}
                          className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        >
                          {t.select}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              jungleAudio.playPowerUp();
                              onUnlockCharacter(char.id, char.cost);
                            }
                          }}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md font-black'
                              : 'bg-stone-800 text-stone-500 border border-stone-800 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{char.cost} 🪙</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'upgrades' && (
            <div className="space-y-3">
              {[
                {
                  id: 'magnet' as const,
                  title: t.upgrades_magnet_title,
                  desc: t.upgrades_magnet_desc,
                  level: upgrades.magnetLevel,
                  icon: <Magnet className="w-5 h-5 text-rose-400" />,
                },
                {
                  id: 'shield' as const,
                  title: t.upgrades_shield_title,
                  desc: t.upgrades_shield_desc,
                  level: upgrades.shieldLevel,
                  icon: <Shield className="w-5 h-5 text-sky-400" />,
                },
                {
                  id: 'multiplier' as const,
                  title: t.upgrades_multiplier_title,
                  desc: t.upgrades_multiplier_desc,
                  level: upgrades.multiplierLevel,
                  icon: <Sparkles className="w-5 h-5 text-amber-400" />,
                },
                {
                  id: 'boost' as const,
                  title: t.upgrades_boost_title,
                  desc: t.upgrades_boost_desc,
                  level: upgrades.boostLevel,
                  icon: <Zap className="w-5 h-5 text-emerald-400" />,
                },
              ].map((up) => {
                const isMax = up.level >= 5;
                const cost = getUpgradeCost(up.level);
                const canAfford = totalCoins >= cost;

                return (
                  <div
                    key={up.id}
                    className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center">
                        {up.icon}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-stone-200">{up.title}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-stone-400">{t.level} {up.level}/5:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <div
                                key={lvl}
                                className={`w-3.5 h-1.5 rounded-full ${
                                  lvl <= up.level ? 'bg-amber-400' : 'bg-stone-800'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isMax ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-xl">
                          {t.maxLevel}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              jungleAudio.playPowerUp();
                              onUpgradePowerUp(up.id, cost);
                            }
                          }}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-md'
                              : 'bg-stone-800 text-stone-500 border border-stone-800 cursor-not-allowed'
                          }`}
                        >
                          {cost} 🪙
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button
            onClick={() => {
              jungleAudio.playClick();
              onClose();
            }}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );
};
