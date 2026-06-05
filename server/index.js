require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Mongoose Models ---------------------
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
    totalRaces: Number, wins: Number, winRate: String,
    gradeIWins: Number, majorTitles: [String],
  },
  raceHistory: [{ date: String, race: String, distance: String, position: mongoose.Schema.Types.Mixed }],
});

const Trainer = mongoose.model('Trainer', trainerSchema);
const Character = mongoose.model('Character', characterSchema);

// GraphQL Schema -------------------------
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
  type TeamEntry { uma: String, scenario: String, score: Int }

  type Stats { speed: Int, stamina: Int, power: Int, guts: Int, wit: Int }
  type CareerRecord {
    totalRaces: Int, wins: Int, winRate: String,
    gradeIWins: Int, majorTitles: [String]
  }
  type RaceEntry { date: String, race: String, distance: String, position: String }
  type Character {
    id: ID!
    name: String, title: String, rarity: String
    terrain: String, lengths: String, runningStyle: String
    image: String, videoId: String, lore: String
    stats: Stats
    horseBackground: String
    careerRecord: CareerRecord
    raceHistory: [RaceEntry]
  }

  type Query {
    trainer(id: ID!): Trainer
    trainers: [Trainer]
    character(id: ID!): Character
    characters: [Character]
  }
`);

const root = {
  trainer:    ({ id }) => Trainer.findOne({ id }),
  trainers:   ()       => Trainer.find(),
  character:  ({ id }) => Character.findOne({ id }),
  characters: ()       => Character.find(),
};

// App ------------------------------
const app = express();
app.use(cors());
app.use(express.json());

app.use('/graphql', graphqlHTTP({ schema, rootValue: root, graphiql: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(4000, () => console.log('Server on http://localhost:4000'));
  })
  .catch(err => console.error('DB connection failed:', err));