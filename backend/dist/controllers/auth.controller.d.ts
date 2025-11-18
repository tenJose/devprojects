import { Response } from 'express';
import { UsuarioRequest } from '../middleware/auth.middleware';
export declare const registro: (req: UsuarioRequest, res: Response) => Promise<void>;
export declare const verificar: (req: UsuarioRequest, res: Response) => Promise<void>;
export declare const login: (req: UsuarioRequest, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map