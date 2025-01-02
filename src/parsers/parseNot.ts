import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject, JsonSchema, Refs } from "../Types.js";
import { parseSchema } from "./parseSchema.js";

export const parseNot = (
  schema: JsonSchemaObject & { not: JsonSchema },
  refs: Refs,
): ZodTypeAny => {
  const notSchema = parseSchema(schema.not, {
    ...refs,
    path: [...refs.path, "not"],
  });

  return z.any().refine(
    (value) => !notSchema.safeParse(value).success,
    "Invalid input: Should NOT be valid against schema"
  );
};
