import { JsonSchemaObject } from "../Types.js";
import { ZodTypeAny } from "zod";

type MethodArgs = unknown[];

export function withMessage(
  schema: ZodTypeAny,
  methodName: string,
  getArgs: (props: { value: unknown; json: string }) => MethodArgs | void,
) {
  const value = schema[methodName as keyof typeof schema];

  if (value !== undefined) {
    const args = getArgs({ value, json: JSON.stringify(value) });

    if (args) {
      let method = (schema as any)[methodName];
      
      // if (schema.errorMessage?.[methodName] !== undefined) {
      //   // Add error message as last argument if provided
      //   args.push(schema.errorMessage[methodName]);
      // }

      return method.apply(schema, args);
    }
  }

  return schema;
}
