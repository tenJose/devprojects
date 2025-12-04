import { Response, Request } from "express";
import { UsuarioRequest } from "../middleware/auth.middleware";
export declare const actualizarCuenta: (req: UsuarioRequest, res: Response) => Promise<void>;
export declare const obtenerPerfil: (req: UsuarioRequest, res: Response) => Promise<void>;
export declare const configurarPerfil: (req: UsuarioRequest, res: Response) => Promise<void>;
export declare const searchUsers: (req: Request, res: Response) => Promise<void>;
export declare const obtenerUsuarioPublico: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map