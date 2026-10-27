"use client";

import { useCallback, useEffect, useState } from "react";
import {
  completeDailyMission,
  getAchievementProgress,
  getMissionProgress,
  loadEngagementState,
  recordAppVisit,
  setDreamCountries,
} from "@/lib/engagement/store";
import {
  ENGAGEMENT_EVENT,
  emptyEngagementState,
  type EngagementState,
} from "@/lib/engagement/types";

export function useEngagement(autoVisit = false) {
  // Start from the empty state so server and first client render match;
  // the effect below loads the saved state from localStorage after mount.
  const [state, setState] = useState<EngagementState>(() => emptyEngagementState());

  const refresh = useCallback(() => {
    setState(loadEngagementState());
  }, []);

  useEffect(() => {
    if (autoVisit) {
      setState(recordAppVisit());
    } else {
      refresh();
    }
    const onChange = () => refresh();
    window.addEventListener(ENGAGEMENT_EVENT, onChange);
    return () => window.removeEventListener(ENGAGEMENT_EVENT, onChange);
  }, [autoVisit, refresh]);

  const missions = getMissionProgress(state);
  const achievements = getAchievementProgress(state);

  return {
    state,
    missions,
    achievements,
    refresh,
    completeMission: (id: string) => {
      setState(completeDailyMission(id));
    },
    setDreams: (codes: string[]) => {
      setState(setDreamCountries(codes));
    },
  };
}
