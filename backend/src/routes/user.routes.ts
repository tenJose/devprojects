import { Router } from "express"
import { obtenerPerfil, configurarPerfil, searchUsers, obtenerUsuarioPublico, actualizarCuenta } from "../controllers/user.controller"
import { autenticar } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"

const router = Router()

// Rutas protegidas
router.get("/perfil", autenticar, obtenerPerfil)
router.put("/configurar", autenticar, upload.single("fotoPerfil"), configurarPerfil)
router.get("/search", autenticar, searchUsers)
router.put("/cuenta", autenticar, actualizarCuenta)

// Rutas públicas (o semi-públicas)
router.get("/:id", autenticar, obtenerUsuarioPublico)

export default router