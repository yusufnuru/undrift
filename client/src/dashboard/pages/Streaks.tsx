import { useState, useEffect } from 'react';
import { getStreaks, getCalendarData } from '../storage';
import type { StreakData } from '../mockData';

const MILESTONES = [
  { days: 3, label: 'Getting started', icon: '\u{1F331}' },
  { days: 7, label: 'One week', icon: '\u{1F525}' },
  { days: 14, label: 'Two weeks', icon: '\u26A1' },
  { days: 30, label: 'One month', icon: '\u{1F3C6}' },
  { days: 60, label: 'Two months', icon: '\u{1F48E}' },
  { days: 90, label: 'Three months', icon: '\u{1F451}' },
];

export default function Streaks() {
  const [streaks, setStreaks] = useState<StreakData | null>(null);
  const [calendar, setCalendar] = useState<{ date: string; completed: boolean }[]>([]);

  useEffect(() => {
    getStreaks().then(setStreaks);
    getCalendarData().then(setCalendar);
  }, []);

  if (!streaks) {
    return (
      <div className="flex items-center justify-center py-16 px-6 text-text-muted text-sm gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-accent-ember animate-pulse-dot" />
        <div className="w-1.5 h-1.5 rounded-full bg-accent-ember animate-pulse-dot animate-pulse-dot-2" />
        <div className="w-1.5 h-1.5 rounded-full bg-accent-ember animate-pulse-dot animate-pulse-dot-3" />
      </div>
    );
  }

  return (
    <div className="animate-page-enter">

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
        <div className="bg-bg-card border border-border-card rounded-md p-6 backdrop-blur-[8px] shadow-card transition-[border-color,box-shadow] duration-300 hover:border-[rgba(255,255,255,0.1)]">
          <div className="text-center py-8 px-8 relative overflow-hidden streak-glow">
            <div className="font-display text-[88px] font-normal text-accent-ember leading-none relative [text-shadow:0_0_60px_rgba(245,158,11,0.2)] max-md:text-[64px]">
              {streaks.currentStreak}
            </div>
            <div className="text-sm text-text-secondary mt-3 uppercase tracking-[0.1em] font-medium">
              Current streak
            </div>
          </div>
        </div>
        <div className="bg-bg-card border border-border-card rounded-md p-6 backdrop-blur-[8px] shadow-card transition-[border-color,box-shadow] duration-300 hover:border-[rgba(255,255,255,0.1)]">
          <div className="text-center py-8 px-8 relative overflow-hidden streak-glow">
            <div className="font-display text-[88px] font-normal text-accent-blue leading-none relative [text-shadow:0_0_60px_rgba(245,158,11,0.2)] max-md:text-[64px]">
              {streaks.longestStreak}
            </div>
            <div className="text-sm text-text-secondary mt-3 uppercase tracking-[0.1em] font-medium">
              Longest streak
            </div>
          </div>
        </div>
      </div>


      <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-4">
        Activity Calendar
      </h3>
      <div className="bg-bg-card border border-border-card rounded-md p-6 backdrop-blur-[8px] shadow-card transition-[border-color,box-shadow] duration-300 hover:border-[rgba(255,255,255,0.1)] mb-9">
        <div className="flex gap-[3px] flex-wrap py-1">
          {calendar.map((day) => (
            <div
              key={day.date}
              className={`w-3.5 h-3.5 rounded-[3px] transition-transform duration-150 hover:scale-[1.4] hover:z-2 hover:relative ${
                day.completed
                  ? 'bg-accent-green shadow-[0_0_6px_rgba(52,211,153,0.3)]'
                  : 'bg-[rgba(255,255,255,0.04)]'
              }`}
              title={`${day.date}: ${day.completed ? 'Completed' : 'No session'}`}
            />
          ))}
        </div>
        <div className="flex gap-5 mt-4 text-[11px] text-text-muted tracking-wide">
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-[3px] mr-1.5 align-middle bg-accent-green" />
            Completed
          </span>
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-[3px] mr-1.5 align-middle bg-[rgba(255,255,255,0.04)]" />
            No session
          </span>
        </div>
      </div>


      <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-4">
        Milestones
      </h3>
      <div className="flex gap-3 flex-wrap max-md:justify-center">
        {MILESTONES.map(({ days, label, icon }) => {
          const earned = streaks.longestStreak >= days;
          return (
            <div
              key={days}
              className={`flex flex-col items-center gap-2 py-5 px-4 rounded-md min-w-[90px] transition-all duration-300 ${
                earned
                  ? 'border border-accent-ember bg-accent-ember-glow shadow-glow-ember'
                  : 'border border-border-subtle bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              <span className={`text-2xl transition-[filter] duration-300 ${earned ? '' : 'grayscale opacity-30'}`}>
                {icon}
              </span>
              <div className={`font-display text-[28px] font-normal leading-none ${earned ? 'text-accent-ember' : 'text-text-muted'}`}>
                {days}
              </div>
              <div className={`text-[10px] uppercase tracking-[0.06em] font-medium ${earned ? 'text-text-secondary' : 'text-text-muted'}`}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
