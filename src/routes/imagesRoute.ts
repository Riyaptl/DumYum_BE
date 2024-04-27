import express, {Request, Response} from "express"
import authorizeUser from "../utils/authorizeUser"
import { uploadImagesMiddleware } from "../middlewares/uploadImges"
import { removeImagesController, updateImagesController, uploadImagesController, viewImagesController } from "../controllers/imagesController"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()

// Apply authentication middleware
router.use(authenticateUser)

// Upload images
router.post('/:id', authorizeUser(['admin']), uploadImagesMiddleware, uploadImagesController)

// Update image
router.post('/update/:id', authorizeUser(['admin']), uploadImagesMiddleware, updateImagesController)

// Remove image
router.delete('/:id', authorizeUser(['admin']), removeImagesController)

// View images
router.get('/:id', viewImagesController)

export default router