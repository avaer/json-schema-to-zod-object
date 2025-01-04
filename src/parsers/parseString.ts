import { JsonSchemaObject } from "../Types";
import { z, ZodTypeAny } from "zod";

export const parseString = (schema: JsonSchemaObject & { type: "string" }): ZodTypeAny => {
  let output = z.string();

  if (schema.format) {
    switch (schema.format) {
      case "email":
        output = output.email();
        break;
      case "ip":
        output = output.ip();
        break;
      case "ipv4":
        output = output.ip({ version: "v4" });
        break;
      case "ipv6":
        output = output.ip({ version: "v6" });
        break;
      case "uri":
        output = output.url();
        break;
      case "uuid":
        output = output.uuid();
        break;
      case "date-time":
        output = output.datetime({ offset: true });
        break;
      case "time":
        output = output.time();
        break;
      case "date":
        output = output.date();
        break;
      case "binary":
        output = output.base64();
        break;
      case "duration":
        output = output.duration();
        break;
    }
  }

  if (schema.pattern) {
    output = output.regex(new RegExp(schema.pattern));
  }

  if (schema.minLength !== undefined) {
    output = output.min(schema.minLength);
  }

  if (schema.maxLength !== undefined) {
    output = output.max(schema.maxLength);
  }

  if (schema.contentEncoding === "base64") {
    output = output.base64();
  }

  // if (schema.contentMediaType === "application/json") {
  //   output = output.transform((str, ctx) => {
  //     try {
  //       return JSON.parse(str);
  //     } catch (err) {
  //       ctx.addIssue({ code: "custom", message: "Invalid JSON" });
  //       return z.NEVER;
  //     }
  //   });

  //   if (schema.contentSchema && schema.contentSchema instanceof Object) {
  //     output = output.pipe(parseSchema(schema.contentSchema));
  //   }
  // }

  return output;
};
