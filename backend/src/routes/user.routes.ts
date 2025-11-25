import * as express from "express"
import { autenticar } from "../middleware/auth.middleware"
import { obtenerPerfil, configurarPerfil, searchUsers, obtenerUsuarioPublico } from "../controllers/user.controller"
import multer from "multer"
import path from "path"

const router = express.Router()

// Configuración Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})
const upload = multer({ storage })

router.get("/perfil", autenticar, obtenerPerfil)
router.put("/configurar", autenticar, upload.single("fotoPerfil"), configurarPerfil)
router.get("/search", autenticar, searchUsers) // Added search route

router.get("/:id", autenticar, obtenerUsuarioPublico)

export default router
