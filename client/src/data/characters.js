//later the horse section will be filled from api

export const CHARACTERS = [
  {
    id: 'silence-suzuka',
    name: 'Silence Suzuka',
    title: 'Otherwordle Front-Runner',
    rarity: '★★★',
    terrain: 'Turf',
    lengths: 'Mile / Medium',
    runningStyle: 'Front Runner',
    image: 'https://umamusume.com/_app/immutable/assets/gameplay_silencesuzuka.IU_hfHC5.png',
    videoId: 's2FX-kAgzaE',
    lore: 'A graceful uma musume known for her blazing front-running style. She runs as if chasing the wind itself.',
    stats: {
      speed: 90,
      stamina: 60,
      power: 70,
      guts: 50,
      wit: 75,
    },
    horseBackground: 'A legendary Japanese racehorse who dominated the 1998 season before a career-ending injury at the Japan Cup.',
    careerRecord: {
      totalRaces: 16,
      wins: 9,
      winRate: '56%',
      gradeIWins: 4,
      majorTitles: ['Takarazuka Kinen', 'Mainichi Okan', 'Sapporo Kinen'],
    },
    raceHistory: [
      { date: '1998-06-07', race: 'Mainichi Okan', distance: '1800m', position: 1 },
      { date: '1998-10-18', race: 'Takarazuka Kinen', distance: '2200m', position: 1 },
      { date: '1998-11-29', race: 'Japan Cup', distance: '2400m', position: '-' },
    ],
  },
  {
    id: 'special-week',
    name: 'Special Week',
    title: 'Supreme Commander of Japan',
    rarity: '★★★',
    terrain: 'Turf',
    lengths: 'Medium / Long',
    runningStyle: 'Pace Chaser',
    image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png',
    videoId: 's2FX-kAgzaE',
    lore: 'A hardworking uma musume with a dream of becoming the best in Japan. Her determination is unmatched.',
    stats: {
      speed: 80,
      stamina: 85,
      power: 75,
      guts: 90,
      wit: 65,
    },
    horseBackground: 'One of Japan\'s greatest racehorses, winner of three Japan Racing Association Grade I races in 1998.',
    careerRecord: {
      totalRaces: 24,
      wins: 10,
      winRate: '42%',
      gradeIWins: 6,
      majorTitles: ['Japan Cup', 'Tenno Sho (Spring)', 'Tenno Sho (Autumn)'],
    },
    raceHistory: [
      { date: '1998-05-03', race: 'Tenno Sho (Spring)', distance: '3200m', position: 1 },
      { date: '1998-10-25', race: 'Tenno Sho (Autumn)', distance: '2000m', position: 1 },
      { date: '1998-11-29', race: 'Japan Cup', distance: '2400m', position: 1 },
    ],
  },
]

export function getCharacterById(id) {
  return CHARACTERS.find((c) => c.id === id) ?? null
}
