import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject } from "../Types";

export const parseNull = (_schema: JsonSchemaObject & { type: "null" }): ZodTypeAny => {
  return z.null();
};
