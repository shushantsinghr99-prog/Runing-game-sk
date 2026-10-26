import React, { useState, useEffect, useCallback, useRef } from 'react';
import { JungleRunnerCanvas } from './components/JungleRunnerCanvas';
import { GameHUD } from './components/GameHUD';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { ShopModal } from './components/ShopModal';
import { PauseModal } from './components/PauseModal';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { VirtualControls } from './components/VirtualControls';
import {
  CharacterId,
  JungleTheme,
  Language,
  Upgrades,
  ActivePowerUp,
  PowerUpType,
  DailyMissionsState,
  DailyMission,
} from './types/game';
import { jungleAudio } from './utils/jungleAudio';
import { loadOrInitDailyMissions, saveDailyMissions, getTodayDateString } from './utils/missions';

export default function App() {
  // Localization: Hindi ('hi') by default as in user's prompt, toggleable to English ('en')
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jungle_runner_lang');
      if (saved === 'en' || saved === 'hi') return saved;
    }
    return 'hi';
  });

  // Game Flow State
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);

  // Audio Mute State
  const [isMuted, setIsMuted] = useState<boolean>(() => jungleAudio.getMuted());

  // Visual Theme
  const [theme, setTheme] = useState<JungleTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jungle_runner_theme');
      if (saved === 'day' || saved === 'sunset' || saved === 'night') return saved;
    }
    return 'day';
  });

  // Persistent Stats & Unlockables
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jungle_runner_high_score');
      if (saved) return parseInt(saved, 10) || 0;
    }
    return 0;
  });

  const [totalCoins, setTotalCoins] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jungle_runner_total_coins');
      if (saved) return parseInt(saved, 10) || 0;
    }
    return 100; // Starter coins
  });

  const [characterId, setCharacterId] = useState<CharacterId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jungle_runner_character');
      if (saved === 'raj' || saved === 'maya' || saved === 'veer') return saved;
    }
    return 'raj';
  });

  const [unlockedCharacters, setUnlockedCharacters] = useState<CharacterId[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jungle_runner_unlocked_chars');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return ['raj'];
  });

  const [upgrades, setUpgrades] = useState<Upgrades>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jungle_runner_upgrades');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      magnetLevel: 1,
      shieldLevel: 1,
      multiplierLevel: 1,
      boostLevel: 1,
    };
  });

  // Daily Missions State (Auto-generates fresh set upon date rollover)
  const [missionsState, setMissionsState] = useState<DailyMissionsState>(() => loadOrInitDailyMissions());

  // Toast banner when a mission objective is completed
  const [missionToast, setMissionToast] = useState<{ message: string; timestamp: number } | null>(null);

  // Live Run Stats
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);

  // Virtual Controls Trigger
  const [inputTrigger, setInputTrigger] = useState<{
    action: 'left' | 'right' | 'jump' | 'slide';
    timestamp: number;
  } | null>(null);

  // Key to remount canvas cleanly on fresh game start
  const [canvasKey, setCanvasKey] = useState<number>(1);

  // Track previous run coin count to compute deltas for mission tracking
  const prevRunCoinsRef = useRef<number>(0);
  const prevRunDistanceRef = useRef<number>(0);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('jungle_runner_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('jungle_runner_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('jungle_runner_high_score', String(highScore));
  }, [highScore]);

  useEffect(() => {
    localStorage.setItem('jungle_runner_total_coins', String(totalCoins));
  }, [totalCoins]);

  useEffect(() => {
    localStorage.setItem('jungle_runner_character', characterId);
  }, [characterId]);

  useEffect(() => {
    localStorage.setItem('jungle_runner_unlocked_chars', JSON.stringify(unlockedCharacters));
  }, [unlockedCharacters]);

  useEffect(() => {
    localStorage.setItem('jungle_runner_upgrades', JSON.stringify(upgrades));
  }, [upgrades]);

  // Periodic check for daily rollover
  useEffect(() => {
    const checkDailyReset = () => {
      const today = getTodayDateString();
      if (missionsState.date !== today) {
        const fresh = loadOrInitDailyMissions();
        setMissionsState(fresh);
      }
    };
    const timer = setInterval(checkDailyReset, 60000); // Check once a minute
    return () => clearInterval(timer);
  }, [missionsState.date]);

  // Auto-dismiss mission toast after 4 seconds
  useEffect(() => {
    if (!missionToast) return;
    const timer = setTimeout(() => {
      setMissionToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [missionToast]);

  // Power-up durations based on upgrade levels
  const magnetDuration = 6 + upgrades.magnetLevel * 2; // 8s to 16s
  const shieldDuration = 10 + upgrades.shieldLevel * 3; // 13s to 25s
  const multiplierDuration = 8 + upgrades.multiplierLevel * 2; // 10s to 18s
  const boostDuration = 4 + upgrades.boostLevel * 1; // 5s to 9s

  // Monitor active power-ups countdown
  useEffect(() => {
    if (activePowerUps.length === 0) return;
    const interval = window.setInterval(() => {
      const now = Date.now();
      setActivePowerUps((prev) => prev.filter((p) => p.endTime > now));
    }, 250);
    return () => clearInterval(interval);
  }, [activePowerUps]);

  // Keyboard shortcut for Pause (Escape or P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (gameStatus === 'playing') {
          setIsPaused((prev) => {
            const next = !prev;
            if (next) jungleAudio.stopDrums();
            else jungleAudio.startDrums();
            return next;
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus]);

  // Generic Mission Progress Updater
  const applyMissionUpdate = useCallback(
    (
      predicate: (m: DailyMission) => boolean,
      updater: (currentVal: number, m: DailyMission) => number
    ) => {
      setMissionsState((prev) => {
        let hasChanges = false;
        let newlyCompleted: DailyMission | null = null;

        const nextMissions = prev.missions.map((mission) => {
          if (!predicate(mission)) return mission;

          const newVal = updater(mission.current, mission);
          if (newVal === mission.current) return mission;

          hasChanges = true;
          const wasCompleted = mission.completed;
          const isNowCompleted = newVal >= mission.target;

          if (!wasCompleted && isNowCompleted) {
            newlyCompleted = { ...mission, current: newVal, completed: true };
          }

          return {
            ...mission,
            current: newVal,
            completed: isNowCompleted,
          };
        });

        if (!hasChanges) return prev;

        const updatedState = { ...prev, missions: nextMissions };
        saveDailyMissions(updatedState);

        if (newlyCompleted) {
          const comp: DailyMission = newlyCompleted;
          jungleAudio.playPowerUp();
          setMissionToast({
            message:
              lang === 'hi'
                ? `🎯 मिशन पूरा: ${comp.titleHi} (+${comp.rewardCoins} 🪙)`
                : `🎯 Mission Complete: ${comp.titleEn} (+${comp.rewardCoins} 🪙)`,
            timestamp: Date.now(),
          });
        }

        return updatedState;
      });
    },
    [lang]
  );

  // Actions
  const startGame = useCallback(() => {
    jungleAudio.playClick();
    setScore(0);
    setCoins(0);
    setDistance(0);
    prevRunCoinsRef.current = 0;
    prevRunDistanceRef.current = 0;
    setIsNewHigh(false);
    setActivePowerUps([]);
    setIsPaused(false);
    setIsMissionsOpen(false);
    setCanvasKey((prev) => prev + 1);
    setGameStatus('playing');
    jungleAudio.startDrums();
  }, []);

  const handleGameOver = useCallback(
    (finalScore: number, finalCoins: number) => {
      setGameStatus('gameover');
      jungleAudio.stopDrums();

      // Check high score
      if (finalScore > highScore) {
        setHighScore(finalScore);
        setIsNewHigh(true);
      }

      // Add earned coins to bank
      setTotalCoins((prev) => prev + finalCoins);
    },
    [highScore]
  );

  const handleCoinCollect = useCallback(
    (newCoins: number) => {
      const delta = newCoins - prevRunCoinsRef.current;
      prevRunCoinsRef.current = newCoins;
      setCoins(newCoins);

      if (delta > 0) {
        applyMissionUpdate(
          (m) => m.type === 'collect_coins',
          (curr, m) => Math.min(m.target, curr + delta)
        );
      }
    },
    [applyMissionUpdate]
  );

  const handleScoreUpdate = useCallback(
    (newScore: number, newDistance: number) => {
      const distDelta = newDistance - prevRunDistanceRef.current;
      prevRunDistanceRef.current = newDistance;

      setScore(newScore);
      setDistance(newDistance);

      // Single run distance mission (take highest reached in this run)
      applyMissionUpdate(
        (m) => m.type === 'survive_distance_single',
        (curr, m) => Math.min(m.target, Math.max(curr, newDistance))
      );

      // Total distance run today
      if (distDelta > 0) {
        applyMissionUpdate(
          (m) => m.type === 'survive_distance_total',
          (curr, m) => Math.min(m.target, curr + distDelta)
        );
      }

      // Single run score mission
      applyMissionUpdate(
        (m) => m.type === 'score_single',
        (curr, m) => Math.min(m.target, Math.max(curr, newScore))
      );
    },
    [applyMissionUpdate]
  );

  const handlePowerUpCollect = useCallback(
    (type: PowerUpType, duration: number) => {
      const endTime = Date.now() + duration * 1000;
      setActivePowerUps((prev) => {
        const withoutThis = prev.filter((p) => p.type !== type);
        return [...withoutThis, { type, endTime, duration }];
      });

      // Update collect power-ups mission
      applyMissionUpdate(
        (m) => m.type === 'collect_powerups',
        (curr, m) => Math.min(m.target, curr + 1)
      );
    },
    [applyMissionUpdate]
  );

  const handleJumpClear = useCallback(() => {
    applyMissionUpdate(
      (m) => m.type === 'jump_obstacles',
      (curr, m) => Math.min(m.target, curr + 1)
    );
  }, [applyMissionUpdate]);

  const handleSlideClear = useCallback(() => {
    applyMissionUpdate(
      (m) => m.type === 'slide_obstacles',
      (curr, m) => Math.min(m.target, curr + 1)
    );
  }, [applyMissionUpdate]);

  const handleVirtualAction = (action: 'left' | 'right' | 'jump' | 'slide') => {
    setInputTrigger({ action, timestamp: Date.now() });
  };

  const toggleMute = () => {
    const muted = jungleAudio.toggleMute();
    setIsMuted(muted);
  };

  const togglePause = () => {
    if (gameStatus !== 'playing') return;
    setIsPaused((prev) => {
      const next = !prev;
      if (next) jungleAudio.stopDrums();
      else jungleAudio.startDrums();
      return next;
    });
  };

  const openMissions = () => {
    if (gameStatus === 'playing') {
      setIsPaused(true);
      jungleAudio.stopDrums();
    }
    setIsMissionsOpen(true);
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const handleUnlockCharacter = (id: CharacterId, cost: number) => {
    if (totalCoins >= cost && !unlockedCharacters.includes(id)) {
      setTotalCoins((prev) => prev - cost);
      setUnlockedCharacters((prev) => [...prev, id]);
      setCharacterId(id);
    }
  };

  const handleUpgradePowerUp = (type: 'magnet' | 'shield' | 'multiplier' | 'boost', cost: number) => {
    if (totalCoins >= cost) {
      setTotalCoins((prev) => prev - cost);
      setUpgrades((prev) => {
        if (type === 'magnet') return { ...prev, magnetLevel: prev.magnetLevel + 1 };
        if (type === 'shield') return { ...prev, shieldLevel: prev.shieldLevel + 1 };
        if (type === 'multiplier') return { ...prev, multiplierLevel: prev.multiplierLevel + 1 };
        if (type === 'boost') return { ...prev, boostLevel: prev.boostLevel + 1 };
        return prev;
      });
    }
  };

  // Claim Individual Mission Reward
  const handleClaimReward = (missionId: string, rewardCoins: number) => {
    setMissionsState((prev) => {
      const nextMissions = prev.missions.map((m) =>
        m.id === missionId ? { ...m, claimed: true } : m
      );
      const nextState = { ...prev, missions: nextMissions };
      saveDailyMissions(nextState);
      return nextState;
    });
    setTotalCoins((prev) => prev + rewardCoins);
  };

  // Claim All Missions Mastery Bonus
  const handleClaimAllBonus = (bonusCoins: number) => {
    setMissionsState((prev) => {
      const nextState = { ...prev, allClaimedBonus: true };
      saveDailyMissions(nextState);
      return nextState;
    });
    setTotalCoins((prev) => prev + bonusCoins);
  };

  // Unclaimed missions counter for badges
  const unclaimedMissionsCount =
    missionsState.missions.filter((m) => m.completed && !m.claimed).length +
    (missionsState.missions.every((m) => m.completed) && !missionsState.allClaimedBonus ? 1 : 0);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none touch-none">
      {/* 3D WebGL Canvas Viewport */}
      <JungleRunnerCanvas
        key={canvasKey}
        isPlaying={gameStatus === 'playing'}
        isPaused={isPaused}
        characterId={characterId}
        theme={theme}
        magnetDuration={magnetDuration}
        shieldDuration={shieldDuration}
        multiplierDuration={multiplierDuration}
        boostDuration={boostDuration}
        onCoinCollect={handleCoinCollect}
        onScoreUpdate={handleScoreUpdate}
        onPowerUpCollect={handlePowerUpCollect}
        onJumpClear={handleJumpClear}
        onSlideClear={handleSlideClear}
        onGameOver={handleGameOver}
        inputTrigger={inputTrigger}
      />

      {/* In-Game Heads-Up Display (HUD) */}
      {gameStatus === 'playing' && (
        <GameHUD
          score={score}
          coins={coins}
          distance={distance}
          highScore={highScore}
          activePowerUps={activePowerUps}
          isMuted={isMuted}
          isPaused={isPaused}
          lang={lang}
          unclaimedMissionsCount={unclaimedMissionsCount}
          onToggleMute={toggleMute}
          onTogglePause={togglePause}
          onToggleLang={toggleLang}
          onOpenMissions={openMissions}
        />
      )}

      {/* Live Mission Completed Toast Banner */}
      {missionToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 border-2 border-amber-400 text-amber-200 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-sm animate-in slide-in-from-top-4 duration-200">
          <span className="text-xl">🎁</span>
          <span className="text-xs sm:text-sm font-bold font-mono">{missionToast.message}</span>
        </div>
      )}

      {/* On-Screen Touch / Keyboard Virtual Controls Dock */}
      {gameStatus === 'playing' && !isPaused && (
        <VirtualControls lang={lang} onAction={handleVirtualAction} />
      )}

      {/* Start Screen Menu (Honors user prompt) */}
      {gameStatus === 'idle' && (
        <StartScreen
          lang={lang}
          characterId={characterId}
          theme={theme}
          isMuted={isMuted}
          highScore={highScore}
          totalCoins={totalCoins}
          unclaimedMissionsCount={unclaimedMissionsCount}
          onStart={startGame}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenMissions={openMissions}
          onSelectTheme={(t) => setTheme(t)}
          onToggleLang={toggleLang}
          onToggleMute={toggleMute}
        />
      )}

      {/* Game Over Modal */}
      {gameStatus === 'gameover' && (
        <GameOverModal
          score={score}
          coins={coins}
          highScore={highScore}
          isNewHigh={isNewHigh}
          lang={lang}
          unclaimedMissionsCount={unclaimedMissionsCount}
          onRestart={startGame}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenMissions={openMissions}
          onBackToMenu={() => setGameStatus('idle')}
        />
      )}

      {/* Pause Modal */}
      {isPaused && !isMissionsOpen && (
        <PauseModal
          score={score}
          coins={coins}
          lang={lang}
          isMuted={isMuted}
          unclaimedMissionsCount={unclaimedMissionsCount}
          onResume={togglePause}
          onRestart={startGame}
          onOpenMissions={openMissions}
          onBackToMenu={() => {
            setIsPaused(false);
            setGameStatus('idle');
          }}
          onToggleMute={toggleMute}
          onToggleLang={toggleLang}
        />
      )}

      {/* Character Locker & Upgrades Shop Modal */}
      {isShopOpen && (
        <ShopModal
          lang={lang}
          totalCoins={totalCoins}
          characterId={characterId}
          unlockedCharacters={unlockedCharacters}
          upgrades={upgrades}
          onClose={() => setIsShopOpen(false)}
          onSelectCharacter={(id) => setCharacterId(id)}
          onUnlockCharacter={handleUnlockCharacter}
          onUpgradePowerUp={handleUpgradePowerUp}
        />
      )}

      {/* Daily Missions Modal */}
      {isMissionsOpen && (
        <DailyMissionsModal
          lang={lang}
          missionsState={missionsState}
          totalCoins={totalCoins}
          onClose={() => setIsMissionsOpen(false)}
          onClaimReward={handleClaimReward}
          onClaimAllBonus={handleClaimAllBonus}
        />
      )}
    </div>
  );
}
