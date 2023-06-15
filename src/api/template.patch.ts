import http from "node:http";
import { httpUtils as hu } from "./_utils";
import db from "./_db";
import { StatusCodes } from "http-status-codes";

interface Body {
  recordId?: string;
  templateName?: string;
  templateDesc?: string;
  templateSubject?: string;
  templateHtml?: string;
  isDefault?: boolean;
}

export default async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const body = await hu.readBody<Body>(req);
  const store = await db();
  const errors: Record<string, string> = {};

  if (!body.templateName?.trim()) {
    errors["templateName"] = "Template name is a required field.";
  }

  if (!body.templateHtml?.trim()) {
    errors["templateHtml"] = "Template content is a required field.";
  }

  if (!body.recordId) {
    errors["recordId"] = "Template is missing record ID.";
  }

  if (Object.keys(errors).length > 0) {
    return hu.send(res, { errors }, { status: StatusCodes.BAD_REQUEST });
  }

  hu.send(
    res,
    {
      template: await store.templates.store({
        recordId: body.recordId,
        name: body.templateName!,
        html: body.templateHtml!,
        description: body.templateDesc,
        defaultSubject: body.templateSubject,
        isDefault: body.isDefault || false,
      }),
    },
    { status: StatusCodes.CREATED }
  );
};