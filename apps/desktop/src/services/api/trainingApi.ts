import { executeFunction, getUserId } from "./client";
import { appwrite, appwriteConfig, Query } from "../../utils/appwrite";
import { fail, ok } from "../../utils/backendError";
import type { TrainingOrderPayload } from "./types";

const trainingSessionCreateFunctionId =
  import.meta.env.VITE_APPWRITE_FN_TRAINING_SESSION_CREATE_ID ||
  "fn-training-session-create";
const trainingOrderFunctionId =
  import.meta.env.VITE_APPWRITE_FN_TRAINING_ORDER_EXEC_ID ||
  "fn-training-order-exec";
const trainingSettlementFunctionId =
  import.meta.env.VITE_APPWRITE_FN_TRAINING_SETTLEMENT_ID ||
  "fn-training-settlement";

export function createTrainingSession(payload: {
  tsCode?: string;
  symbol?: string;
  period?: "daily" | "weekly" | "monthly";
  trainRange?: {
    startIndex: number;
    endIndex: number;
    startDate?: string;
    endDate?: string;
  };
  startDate?: string;
  endDate?: string;
  startPrice?: number;
  initialBalance?: number;
}) {
  const body = {
    tsCode: payload.tsCode,
    symbol: payload.symbol,
    period: payload.period ?? "daily",
    trainRange: payload.trainRange,
    startIndex: payload.trainRange?.startIndex,
    endIndex: payload.trainRange?.endIndex,
    startDate: payload.startDate ?? payload.trainRange?.startDate,
    endDate: payload.endDate ?? payload.trainRange?.endDate,
    startPrice: payload.startPrice,
    initialBalance: payload.initialBalance,
  };
  return executeFunction<typeof body, Record<string, unknown>>(
    trainingSessionCreateFunctionId,
    body,
  );
}

export function executeTrainingOrder(payload: TrainingOrderPayload) {
  return executeFunction<TrainingOrderPayload, Record<string, unknown>>(
    trainingOrderFunctionId,
    payload,
  );
}

export function settleTrainingSession(
  sessionId: string,
  reason: "completed" | "aborted",
) {
  return executeFunction<
    { sessionId: string; reason: string },
    Record<string, unknown>
  >(trainingSettlementFunctionId, { sessionId, reason });
}

export function recalcSessionStats(sessionId: string) {
  return executeFunction<
    { sessionId: string; reason: string },
    Record<string, unknown>
  >(trainingSettlementFunctionId, { sessionId, reason: "recalc" });
}

export async function getTrainingSession(sessionId: string) {
  try {
    const doc = await appwrite.databases.getDocument(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingSessionCollectionId!,
      sessionId,
    );
    return ok(doc);
  } catch (error) {
    return fail(error);
  }
}

export async function getTrainingTrades(
  sessionId: string,
  limit: number = 50,
  cursor?: string,
) {
  try {
    const queries = [
      Query.equal("session_id", sessionId),
      Query.limit(limit),
      Query.orderDesc("trade_time"), // Assuming order by trade time
    ];
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }
    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingTradeLogCollectionId!,
      queries,
    );
    return ok(response.documents);
  } catch (error) {
    return fail(error);
  }
}

export async function listSessions(limit: number = 20, cursor?: string) {
  try {
    const userId = await getUserId();
    if (!userId)
      return fail({ message: "Not logged in", code: "UNAUTHORIZED" });

    const queries = [
      Query.equal("user_id", userId),
      Query.limit(limit),
      Query.orderDesc("$createdAt"),
    ];
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingSessionCollectionId!,
      queries,
    );
    return ok(response);
  } catch (error) {
    return fail(error);
  }
}

export async function getLatestActiveSession() {
  try {
    const userId = await getUserId();
    if (!userId)
      return fail({ message: "Not logged in", code: "UNAUTHORIZED" });
    const statuses = [
      "active",
      "running",
      "initialized",
      "pending",
      "in_progress",
      "not_started",
    ];
    const queries = [
      Query.equal("user_id", userId),
      Query.equal("status", statuses),
      Query.orderDesc("updated_at"),
      Query.limit(1),
    ];
    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingSessionCollectionId!,
      queries,
    );
    const doc = response.total > 0 ? response.documents[0] : null;
    return ok(doc);
  } catch (error) {
    return fail(error);
  }
}



export async function saveSessionProgress(
  sessionId: string,
  currentDateIso: string,
) {
  try {
    const payload: Record<string, unknown> = {
      current_date: currentDateIso,
      updated_at: new Date().toISOString(),
    };
    const res = await appwrite.databases.updateDocument(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingSessionCollectionId!,
      sessionId,
      payload,
    );
    return ok(res);
  } catch (error) {
    return fail(error);
  }
}

export function snapshotSessionDaily(
  sessionId: string,
  currentDateIso: string,
  markPrice?: number,
) {
  return executeFunction<
    { sessionId: string; reason: string; currentDate?: string; markPrice?: number },
    Record<string, unknown>
  >(trainingSettlementFunctionId, {
    sessionId,
    reason: "daily",
    currentDate: currentDateIso,
    markPrice,
  });
}
