import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject } from "../Types.js";

export const parseBoolean = (
  _schema: JsonSchemaObject & { type: "boolean" },
): ZodTypeAny => {
  return z.boolean();
};
