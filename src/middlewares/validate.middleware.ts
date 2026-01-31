import type { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { BadRequestError } from '../core/apiError.js';
export const validate =
  <T extends ZodType>(schema: T) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => {
          const trimmedPath = issue.path
            .map(String)
            .filter((seg) => !['body', 'query', 'params'].includes(seg));

          if (trimmedPath.length > 0) {
            return `${trimmedPath.join('.')}: ${issue.message}`;
          }
          return issue.message;
        });

        next(new BadRequestError(errorMessages.join(', ')));
      } else {
        next(error);
      }
    }
  };
