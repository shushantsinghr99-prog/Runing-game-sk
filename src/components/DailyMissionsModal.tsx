import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Check, Gift, Sparkles, Clock } from 'lucide-react';
import { DailyMission, DailyMissionsState, Language } from '../types/game';
import { TRANSLATIONS } from '../utils/translations';
import { getTimeUntilMidnight } from '../utils/missions';
import { jungleAudio } from '../utils/jungleAudio';

interface DailyMissionsModalProps {
  lang: Language;
  missionsState: DailyMissionsState;
  totalCoins: number;
  onClose: () => void;
  onClaimReward: (missionId: string, rewardCoins: number) => void;
  onClaimAllBonus: (bonusCoins: number) => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  lang,
  missionsState,
  totalCoins,
  onClose,
  onClaimReward,
  onClaimAllBonus,
}) => {
  const t = TRANSLATIONS[lang];
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const allMissionsFinished = missionsState.missions.every((m) => m.completed);
  const allMissionsClaimed = missionsState.missions.every((m) => m.claimed);
  const canClaimAllBonus = allMissionsFinished && !missionsState.allClaimedBonus;

  const handleClaim = (m: DailyMission) => {
    if (!m.completed || m.claimed) return;
    jungleAudio.playPowerUp();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#38bdf8'],
      });
    } catch {}
    onClaimReward(m.id, m.rewardCoins);
  };

  const handleClaimBonus = () => {
    if (!canClaimAllBonus) return;
    jungleAudio.playPowerUp();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#eab308', '#ec4899', '#3b82f6', '#10b981'],
      });
    } catch {}
    onClaimAllBonus(missionsState.allClaimedBonusAmount);
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-stone-900 border border-amber-400/50 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce">🎯</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-amber-300 leading-tight">
                  {t.dailyMissions}
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  DAILY
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {t.newMissionsDaily}
              </p>
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

        {/* Countdown & Bank Ribbon */}
        <div className="px-5 py-2.5 bg-emerald-950/40 border-b border-emerald-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-300 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-stone-300">{t.resetsIn}</span>
            <span className="font-bold text-amber-300">
              {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
            </span>
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-mono font-bold">
            <span>🪙 {t.totalVault}: {totalCoins}</span>
          </div>
        </div>

        {/* Missions List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {missionsState.missions.map((mission) => {
            const isCompleted = mission.completed;
            const isClaimed = mission.claimed;
            const progressPct = Math.min(100, Math.round((mission.current / mission.target) * 100));

            const tierColor =
              mission.tier === 'gold'
                ? 'border-amber-400/60 bg-amber-950/20 text-amber-300'
                : mission.tier === 'silver'
                ? 'border-slate-400/60 bg-slate-900/40 text-slate-200'
                : 'border-amber-700/60 bg-amber-950/10 text-amber-400';

            const tierBadge =
              mission.tier === 'gold'
                ? '🥇 GOLD'
                : mission.tier === 'silver'
                ? '🥈 SILVER'
                : '🥉 BRONZE';

            return (
              <div
                key={mission.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                  isCompleted && !isClaimed
                    ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/10'
                    : isClaimed
                    ? 'bg-stone-950/40 border-stone-800/80 opacity-75'
                    : 'bg-stone-950/60 border-stone-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0">
                      {mission.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${tierColor}`}>
                          {tierBadge}
                        </span>
                        <h3 className="text-sm font-bold text-stone-100">
                          {lang === 'hi' ? mission.titleHi : mission.titleEn}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-300 mt-1">
                        {lang === 'hi' ? mission.descriptionHi : mission.descriptionEn}
                      </p>
                    </div>
                  </div>

                  {/* Reward tag */}
                  <div className="shrink-0 bg-amber-500/10 border border-amber-500/30 rounded-xl px-2.5 py-1 text-xs font-mono font-black text-amber-400 flex items-center gap-1">
                    <span>+{mission.rewardCoins}</span>
                    <span>🪙</span>
                  </div>
                </div>

                {/* Progress bar & Claim button */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 mb-1">
                      <span>{t.missionProgress}</span>
                      <span className="font-bold text-stone-200">
                        {mission.current} / {mission.target} ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-400'
                            : 'bg-gradient-to-r from-amber-500 to-amber-400'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Button state */}
                  <div className="shrink-0">
                    {isClaimed ? (
                      <div className="flex items-center gap-1 text-stone-400 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl text-xs font-bold">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.claimed}</span>
                      </div>
                    ) : isCompleted ? (
                      <button
                        onClick={() => handleClaim(mission)}
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black px-4 py-1.5 rounded-xl text-xs shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer animate-pulse"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>{t.claim}</span>
                      </button>
                    ) : (
                      <div className="text-[11px] font-mono text-stone-400 bg-stone-900/60 border border-stone-800 px-3 py-1.5 rounded-xl font-medium">
                        {mission.target - mission.current} left
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* All-Clear Mastery Bonus Banner */}
          <div
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              missionsState.allClaimedBonus
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                : canClaimAllBonus
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-xl shadow-amber-500/20 animate-pulse'
                : 'bg-stone-950/50 border-stone-800 text-stone-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                  {t.allClaimBonusTitle}
                </div>
                <div className="text-[11px] text-stone-300">
                  {t.allMissionsCompleted}
                </div>
              </div>
            </div>

            <div>
              {missionsState.allClaimedBonus ? (
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl">
                  <Check className="w-4 h-4" />
                  <span>{t.bonusClaimed}</span>
                </div>
              ) : canClaimAllBonus ? (
                <button
                  onClick={handleClaimBonus}
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 font-black px-4 py-2 rounded-xl text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Gift className="w-4 h-4" />
                  <span>+{missionsState.allClaimedBonusAmount} 🪙</span>
                </button>
              ) : (
                <div className="text-xs font-mono text-stone-400 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl">
                  +{missionsState.allClaimedBonusAmount} 🪙
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/70 flex justify-end">
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
