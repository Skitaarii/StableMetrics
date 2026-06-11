import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { createServer } from 'http';
import { Server } from 'socket.io';

// --- Mongoose Models ----------------------------------------------------------

const trainerSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true,
                  match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] },
  passwordHash: { type: String, required: true },
  name:         { type: String, default: null, maxlength: [50, 'Name too long'] },
  trainerId:    { type: String, default: null, maxlength: [30, 'Trainer ID too long'] },
  rank:         { type: String, default: 'Unranked' },
  comment:      { type: String, default: '', maxlength: [300, 'Comment too long'] },
  followers:    { type: Number, default: 0, min: [0, 'Followers cannot be negative'] },
  coins:        { type: Number, default: 1000, min: [0, 'Coins cannot be negative'] },
  totalTrained: { type: Number, default: 0, min: [0, 'totalTrained cannot be negative'] },
  highestScore: { type: Number, default: 0, min: [0, 'Score cannot be negative'] },
  team:         [{ uma: String, scenario: String, score: { type: Number, min: 0 } }],
  supportSetup: [String],
}, { timestamps: true });

const characterSchema = new mongoose.Schema({
  id:           { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  title:        { type: String },
  rarity:       { type: String },
  terrain:      { type: String },
  lengths:      { type: String },
  runningStyle: { type: String },
  image:        { type: String },
  racewear:     { type: String },
  videoId:      { type: String },
  lore:         { type: String },
  umapyoiId:    { type: Number, min: [1, 'Invalid umapyoi ID'] },
  color:        { type: String, match: [/^#[0-9a-fA-F]{6}$/, 'Color must be a hex code'] },
});

const Trainer   = mongoose.model('Trainer',   trainerSchema);
const Character = mongoose.model('Character', characterSchema);

// --- Passport -----------------------------------------------------------------

passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const trainer = await Trainer.findOne({ email });
      if (!trainer) return done(null, false, { message: 'Email not found' });
      const valid = await bcrypt.compare(password, trainer.passwordHash);
      if (!valid) return done(null, false, { message: 'Incorrect password' });
      return done(null, trainer);
    } catch (err) { return done(err); }
  }
));

const cookieExtractor = (req) => req?.cookies?.token ?? null;

passport.use(new JwtStrategy(
  { jwtFromRequest: cookieExtractor, secretOrKey: process.env.JWT_SECRET },
  async (payload, done) => {
    try {
      const trainer = await Trainer.findById(payload.sub);
      if (!trainer) return done(null, false);
      return done(null, trainer);
    } catch (err) { return done(err); }
  }
));

// --- Auth Middleware ----------------------------------------------------------

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

// --- Cookie Helper ------------------------------------------------------------

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

// --- Auth Routes --------------------------------------------------------------

const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password too short (6 characters min)' });
  try {
    const exists = await Trainer.findOne({ email });
    if (exists) return res.status(409).json({ error: 'This email is already in use' });
    const passwordHash = await bcrypt.hash(password, 12);
    const trainer = await Trainer.create({ email, passwordHash });
    issueTokenCookie(res, trainer);
    res.status(201).json({ message: 'Account created', email: trainer.email });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'This email is already in use' });
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
    email:      req.trainer.email,
    name:       req.trainer.name,
    trainerId:  req.trainer.trainerId,
    hasProfile: !!req.trainer.name,
    id:         req.trainer._id,
    coins:      req.trainer.coins,
  });
});

// --- GraphQL ------------------------------------------------------------------

const typeDefs = `
  type Trainer {
    id: ID!
    email: String
    name: String
    trainerId: String
    comment: String
    rank: String
    followers: Int
    coins: Int
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
    name: String title: String rarity: String
    terrain: String lengths: String runningStyle: String
    image: String racewear: String videoId: String lore: String
    umapyoiId: Int color: String
    stats: Stats horseBackground: String
    careerRecord: CareerRecord raceHistory: [RaceEntry]
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
      coins: Int
      totalTrained: Int
      highestScore: Int
      team: [TeamEntryInput]
      supportSetup: [String]
    ): Trainer
    updateCoins(coins: Int!): Trainer
  }
`;

const resolvers = {
  Trainer: {
    id: (trainer) => trainer._id?.toString(),
  },
  Character: {
    id: (c) => c.id ?? c._id?.toString(),
  },
  Query: {
    trainer:    async (_, { id }) => Trainer.findById(id).lean(),
    trainers:   async ()          => Trainer.find({ name: { $ne: null } }).lean(),
    character:  async (_, { id }) => {
      return await Character.findOne({ id }).lean()
        ?? await Character.findById(id).lean().catch(() => null)
    },
    characters: async ()          => Character.find().lean(),
  },
  Mutation: {
    updateProfile: async (_, fields, { trainer }) => {
      if (!trainer) throw new Error('Not authenticated');
      Object.assign(trainer, fields);
      await trainer.save();
      return trainer;
    },
    updateCoins: async (_, { coins }, { trainer }) => {
      if (!trainer) throw new Error('Not authenticated')
      trainer.coins = coins
      await trainer.save()
      return trainer
    },
  },
};

// --- Race Logic ---------------------------------------------------------------

const BETTING_DURATION = 15;
const RACE_DURATION    = 23000;
const TICK_MS          = 150;
const TICKS            = RACE_DURATION / TICK_MS;

const TIER_PROFILES = {
  favorite:  { baseSpeed: 0.75, decay: 0.0008, surgeChance: 0.07, surgePower: 1.6, oddsRange: [1.1,  2.5]  },
  contender: { baseSpeed: 0.74, decay: 0.0011, surgeChance: 0.07, surgePower: 1.8, oddsRange: [2.0,  8.0]  },
  midpack:   { baseSpeed: 0.73, decay: 0.0014, surgeChance: 0.06, surgePower: 2.1, oddsRange: [7.0,  13.0] },
  outsider:  { baseSpeed: 0.72, decay: 0.0017, surgeChance: 0.06, surgePower: 2.5, oddsRange: [12.0, 20.0] },
}

const MOOD_PROFILES = {
  awful:   { weight: 10, speedMult: 0.82, decayMult: 1.40, surgeMult: 0.50, oddsShift:  3.0 },
  bad:     { weight: 20, speedMult: 0.91, decayMult: 1.20, surgeMult: 0.75, oddsShift:  1.5 },
  neutral: { weight: 35, speedMult: 1.00, decayMult: 1.00, surgeMult: 1.00, oddsShift:  0.0 },
  good:    { weight: 25, speedMult: 1.08, decayMult: 0.85, surgeMult: 1.25, oddsShift: -1.0 },
  great:   { weight: 10, speedMult: 1.16, decayMult: 0.70, surgeMult: 1.60, oddsShift: -2.0 },
}

function pickMood() {
  const total = Object.values(MOOD_PROFILES).reduce((a, m) => a + m.weight, 0)
  let roll = Math.random() * total
  for (const [mood, profile] of Object.entries(MOOD_PROFILES)) {
    roll -= profile.weight
    if (roll <= 0) return mood
  }
  return 'neutral'
}

async function pickRacers() {
  const all = await Character.find({}, 'id name color racewear image').lean()
  return [...all]
    .sort(() => Math.random() - 0.5)
    .slice(0, 9)
    .map(c => ({ id: c.id, name: c.name, color: c.color ?? '#ffffff', image: c.racewear ?? c.image }))
}

function generateOdds(racers, tiers, moods) {
  return Object.fromEntries(
    racers.map(r => {
      const [min, max] = TIER_PROFILES[tiers[r.id]].oddsRange
      const shift = MOOD_PROFILES[moods[r.id]].oddsShift
      const raw = Math.min(20, Math.max(2, min + Math.random() * (max - min) + shift))
      return [r.id, +raw.toFixed(1)]
    })
  )
}

function simulateRace(racers) {
  const shuffled = [...racers].sort(() => Math.random() - 0.5)
  const tiers = {}
  shuffled.slice(0, 1).forEach(r => tiers[r.id] = 'favorite')
  shuffled.slice(1, 3).forEach(r => tiers[r.id] = 'contender')
  shuffled.slice(3, 6).forEach(r => tiers[r.id] = 'midpack')
  shuffled.slice(6).forEach(r => tiers[r.id]    = 'outsider')

  const moods = Object.fromEntries(racers.map(r => [r.id, pickMood()]))

  const profiles  = Object.fromEntries(racers.map(r => {
    const tier = TIER_PROFILES[tiers[r.id]]
    const mood = MOOD_PROFILES[moods[r.id]]
    return [r.id, {
      baseSpeed:   tier.baseSpeed  * mood.speedMult,
      decay:       tier.decay      * mood.decayMult,
      surgeChance: tier.surgeChance * mood.surgeMult,
      surgePower:  tier.surgePower,
    }]
  }))

  const stamina    = Object.fromEntries(racers.map(r => [r.id, 1.0]))
  const positions  = Object.fromEntries(racers.map(r => [r.id, 0]))
  const finishTick = {}
  const snapshots  = []

  const odds = generateOdds(racers, tiers, moods)

  for (let t = 0; t < TICKS; t++) {
    const ranked = [...racers]
      .filter(r => finishTick[r.id] === undefined)
      .sort((a, b) => positions[b.id] - positions[a.id])

    racers.forEach(r => {
      if (finishTick[r.id] !== undefined) return

      const p = profiles[r.id]
      stamina[r.id] = Math.max(0.45, stamina[r.id] - p.decay)

      const rank = ranked.findIndex(x => x.id === r.id)
      const leadPenalty = rank === 0 ? 0.25 : rank === 1 ? 0.55 : 1.0
      const adjustedSurgeChance = p.surgeChance * leadPenalty

      const surging    = Math.random() < adjustedSurgeChance
      const surgeBoost = surging ? Math.random() * p.surgePower : 0
      const noise      = Math.random() * 0.4 + 0.8

      positions[r.id] += (p.baseSpeed * stamina[r.id] + surgeBoost) * noise

      if (positions[r.id] >= 100) {
        finishTick[r.id] = t
        positions[r.id]  = 100
      }
    })
    snapshots.push({ ...positions })
  }

  const winner = racers
    .filter(r => finishTick[r.id] !== undefined)
    .sort((a, b) => finishTick[a.id] - finishTick[b.id])[0]

  return { snapshots, winnerId: winner?.id ?? racers[0].id, odds, moods }
}

// --- App + HTTP + Socket.io ---------------------------------------------------

const app        = express();
const httpServer = createServer(app);
const io         = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/auth', authRouter);

// --- Race State Machine -------------------------------------------------------

let raceState = {
  phase:     'betting',
  odds:      {},
  timeLeft:  BETTING_DURATION,
  positions: {},
  winnerId:  null,
  racers:    [],
};

let pendingSimulation = null;

function broadcastState() { io.emit('race:state', raceState); }
function emitState(socket) { socket.emit('race:state', raceState); }

async function startBettingPhase(precomputed) {
  const racers = precomputed?.racers ?? await pickRacers()
  const { snapshots, winnerId, odds, moods } = precomputed?.simulation ?? simulateRace(racers)
  pendingSimulation = { snapshots, winnerId }
  raceState = {
    phase:     'betting',
    odds,
    moods,                                                    // 👈 added
    timeLeft:  BETTING_DURATION,
    positions: Object.fromEntries(racers.map(r => [r.id, 0])),
    winnerId:  null,
    racers,
  };
  broadcastState();
  const countdown = setInterval(() => {
    raceState.timeLeft--;
    broadcastState();
    if (raceState.timeLeft <= 0) { clearInterval(countdown); startRacingPhase(); }
  }, 1000);
}

function startRacingPhase() {
  const { snapshots, winnerId } = pendingSimulation
  raceState.phase = 'racing';
  broadcastState();
  let tick = 0;
  const interval = setInterval(() => {
    const snap = snapshots[tick];
    if (snap) { raceState.positions = snap; broadcastState(); }
    tick++;
    if (tick >= TICKS) { clearInterval(interval); startResultsPhase(winnerId); }
  }, TICK_MS);
}

async function startResultsPhase(winnerId) {
  raceState.phase    = 'results';
  raceState.winnerId = winnerId;
  broadcastState();
  const nextRacers = await pickRacers()
  const nextSimulation = simulateRace(nextRacers)
  setTimeout(() => startBettingPhase({ racers: nextRacers, simulation: nextSimulation }), 5000);
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

app.use('/graphql', optionalAuth, expressMiddleware(apolloServer, {
  context: async ({ req }) => ({ trainer: req.trainer ?? null })
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