import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getOverviewStats } from '../storage';
import type { OverviewStats } from '../mockData';
import { formatSeconds, formatDateShort } from '../utils';

const TOOLTIP_STYLE = {
  background: 'rgba(12, 12, 20, 0.95)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: '#e8e6f0',
  fontSize: 13,
  padding: '10px 14px',
  backdropFilter: 'blur(8px)',
};

export default function Overview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    getOverviewStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-16 px-6 text-text-muted text-sm gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-accent-ember animate-pulse-dot" />
        <div className="w-1.5 h-1.5 rounded-full bg-accent-ember animate-pulse-dot animate-pulse-dot-2" />
        <div className="w-1.5 h-1.5 rounded-full bg-accent-ember animate-pulse-dot animate-pulse-dot-3" />
      </div>
    );
  }

  const chartData = stats.weeklyTrend.map((d) => ({
    date: formatDateShort(d.date),
    minutes: Math.round(d.seconds / 60),
  }));

  return (
    <div className="animate-page-enter">

      <div className="bg-bg-card border border-border-card rounded-md p-6 backdrop-blur-[8px] shadow-card transition-[border-color,box-shadow] duration-300 hover:border-[rgba(255,255,255,0.1)] mb-7">
        <div className="text-center py-12 px-8 relative overflow-hidden streak-glow">
          <div className="font-display text-[88px] font-normal text-accent-ember leading-none relative [text-shadow:0_0_60px_rgba(245,158,11,0.2)] max-md:text-[64px]">
            {stats.currentStreak}
          </div>
          <div className="text-sm text-text-secondary mt-3 uppercase tracking-[0.1em] font-medium">
            day streak
          </div>
        </div>
      </div>


      <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-4">
        Today&rsquo;s Summary
      </h3>
      <div className="grid grid-cols-3 gap-4 mb-10 max-md:grid-cols-2 max-sm:grid-cols-1">
        {[
          { icon: '\u29D7', value: formatSeconds(stats.todayScreenTime), label: 'Screen time', accent: 'text-accent-blue' },
          { icon: '\u25CE', value: stats.sessionsToday, label: 'Sessions completed', accent: 'text-accent-green' },
          { icon: '\u2694', value: stats.interruptionsResisted, label: 'Interruptions resisted', accent: 'text-accent-ember' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-bg-card border border-border-card rounded-md p-6 backdrop-blur-[8px] shadow-card transition-[border-color,box-shadow] duration-300 hover:border-[rgba(255,255,255,0.1)] text-center py-7 px-5 relative overflow-hidden stat-card-line"
          >
            <span className="text-2xl mb-3 block opacity-60">{item.icon}</span>
            <div className={`font-display text-4xl font-normal leading-tight tracking-tight ${item.accent}`}>
              {item.value}
            </div>
            <div className="text-xs text-text-muted mt-2 uppercase tracking-[0.06em] font-medium">
              {item.label}
            </div>
          </div>
        ))}
      </div>


      <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-4">
        Weekly Trend
      </h3>
      <div className="bg-bg-card border border-border-card rounded-md p-6 backdrop-blur-[8px] shadow-card transition-[border-color,box-shadow] duration-300 hover:border-[rgba(255,255,255,0.1)] mb-10">
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.2)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => [`${value} min`, 'Screen time']}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar
                dataKey="minutes"
                fill="var(--color-accent-blue)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-4">
        Quick Stats
      </h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
        {[
          { value: stats.totalSessions, label: 'Total sessions', accent: '' },
          { value: `${stats.avgSessionMinutes}m`, label: 'Avg session length', accent: 'text-accent-blue' },
          { value: `${Math.round(stats.completionRate * 100)}%`, label: 'Completion rate', accent: 'text-accent-green' },
          { value: stats.mostResistedSite, label: 'Most resisted site', accent: 'text-accent-ember', small: stats.mostResistedSite.length > 12 },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-bg-card border border-border-card rounded-md p-6 backdrop-blur-[8px] shadow-card transition-[border-color,box-shadow] duration-300 hover:border-[rgba(255,255,255,0.1)] text-center py-7 px-5 relative overflow-hidden stat-card-line"
          >
            <div
              className={`font-display font-normal text-text-heading leading-tight tracking-tight ${item.accent || 'text-text-heading'}`}
              style={{ fontSize: item.small ? 20 : 36 }}
            >
              {item.value}
            </div>
            <div className="text-xs text-text-muted mt-2 uppercase tracking-[0.06em] font-medium">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
