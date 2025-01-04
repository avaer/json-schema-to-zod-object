import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject, Serializable } from "../Types";

export const parseEnum = (
  schema: JsonSchemaObject & { enum: Serializable[] },
): ZodTypeAny => {
  if (schema.enum.length === 0) {
    return z.never();
  } else if (schema.enum.length === 1) {
    // union does not work when there is only one element
    return z.literal(schema.enum[0] as any);
  } else if (schema.enum.every((x) => typeof x === "string")) {
    return z.enum(schema.enum as [string, ...string[]]);
  } else {
    return z.union(schema.enum.map((x) => z.literal(x as any)) as any);
  }
};
