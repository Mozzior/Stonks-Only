import { supabase } from "../utils/supabase";
import type {
  CreateTrainingSessionPayload,
  TrainingSessionSummaryPayload,
  TrainingTradeLogPayload,
} from "../types/training";

export async function createSession(payload: CreateTrainingSessionPayload) {
  return supabase
    .from("training_session")
    .insert({
      ...payload,
      meta: payload.meta ?? {},
    })
    .select("id")
    .single();
}

export async function finishSession(
  sessionId: number,
  summary: TrainingSessionSummaryPayload,
) {
  return supabase
    .from("training_session")
    .update(summary)
    .eq("id", sessionId)
    .select("id")
    .single();
}

export async function appendTradeLog(payload: TrainingTradeLogPayload) {
  return supabase
    .from("training_trade_log")
    .insert({
      ...payload,
      fee: payload.fee ?? 0,
      position_after: payload.position_after ?? {},
      extra: payload.extra ?? {},
    })
    .select("id")
    .single();
}

export async function listSessions(userId: string, limit = 50) {
  return supabase
    .from("training_session")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(limit);
}

export async function listTradeLogs(sessionId: number) {
  return supabase
    .from("training_trade_log")
    .select("*")
    .eq("session_id", sessionId)
    .order("seq_no", { ascending: true });
}
