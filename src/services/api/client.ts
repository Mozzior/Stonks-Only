import { ExecutionMethod } from "appwrite";
import { appwrite } from "../../utils/appwrite";
import { fail, ok, type BackendResult } from "../../utils/backendError";

let cachedUserId: string | null = null;
export async function getUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  try {
    const u = await appwrite.account.get();
    cachedUserId = u.$id;
    return cachedUserId;
  } catch {
    return null;
  }
}

export function resetCachedUserId() {
  cachedUserId = null;
}

export function setCachedUserId(id: string | null) {
  cachedUserId = id;
}

export async function executeFunction<TPayload, TResult>(
  functionId: string,
  payload?: TPayload,
): Promise<BackendResult<TResult>> {
  try {
    const userId = await getUserId();
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (userId) headers["x-user-id"] = userId;
    const execution = await appwrite.functions.createExecution(
      functionId,
      payload ? JSON.stringify(payload) : undefined,
      false,
      "/",
      ExecutionMethod.POST,
      headers,
    );

    let parsed;
    try {
      parsed = execution.responseBody ? JSON.parse(execution.responseBody) : null;
    } catch (e) {
      return fail({
        message: "Failed to parse function response",
        code: "PARSE_ERROR",
        type: "client",
      });
    }

    if (execution.responseStatusCode >= 400 || (parsed && parsed.code && parsed.code !== "OK")) {
      return fail({
        message: parsed?.message || "Function execution failed",
        code: parsed?.code || execution.responseStatusCode,
        details: parsed?.details,
        requestId: parsed?.requestId,
      });
    }

    const resultData = parsed?.data !== undefined ? parsed.data : parsed;
    return ok(resultData as TResult);
  } catch (error) {
    return fail(error);
  }
}
