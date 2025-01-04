import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject } from "../Types";

export const parseBoolean = (
  _schema: JsonSchemaObject & { type: "boolean" },
): ZodTypeAny => {
  return z.boolean();
};
