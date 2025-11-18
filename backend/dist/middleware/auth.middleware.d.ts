import { Request, Response, NextFunction } from 'express';
export interface UsuarioRequest extends Request {
    usuarioId?: number;
}
export declare const autenticar: (req: UsuarioRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map