require('dotenv').config();
const mongoose = require('mongoose');

// Schema (mirrors server/index.js) -----------------------
const characterSchema = new mongoose.Schema({
  id: String,
  name: String,
  title: String,
  rarity: String,
  terrain: String,
  lengths: String,
  runningStyle: String,
  image: String,
  videoId: String,
  lore: String,
  stats: { speed: Number, stamina: Number, power: Number, guts: Number, wit: Number },
  horseBackground: String,
  careerRecord: {
    totalRaces: Number,
    wins: Number,
    winRate: String,
    gradeIWins: Number,
    majorTitles: [String],
  },
  raceHistory: [{ date: String, race: String, distance: String, position: mongoose.Schema.Types.Mixed }],
});

const Character = mongoose.model('Character', characterSchema);

// Data (from your characters.js, with fixed unique IDs) -------------------------
const CHARACTERS = [
  {
    id: '4737',
    name: 'Stay Gold',
    title: 'Supreme Commander of Japan',
    rarity: '★★★',
    terrain: 'Turf',
    lengths: 'Medium / Long',
    runningStyle: 'Pace Chaser',
    image: 'https://umamusu.wiki/w/images/4/44/Stay_Gold_%28Main%29.png',
    videoId: 'FoNCACZr3z0',
    lore: 'A hardworking uma musume with a dream of becoming the best in Japan. Her determination is unmatched.',
    stats: { speed: 80, stamina: 85, power: 75, guts: 90, wit: 65 },
    horseBackground: "One of Japan's greatest racehorses, winner of three Japan Racing Association Grade I races in 1998.",
    careerRecord: {
      totalRaces: 24, wins: 10, winRate: '42%', gradeIWins: 6,
      majorTitles: ['Japan Cup', 'Tenno Sho (Spring)', 'Tenno Sho (Autumn)'],
    },
    raceHistory: [
      { date: '1998-05-03', race: 'Tenno Sho (Spring)', distance: '3200m', position: 1 },
      { date: '1998-10-25', race: 'Tenno Sho (Autumn)', distance: '2000m', position: 1 },
      { date: '1998-11-29', race: 'Japan Cup', distance: '2400m', position: 1 },
    ],
  },
  {
    id: '4001',                        
    name: 'Dream Journey',
    title: 'Otherwordly Front-Runner',
    rarity: '★★★',
    terrain: 'Turf',
    lengths: 'Mile / Medium',
    runningStyle: 'Front Runner',
    image: 'https://umamusu.wiki/w/images/a/a3/Dream_Journey_%28Main%29.png',
    videoId: 'jg585yXtHbk',
    lore: 'A graceful uma musume known for her blazing front-running style. She runs as if chasing the wind itself.',
    stats: { speed: 90, stamina: 60, power: 70, guts: 50, wit: 75 },
    horseBackground: 'A legendary Japanese racehorse who dominated the 1998 season before a career-ending injury at the Japan Cup.',
    careerRecord: {
      totalRaces: 16, wins: 9, winRate: '56%', gradeIWins: 4,
      majorTitles: ['Takarazuka Kinen', 'Mainichi Okan', 'Sapporo Kinen'],
    },
    raceHistory: [
      { date: '1998-06-07', race: 'Mainichi Okan', distance: '1800m', position: 1 },
      { date: '1998-10-18', race: 'Takarazuka Kinen', distance: '2200m', position: 1 },
      { date: '1998-11-29', race: 'Japan Cup', distance: '2400m', position: '-' },
    ],
  },
  {
    id: '4002',                       
    name: 'Orfevre',
    title: 'Otherwordly Front-Runner',
    rarity: '★★★',
    terrain: 'Turf',
    lengths: 'Mile / Medium',
    runningStyle: 'Front Runner',
    image: 'https://umamusu.wiki/w/images/d/dc/Orfevre_%28Main%29.png',
    videoId: 'jg585yXtHbk',
    lore: 'A graceful uma musume known for her blazing front-running style. She runs as if chasing the wind itself.',
    stats: { speed: 90, stamina: 60, power: 70, guts: 50, wit: 75 },
    horseBackground: 'A legendary Japanese racehorse who dominated the 1998 season before a career-ending injury at the Japan Cup.',
    careerRecord: {
      totalRaces: 16, wins: 9, winRate: '56%', gradeIWins: 4,
      majorTitles: ['Takarazuka Kinen', 'Mainichi Okan', 'Sapporo Kinen'],
    },
    raceHistory: [
      { date: '1998-06-07', race: 'Mainichi Okan', distance: '1800m', position: 1 },
      { date: '1998-10-18', race: 'Takarazuka Kinen', distance: '2200m', position: 1 },
      { date: '1998-11-29', race: 'Japan Cup', distance: '2400m', position: '-' },
    ],
  },
  {
    id: '4003',                          
    name: 'Gold Ship',
    title: 'Otherwordly Front-Runner',
    rarity: '★★★',
    terrain: 'Turf',
    lengths: 'Mile / Medium',
    runningStyle: 'Front Runner',
    image: 'https://umamusu.wiki/w/images/8/8e/Gold_Ship_%28Main%29.png',
    videoId: 'jg585yXtHbk',
    lore: 'A graceful uma musume known for her blazing front-running style. She runs as if chasing the wind itself.',
    stats: { speed: 90, stamina: 60, power: 70, guts: 50, wit: 75 },
    horseBackground: 'A legendary Japanese racehorse who dominated the 1998 season before a career-ending injury at the Japan Cup.',
    careerRecord: {
      totalRaces: 16, wins: 9, winRate: '56%', gradeIWins: 4,
      majorTitles: ['Takarazuka Kinen', 'Mainichi Okan', 'Sapporo Kinen'],
    },
    raceHistory: [
      { date: '1998-06-07', race: 'Mainichi Okan', distance: '1800m', position: 1 },
      { date: '1998-10-18', race: 'Takarazuka Kinen', distance: '2200m', position: 1 },
      { date: '1998-11-29', race: 'Japan Cup', distance: '2400m', position: '-' },
    ],
  },
  {
    id: '4004',                           
    name: 'Nakayama Festa',
    title: 'Otherwordly Front-Runner',
    rarity: '★★★',
    terrain: 'Turf',
    lengths: 'Mile / Medium',
    runningStyle: 'Front Runner',
    image: 'https://umamusu.wiki/w/images/f/fe/Nakayama_Festa_%28Main%29.png',
    videoId: 'jg585yXtHbk',
    lore: 'A graceful uma musume known for her blazing front-running style. She runs as if chasing the wind itself.',
    stats: { speed: 90, stamina: 60, power: 70, guts: 50, wit: 75 },
    horseBackground: 'A legendary Japanese racehorse who dominated the 1998 season before a career-ending injury at the Japan Cup.',
    careerRecord: {
      totalRaces: 16, wins: 9, winRate: '56%', gradeIWins: 4,
      majorTitles: ['Takarazuka Kinen', 'Mainichi Okan', 'Sapporo Kinen'],
    },
    raceHistory: [
      { date: '1998-06-07', race: 'Mainichi Okan', distance: '1800m', position: 1 },
      { date: '1998-10-18', race: 'Takarazuka Kinen', distance: '2200m', position: 1 },
      { date: '1998-11-29', race: 'Japan Cup', distance: '2400m', position: '-' },
    ],
  },
  {
    id: '4005',                           
    name: 'Fenomeno',
    title: 'Otherwordly Front-Runner',
    rarity: '★★★',
    terrain: 'Turf',
    lengths: 'Mile / Medium',
    runningStyle: 'Front Runner',
    image: 'https://umamusu.wiki/w/images/8/84/Fenomeno_%28Main%29.png',
    videoId: 'jg585yXtHbk',
    lore: 'A graceful uma musume known for her blazing front-running style. She runs as if chasing the wind itself.',
    stats: { speed: 90, stamina: 60, power: 70, guts: 50, wit: 75 },
    horseBackground: 'A legendary Japanese racehorse who dominated the 1998 season before a career-ending injury at the Japan Cup.',
    careerRecord: {
      totalRaces: 16, wins: 9, winRate: '56%', gradeIWins: 4,
      majorTitles: ['Takarazuka Kinen', 'Mainichi Okan', 'Sapporo Kinen'],
    },
    raceHistory: [
      { date: '1998-06-07', race: 'Mainichi Okan', distance: '1800m', position: 1 },
      { date: '1998-10-18', race: 'Takarazuka Kinen', distance: '2200m', position: 1 },
      { date: '1998-11-29', race: 'Japan Cup', distance: '2400m', position: '-' },
    ],
  },
  {
    id: '4006',                          
    name: 'Lucky Lilac',
    title: 'Otherwordly Front-Runner',
    rarity: '★★★',
    terrain: 'Turf',
    lengths: 'Mile / Medium',
    runningStyle: 'Front Runner',
    image: 'https://umamusu.wiki/w/images/9/93/Lucky_Lilac_%28Main%29.png',
    videoId: 'jg585yXtHbk',
    lore: 'A graceful uma musume known for her blazing front-running style. She runs as if chasing the wind itself.',
    stats: { speed: 90, stamina: 60, power: 70, guts: 50, wit: 75 },
    horseBackground: 'A legendary Japanese racehorse who dominated the 1998 season before a career-ending injury at the Japan Cup.',
    careerRecord: {
      totalRaces: 16, wins: 9, winRate: '56%', gradeIWins: 4,
      majorTitles: ['Takarazuka Kinen', 'Mainichi Okan', 'Sapporo Kinen'],
    },
    raceHistory: [
      { date: '1998-06-07', race: 'Mainichi Okan', distance: '1800m', position: 1 },
      { date: '1998-10-18', race: 'Takarazuka Kinen', distance: '2200m', position: 1 },
      { date: '1998-11-29', race: 'Japan Cup', distance: '2400m', position: '-' },
    ],
  },
  {
    id: '4007',                          
    name: 'Marche Lorraine',
    title: 'Otherwordly Front-Runner',
    rarity: '★★★',
    terrain: 'Turf',
    lengths: 'Mile / Medium',
    runningStyle: 'Front Runner',
    image: 'https://umamusu.wiki/w/images/a/a0/Marche_Lorraine_main.webp',
    videoId: 'jg585yXtHbk',
    lore: 'A graceful uma musume known for her blazing front-running style. She runs as if chasing the wind itself.',
    stats: { speed: 90, stamina: 60, power: 70, guts: 50, wit: 75 },
    horseBackground: 'A legendary Japanese racehorse who dominated the 1998 season before a career-ending injury at the Japan Cup.',
    careerRecord: {
      totalRaces: 16, wins: 9, winRate: '56%', gradeIWins: 4,
      majorTitles: ['Takarazuka Kinen', 'Mainichi Okan', 'Sapporo Kinen'],
    },
    raceHistory: [
      { date: '1998-06-07', race: 'Mainichi Okan', distance: '1800m', position: 1 },
      { date: '1998-10-18', race: 'Takarazuka Kinen', distance: '2200m', position: 1 },
      { date: '1998-11-29', race: 'Japan Cup', distance: '2400m', position: '-' },
    ],
  },
];

// Seed --------------------------------
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Character.deleteMany({});
  console.log('Cleared existing characters');

  await Character.insertMany(CHARACTERS);
  console.log(`Seeded ${CHARACTERS.length} characters`);

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});