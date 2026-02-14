// Types used by dashboard pages.
// Mock data kept for reference but no longer used as fallback —
// the dashboard reads live data from chrome.storage.

export interface TimeTrackingEntry {
  date: string;
  domain: string;
  seconds: number;
}

export interface Session {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  blockedSites: string[];
  endReason: 'timer' | 'manual' | 'browser_closed';
  completed: boolean;
  interruptions: Interruption[];
}

export interface Interruption {
  timestamp: string;
  domain: string;
  outcome: 'stayed' | 'broke';
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  streakStartDate: string;
}

export interface OverviewStats {
  currentStreak: number;
  todayScreenTime: number;
  sessionsToday: number;
  interruptionsResisted: number;
  weeklyTrend: { date: string; seconds: number }[];
  totalSessions: number;
  avgSessionMinutes: number;
  completionRate: number;
  mostResistedSite: string;
}

export interface Settings {
  personalReason: string;
  notificationPrefs: {
    streakMilestone: boolean;
    streakAtRisk: boolean;
    streakBroken: boolean;
    timeLimit: boolean;
    dailySummary: boolean;
  };
}

export interface SiteBreakdown {
  domain: string;
  todaySeconds: number;
  weekAvgSeconds: number;
  monthTotalSeconds: number;
  trendPercent: number;
}
