import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject } from "../Types.js";

export const parseNumber = (
  schema: JsonSchemaObject & { type: "number" | "integer" },
): ZodTypeAny => {
  let zodNumber = z.number();

  if (schema.type === "integer") {
    zodNumber = zodNumber.int();
  } else if (schema.format === "int64") {
    zodNumber = zodNumber.int();
  }

  if (schema.multipleOf !== undefined) {
    if (schema.multipleOf === 1) {
      if (!zodNumber.isInt) {
        zodNumber = zodNumber.int();
      }
    } else {
      zodNumber = zodNumber.multipleOf(schema.multipleOf);
    }
  }

  if (typeof schema.minimum === "number") {
    if (schema.exclusiveMinimum === true) {
      zodNumber = zodNumber.gt(schema.minimum);
    } else {
      zodNumber = zodNumber.gte(schema.minimum);
    }
  } else if (typeof schema.exclusiveMinimum === "number") {
    zodNumber = zodNumber.gt(schema.exclusiveMinimum);
  }

  if (typeof schema.maximum === "number") {
    if (schema.exclusiveMaximum === true) {
      zodNumber = zodNumber.lt(schema.maximum);
    } else {
      zodNumber = zodNumber.lte(schema.maximum);
    }
  } else if (typeof schema.exclusiveMaximum === "number") {
    zodNumber = zodNumber.lt(schema.exclusiveMaximum);
  }

  return zodNumber;
};
