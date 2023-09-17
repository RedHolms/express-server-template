import fs from "fs";
import path from "path";

import { Response } from "express";

export class WebPage {
  name: string
  filePath: string

  constructor(pageName: string, pageFilePath: string, webPagesDirectory: string) {
    this.name = pageName;
    this.filePath = path.join(webPagesDirectory, pageFilePath);
  }

  isFileExists(): boolean {
    return fs.existsSync(this.filePath);
  }

  send(response: Response) {
    response.sendFile(this.filePath);
  }

  verify() {
    if (!this.isFileExists()) {
      throw Error("File for page " + this.name + " doesn't exists (" + this.filePath + ")");
    }
  }
};

export class WebMap {
  index_page: WebPage
  error_pages: Map<string, WebPage> | undefined
  pages: Map<string, WebPage> | undefined

  constructor(filename: string, webPagesDirectory: string) {
    const web_map_json = JSON.parse(fs.readFileSync(filename).toString());

    this.index_page = new WebPage("", web_map_json.index, webPagesDirectory);
    
    this.error_pages = new Map();
    this.pages = new Map();

    for (const key in web_map_json.error_pages) {
      const value = web_map_json.error_pages[key];

      const page = new WebPage("$errors/" + key, value, webPagesDirectory);
      page.verify();

      this.error_pages?.set(key, page);
    };

    for (const key in web_map_json.pages) {
      const value = web_map_json.pages[key];

      const page = new WebPage(key, value, webPagesDirectory);
      page.verify();

      this.pages?.set(key, page);
    };
  }

  getErrorPageCode(errorCode: number): WebPage | undefined {
    return this.getErrorPageString(errorCode.toString());
  }

  getErrorPageString(errorString: string): WebPage | undefined {
    return this.error_pages?.get(errorString);
  }

  getPage(urlPath: string): WebPage | undefined {
    // Remove last slash and then find page associated with this path
    return this.pages?.get(urlPath.replace(/\/$/, ""));
  }
};
