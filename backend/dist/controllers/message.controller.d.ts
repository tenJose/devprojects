import type { Response } from "express";
import { UsuarioRequest } from "../middleware/auth.middleware";
export declare const getConversations: (req: UsuarioRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMessages: (req: UsuarioRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendMessage: (req: UsuarioRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markAsRead: (req: UsuarioRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=message.controller.d.ts.map