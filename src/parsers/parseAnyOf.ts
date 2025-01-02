import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject, JsonSchema, Refs } from "../Types.js";
import { parseSchema } from "./parseSchema.js";

export const parseAnyOf = (
  schema: JsonSchemaObject & { anyOf: JsonSchema[] },
  refs: Refs,
): ZodTypeAny => {
  if (!schema.anyOf.length) {
    return z.any();
  }

  if (schema.anyOf.length === 1) {
    return parseSchema(schema.anyOf[0], {
      ...refs,
      path: [...refs.path, "anyOf", 0],
    });
  }

  const unionTypes = schema.anyOf.map((schema, i) =>
    parseSchema(schema, { ...refs, path: [...refs.path, "anyOf", i] })
  );

  return z.union(unionTypes as any);
};
