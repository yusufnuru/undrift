import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getTimeTracking, getSiteBreakdown } from '../storage';
import type { TimeTrackingEntry, SiteBreakdown } from '../mockData';
import { formatSeconds, formatDateShort, daysAgoStr, todayStr } from '../utils';

type Range = 'today' | '7d' | '30d';

const SITE_COLORS = ['#818cf8', '#34d399', '#f59e0b', '#fb7185', '#c084fc', '#67e8f9'];

const TOOLTIP_STYLE = {
  background: 'rgba(12, 12, 20, 0.95)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: '#e8e6f0',
  fontSize: 13,
  padding: '10px 14px',
};

export default function TimeTracking() {
  const [range, setRange] = useState<Range>('7d');
  const [entries, setEntries] = useState<TimeTrackingEntry[]>([]);
  const [breakdown, setBreakdown] = useState<SiteBreakdown[]>([]);

  useEffect(() => {
    const days = range === 'today' ? 0 : range === '7d' ? 6 : 29;
    getTimeTracking(daysAgoStr(days), todayStr()).then(setEntries);
    getSiteBreakdown().then(setBreakdown);
  }, [range]);

  const topSitesToday =
    range === 'today'
      ? Object.entries(
          entries.reduce<Record<string, number>>((acc, entry) => {
            acc[entry.domain] = (acc[entry.domain] || 0) + entry.seconds;
            return acc;
          }, {})
        )
          .map(([domain, seconds]) => ({
            domain,
            minutes: Math.round(seconds / 60),
          }))
          .sort((a, b) => b.minutes - a.minutes)
          .slice(0, 8)
      : [];

  const domains =
    range === 'today'
      ? topSitesToday.map((site) => site.domain)
      : [...new Set(entries.map((e) => e.domain))].slice(0, 6);

  const dateMap = new Map<string, Record<string, number>>();
  for (const e of entries) {
    if (!dateMap.has(e.date)) dateMap.set(e.date, {});
    const row = dateMap.get(e.date)!;
    row[e.domain] = (row[e.domain] || 0) + Math.round(e.seconds / 60);
  }
  const chartData =
    range === 'today'
      ? topSitesToday
      : [...dateMap.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, domainData]) => ({
            date: formatDateShort(date),
            ...domainData,
          }));

  return (
    <div className="animate-page-enter">

      <div className="flex gap-1 mb-7 bg-[rgba(255,255,255,0.03)] rounded-sm p-1 w-fit border border-border-subtle max-md:w-full">
        {([['today', 'Today'], ['7d', '7 Days'], ['30d', '30 Days']] as const).map(
          ([key, label]) => (
            <button
              key={key}
              className={`py-2 px-5 rounded-[6px] border-none text-[13px] font-medium transition-all duration-200 max-md:flex-1 max-md:text-center ${
                range === key
                  ? 'bg-accent-ember text-[#0c0c12] shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-transparent text-text-muted hover:text-text-primary'
              }`}
              onClick={() => setRange(key)}
            >
              {label}
            </button>
          )
        )}
      </div>


      <div className="bg-bg-card border border-border-card rounded-md p-6 backdrop-blur-[8px] shadow-card transition-[border-color,box-shadow] duration-300 hover:border-[rgba(255,255,255,0.1)] mb-8">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-4">
          {range === 'today' ? 'Top Sites Today' : 'Time Per Site'}
        </h3>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={320}>
            {range === 'today' ? (
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="domain"
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
                  formatter={(value) => [`${value} min`]}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar
                  dataKey="minutes"
                  fill="var(--color-accent-blue)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            ) : (
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
                  formatter={(value) => [`${value} min`]}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Legend
                  wrapperStyle={{ color: '#8b8a9e', fontSize: 12, paddingTop: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
                {domains.map((domain, i) => (
                  <Bar
                    key={domain}
                    dataKey={domain}
                    stackId="time"
                    fill={SITE_COLORS[i % SITE_COLORS.length]}
                    radius={i === domains.length - 1 ? [6, 6, 0, 0] : undefined}
                    maxBarSize={48}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>


      <div className="bg-bg-card border border-border-card rounded-md p-6 backdrop-blur-[8px] shadow-card transition-[border-color,box-shadow] duration-300 hover:border-[rgba(255,255,255,0.1)]">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-4">
          Site Breakdown
        </h3>
        {breakdown.length > 0 ? (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {['Site', 'Today', '7-Day Avg', '30-Day Total', 'Trend'].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-text-muted font-medium text-[11px] uppercase tracking-[0.06em] border-b border-border-subtle"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {breakdown.map((site) => (
                <tr key={site.domain} className="hover:bg-[rgba(255,255,255,0.02)] [&:last-child>td]:border-b-0">
                  <td className="py-3.5 px-4 border-b border-border-subtle text-text-primary font-medium">
                    {site.domain}
                  </td>
                  <td className="py-3.5 px-4 border-b border-border-subtle text-text-secondary">
                    {formatSeconds(site.todaySeconds)}
                  </td>
                  <td className="py-3.5 px-4 border-b border-border-subtle text-text-secondary">
                    {formatSeconds(site.weekAvgSeconds)}
                  </td>
                  <td className="py-3.5 px-4 border-b border-border-subtle text-text-secondary">
                    {formatSeconds(site.monthTotalSeconds)}
                  </td>
                  <td className="py-3.5 px-4 border-b border-border-subtle">
                    <span className={`font-semibold ${site.trendPercent > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
                      {site.trendPercent > 0 ? '\u2191' : '\u2193'}{' '}
                      {Math.abs(site.trendPercent)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 px-6 text-text-muted">
            <div className="text-sm leading-relaxed">No tracking data yet. Start browsing to see your stats.</div>
          </div>
        )}
      </div>
    </div>
  );
}
