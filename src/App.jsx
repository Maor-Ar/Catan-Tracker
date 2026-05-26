import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import wheatImg from './assets/wheat.jpeg'
import oreImg from './assets/ore.jpeg'
import brickImg from './assets/brik.jpeg'
import sheepImg from './assets/sheep.jpeg'

const STORAGE_KEY = 'catan-tracker:wins:v1'

function loadStoredWins(players) {
  const empty = Object.fromEntries(players.map((p) => [p.id, 0]))
  if (typeof window === 'undefined') return empty
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw)
    return Object.fromEntries(
      players.map((p) => {
        const v = parsed?.[p.id]
        return [p.id, Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0]
      })
    )
  } catch {
    return empty
  }
}

function saveWins(wins) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wins))
  } catch {
    /* ignore quota / privacy errors */
  }
}

const INITIAL_PLAYERS = [
  {
    id: 'neriya',
    name: 'Neriya Zudi',
    resource: 'Wheat',
    image: wheatImg,
    accent: '#f39c12',
    accentDeep: '#b9750a',
    glow: 'rgba(243, 156, 18, 0.55)',
  },
  {
    id: 'eliko',
    name: 'Eliko Hubara',
    resource: 'Ore',
    image: oreImg,
    accent: '#2980b9',
    accentDeep: '#1c5980',
    glow: 'rgba(41, 128, 185, 0.55)',
  },
  {
    id: 'tal',
    name: 'Tal Halevi',
    resource: 'Brick',
    image: brickImg,
    accent: '#e74c3c',
    accentDeep: '#a52a1d',
    glow: 'rgba(231, 76, 60, 0.55)',
  },
  {
  id: 'maor',
  name: 'Maor Arnon',
  resource: 'Sheep',
  image: sheepImg,
  accent: '#27ae60',
  accentDeep: '#1e8449',
  glow: 'rgba(39, 174, 96, 0.55)',
}
]

function App() {
  const [wins, setWins] = useState(() => loadStoredWins(INITIAL_PLAYERS))
  const [pulseId, setPulseId] = useState(null)

  useEffect(() => {
    saveWins(wins)
  }, [wins])

  const totals = useMemo(() => {
    const total = Object.values(wins).reduce((a, b) => a + b, 0)
    const leaderId = Object.entries(wins).reduce(
      (best, [id, count]) => (count > best[1] ? [id, count] : best),
      [null, 0]
    )[0]
    return { total, leaderId: total > 0 ? leaderId : null }
  }, [wins])

  const handleChange = (id, delta) => {
    setWins((prev) => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta),
    }))
    if (delta !== 0) {
      setPulseId(`${id}-${Date.now()}`)
    }
  }

  const handleResetAll = () => {
    setWins(Object.fromEntries(INITIAL_PLAYERS.map((p) => [p.id, 0])))
  }

  return (
    <div className="relative min-h-svh overflow-hidden">
      <CatanMapBackground />
      <div className="charter-vignette" aria-hidden />
      <div className="charter-grain" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col px-4 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        <Header total={totals.total} onReset={handleResetAll} />

        <main className="mt-8 flex-1 sm:mt-12">
          <div className="grid gap-6 sm:gap-7 md:grid-cols-2 xl:grid-cols-3">
            {INITIAL_PLAYERS.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                wins={wins[player.id]}
                isLeader={totals.leaderId === player.id}
                pulseKey={pulseId?.startsWith(player.id) ? pulseId : null}
                onIncrement={() => handleChange(player.id, +1)}
                onDecrement={() => handleChange(player.id, -1)}
                index={index}
              />
            ))}
          </div>

          <LeaderboardBar players={INITIAL_PLAYERS} wins={wins} />
        </main>

        <Footer />
      </div>
    </div>
  )
}

function Header({ total, onReset }) {
  return (
    <header className="relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex flex-col items-center text-center"
      >
        <div className="flex items-center gap-2 text-catan-tan/85 sm:gap-3">
          <CompassRose className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-display text-[10px] uppercase tracking-[0.32em] sm:text-xs sm:tracking-[0.5em]">
            Settlers Chronicle
          </span>
          <CompassRose className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        <h1 className="mt-3 font-display text-[2.25rem] font-bold leading-[1.05] tracking-tight sm:mt-4 sm:text-6xl md:text-7xl">
          <span className="gold-shimmer">Catan Victory Tracker</span>
        </h1>

        <p className="mt-3 max-w-xl px-2 text-xs italic text-catan-tan/85 sm:mt-4 sm:text-base">
          Every Thursday, there's that moment...
        </p>

        <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
          <StatPill label="Games Played" value={total} />
          <button
            onClick={onReset}
            className="group inline-flex items-center gap-2 rounded-full border border-catan-tan/25 bg-black/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-catan-tan/90 backdrop-blur-md transition hover:border-catan-red/60 hover:bg-catan-red/15 hover:text-catan-tan sm:px-5 sm:py-2.5 sm:text-xs"
          >
            <ResetIcon className="h-3.5 w-3.5 transition group-hover:rotate-180" />
            Reset Chronicle
          </button>
        </div>
      </motion.div>
    </header>
  )
}

function StatPill({ label, value }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-catan-tan/25 bg-black/30 px-4 py-2 backdrop-blur-md sm:gap-3 sm:px-5 sm:py-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-catan-tan/70 sm:text-xs">
        {label}
      </span>
      <motion.span
        key={value}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="font-display text-base font-bold text-catan-tan sm:text-lg"
      >
        {value}
      </motion.span>
    </div>
  )
}

function PlayerCard({
  player,
  wins,
  isLeader,
  pulseKey,
  onIncrement,
  onDecrement,
  index,
}) {
  const cardBackground = `
    linear-gradient(135deg, ${player.accent}26 0%, ${player.accent}0d 45%, rgba(8, 12, 24, 0.55) 100%),
    radial-gradient(ellipse at top, ${player.accent}1f 0%, transparent 70%),
    rgba(12, 18, 32, 0.55)
  `

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 0.15 * index,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{ y: -6 }}
      className="grain group relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl sm:p-7"
      style={{
        background: cardBackground,
        borderColor: `${player.accent}40`,
        boxShadow: isLeader
          ? `0 30px 70px -18px ${player.glow}, 0 0 0 1px ${player.accent}80, inset 0 1px 0 ${player.accent}55`
          : `0 25px 60px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${player.accent}, transparent)`,
          boxShadow: `0 0 18px ${player.accent}`,
        }}
      />

      <AnimatePresence>
        {isLeader && (
          <motion.div
            initial={{ opacity: 0, y: -10, rotate: -10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-catan-yellow shadow-lg backdrop-blur sm:right-5 sm:top-5 sm:px-3 sm:py-1.5 sm:text-[10px]"
          >
            <CrownIcon className="h-3 w-3" />
            Reigning
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col items-center gap-3 text-center sm:gap-4">
        <div
          className="relative h-16 w-16 overflow-hidden rounded-2xl sm:h-20 sm:w-20"
          style={{
            border: `2px solid ${player.accent}`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.5), 0 14px 32px -10px ${player.glow}, 0 0 0 4px rgba(0,0,0,0.18)`,
          }}
        >
          <img
            src={player.image}
            alt={`${player.resource} — ${player.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.18) 100%)',
            }}
          />
        </div>
        <h2
          className="w-full truncate font-display text-2xl font-bold leading-tight text-catan-tan sm:text-3xl md:text-[34px]"
          title={player.name}
        >
          {player.name}
        </h2>
      </header>

      <div className="relative my-5 flex items-center justify-center sm:my-6">
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl opacity-25 blur-2xl"
          style={{ background: player.accent }}
        />
        <div className="relative flex flex-col items-center">
          <span className="font-display text-[10px] uppercase tracking-[0.35em] text-catan-tan/60 sm:text-[11px] sm:tracking-[0.4em]">
            Victories
          </span>
          <div className="relative h-24 w-28 sm:h-28 sm:w-32">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={wins}
                initial={{ y: 40, opacity: 0, scale: 0.6, rotateX: -90 }}
                animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ y: -40, opacity: 0, scale: 0.6, rotateX: 90 }}
                transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                className="absolute inset-0 flex items-center justify-center font-display text-6xl font-black tabular-nums text-white sm:text-7xl"
                style={{
                  textShadow: `0 4px 18px ${player.glow}, 0 0 1px rgba(0,0,0,0.4)`,
                }}
              >
                {wins}
              </motion.span>
            </AnimatePresence>
            {pulseKey && (
              <motion.span
                key={pulseKey}
                initial={{ scale: 1, opacity: 0.55 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{ boxShadow: `inset 0 0 0 2px ${player.accent}` }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <CounterButton
          variant="decrement"
          accent={player.accent}
          onClick={onDecrement}
          disabled={wins === 0}
          label={`Decrement ${player.name}`}
        />

        <RobberIcon
          color={player.accent}
          className="h-11 w-11 sm:h-12 sm:w-12"
          aria-label={`${player.name}'s robber token`}
        />

        <CounterButton
          variant="increment"
          accent={player.accent}
          accentDeep={player.accentDeep}
          onClick={onIncrement}
          label={`Increment ${player.name}`}
        />
      </div>
    </motion.article>
  )
}

function CounterButton({ variant, accent, accentDeep, onClick, disabled, label }) {
  const isInc = variant === 'increment'
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      whileTap={{ scale: 0.88 }}
      whileHover={disabled ? {} : { scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className="group relative flex h-16 w-16 items-center justify-center rounded-2xl font-display text-3xl font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-30 sm:h-14 sm:w-14 sm:text-2xl"
      style={{
        background: isInc
          ? `linear-gradient(135deg, ${accent}, ${accentDeep})`
          : 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(0,0,0,0.35))',
        boxShadow: isInc
          ? `0 14px 30px -10px ${accent}, inset 0 1px 0 rgba(255,255,255,0.35)`
          : '0 12px 30px -10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
        border: isInc ? 'none' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span className="relative z-10">{isInc ? '+' : '−'}</span>
      <span
        aria-hidden
        className="absolute inset-0 rounded-2xl bg-white opacity-0 transition group-hover:opacity-20"
      />
    </motion.button>
  )
}

function LeaderboardBar({ players, wins }) {
  const total = Object.values(wins).reduce((a, b) => a + b, 0)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="mt-10 rounded-3xl border border-white/10 bg-black/35 p-5 backdrop-blur-xl sm:mt-12 sm:p-7"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 sm:mb-5">
        <h2 className="font-display text-[11px] uppercase tracking-[0.32em] text-catan-tan/75 sm:text-xs sm:tracking-[0.4em]">
          Path to Victory
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-catan-tan/55 sm:text-[11px]">
          Share of glory
        </span>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {players.map((player) => {
          const count = wins[player.id]
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={player.id} className="flex items-center gap-3 sm:gap-4">
              <span className="w-24 shrink-0 truncate text-xs font-semibold text-catan-tan/90 sm:w-32 sm:text-sm">
                {player.name}
              </span>
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-black/55 sm:h-3">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${player.accent}, ${player.accent}aa)`,
                    boxShadow: `0 0 16px ${player.glow}`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                />
              </div>
              <span className="w-8 text-right font-display text-xs font-bold tabular-nums text-catan-tan sm:w-10 sm:text-sm">
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}

function Footer() {
  return (
    <footer className="mt-12 flex flex-col items-center gap-4 px-2 text-center sm:mt-16 sm:gap-5">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="h-px w-10 bg-catan-tan/25 sm:w-16" />
        <CompassRose className="h-4 w-4 text-catan-tan/50" />
        <span className="h-px w-10 bg-catan-tan/25 sm:w-16" />
      </div>
      <CatanDice className="h-12 w-auto sm:h-16 md:h-20" />
      <p
        className="break-words font-display text-base font-extrabold uppercase tracking-[0.18em] sm:text-2xl sm:tracking-[0.24em] md:text-3xl md:tracking-[0.28em]"
        style={{
          color: '#f5e6c8',
          textShadow:
            '0 1px 0 rgba(0,0,0,0.45), 0 2px 18px rgba(0,0,0,0.55)',
        }}
      >
        May the dice favor you.
      </p>
    </footer>
  )
}

/* ----------------------------- Catan Map ----------------------------- */
/* Hand-composed SVG: vibrant sunset sky + low sun + classic 19-hex     */
/* island (3-4-5-4-3) ringed by 18 ocean hexes + number tokens.          */
/* Rendered fixed, behind app content.                                   */

const HEX_R = 50
const HEX_W = Math.sqrt(3) * HEX_R // ~86.6
const HEX_H = 2 * HEX_R // 100
const ROW_DY = 1.5 * HEX_R // 75
const CENTER_X = 500
const CENTER_Y = 410

const hexPoints = (() => {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90)
    pts.push(`${(HEX_R * Math.cos(angle)).toFixed(2)},${(HEX_R * Math.sin(angle)).toFixed(2)}`)
  }
  return pts.join(' ')
})()

const TILE_PALETTE = {
  wheat: { top: '#e9b341', bot: '#a87420' },
  sheep: { top: '#b6d77a', bot: '#6e9437' },
  wood: { top: '#4e8a4a', bot: '#23532a' },
  brick: { top: '#c96a45', bot: '#7a3320' },
  ore: { top: '#7a818e', bot: '#3d434e' },
  desert: { top: '#dfc187', bot: '#a08249' },
  ocean: { top: '#2f6da8', bot: '#0f2a4a' },
}

const LAND_LAYOUT = [
  { row: 0, items: ['ore', 'sheep', 'wood'] },
  { row: 1, items: ['wheat', 'brick', 'sheep', 'brick'] },
  { row: 2, items: ['wheat', 'wood', 'desert', 'wood', 'ore'] },
  { row: 3, items: ['wood', 'ore', 'wheat', 'sheep'] },
  { row: 4, items: ['brick', 'wheat', 'sheep'] },
]

const NUMBER_LAYOUT = [
  [10, 2, 9],
  [12, 6, 4, 10],
  [9, 11, null, 3, 8],
  [8, 3, 4, 5],
  [5, 6, 11],
]

function rowOffsets(count) {
  const start = -((count - 1) / 2) * HEX_W
  return Array.from({ length: count }, (_, i) => start + i * HEX_W)
}

function landPositions() {
  const tiles = []
  LAND_LAYOUT.forEach(({ row, items }) => {
    const offsets = rowOffsets(items.length)
    const y = CENTER_Y + (row - 2) * ROW_DY
    items.forEach((type, i) => {
      tiles.push({
        cx: CENTER_X + offsets[i],
        cy: y,
        type,
        number: NUMBER_LAYOUT[row][i],
      })
    })
  })
  return tiles
}

function oceanPositions() {
  const tiles = []
  const rowSizes = [4, 5, 6, 7, 6, 5, 4]
  rowSizes.forEach((size, idx) => {
    const row = idx - 1
    const y = CENTER_Y + (row - 2) * ROW_DY
    const offsets = rowOffsets(size)
    const landSize = LAND_LAYOUT[row]?.items.length ?? 0
    offsets.forEach((dx, i) => {
      if (row >= 0 && row <= 4) {
        const leftLandEdge = (size - landSize) / 2
        if (i >= leftLandEdge && i < leftLandEdge + landSize) return
      }
      tiles.push({ cx: CENTER_X + dx, cy: y, type: 'ocean' })
    })
  })
  return tiles
}

function Hex({ cx, cy, type, label, isHighTile }) {
  const { top, bot } = TILE_PALETTE[type]
  const gradId = `tile-${type}`
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <polygon
        points={hexPoints}
        fill={`url(#${gradId})`}
        stroke="rgba(20, 8, 4, 0.55)"
        strokeWidth="1.2"
      />
      <polygon
        points={hexPoints}
        fill="url(#tileSheen)"
        opacity="0.35"
      />
      {label != null && (
        <g>
          <circle r="15" fill="#f5e6c8" stroke="#7a5a30" strokeWidth="1.2" />
          <circle r="13" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            y="0.5"
            fontFamily="Cinzel, serif"
            fontWeight="800"
            fontSize={isHighTile ? '15' : '14'}
            fill={isHighTile ? '#b6321c' : '#2b1810'}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  )
}

function CatanMapBackground() {
  const land = landPositions()
  const ocean = oceanPositions()

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <svg
        className="h-full w-full"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Sunset sky */}
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a0a35" />
            <stop offset="18%" stopColor="#4a1f5c" />
            <stop offset="38%" stopColor="#a8395a" />
            <stop offset="58%" stopColor="#e8744e" />
            <stop offset="74%" stopColor="#f4b860" />
            <stop offset="88%" stopColor="#b85a3a" />
            <stop offset="100%" stopColor="#3a1a30" />
          </linearGradient>

          <radialGradient id="sunGlow" cx="50%" cy="62%" r="55%">
            <stop offset="0%" stopColor="#fff1b8" stopOpacity="0.85" />
            <stop offset="30%" stopColor="#ffb86b" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#ff6b35" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="sunDisc" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8dc" />
            <stop offset="55%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#ff8a3d" />
          </radialGradient>

          {/* Tile gradients */}
          {Object.entries(TILE_PALETTE).map(([key, { top, bot }]) => (
            <linearGradient
              key={key}
              id={`tile-${key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={top} />
              <stop offset="100%" stopColor={bot} />
            </linearGradient>
          ))}

          {/* Subtle highlight pass on every tile */}
          <linearGradient id="tileSheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
          </linearGradient>

          {/* Soft halo behind the island */}
          <radialGradient id="islandHalo" cx="50%" cy="50%" r="45%">
            <stop offset="0%" stopColor="rgba(255, 184, 90, 0.35)" />
            <stop offset="60%" stopColor="rgba(255, 110, 60, 0.12)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>

          {/* Drop shadow for tiles */}
          <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="3" result="off" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky */}
        <rect width="1000" height="800" fill="url(#sky)" />
        <rect width="1000" height="800" fill="url(#sunGlow)" />

        {/* Sun on the horizon */}
        <g className="sun-pulse" transform="translate(500, 480)">
          <circle r="120" fill="url(#sunGlow)" opacity="0.7" />
          <circle r="62" fill="url(#sunDisc)" opacity="0.92" />
        </g>

        {/* Distant cloud streaks */}
        <g opacity="0.35">
          <ellipse cx="240" cy="300" rx="180" ry="10" fill="#ffd9a8" />
          <ellipse cx="760" cy="280" rx="220" ry="8" fill="#ffd9a8" />
          <ellipse cx="500" cy="220" rx="320" ry="6" fill="#ffe0b8" opacity="0.7" />
          <ellipse cx="200" cy="180" rx="120" ry="5" fill="#ffe0b8" opacity="0.6" />
          <ellipse cx="820" cy="200" rx="140" ry="5" fill="#ffe0b8" opacity="0.6" />
        </g>

        {/* Halo behind island */}
        <ellipse
          cx={CENTER_X}
          cy={CENTER_Y + 10}
          rx="360"
          ry="280"
          fill="url(#islandHalo)"
        />

        {/* Ocean ring */}
        <g filter="url(#tileShadow)">
          {ocean.map((t, i) => (
            <Hex key={`o-${i}`} cx={t.cx} cy={t.cy} type={t.type} />
          ))}
        </g>

        {/* Land tiles */}
        <g filter="url(#tileShadow)">
          {land.map((t, i) => (
            <Hex
              key={`l-${i}`}
              cx={t.cx}
              cy={t.cy}
              type={t.type}
              label={t.number}
              isHighTile={t.number === 6 || t.number === 8}
            />
          ))}
        </g>

        {/* Foreground darkening so cards stay readable */}
        <rect
          width="1000"
          height="800"
          fill="url(#sky)"
          opacity="0.18"
          style={{ mixBlendMode: 'multiply' }}
        />
      </svg>
    </div>
  )
}

/* ----------------------------- Icons ----------------------------- */

function CompassRose({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3 L13.5 12 L12 21 L10.5 12 Z" fill="currentColor" />
      <path d="M3 12 L12 10.5 L21 12 L12 13.5 Z" fill="currentColor" />
    </svg>
  )
}

function CrownIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 7l4 5 5-7 5 7 4-5v11H3V7zm0 13h18v2H3z" />
    </svg>
  )
}

function ResetIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  )
}


/* The Robber — minimalist silhouette modeled after the 3D Catan figurine in
   src/assets/rober.jpeg. Stocky pawn with a wide fedora, eye mask, hands
   clasped at chest, and a heavy cloak resting on a circular base. The whole
   silhouette is tinted with the player's accent color. */
function RobberIcon({ className, color, ...rest }) {
  const safe = color.replace('#', '')
  const bodyId = `robber-body-${safe}`
  const headId = `robber-head-${safe}`
  return (
    <svg
      viewBox="0 0 64 80"
      className={className}
      role="img"
      {...rest}
    >
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="65%" stopColor={color} stopOpacity="0.92" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id={headId} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="32" cy="73" rx="20" ry="2.6" fill={color} opacity="0.25" />

      {/* Base disc */}
      <ellipse
        cx="32"
        cy="70"
        rx="18"
        ry="3.2"
        fill={color}
        opacity="0.85"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="0.7"
      />

      {/* Cloak / body — chunky pear shape */}
      <path
        d="M20 28
           C 14 31, 11 38, 11 47
           C 11 55, 12.5 62, 14 67
           C 14.5 69, 16 70, 18 70
           L 46 70
           C 48 70, 49.5 69, 50 67
           C 51.5 62, 53 55, 53 47
           C 53 38, 50 31, 44 28 Z"
        fill={`url(#${bodyId})`}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* Hands clasped at chest */}
      <ellipse
        cx="24"
        cy="42"
        rx="4.2"
        ry="4.6"
        fill={`url(#${bodyId})`}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="0.8"
      />
      <ellipse
        cx="40"
        cy="42"
        rx="4.2"
        ry="4.6"
        fill={`url(#${bodyId})`}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="0.8"
      />

      {/* Head */}
      <ellipse
        cx="32"
        cy="22"
        rx="9"
        ry="8.5"
        fill={`url(#${headId})`}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="0.7"
      />

      {/* Hat brim */}
      <ellipse
        cx="32"
        cy="14"
        rx="15"
        ry="2.8"
        fill={color}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="0.8"
      />

      {/* Hat crown */}
      <path
        d="M25 14
           L 25 7
           Q 25 4 28.5 4
           L 35.5 4
           Q 39 4 39 7
           L 39 14 Z"
        fill={color}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* Hatband — darker pinstripe */}
      <rect x="25" y="11.5" width="14" height="1.6" fill="rgba(0,0,0,0.55)" />

      {/* Eye mask — long horizontal bar with two eye notches */}
      <path
        d="M24.5 22
           Q 24.5 19.5 27 19.5
           L 37 19.5
           Q 39.5 19.5 39.5 22
           Q 39.5 23.8 37.5 23.8
           L 26.5 23.8
           Q 24.5 23.8 24.5 22 Z"
        fill="rgba(15,8,4,0.78)"
      />
      {/* Mask reflections */}
      <ellipse cx="28" cy="21.6" rx="1.3" ry="0.7" fill="rgba(255,255,255,0.35)" />
      <ellipse cx="36" cy="21.6" rx="1.3" ry="0.7" fill="rgba(255,255,255,0.35)" />
    </svg>
  )
}

/* Two red Catan dice with golden pips — modeled after the reference render. */
function CatanDice({ className }) {
  return (
    <svg viewBox="0 0 170 110" className={className} aria-hidden>
      <defs>
        {/* Face gradient: brighter top-left, deepening to bottom-right. */}
        <linearGradient id="dice-face" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#f56a55" />
          <stop offset="45%" stopColor="#d8392a" />
          <stop offset="100%" stopColor="#7d1e14" />
        </linearGradient>
        {/* Top gloss — a soft white band along the upper edge. */}
        <linearGradient id="dice-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="40%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* Right-edge darken to fake a beveled corner. */}
        <linearGradient id="dice-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="black" stopOpacity="0" />
          <stop offset="80%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.35" />
        </linearGradient>
        {/* Pip — yellow with a small inset highlight + dark rim. */}
        <radialGradient id="pip" cx="32%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#fff5b3" />
          <stop offset="55%" stopColor="#f1c40f" />
          <stop offset="100%" stopColor="#8a6608" />
        </radialGradient>
        {/* Soft ground shadow under each die. */}
        <radialGradient id="ground-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="black" stopOpacity="0.55" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground shadows behind both dice */}
      <ellipse cx="42" cy="92" rx="32" ry="6" fill="url(#ground-shadow)" />
      <ellipse cx="120" cy="94" rx="32" ry="6" fill="url(#ground-shadow)" />

      {/* Die 1 — shows 5 */}
      <g transform="translate(15 18) rotate(-8 27 27)">
        <rect
          width="54"
          height="54"
          rx="11"
          fill="url(#dice-face)"
          stroke="#4a1108"
          strokeWidth="1.3"
        />
        <rect width="54" height="54" rx="11" fill="url(#dice-gloss)" />
        <rect width="54" height="54" rx="11" fill="url(#dice-edge)" />
        {/* Pip rims + pips for the "5" face */}
        {[
          [13, 13],
          [41, 13],
          [27, 27],
          [13, 41],
          [41, 41],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy + 0.6} r="4.5" fill="#3a0a05" opacity="0.55" />
            <circle cx={cx} cy={cy} r="4.4" fill="url(#pip)" />
          </g>
        ))}
      </g>

      {/* Die 2 — shows 5 */}
      <g transform="translate(93 22) rotate(7 27 27)">
        <rect
          width="54"
          height="54"
          rx="11"
          fill="url(#dice-face)"
          stroke="#4a1108"
          strokeWidth="1.3"
        />
        <rect width="54" height="54" rx="11" fill="url(#dice-gloss)" />
        <rect width="54" height="54" rx="11" fill="url(#dice-edge)" />
        {[
          [13, 13],
          [41, 13],
          [27, 27],
          [13, 41],
          [41, 41],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy + 0.6} r="4.5" fill="#3a0a05" opacity="0.55" />
            <circle cx={cx} cy={cy} r="4.4" fill="url(#pip)" />
          </g>
        ))}
      </g>
    </svg>
  )
}

export default App
