import React, { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  AlarmClock, Bell, BellOff, CalendarDays, Check, ChevronDown, Clock3,
  Globe2, LayoutGrid, ListFilter, MapPin, Moon, Plus, Search, Settings,
  Sunrise, SunMedium, Trash2, Volume2, X
} from 'lucide-react'
import './styles.css'

const ZONES = [
  { id: 'local', city: 'Your location', country: 'India', zone: 'Asia/Kolkata', code: 'IST', flag: '🇮🇳', offset: 'UTC +5:30', accent: 'teal' },
  { id: 'new-york', city: 'New York', country: 'United States', zone: 'America/New_York', code: 'EST', flag: '🇺🇸', offset: 'UTC −4:00', accent: 'violet' },
  { id: 'london', city: 'London', country: 'United Kingdom', zone: 'Europe/London', code: 'GMT', flag: '🇬🇧', offset: 'UTC +1:00', accent: 'blue' },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', zone: 'Asia/Tokyo', code: 'JST', flag: '🇯🇵', offset: 'UTC +9:00', accent: 'orange' },
  { id: 'sydney', city: 'Sydney', country: 'Australia', zone: 'Australia/Sydney', code: 'AEDT', flag: '🇦🇺', offset: 'UTC +11:00', accent: 'pink' },
]

const INITIAL_ALARMS = [
  { id: 1, title: 'Morning focus', time: '07:30', zone: 'Asia/Kolkata', days: 'Mon – Fri', enabled: true },
  { id: 2, title: 'Team stand-up', time: '09:00', zone: 'Europe/London', days: 'Mon – Fri', enabled: true },
  { id: 3, title: 'Wind down', time: '22:30', zone: 'Asia/Kolkata', days: 'Every day', enabled: false },
]

const formatTime = (date, zone, hour12) => new Intl.DateTimeFormat('en-US', {
  timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12
}).format(date)

const formatHourMinute = (date, zone, hour12) => new Intl.DateTimeFormat('en-US', {
  timeZone: zone, hour: '2-digit', minute: '2-digit', hour12
}).format(date)

const getParts = (date, zone) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }).formatToParts(date)
  return Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]))
}

function AnalogClock({ date, zone }) {
  const { hour, minute, second } = getParts(date, zone)
  const secondDeg = second * 6
  const minuteDeg = minute * 6 + second * 0.1
  const hourDeg = (hour % 12) * 30 + minute * 0.5
  return (
    <div className="analog-clock" aria-label={`Analog clock for ${zone}`}>
      <div className="clock-glow" />
      {Array.from({ length: 12 }, (_, index) => <span className="clock-mark" style={{ transform: `rotate(${index * 30}deg)` }} key={index}><i /></span>)}
      <div className="hand hand-hour" style={{ transform: `rotate(${hourDeg}deg)` }} />
      <div className="hand hand-minute" style={{ transform: `rotate(${minuteDeg}deg)` }} />
      <div className="hand hand-second" style={{ transform: `rotate(${secondDeg}deg)` }} />
      <div className="clock-pin" />
    </div>
  )
}

function ZoneCard({ zone, date, hour12, active, onSelect, onRemove }) {
  const time = formatHourMinute(date, zone.zone, hour12)
  const seconds = formatTime(date, zone.zone, hour12).split(':').pop()
  return (
    <button className={`zone-card ${active ? 'active' : ''} accent-${zone.accent}`} onClick={onSelect}>
      <div className="zone-card-top"><span className="flag">{zone.flag}</span><span className="zone-code">{zone.code}</span>{zone.id !== 'local' && <span className="remove-zone" onClick={(event) => { event.stopPropagation(); onRemove(zone.id) }}><X size={14} /></span>}</div>
      <div className="zone-time">{time}<small>:{seconds}</small></div>
      <div className="zone-meta"><span>{zone.city}</span><span>{zone.offset}</span></div>
      <div className="zone-status"><span className="status-dot" /> Live now</div>
    </button>
  )
}

function App() {
  const [now, setNow] = useState(new Date())
  const [zones, setZones] = useState(ZONES)
  const [selectedId, setSelectedId] = useState('local')
  const [hour12, setHour12] = useState(false)
  const [alarms, setAlarms] = useState(INITIAL_ALARMS)
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [newAlarm, setNewAlarm] = useState({ title: '', time: '08:00', zone: 'Asia/Kolkata' })

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const selectedZone = zones.find((zone) => zone.id === selectedId) || zones[0]
  const filteredZones = useMemo(() => zones.filter((zone) => `${zone.city} ${zone.country} ${zone.code}`.toLowerCase().includes(query.toLowerCase())), [zones, query])
  const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: selectedZone.zone }).format(now)
  const localHour = getParts(now, selectedZone.zone).hour
  const greeting = localHour < 12 ? 'Good morning' : localHour < 18 ? 'Good afternoon' : 'Good evening'

  const toggleAlarm = (id) => setAlarms((current) => current.map((alarm) => alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm))
  const addAlarm = (event) => {
    event.preventDefault()
    if (!newAlarm.title.trim()) return
    setAlarms((current) => [...current, { ...newAlarm, id: Date.now(), days: 'Every day', enabled: true }])
    setNewAlarm({ title: '', time: '08:00', zone: 'Asia/Kolkata' })
    setShowAdd(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Clock3 size={21} /></div><span>tempo<span className="brand-dot">.</span></span></div>
        <div className="topbar-actions"><div className="live-pill"><span /> System live</div><button className="icon-btn" onClick={() => setShowSettings(!showSettings)} aria-label="Settings"><Settings size={19} /></button><div className="avatar">SR</div></div>
      </header>

      <main className="dashboard">
        <section className="welcome-row">
          <div><p className="eyebrow"><span className="eyebrow-line" /> WORLD CLOCK / OVERVIEW</p><h1>{greeting}, Sarvesh.</h1><p className="subtle">Your global command center for every moment that matters.</p></div>
          <div className="date-chip"><CalendarDays size={17} /><div><strong>{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(now)}</strong><span>{new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now)}</span></div></div>
        </section>

        <div className="content-grid">
          <section className="main-column">
            <div className="section-heading"><div><h2>Time zones</h2><span className="count-label">{zones.length} locations tracked</span></div><div className="heading-tools"><div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search locations..." /></div><button className="filter-btn"><ListFilter size={16} /> Filter</button><button className="add-btn" onClick={() => setShowAdd(true)}><Plus size={17} /> Add location</button></div></div>
            <div className="zones-grid">{filteredZones.map((zone) => <ZoneCard key={zone.id} zone={zone} date={now} hour12={hour12} active={zone.id === selectedId} onSelect={() => setSelectedId(zone.id)} onRemove={(id) => { setZones((current) => current.filter((item) => item.id !== id)); if (selectedId === id) setSelectedId('local') }} />)}</div>

            <div className="overview-card">
              <div className="overview-main"><div className="overview-label"><span className="selected-flag">{selectedZone.flag}</span><div><span className="eyebrow">SELECTED LOCATION</span><h2>{selectedZone.city} <span>{selectedZone.code}</span></h2></div></div><AnalogClock date={now} zone={selectedZone.zone} /></div>
              <div className="big-time">{formatTime(now, selectedZone.zone, hour12)}<div className="time-zone-label"><Globe2 size={14} /> {selectedZone.zone.replace('_', ' ')}</div></div>
              <div className="overview-footer"><span>{dateLabel}</span><span className="sun-position"><Sunrise size={15} /> Daylight · {localHour >= 6 && localHour < 18 ? 'Active' : 'Resting'}</span></div>
            </div>
          </section>

          <aside className="side-column">
            <div className="panel-title"><div><h2>Alarms</h2><span className="count-label">{alarms.filter((alarm) => alarm.enabled).length} active</span></div><button className="round-add" onClick={() => setShowAdd(true)}><Plus size={18} /></button></div>
            <div className="alarm-list">{alarms.map((alarm) => <div className={`alarm-item ${!alarm.enabled ? 'muted' : ''}`} key={alarm.id}><div className="alarm-icon"><AlarmClock size={17} /></div><div className="alarm-info"><strong>{alarm.title}</strong><span>{alarm.days} · {alarm.zone.split('/').pop().replace('_', ' ')}</span></div><div className="alarm-time">{formatHourMinute(new Date(`2024-01-01T${alarm.time}:00`), 'UTC', false)}</div><button className={`toggle ${alarm.enabled ? 'on' : ''}`} onClick={() => toggleAlarm(alarm.id)} aria-label={`Toggle ${alarm.title}`}><span /></button><button className="delete-btn" onClick={() => setAlarms((current) => current.filter((item) => item.id !== alarm.id))} aria-label={`Delete ${alarm.title}`}><Trash2 size={14} /></button></div>)}</div>
            <button className="full-add" onClick={() => setShowAdd(true)}><Plus size={15} /> Create new alarm</button>
            <div className="next-alarm"><div className="next-alarm-head"><span className="eyebrow">NEXT UP</span><Bell size={16} /></div><strong>{alarms.find((alarm) => alarm.enabled)?.title || 'No active alarms'}</strong><p>{alarms.find((alarm) => alarm.enabled) ? `Today at ${alarms.find((alarm) => alarm.enabled).time}` : 'Add an alarm to stay on schedule'}</p><div className="progress"><span /></div></div>
            <div className="settings-card"><div className="settings-title"><span><LayoutGrid size={16} /> Display</span><button onClick={() => setShowSettings(!showSettings)}><ChevronDown size={16} /></button></div><div className="setting-row"><span>24-hour time</span><button className={`toggle ${!hour12 ? 'on' : ''}`} onClick={() => setHour12(!hour12)}><span /></button></div><div className="setting-row"><span>Seconds</span><span className="setting-value"><Check size={14} /> Shown</span></div></div>
          </aside>
        </div>
      </main>

      <footer className="footer"><span><span className="footer-dot" /> All systems operational</span><span>Last synced just now · <a href="#privacy">Privacy</a></span></footer>

      {showAdd && <div className="modal-backdrop" onClick={(event) => event.target === event.currentTarget && setShowAdd(false)}><form className="modal" onSubmit={addAlarm}><div className="modal-header"><div><span className="eyebrow">SCHEDULE</span><h2>Create new alarm</h2></div><button type="button" className="icon-btn" onClick={() => setShowAdd(false)}><X size={18} /></button></div><label>Alarm name<input autoFocus required value={newAlarm.title} onChange={(event) => setNewAlarm({ ...newAlarm, title: event.target.value })} placeholder="e.g. Morning workout" /></label><div className="form-grid"><label>Time<input type="time" value={newAlarm.time} onChange={(event) => setNewAlarm({ ...newAlarm, time: event.target.value })} /></label><label>Time zone<select value={newAlarm.zone} onChange={(event) => setNewAlarm({ ...newAlarm, zone: event.target.value })}>{ZONES.map((zone) => <option value={zone.zone} key={zone.id}>{zone.city} ({zone.code})</option>)}</select></label></div><button className="add-btn modal-submit" type="submit"><Bell size={16} /> Save alarm</button></form></div>}
    </div>
  )
}

export default App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
