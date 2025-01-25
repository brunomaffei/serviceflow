import "express";

declare global {
  namespace Express {
    interface Request {
      query: Record<string, any>;
      params: Record<string, string>;
      body: any; // Customize para tipar melhor, se souber o formato
    }

    interface Response {
      json: (body: any) => this;
      status: (code: number) => this;
    }
  }
}
