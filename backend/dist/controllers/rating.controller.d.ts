import { Request, Response } from 'express';
export declare const rateProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserRatings: (req: Request, res: Response) => Promise<void>;
export declare const getUserCompletedProjects: (req: Request, res: Response) => Promise<void>;
export declare const getUserActiveProjects: (req: Request, res: Response) => Promise<void>;
export declare const getProjectsToRate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=rating.controller.d.ts.map