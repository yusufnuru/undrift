import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getSessions } from '../storage';
import type { Session } from '../mockData';
import { formatDate, formatTime, formatSeconds } from '../utils';

const PAGE_SIZE = 10;

const TOOLTIP_STYLE = {
  background: 'rgba(12, 12, 20, 0.95)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: '#e8e6f0',
  fontSize: 13,
  padding: '10px 14px',
};

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getSessions(page, PAGE_SIZE).then((data) => {
      setSessions(data.sessions);
      setTotal(data.total);
    });
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const completionData = sessions.map((_s, i) => {
    const prior = sessions.slice(0, i + 1);
    const rate = prior.filter((p) => p.completed).length / prior.length;
    return {
      index: i + 1,
      rate: Math.round(rate * 100),
    };
  });

  return (
    <div className="animate-page-enter">

      <div className="bg-bg-card border border-border-card rounded-md p-6 backdrop-blur-[8px] shadow-card transition-[border-color,box-shadow] duration-300 hover:border-[rgba(255,255,255,0.1)] mb-8">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-4">
          Completion Rate Trend
        </h3>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="index"
                stroke="rgba(255,255,255,0.2)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                fontSize={12}
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => [`${value}%`, 'Completion rate']}
                cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--color-accent-green)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: 'var(--color-accent-green)', stroke: 'var(--color-bg-primary)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>


      <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-4">
        Session History
      </h3>
      {sessions.length > 0 ? (
        sessions.map((session) => {
          const isExpanded = expandedId === session.id;
          return (
            <div
              key={session.id}
              className="border border-border-subtle rounded-md mb-2.5 overflow-hidden bg-bg-card backdrop-blur-[8px] transition-[border-color] duration-200 hover:border-[rgba(255,255,255,0.1)]"
            >
              <div
                className="flex justify-between items-center py-4 px-5 cursor-pointer transition-colors duration-150 hover:bg-[rgba(255,255,255,0.02)] max-md:flex-col max-md:gap-2.5 max-md:items-start"
                onClick={() => setExpandedId(isExpanded ? null : session.id)}
              >
                <div>
                  <span className="font-medium text-text-primary">{formatDate(session.startedAt)}</span>
                  <span className="text-text-muted ml-2.5 text-[13px]">{formatTime(session.startedAt)}</span>
                </div>
                <div className="flex gap-5 items-center text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">{session.durationMinutes}m</span>
                  <span className="flex items-center gap-1.5">{session.blockedSites.length} sites</span>
                  <span className="flex items-center gap-1.5">{session.interruptions.length} interruptions</span>
                  <span
                    className={`inline-flex items-center py-1 px-3 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                      session.completed
                        ? 'bg-accent-green-dim text-accent-green'
                        : 'bg-accent-ember-dim text-accent-ember'
                    }`}
                  >
                    {session.completed ? 'Completed' : 'Ended early'}
                  </span>
                  <span className={`text-text-muted text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    &#9662;
                  </span>
                </div>
              </div>
              {isExpanded && (
                <div className="py-4 px-5 bg-[rgba(0,0,0,0.2)] border-t border-border-subtle text-[13px]">
                  <div className="flex gap-6 flex-wrap mb-4 text-text-secondary">
                    <span><strong className="text-text-primary font-medium">Duration:</strong> {formatSeconds(session.durationMinutes * 60)}</span>
                    <span><strong className="text-text-primary font-medium">End reason:</strong> {session.endReason}</span>
                    <span><strong className="text-text-primary font-medium">Sites:</strong> {session.blockedSites.join(', ')}</span>
                  </div>
                  {session.interruptions.length > 0 ? (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          {['Time', 'Site', 'Outcome'].map((h) => (
                            <th
                              key={h}
                              className="text-left py-2 px-3 text-text-muted font-medium text-[10px] uppercase tracking-wide border-b border-border-subtle"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {session.interruptions.map((intr, i) => (
                          <tr key={i}>
                            <td className="py-2 px-3 text-xs text-text-secondary border-b border-[rgba(255,255,255,0.03)]">
                              {formatTime(intr.timestamp)}
                            </td>
                            <td className="py-2 px-3 text-xs text-text-secondary border-b border-[rgba(255,255,255,0.03)]">
                              {intr.domain}
                            </td>
                            <td className="py-2 px-3 text-xs border-b border-[rgba(255,255,255,0.03)]">
                              <span
                                className={`inline-flex items-center py-1 px-3 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                                  intr.outcome === 'stayed'
                                    ? 'bg-accent-green-dim text-accent-green'
                                    : 'bg-accent-red-dim text-accent-red'
                                }`}
                              >
                                {intr.outcome}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-text-muted text-[13px]">
                      No interruptions during this session.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="bg-bg-card border border-border-card rounded-md p-6 backdrop-blur-[8px] shadow-card">
          <div className="text-center py-12 px-6 text-text-muted">
            <div className="text-sm leading-relaxed">No sessions yet. Start a focus session to see your history.</div>
          </div>
        </div>
      )}


      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-7">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="py-2 px-4.5 rounded-sm border border-border-card bg-bg-card text-text-secondary text-[13px] font-medium transition-all duration-200 hover:enabled:bg-[rgba(255,255,255,0.06)] hover:enabled:text-text-primary hover:enabled:border-[rgba(255,255,255,0.12)] disabled:opacity-30 disabled:cursor-default"
          >
            Previous
          </button>
          <span className="text-xs text-text-muted tracking-wide">
            {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="py-2 px-4.5 rounded-sm border border-border-card bg-bg-card text-text-secondary text-[13px] font-medium transition-all duration-200 hover:enabled:bg-[rgba(255,255,255,0.06)] hover:enabled:text-text-primary hover:enabled:border-[rgba(255,255,255,0.12)] disabled:opacity-30 disabled:cursor-default"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
