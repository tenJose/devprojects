import { Response } from 'express';
import { UsuarioRequest } from '../middleware/auth.middleware';
export declare const enviarSolicitud: (req: UsuarioRequest, res: Response) => Promise<void>;
export declare const responderSolicitud: (req: UsuarioRequest, res: Response) => Promise<void>;
export declare const verificarEstado: (req: UsuarioRequest, res: Response) => Promise<void>;
//# sourceMappingURL=friend.controller.d.ts.map