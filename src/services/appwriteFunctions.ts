import { ExecutionMethod } from "appwrite";
import { appwrite } from "../utils/appwrite";
import { fail, ok } from "../utils/backendError";

export async function invokeAppwriteFunction<TPayload, TResult>(
  functionId: string,
  payload?: TPayload,
) {
  try {
    const execution = await appwrite.functions.createExecution(
      functionId,
      payload ? JSON.stringify(payload) : undefined,
      false,
      "/",
      ExecutionMethod.POST,
      {
        "content-type": "application/json",
      },
    );
    const output = execution.responseBody
      ? (JSON.parse(execution.responseBody) as TResult)
      : null;
    return ok({
      executionId: execution.$id,
      status: execution.status,
      output,
      raw: execution,
    });
  } catch (error) {
    return fail(error);
  }
}
