import { z, ZodTypeAny } from "zod";
import { JsonSchemaObject, Refs } from "../Types";
import { parseAnyOf } from "./parseAnyOf";
import { parseOneOf } from "./parseOneOf";
import { its, parseSchema } from "./parseSchema";
import { parseAllOf } from "./parseAllOf";
import { addJsdocs } from "../utils/jsdocs";

export function parseObject(
  objectSchema: JsonSchemaObject & { type: "object" },
  refs: Refs,
): ZodTypeAny {
  let properties: ZodTypeAny | undefined = undefined;

  if (objectSchema.properties) {
    if (!Object.keys(objectSchema.properties).length) {
      properties = z.object({});
    } else {
      const shape: Record<string, ZodTypeAny> = {};
      
      for (const key of Object.keys(objectSchema.properties)) {
        const propSchema = objectSchema.properties[key];
        
        let zodType = parseSchema(propSchema, {
          ...refs,
          path: [...refs.path, "properties", key],
        });

        if (refs.withJsdocs && typeof propSchema === "object") {
          zodType = addJsdocs(propSchema, zodType);
        }

        const hasDefault = 
          typeof propSchema === "object" && propSchema.default !== undefined;

        const required = Array.isArray(objectSchema.required)
          ? objectSchema.required.includes(key)
          : typeof propSchema === "object" && propSchema.required === true;

        const optional = !hasDefault && !required;

        shape[key] = optional ? zodType.optional() : zodType;
      }

      properties = z.object(shape);
    }
  }

  const additionalProperties =
    objectSchema.additionalProperties !== undefined
      ? parseSchema(objectSchema.additionalProperties, {
          ...refs,
          path: [...refs.path, "additionalProperties"],
        })
      : undefined;

  let patternProperties: ZodTypeAny | undefined = undefined;

  if (objectSchema.patternProperties) {
    const parsedPatternProperties = Object.fromEntries(
      Object.entries(objectSchema.patternProperties).map(([key, value]) => {
        return [
          key,
          parseSchema(value, {
            ...refs,
            path: [...refs.path, "patternProperties", key],
          }),
        ];
      }, {}),
    );

    const patternValues = Object.values(parsedPatternProperties);

    let baseSchema: ZodTypeAny;
    if (properties) {
      baseSchema = properties;
      // if (additionalProperties) {
      //   baseSchema = baseSchema.catchall(z.union([...patternValues, additionalProperties]));
      // } else if (patternValues.length > 1) {
      //   baseSchema = baseSchema.catchall(z.union(patternValues));
      // } else {
      //   baseSchema = baseSchema.catchall(patternValues[0]);
      // }
    } else {
      if (additionalProperties) {
        baseSchema = z.record(z.union([...patternValues, additionalProperties] as any));
      } else if (patternValues.length > 1) {
        baseSchema = z.record(z.union(patternValues as any));
      } else {
        baseSchema = z.record(patternValues[0]);
      }
    }

    patternProperties = baseSchema.superRefine((value, ctx) => {
      for (const key in value) {
        let evaluated = false;
        if (additionalProperties && objectSchema.properties) {
          evaluated = Object.keys(objectSchema.properties).includes(key);
        }

        for (const [pattern, schema] of Object.entries(parsedPatternProperties)) {
          if (key.match(new RegExp(pattern))) {
            evaluated = true;
            const result = schema.safeParse(value[key]);
            if (!result.success) {
              ctx.addIssue({
                path: [...ctx.path, key],
                code: 'custom',
                message: `Invalid input: Key matching regex /${pattern}/ must match schema`,
                params: {
                  issues: result.error.issues
                }
              });
            }
          }
        }

        if (additionalProperties && !evaluated) {
          const result = additionalProperties.safeParse(value[key]);
          if (!result.success) {
            ctx.addIssue({
              path: [...ctx.path, key],
              code: 'custom',
              message: `Invalid input: must match catchall schema`,
              params: {
                issues: result.error.issues
              }
            });
          }
        }
      }
    });
  }

  let output: ZodTypeAny = properties
    ? patternProperties
      ? patternProperties
      : properties
    : patternProperties
      ? patternProperties
      : additionalProperties
        ? z.record(additionalProperties)
        : z.record(z.any());

  if (its.an.anyOf(objectSchema)) {
    output = output.and(parseAnyOf(
      {
        ...objectSchema,
        anyOf: objectSchema.anyOf.map((x) =>
          typeof x === "object" &&
          !x.type &&
          (x.properties || x.additionalProperties || x.patternProperties)
            ? { ...x, type: "object" }
            : x,
        ) as any,
      },
      refs,
    ));
  }

  if (its.a.oneOf(objectSchema)) {
    output = output.and(parseOneOf(
      {
        ...objectSchema,
        oneOf: objectSchema.oneOf.map((x) =>
          typeof x === "object" &&
          !x.type &&
          (x.properties || x.additionalProperties || x.patternProperties)
            ? { ...x, type: "object" }
            : x,
        ) as any,
      },
      refs,
    ));
  }

  if (its.an.allOf(objectSchema)) {
    output = output.and(parseAllOf(
      {
        ...objectSchema,
        allOf: objectSchema.allOf.map((x) =>
          typeof x === "object" &&
          !x.type &&
          (x.properties || x.additionalProperties || x.patternProperties)
            ? { ...x, type: "object" }
            : x,
        ) as any,
      },
      refs,
    ));
  }

  return output;
}
