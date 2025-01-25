declare global {
  namespace Express {
    interface Request {
      body: any;
      query: any;
      params: any;
    }
    interface Response {
      json: any;
      status: any;
    }
  }
}
