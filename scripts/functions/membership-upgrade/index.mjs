import { withHandler, parseBody } from "../_shared/response.mjs";

export default withHandler(async ({ req }, logger) => {
  const userId = req?.headers?.["x-user-id"] || "";
  if (!userId) {
    const error = new Error("未登录");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  const body = parseBody(req);
  const planId = String(body.planId || "");

  if (!planId) {
    const error = new Error("缺少 planId");
    error.statusCode = 400;
    error.code = "BAD_REQUEST";
    throw error;
  }

  logger.info("Upgrading membership", { userId, planId });
  return { orderId: `ord_${Date.now()}`, status: "CREATED", planId };
});
