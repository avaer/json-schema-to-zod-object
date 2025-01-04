import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject, Refs } from "../Types";
import { parseSchema } from "./parseSchema";

export const parseMultipleType = (
  schema: JsonSchemaObject & { type: string[] },
  refs: Refs,
): ZodTypeAny => {
  const schemas = schema.type.map((type) => 
    parseSchema({ ...schema, type } as any, refs)
  );
  return z.union(schemas as any);
};
