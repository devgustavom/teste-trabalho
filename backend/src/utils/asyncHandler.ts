import { Request, Response, NextFunction, RequestHandler } from "express";

// Wrapper para handlers assíncronos que encaminha erros para o middleware de erro
export function wrapAsync(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
