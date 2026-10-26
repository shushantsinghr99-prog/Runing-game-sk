import { CharacterSkin } from '../types/game';

export const CHARACTER_SKINS: CharacterSkin[] = [
  {
    id: 'raj',
    nameEn: 'Raj Explorer',
    nameHi: 'राज खोजी',
    descriptionEn: 'Seasoned safari adventurer with lightning reflexes.',
    descriptionHi: 'अनुभवी जंगल खोजकर्ता, तेज़ और संतुलित।',
    cost: 0,
    unlocked: true,
    colors: {
      shirt: 0x1874c7, // Classic adventurer blue
      pants: 0x202d48, // Dark navy explorer trousers
      skin: 0xe3a276,  // Warm skin
      hat: 0xd2a679,   // Explorer pith hat
      accent: 0xe08d24,// Belt & buckle
    },
  },
  {
    id: 'maya',
    nameEn: 'Maya Ranger',
    nameHi: 'माया रेंजर',
    descriptionEn: 'Agile forest guardian at one with the jungle canopy.',
    descriptionHi: 'जंगल की रक्षक, चपलता और गति में माहिर।',
    cost: 150,
    unlocked: false,
    colors: {
      shirt: 0x15803d, // Emerald jungle green
      pants: 0x164e63, // Deep teal trousers
      skin: 0xd99b6e,  // Golden tone
      hat: 0x047857,   // Forest ranger cap
      accent: 0xfacc15,// Golden feather & tribal badge
    },
  },
  {
    id: 'veer',
    nameEn: 'Veer Tiger-Heart',
    nameHi: 'वीर व्याघ्र',
    descriptionEn: 'Fierce warrior empowered by the ancient golden tiger spirit.',
    descriptionHi: 'निडर योद्धा, प्राचीन स्वर्ण व्याघ्र की शक्ति से युक्त।',
    cost: 350,
    unlocked: false,
    colors: {
      shirt: 0xc2410c, // Tiger fire amber
      pants: 0x18181b, // Panther black
      skin: 0xb45309,  // Sun-kissed warrior skin
      hat: 0x78350f,   // Tiger crest headband
      accent: 0xf59e0b,// Pure gold ornaments
    },
  },
];
