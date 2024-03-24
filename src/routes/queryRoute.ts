import express, {Request, Response} from "express"
import { exportDataQueries, queryCloseController, queryCreateController, queryDeleteController, queryGetAllController, queryGetOneController, queryUploadImagesController, queryViewImagesController } from "../controllers/queryController"
import { validationMiddleware } from "../middlewares/validationDTO"
import { CreateQueryDto } from "../dto/queryDto"
import { GetDataDto } from "../dto/adminDto"
import authorizeUser from "../utils/authorizeUser"
import { uploadImagesMiddleware } from "../middlewares/uploadImges"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()

// Admin panel
// get all queries, close query, delete query, csv export, view images

// Website
// create query,

// Images
// view images, upload images

// Apply authentication middleware
router.use(authenticateUser)

// Upload images
router.post('/images/:id', uploadImagesMiddleware, queryUploadImagesController)

// View images
router.get('/images/:id', queryViewImagesController)

// Create single query
router.post('/create', validationMiddleware(CreateQueryDto), queryCreateController)

// Get all queries
router.post('/', validationMiddleware(GetDataDto), queryGetAllController)

// Get single query
router.get('/:id', queryGetOneController)

// Close single query
router.post('/:id', authorizeUser(['admin']), queryCloseController)

// Delete single query
router.delete('/:id', authorizeUser(['admin']), queryDeleteController)

// CSV export
router.get('/csv/export', authorizeUser(['admin']), validationMiddleware(GetDataDto), exportDataQueries)

// view image


export default router
