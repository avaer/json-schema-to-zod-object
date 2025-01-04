import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject, Serializable } from "../Types";

export const parseConst = (
  schema: JsonSchemaObject,
): ZodTypeAny => {
  return z.literal(schema.const as any);
};
