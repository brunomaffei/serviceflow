import "express";

declare global {
  namespace Express {
    interface Request {
      query: Record<string, any>; // Tipagem genérica para query params
      params: Record<string, string>; // Tipagem genérica para parâmetros de rota
      body: any; // Ajuste conforme a estrutura do body no seu app
    }

    interface Response {
      json: (body: any) => this;
      status: (code: number) => this;
    }
  }
}
