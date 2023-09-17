import { Request, Response } from "express";
import { UrlWithParsedQuery } from "url";

export default class {
  constructor() {
  }

  start() {
    console.log("- Starting backend ...");

    // todo: initialize some stuff and load DB
  }

  handleRequest(request: Request, response: Response) {
    response.send(request.path);
  }
};
