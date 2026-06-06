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
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';


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
  supportSetup: [String],
}, { timestamps: true });

const characterSchema = new mongoose.Schema({
  id: String, name: String, title: String, rarity: String,
  terrain: String, lengths: String, runningStyle: String,
  image: String, videoId: String, lore: String,
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


// Passport Local Strategy (email + password) ---------------------

passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const trainer = await Trainer.findOne({ email });
      if (!trainer) return done(null, false, { message: 'Email not found' });

      const valid = await bcrypt.compare(password, trainer.passwordHash);
      if (!valid) return done(null, false, { message: 'Incorrect password' });

      return done(null, trainer);
    } catch (err) {
      return done(err);
    }
  }
));


// Passport JWT Strategy (cookie HttpOnly) ---------------------

const cookieExtractor = (req) => req?.cookies?.token ?? null;

passport.use(new JwtStrategy(
  {
    jwtFromRequest: cookieExtractor,
    secretOrKey:    process.env.JWT_SECRET,
  },
  async (payload, done) => {
    try {
      const trainer = await Trainer.findById(payload.sub);
      if (!trainer) return done(null, false);
      return done(null, trainer);
    } catch (err) {
      return done(err);
    }
  }
));


// Auth middleware ---------------------

function requireAuth(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, trainer) => {
    if (err)      return next(err);
    if (!trainer) return res.status(401).json({ error: 'Not authenticated' });
    req.trainer = trainer;
    next();
  })(req, res, next);
}

function optionalAuth(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, trainer) => {
    if (trainer) req.trainer = trainer;
    next();
  })(req, res, next);
}


// Cookie helper ---------------------

function issueTokenCookie(res, trainer) {
  const token = jwt.sign(
    { sub: trainer._id, email: trainer.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
  return token;
}


// Auth Routes ---------------------

const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password too short (6 characters min)' });

  try {
    const exists = await Trainer.findOne({ email });
    if (exists)
      return res.status(409).json({ error: 'This email is already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const trainer = await Trainer.create({ email, passwordHash });

    issueTokenCookie(res, trainer);
    res.status(201).json({ message: 'Account created', email: trainer.email });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: 'This email is already in use' });
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, trainer, info) => {
    if (err)      return next(err);
    if (!trainer) return res.status(401).json({ error: info?.message ?? 'Invalid credentials' });

    issueTokenCookie(res, trainer);
    res.json({ message: 'Logged in', email: trainer.email });
  })(req, res, next);
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({
    email:        req.trainer.email,
    name:         req.trainer.name,
    trainerId:    req.trainer.trainerId,
    hasProfile:   !!req.trainer.name,
    id:           req.trainer._id,
  });
});


// GraphQL Schema -------------------------

const schema = buildSchema(`
  type Trainer {
    id: ID!
    email: String
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

  input TeamEntryInput { uma: String, scenario: String, score: Int }

  type Query {
    trainer(id: ID!): Trainer
    trainers: [Trainer]
    character(id: ID!): Character
    characters: [Character]
  }

  type Mutation {
    updateProfile(
      name: String
      trainerId: String
      comment: String
      rank: String
      followers: Int
      totalTrained: Int
      highestScore: Int
      team: [TeamEntryInput]
      supportSetup: [String]
    ): Trainer
  }
`);

function buildRoot(req) {
  return {
    // Only expose trainers that have set up a profile (have a name)
    trainer:    ({ id }) => Trainer.findById(id).then(t => (t?.name ? t : null)),
    trainers:   ()       => Trainer.find({ name: { $ne: null } }),
    character:  ({ id }) => Character.findOne({ id }),
    characters: ()       => Character.find(),

    // Create or update the logged-in trainer's profile
    updateProfile: async ({ ...fields }) => {
      if (!req.trainer) throw new Error('Not authenticated');

      Object.assign(req.trainer, fields);
      await req.trainer.save();
      return req.trainer;
    },
  };
}


// App ------------------------------

const app = express();

app.use(cors({
  origin:      'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/auth', authRouter);

app.use('/graphql', optionalAuth, (req, res) => {
  graphqlHTTP({
    schema,
    rootValue: buildRoot(req),
    graphiql:  true,
  })(req, res);
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(4000, () => console.log('Server on http://localhost:4000'));
  })
  .catch(err => console.error('DB error:', err));