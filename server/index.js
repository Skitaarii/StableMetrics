const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');


const app = express();
const PORT = 3000;

const trainers = [
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
      { uma: 'Mejiro Ardan', scenario: 'Make A New Track (soon, trust)', score: 10000 },
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
]

const schema = buildSchema(`
  type Trainer {
    id: ID!
    name: String
    trainerId: String
    comment: String
    rank: String
    followers: Int
    totalTrained: Int
    highestScore: Int
    team: [TeamEntry]
    supportSetup: [String]
  }

  type TeamEntry {
    uma: String
    scenario: String
    score: Int
  }

  type Query {
    trainer(id: ID!): Trainer
    trainers: [Trainer]
  }
`)

const root = {
  trainer: ({ id }) => trainers.find(t => t.id === id),
  trainers: () => trainers
}

app.use(cors());
app.use(express.json());

app.get('/hello', (req, res) => {
  console.log("Route /hello appelée");
  res.send('Hello World niba');
});

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});