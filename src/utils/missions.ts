import { DailyMission, DailyMissionsState, MissionType } from '../types/game';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

// Pseudo-random deterministic number based on string seed
function seedRandom(seedStr: string): () => number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return function () {
    hash = (hash + 0x6d2b79f5) | 0;
    let t = Math.imul(hash ^ (hash >>> 15), 1 | hash);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BRONZE_POOL: Omit<DailyMission, 'current' | 'completed' | 'claimed'>[] = [
  {
    id: 'bronze-coins-50',
    type: 'collect_coins',
    tier: 'bronze',
    titleEn: 'Pocket of Gold',
    titleHi: 'सोने की थैली',
    descriptionEn: 'Collect 50 gold coins today',
    descriptionHi: 'आज 50 सोने के सिक्के इकट्ठा करें',
    target: 50,
    rewardCoins: 60,
    icon: '🪙',
  },
  {
    id: 'bronze-dist-200',
    type: 'survive_distance_single',
    tier: 'bronze',
    titleEn: 'Jungle Scout',
    titleHi: 'जंगल स्काउट',
    descriptionEn: 'Survive at least 200m in a single run',
    descriptionHi: 'एक दौड़ में कम से कम 200 मीटर जीवित रहें',
    target: 200,
    rewardCoins: 50,
    icon: '🏃',
  },
  {
    id: 'bronze-jump-5',
    type: 'jump_obstacles',
    tier: 'bronze',
    titleEn: 'Leap of Faith',
    titleHi: 'साहसी छलांग',
    descriptionEn: 'Jump over 5 fallen logs or rocks',
    descriptionHi: '5 गिरे हुए तनों या पत्थरों के ऊपर से कूदें',
    target: 5,
    rewardCoins: 50,
    icon: '🦘',
  },
  {
    id: 'bronze-powerup-1',
    type: 'collect_powerups',
    tier: 'bronze',
    titleEn: 'Relic Finder',
    titleHi: 'अवशेष खोजी',
    descriptionEn: 'Collect 2 ancient power-ups in the wild',
    descriptionHi: 'दौड़ते हुए 2 जादुई शक्तियां इकट्ठा करें',
    target: 2,
    rewardCoins: 50,
    icon: '✨',
  },
];

const SILVER_POOL: Omit<DailyMission, 'current' | 'completed' | 'claimed'>[] = [
  {
    id: 'silver-coins-120',
    type: 'collect_coins',
    tier: 'silver',
    titleEn: 'Treasure Hunter',
    titleHi: 'खजाना शिकारी',
    descriptionEn: 'Collect 120 gold coins today',
    descriptionHi: 'आज कुल 120 सोने के सिक्के इकट्ठा करें',
    target: 120,
    rewardCoins: 120,
    icon: '💰',
  },
  {
    id: 'silver-dist-400',
    type: 'survive_distance_single',
    tier: 'silver',
    titleEn: 'Deep Expedition',
    titleHi: 'गहरा अन्वेषण',
    descriptionEn: 'Survive 400m in a single sprint',
    descriptionHi: 'एक ही दौड़ में 400 मीटर तक जीवित रहें',
    target: 400,
    rewardCoins: 130,
    icon: '🧭',
  },
  {
    id: 'silver-slide-5',
    type: 'slide_obstacles',
    tier: 'silver',
    titleEn: 'Temple Slider',
    titleHi: 'मंदिर स्लाइडर',
    descriptionEn: 'Slide under 5 hanging temple arches',
    descriptionHi: '5 लटकते हुए मंदिर फाटकों के नीचे से फिसलें',
    target: 5,
    rewardCoins: 110,
    icon: '⚡',
  },
  {
    id: 'silver-powerups-4',
    type: 'collect_powerups',
    tier: 'silver',
    titleEn: 'Relic Master',
    titleHi: 'शक्तियों का स्वामी',
    descriptionEn: 'Collect 4 power-ups across your runs',
    descriptionHi: 'अपनी दौड़ों में कुल 4 पावर-अप उठाएं',
    target: 4,
    rewardCoins: 120,
    icon: '🔮',
  },
];

const GOLD_POOL: Omit<DailyMission, 'current' | 'completed' | 'claimed'>[] = [
  {
    id: 'gold-score-2500',
    type: 'score_single',
    tier: 'gold',
    titleEn: 'Legendary Sprint',
    titleHi: 'शानदार स्प्रिंट',
    descriptionEn: 'Achieve 2,500+ score in a single run',
    descriptionHi: 'एक ही दौड़ में 2,500 या अधिक स्कोर बनाएं',
    target: 2500,
    rewardCoins: 200,
    icon: '🏆',
  },
  {
    id: 'gold-dist-total-1000',
    type: 'survive_distance_total',
    tier: 'gold',
    titleEn: 'Safari Marathon',
    titleHi: 'सफारी मैराथन',
    descriptionEn: 'Run a combined total of 1,000m today',
    descriptionHi: 'आज कुल मिलाकर 1,000 मीटर की दौड़ पूरी करें',
    target: 1000,
    rewardCoins: 220,
    icon: '🌟',
  },
  {
    id: 'gold-jumps-12',
    type: 'jump_obstacles',
    tier: 'gold',
    titleEn: 'Canopy Acrobat',
    titleHi: 'जंगल कलाबाज़',
    descriptionEn: 'Successfully leap over 12 obstacles',
    descriptionHi: 'सफलतापूर्वक 12 बाधाओं के ऊपर से छलांग लगाएं',
    target: 12,
    rewardCoins: 180,
    icon: '👑',
  },
];

export function generateDailyMissions(dateStr: string): DailyMissionsState {
  const rng = seedRandom(dateStr);

  const bronzeChoice = BRONZE_POOL[Math.floor(rng() * BRONZE_POOL.length)];
  const silverChoice = SILVER_POOL[Math.floor(rng() * SILVER_POOL.length)];
  const goldChoice = GOLD_POOL[Math.floor(rng() * GOLD_POOL.length)];

  const missions: DailyMission[] = [
    { ...bronzeChoice, current: 0, completed: false, claimed: false },
    { ...silverChoice, current: 0, completed: false, claimed: false },
    { ...goldChoice, current: 0, completed: false, claimed: false },
  ];

  return {
    date: dateStr,
    missions,
    allClaimedBonus: false,
    allClaimedBonusAmount: 150, // Extra bonus when all 3 are completed
  };
}

export function loadOrInitDailyMissions(): DailyMissionsState {
  const today = getTodayDateString();
  if (typeof window === 'undefined') {
    return generateDailyMissions(today);
  }

  const saved = localStorage.getItem('jungle_runner_daily_missions');
  if (saved) {
    try {
      const parsed: DailyMissionsState = JSON.parse(saved);
      if (parsed.date === today && parsed.missions && parsed.missions.length === 3) {
        return parsed;
      }
    } catch {
      // parse error -> fallback
    }
  }

  // Generate new set for today
  const fresh = generateDailyMissions(today);
  localStorage.setItem('jungle_runner_daily_missions', JSON.stringify(fresh));
  return fresh;
}

export function saveDailyMissions(state: DailyMissionsState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jungle_runner_daily_missions', JSON.stringify(state));
  }
}
