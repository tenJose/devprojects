import { TokenPayload } from '../types';
export declare const generarToken: (payload: TokenPayload) => string;
export declare const verificarToken: (token: string) => TokenPayload | null;
export declare const obtenerIdDelToken: (authHeader: string | undefined) => number | null;
//# sourceMappingURL=jwt.d.ts.map