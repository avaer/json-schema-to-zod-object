import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject, Refs } from "../Types.js";
import { parseSchema } from "./parseSchema.js";

export const parseArray = (
  schema: JsonSchemaObject & { type: "array" },
  refs: Refs,
): ZodTypeAny => {
  if (Array.isArray(schema.items)) {
    return z.tuple(
      schema.items.map((v, i) =>
        parseSchema(v, { ...refs, path: [...refs.path, "items", i] })
      ) as any
    );
  }

  let array = !schema.items
    ? z.array(z.any())
    : z.array(
        parseSchema(schema.items, {
          ...refs,
          path: [...refs.path, "items"],
        })
      );

  if (schema.minItems !== undefined) {
    array = array.min(schema.minItems, `Array must contain at least ${schema.minItems} element(s)`);
  }

  if (schema.maxItems !== undefined) {
    array = array.max(schema.maxItems, `Array must contain at most ${schema.maxItems} element(s)`);
  }

  return array;
};
