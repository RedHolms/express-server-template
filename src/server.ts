import url from "url";
import path from "path";
import express from "express";

import { Express, Request, Response } from "express";

import Backend from "./backend";
import Frontend from "./frontend";

class Server {
  hostname: string
  port: number
  isDev: boolean

  server: Express
  backend: Backend
  frontend: Frontend

  constructor(hostname: string, port: number, dev: boolean) {
    this.hostname = hostname;
    this.port = port;
    this.isDev = dev;

    this.server = express();
    this.backend = new Backend();
    this.frontend = new Frontend(path.join(__dirname, "public"), path.join(__dirname, "web"));
  }

  start() {
    this.backend.start();
    this.frontend.start();
    
    this.server.all("*", (request, respose) => {
      this.handleRequest(request, respose);
    });
    
    this.server.listen(this.port, () => {
      console.log(`- Server started at http://${this.hostname}:${this.port}`);
    });
  }

  handleRequestUnsafe(request: Request, response: Response) {
    if (request.path.startsWith("/api")) {
      this.backend.handleRequest(request, response);
    } else {
      this.frontend.handleRequest(request, response);
    }
  }

  handleRequest(request: Request, response: Response) {
    try {
      this.handleRequestUnsafe(request, response);
    } catch (error) {
      console.error("======================================");
      console.error("Uncaught error while handling request!");
      console.error(error);
      console.error("======================================");

      response.statusCode = 500;
      response.send("Internal Server Error");
    }
  }
};

const hostname = "localhost";
const port = 3000;

const server = new Server(hostname, port, process.env.NODE_ENV !== "production");

try {
  server.start();
} catch(error) {
  console.error(error);
}
