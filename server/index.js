require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const mongoose     = require('mongoose');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const passport     = require('passport');
const cookieParser = require('cookie-parser');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy   } = require('passport-jwt');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { createServer } from 'http';
import { Server } from 'socket.io';

// --- Mongoose Models ----------------------------------------------------------


// Mongoose Models ---------------------

const trainerSchema = new mongoose.Schema({
  // Auth fields
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  // Trainer profile fields
  name:         { type: String, default: null },
  trainerId:    { type: String, default: null },
  rank:         { type: String, default: 'Unranked' },
  comment:      { type: String, default: '' },
  followers:    { type: Number, default: 0 },
  totalTrained: { type: Number, default: 0 },
  highestScore: { type: Number, default: 0 },
  team:         [{ uma: String, scenario: String, score: Number }],
const trainerSchema = new mongoose.Schema({
  id: String, name: String, trainerId: String, rank: String, comment: String,
  followers: Number, totalTrained: Number, highestScore: Number,
  team: [{ uma: String, scenario: String, score: Number }],
  supportSetup: [String],
}, { timestamps: true });

const characterSchema = new mongoose.Schema({
  id: String, name: String, title: String, rarity: String, terrain: String,
  lengths: String, runningStyle: String, image: String, videoId: String, lore: String,
  stats: { speed: Number, stamina: Number, power: Number, guts: Number, wit: Number },
  horseBackground: String,
  careerRecord: {
    totalRaces: Number, wins: Number, winRate: String,
    gradeIWins: Number, majorTitles: [String],
  },
  raceHistory: [{ date: String, race: String, distance: String, position: mongoose.Schema.Types.Mixed }],
});

const Trainer   = mongoose.model('Trainer',   trainerSchema);
const Character = mongoose.model('Character', characterSchema);

// --- GraphQL ------------------------------------------------------------------

const typeDefs = `
  type Trainer {
    id: ID! name: String trainerId: String comment: String rank: String
    followers: Int totalTrained: Int highestScore: Int
    team: [TeamEntry] supportSetup: [String]
  }
  type TeamEntry { uma: String, scenario: String, score: Int }
  type Stats { speed: Int, stamina: Int, power: Int, guts: Int, wit: Int }
  type CareerRecord {
    totalRaces: Int, wins: Int, winRate: String,
    gradeIWins: Int, majorTitles: [String]
  }
  type RaceEntry { date: String, race: String, distance: String, position: String }
  type Character {
    id: ID! name: String title: String rarity: String
    terrain: String lengths: String runningStyle: String
    image: String videoId: String lore: String
    stats: Stats horseBackground: String
    careerRecord: CareerRecord raceHistory: [RaceEntry]
  }
  type Query {
    trainer(id: ID!): Trainer
    trainers: [Trainer]
    character(id: ID!): Character
    characters: [Character]
  }
`;

const resolvers = {
  Query: {
    trainer:    (_, { id }) => Trainer.findOne({ id }),
    trainers:   ()          => Trainer.find(),
    character:  (_, { id }) => Character.findOne({ id }),
    characters: ()          => Character.find(),
  }
};

// --- Race Logic ---------------------------------------------------------------

const RACERS = [
  { id: 'suzuka',  name: 'Silence Suzuka',  color: '#44fe2f' },
  { id: 'special', name: 'Special Week',    color: '#ff52e8' },
  { id: 'tokai',   name: 'Tokai Teio',      color: '#66baff' },
  { id: 'mcqueen', name: 'Mejiro McQueen',  color: '#c9a8fc' },
  { id: 'rice',    name: 'Rice Shower',     color: '#924ece' },
  { id: 'ardan',   name: 'Mejiro Ardan',    color: '#67f1ef' },
  { id: 'creek',   name: 'Super Creek',     color: '#91e0ff' },
  { id: 'rudolf',  name: 'Symboli Rudolf',  color: '#209339' },
  { id: 'oguri',   name: 'Oguri Cap',       color: '#e4e4e4' },
];

const BETTING_DURATION = 15;
const RACE_DURATION    = 8000;
const TICK_MS          = 100;
const TICKS            = RACE_DURATION / TICK_MS;

function generateOdds(speeds) {
  // Use the racer speeds to derive weights — faster = more favored = lower odds
  const weights = RACERS.map(r => speeds[r.id])
  const total   = weights.reduce((a, b) => a + b, 0)
  return Object.fromEntries(
    RACERS.map((r, i) => [r.id, +(total / weights[i] * 0.85).toFixed(1)])
  )
}

function simulateRace() {
  // Speeds weighted toward the middle — less extreme variation
  const speeds = Object.fromEntries(
    RACERS.map(r => [r.id, Math.random() * 0.3 + 0.85])
  )

  const odds      = generateOdds(speeds)
  const snapshots = []
  const positions = Object.fromEntries(RACERS.map(r => [r.id, 0]))
  const finishTick = {}

  for (let t = 0; t < TICKS; t++) {
    RACERS.forEach(r => {
      if (finishTick[r.id] !== undefined) return
      const surge = Math.random() < 0.08 ? Math.random() * 2 : 0
      positions[r.id] += speeds[r.id] * (Math.random() * 1.2 + 0.6) + surge
      if (positions[r.id] >= 100) { finishTick[r.id] = t; positions[r.id] = 100 }
    })
    snapshots.push({ ...positions })
  }

  const winner = RACERS
    .filter(r => finishTick[r.id] !== undefined)
    .sort((a, b) => finishTick[a.id] - finishTick[b.id])[0]

  return { snapshots, winnerId: winner?.id ?? RACERS[0].id, odds }
}

// --- App + HTTP + Socket.io ---------------------------------------------------

const app        = express();
const httpServer = createServer(app);
const io         = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// --- Race State Machine -------------------------------------------------------

let raceState = {
  phase:     'betting',
  odds:      generateOdds(Object.fromEntries(RACERS.map(r => [r.id, Math.random() * 0.3 + 0.85]))),
  timeLeft:  BETTING_DURATION,
  positions: Object.fromEntries(RACERS.map(r => [r.id, 0])),
  winnerId:  null,
};

function broadcastState() { io.emit('race:state', raceState); }
function emitState(socket) { socket.emit('race:state', raceState); }

function startBettingPhase(nextOdds) {
  raceState = {
    phase:     'betting',
    odds:      nextOdds ?? generateOdds(Object.fromEntries(RACERS.map(r => [r.id, Math.random() * 0.3 + 0.85]))),
    timeLeft:  BETTING_DURATION,
    positions: Object.fromEntries(RACERS.map(r => [r.id, 0])),
    winnerId:  null,
  }
  broadcastState()

  const countdown = setInterval(() => {
    raceState.timeLeft--
    broadcastState()
    if (raceState.timeLeft <= 0) { clearInterval(countdown); startRacingPhase() }
  }, 1000)
}

function startRacingPhase() {
  const { snapshots, winnerId, odds } = simulateRace()
  raceState.phase = 'racing'
  broadcastState()

  let tick = 0
  const interval = setInterval(() => {
    const snap = snapshots[tick]
    if (snap) { raceState.positions = snap; broadcastState() }
    tick++
    if (tick >= TICKS) { clearInterval(interval); startResultsPhase(winnerId, odds) }
  }, TICK_MS)
}

function startResultsPhase(winnerId, odds) {
  raceState.phase    = 'results'
  raceState.winnerId = winnerId
  broadcastState()
  // Pre-generate next race odds and pass them into the next betting phase
  const { odds: nextOdds } = simulateRace()
  setTimeout(() => startBettingPhase(nextOdds), 5000)
}

// --- Socket.io Connections ----------------------------------------------------

io.on('connection', socket => {
  console.log('Client connected:', socket.id);
  emitState(socket);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// --- Apollo + Start -----------------------------------------------------------

const apolloServer = new ApolloServer({ typeDefs, resolvers });
await apolloServer.start();

app.use('/graphql', expressMiddleware(apolloServer, {
  context: async ({ req }) => ({ req })
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(4000, () => {
      console.log('Server on http://localhost:4000');
      startBettingPhase();
    });
  })
  .catch(err => console.error('DB error:', err));