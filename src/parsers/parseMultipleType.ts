import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject, Refs } from "../Types.js";
import { parseSchema } from "./parseSchema.js";

export const parseMultipleType = (
  schema: JsonSchemaObject & { type: string[] },
  refs: Refs,
): ZodTypeAny => {
  const schemas = schema.type.map((type) => 
    parseSchema({ ...schema, type } as any, refs)
  );
  return z.union(schemas as any);
};
