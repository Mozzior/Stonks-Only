import { withHandler } from "../_shared/response.mjs";

export default withHandler(async ({ req }, logger) => {
  logger.info("Running membership expiry cron");
  // 模拟处理过期逻辑
  return { status: "OK" };
});
