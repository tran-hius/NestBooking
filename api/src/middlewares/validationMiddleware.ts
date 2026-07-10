import { NextFunction, Request, Response } from "express";
import { ZodError, ZodIssue, ZodSchema } from "zod/v3";
import { ApiError } from "../utils/errors/apiError";

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try{
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            }) as any;

            req.body = parsed.body || req.body;
            req.query = parsed.query || req.query;
            req.params = parsed.params || req.params;

            next();
        }catch(error){
            if(error instanceof ZodError){
                const formattedErrors = error.issues.map((err) => ({
                  field: err.path.slice(1).join("."),
                  message: err.message,
                }));

                 next(
                   new ApiError(
                     400,
                     "Dữ liệu gửi lên không hợp lệ.",
                     formattedErrors,
                   ),
                 );
            }else{
                next(error);
            }
              
        }
    }
}