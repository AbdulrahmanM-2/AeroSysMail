export default function CalendarPage() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const events = [
    { day: 7, title: 'Team Meeting', time: '10:00 AM', color: 'bg-aero-blue' },
    { day: 12, title: 'Client Call: Acme', time: '2:00 PM', color: 'bg-emerald-500' },
    { day: 18, title: 'Invoice Due: BrightWave', time: 'All day', color: 'bg-amber-500' },
    { day: 24, title: 'Meeting: John Maxwell', time: '2:00 PM', color: 'bg-purple-500' },
  ]
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-xl font-bold">Calendar</h1><p className="text-sm text-gray-500">April 2026</p></div>
      <div className="glass-card p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs text-gray-500 font-medium py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[0, 0, 0].map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
          {days.map(day => {
            const event = events.find(e => e.day === day)
            return (
              <div key={day} className={`aspect-square rounded-lg p-1 text-xs cursor-pointer transition-all hover:bg-white/[0.06] ${day === 6 ? 'bg-aero-blue/20 border border-aero-blue/30' : ''}`}>
                <span className={`text-xs ${day === 6 ? 'text-aero-blue font-bold' : 'text-gray-400'}`}>{day}</span>
                {event && <div className={`mt-0.5 h-1 ${event.color} rounded-full`} />}
              </div>
            )
          })}
        </div>
      </div>
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3">Upcoming Events</h3>
        <div className="space-y-3">
          {events.map((event, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-all">
              <div className={`w-1 h-8 ${event.color} rounded-full`} />
              <div>
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-gray-500">Apr {event.day} · {event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
