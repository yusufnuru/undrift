import type { GamificationData, GamificationSessionCtx } from "./types";
import { createDefaultGamificationData, createDefaultSessionCtx } from "./engine";

export async function getGamificationData(): Promise<GamificationData> {
  const result = await chrome.storage.local.get("gamification");
  return result.gamification || createDefaultGamificationData();
}

export async function saveGamificationData(data: GamificationData): Promise<void> {
  await chrome.storage.local.set({ gamification: data });
}

export async function getSessionCtx(sessionId: string): Promise<GamificationSessionCtx> {
  const result = await chrome.storage.local.get("gamificationSessionCtx");
  const ctx = result.gamificationSessionCtx as GamificationSessionCtx | undefined;
  if (ctx && ctx.sessionId === sessionId) return ctx;
  return createDefaultSessionCtx(sessionId);
}

export async function saveSessionCtx(ctx: GamificationSessionCtx): Promise<void> {
  await chrome.storage.local.set({ gamificationSessionCtx: ctx });
}
