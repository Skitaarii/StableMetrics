require('dotenv').config();
const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  id: String,
  name: String,
  trainerId: String,
  rank: String,
  comment: String,
  followers: Number,
  totalTrained: Number,
  highestScore: Number,
  team: [{ uma: String, scenario: String, score: Number }],
  supportSetup: [String],
});

const Trainer = mongoose.model('Trainer', trainerSchema);

const TRAINERS = [
  {
    id: 'neb5384',
    name: 'Neb5384',
    trainerId: '783 492 014 067',
    rank: 'A3',
    comment: 'Wh-why am I crying ? I had so mvch fvn ....',
    followers: 142,
    totalTrained: 38,
    highestScore: 12000,
    team: [
      { uma: 'Tokai Teio', scenario: 'Unity Cup', score: 11000 },
      { uma: 'Smart Falcon', scenario: 'Unity Cup', score: 12000 },
    ],
    supportSetup: [
      'Oguri Cap [Speed]',
      'Symboli Rudolf [Speed]',
      'Daiwa Scarlet [Stamina]',
      'Vodka [Power]',
      'Gold Ship [Guts]',
      'Mejiro McQueen [Friend]',
    ],
  },
  {
    id: 'skitaarii',
    name: 'Skitaarii',
    trainerId: '407 312 760 740',
    rank: 'B2',
    comment: 'h o r s e club CEO',
    followers: 67,
    totalTrained: 22,
    highestScore: 10000,
    team: [
      { uma: 'Mejiro Ardan', scenario: 'Make A New Track', score: 10000 },
    ],
    supportSetup: [
      'First-Rate Plan [King Halo] [SR] [Speed]',
      'Messing Around [Nice Nature] [SR] [Wit]',
      '5:00 a.m.-Right on Schedule [Eishin Flash] [SR] [Speed]',
      'Pal-Assisted Training [Mihono Bourbon] [SR] [Power]',
      'Turf as Nails [Tosen Jordan] [SR] [Stamina]',
      'The Will to Overtake [Satono Diamond] [SSR] [Stamina]',
    ],
  },
  {
    id: 'seblepoisson02',
    name: 'SebLePoisson02',
    trainerId: '118 924 364 045',
    rank: 'D2',
    comment: "Let's have fun!",
    followers: 14,
    totalTrained: 8,
    highestScore: 8400,
    team: [],
    supportSetup: [],
  },
  {
    id: 'dav',
    name: 'Dav',
    trainerId: '615 843 952 114',
    rank: 'F',
    comment: 'They dragged me into this game help me what is a umamusume',
    followers: 3,
    totalTrained: 2,
    highestScore: 4100,
    team: [],
    supportSetup: [],
  },
  {
    id: 'noxenara',
    name: 'Noxenara',
    trainerId: '929 898 285 038',
    rank: 'F',
    comment: 'Grand Galop il a changé',
    followers: 5,
    totalTrained: 3,
    highestScore: 3800,
    team: [],
    supportSetup: [],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Trainer.deleteMany({});
  console.log('Cleared existing trainers');

  await Trainer.insertMany(TRAINERS);
  console.log(`Seeded ${TRAINERS.length} trainers`);

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
