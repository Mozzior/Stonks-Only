import { withHandler, ok } from "../_shared/response.mjs";

export default withHandler(async () => {
  return ok({ created: true });
});
