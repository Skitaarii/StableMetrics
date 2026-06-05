import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Characters from './pages/Characters'
import CharacterDetail from './pages/CharacterDetail'
import ScoreCalculator from './pages/ScoreCalculator'
import TrainerList from './pages/TrainerList'
import TrainerProfile from './pages/TrainerProfile'
import Gambling from './pages/Gambling'
import Login from './pages/Login'
import Register from './pages/Register'
import Terms from './pages/Terms'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/characters" element={<Characters />} />
      <Route path="/characters/:id" element={<CharacterDetail />} />
      <Route path="/score-calculator" element={<ScoreCalculator />} />
      <Route path="/trainers" element={<TrainerList />} />
      <Route path="/trainers/:id" element={<TrainerProfile />} />
      <Route path="/gambling" element={<Gambling />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/terms" element={<Terms />} />
    </Routes>
  )
}
