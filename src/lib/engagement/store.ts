"use client";

import {
  ACHIEVEMENTS,
  DAILY_MISSION_POOL,
  ENGAGEMENT_EVENT,
  emptyEngagementState,
  type DailyMissionDef,
  type EngagementState,
} from "@/lib/engagement/types";

const KEY = "eye-finder-engagement";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function notify(): void {
  window.dispatchEvent(new Event(ENGAGEMENT_EVENT));
}

function readState(): EngagementState {
  if (typeof window === "undefined") return emptyEngagementState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyEngagementState();
    return { ...emptyEngagementState(), ...JSON.parse(raw) } as EngagementState;
  } catch {
    return emptyEngagementState();
  }
}

function writeState(state: EngagementState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
  notify();
}

function unlock(state: EngagementState, id: string): EngagementState {
  if (state.achievements.includes(id)) return state;
  return { ...state, achievements: [...state.achievements, id] };
}

function withAchievements(state: EngagementState): EngagementState {
  let next = state;
  if (next.stats.analysesCompleted >= 1) next = unlock(next, "first_analysis");
  if (next.streak >= 3) next = unlock(next, "streak_3");
  if (next.streak >= 7) next = unlock(next, "streak_7");
  if (next.viewedCountryCodes.length >= 5) next = unlock(next, "explorer_5");
  if (next.stats.comparisonsDone >= 1) next = unlock(next, "comparator");
  if (next.dreamCountries.length >= 1) next = unlock(next, "dream_set");
  if (next.stats.pinsUsed >= 1) next = unlock(next, "pin_master");
  if (next.stats.sharesDone >= 1) next = unlock(next, "sharer");
  return next;
}

export function loadEngagementState(): EngagementState {
  return readState();
}

export function recordAppVisit(): EngagementState {
  const state = readState();
  const today = todayKey();
  let streak = state.streak;

  if (state.lastVisitDate === today) {
    const next = withAchievements({ ...state, totalVisits: state.totalVisits + 1 });
    writeState(next);
    return next;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (state.lastVisitDate === yesterdayKey) {
    streak = state.streak + 1;
  } else {
    streak = 1;
  }

  const next = withAchievements({
    ...state,
    streak,
    longestStreak: Math.max(state.longestStreak, streak),
    lastVisitDate: today,
    totalVisits: state.totalVisits + 1,
  });

  const withVisitMission = completeDailyMissionInternal(next, "visit_app");
  writeState(withVisitMission);
  return withVisitMission;
}

function completeDailyMissionInternal(state: EngagementState, id: string): EngagementState {
  const today = todayKey();
  const base =
    state.dailyCompleted.date === today
      ? state
      : { ...state, dailyCompleted: { date: today, ids: [] } };

  if (base.dailyCompleted.ids.includes(id)) return base;
  return {
    ...base,
    dailyCompleted: { date: today, ids: [...base.dailyCompleted.ids, id] },
  };
}

export function completeDailyMission(id: string): EngagementState {
  const next = withAchievements(completeDailyMissionInternal(readState(), id));
  writeState(next);
  return next;
}

export function recordAnalysisComplete(eyeScore: number | null): EngagementState {
  const state = readState();
  let next: EngagementState = {
    ...state,
    stats: { ...state.stats, analysesCompleted: state.stats.analysesCompleted + 1 },
  };
  if (eyeScore != null && eyeScore >= 70) next = unlock(next, "score_70");
  if (eyeScore != null && eyeScore >= 85) next = unlock(next, "score_85");
  next = withAchievements(next);
  writeState(next);
  return next;
}

export function recordCountryView(code: string): EngagementState {
  const state = readState();
  const viewed = state.viewedCountryCodes.includes(code)
    ? state.viewedCountryCodes
    : [...state.viewedCountryCodes, code];

  let next: EngagementState = {
    ...state,
    viewedCountryCodes: viewed,
    stats: {
      ...state.stats,
      countriesViewed: state.stats.countriesViewed + 1,
    },
  };
  next = completeDailyMissionInternal(next, "view_country");
  next = withAchievements(next);
  writeState(next);
  return next;
}

export function recordComparisonDone(): EngagementState {
  const state = readState();
  let next: EngagementState = {
    ...state,
    stats: { ...state.stats, comparisonsDone: state.stats.comparisonsDone + 1 },
  };
  next = completeDailyMissionInternal(next, "compare");
  next = withAchievements(next);
  writeState(next);
  return next;
}

export function recordShareDone(): EngagementState {
  const state = readState();
  let next: EngagementState = {
    ...state,
    stats: { ...state.stats, sharesDone: state.stats.sharesDone + 1 },
  };
  next = withAchievements(next);
  writeState(next);
  return next;
}

export function recordPinUsed(): EngagementState {
  const state = readState();
  let next: EngagementState = {
    ...state,
    stats: { ...state.stats, pinsUsed: Math.max(state.stats.pinsUsed, 1) },
  };
  next = completeDailyMissionInternal(next, "pin_country");
  next = withAchievements(next);
  writeState(next);
  return next;
}

export function setDreamCountries(codes: string[]): EngagementState {
  const next = withAchievements({
    ...readState(),
    dreamCountries: codes.slice(0, 3),
  });
  writeState(next);
  return next;
}

export function getTodayMissions(): DailyMissionDef[] {
  const day = new Date().getDate();
  const pool = DAILY_MISSION_POOL;
  const picks = [
    pool[day % pool.length],
    pool[(day + 2) % pool.length],
    pool[(day + 4) % pool.length],
  ];
  const unique = new Map(picks.map((m) => [m.id, m]));
  return [...unique.values()];
}

export function getMissionProgress(state: EngagementState): {
  missions: DailyMissionDef[];
  completedIds: string[];
  doneCount: number;
  total: number;
} {
  const today = todayKey();
  const missions = getTodayMissions();
  const completedIds = state.dailyCompleted.date === today ? state.dailyCompleted.ids : [];
  return {
    missions,
    completedIds,
    doneCount: missions.filter((m) => completedIds.includes(m.id)).length,
    total: missions.length,
  };
}

export function getAchievementProgress(state: EngagementState) {
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: state.achievements.includes(a.id),
  }));
}

export function resetEngagementState(): void {
  localStorage.removeItem(KEY);
  notify();
}
