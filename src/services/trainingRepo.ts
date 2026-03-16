import {
  appwrite,
  appwriteConfig,
  assertAppwriteCoreConfigured,
  ID,
  Query,
} from "../utils/appwrite";
import { fail, ok } from "../utils/backendError";
import type {
  CreateTrainingSessionPayload,
  TrainingSessionSummaryPayload,
  TrainingTradeLogPayload,
} from "../types/training";

const {
  databaseId,
  trainingSessionCollectionId,
  trainingTradeLogCollectionId,
} = appwriteConfig;

function getTrainingRepoConfig() {
  assertAppwriteCoreConfigured();
  if (!databaseId) {
    throw new Error("Missing Appwrite config: VITE_APPWRITE_DATABASE_ID");
  }
  if (!trainingSessionCollectionId) {
    throw new Error("Missing Appwrite config: VITE_APPWRITE_TRAINING_SESSION_COLLECTION_ID");
  }
  if (!trainingTradeLogCollectionId) {
    throw new Error("Missing Appwrite config: VITE_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID");
  }
  return {
    databaseId,
    trainingSessionCollectionId,
    trainingTradeLogCollectionId,
  };
}

export async function createSession(payload: CreateTrainingSessionPayload) {
  try {
    const config = getTrainingRepoConfig();
    const created = await appwrite.databases.createDocument(
      config.databaseId,
      config.trainingSessionCollectionId,
      ID.unique(),
      {
        ...payload,
        meta: JSON.stringify(payload.meta ?? {}),
      },
    );
    return ok({ id: created.$id });
  } catch (error) {
    return fail(error);
  }
}

export async function finishSession(
  sessionId: string,
  summary: TrainingSessionSummaryPayload,
) {
  try {
    const config = getTrainingRepoConfig();
    const updated = await appwrite.databases.updateDocument(
      config.databaseId,
      config.trainingSessionCollectionId,
      sessionId,
      summary,
    );
    return ok({ id: updated.$id });
  } catch (error) {
    return fail(error);
  }
}

export async function appendTradeLog(payload: TrainingTradeLogPayload) {
  try {
    const config = getTrainingRepoConfig();
    const created = await appwrite.databases.createDocument(
      config.databaseId,
      config.trainingTradeLogCollectionId,
      ID.unique(),
      {
        ...payload,
        fee: payload.fee ?? 0,
        position_after: JSON.stringify(payload.position_after ?? {}),
        extra: JSON.stringify(payload.extra ?? {}),
      },
    );
    return ok({ id: created.$id });
  } catch (error) {
    return fail(error);
  }
}

export async function listSessions(userId: string, limit = 50) {
  try {
    const config = getTrainingRepoConfig();
    const result = await appwrite.databases.listDocuments(
      config.databaseId,
      config.trainingSessionCollectionId,
      [
        Query.equal("user_id", [userId]),
        Query.orderDesc("started_at"),
        Query.limit(limit),
      ],
    );
    return ok(result.documents);
  } catch (error) {
    return fail(error);
  }
}

export async function listTradeLogs(sessionId: string) {
  try {
    const config = getTrainingRepoConfig();
    const result = await appwrite.databases.listDocuments(
      config.databaseId,
      config.trainingTradeLogCollectionId,
      [Query.equal("session_id", [sessionId]), Query.orderAsc("seq_no")],
    );
    return ok(result.documents);
  } catch (error) {
    return fail(error);
  }
}
