import { render } from "ejs";
import type { Transformer } from "./utils";

export const createEjsTransformer =
  (data: Record<string, unknown>): Transformer =>
  (context) => {
    return render(context.content, data, { async: false });
  };
