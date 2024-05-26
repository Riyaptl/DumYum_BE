import express, {Request, Response} from "express"
const router = express.Router()

// import routes
import adminRoute from "./routes/adminRoute"

import { newsletterController } from "./controllers/newsletterController"
import { B2BConnectController } from "./controllers/B2BController"

// Forgot and reset password
router.post('/newsletter', newsletterController)

// Admin
router.post('/B2B', B2BConnectController)


export default router