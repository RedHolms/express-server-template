import path from "path";
import fs from "fs";

import { Request, Response } from "express";

import { WebMap } from "./frontend/webmap";

export default class {
  webmap: WebMap

  publicDirectory: string

  constructor(publicDirectory: string, webPagesDirectory: string) {
    this.webmap = new WebMap("./src/webmap.json", webPagesDirectory);

    this.publicDirectory = publicDirectory;
  }

  start() {
    console.log("- Starting frontend ...");

  }

  tryResponsePage(request: Request, response: Response) {
    const pageCandidate = this.webmap.getPage(request.path);

    if (pageCandidate !== undefined) {
      pageCandidate.send(response);
      return true;
    }

    return false;
  }

  tryResponsePublicFile(request: Request, response: Response) {
    const publicFileCandidate = path.join(this.publicDirectory, request.path);

    if (fs.existsSync(publicFileCandidate)) {
      response.send(fs.readFileSync(publicFileCandidate));
      return true;
    }

    return false;
  }

  handleRequest(request: Request, response: Response) {
    const pathname = request.path.replaceAll(/\/$/g, "");

    if (pathname === "") {
      return this.webmap.index_page.send(response);
    }

    if (this.tryResponsePage(request, response))
      return;

    if (this.tryResponsePublicFile(request, response))
      return;
    
    response.status(404);
    this.webmap.getErrorPageCode(404)?.send(response);
  }
};
