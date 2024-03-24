import express, {Request, Response} from "express"
import { validationMiddleware } from "../middlewares/validationDTO"
import { CreateSubCategoryDto } from "../dto/subCategoryDto"
import { GetDataDto } from "../dto/adminDto"
import authorizeUser from "../utils/authorizeUser"
import { CreateRatingDto } from "../dto/ratingDto"
import { exportDataRatings, ratingCreateController, ratingGetAllController, ratingGetController, ratingGetIdController } from "../controllers/ratingController"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()


// Admin panel
// get all ratings, get single rating based on rating id, get all ratings of subCategory, csv export

// Website
// create rating on subCategory, get all ratings of subCategory

// Get all ratings of subCategory
router.post('/subCategory',ratingGetController)

// Apply authentication middleware
router.use(authenticateUser)

// Get all ratings 
router.post('/', authorizeUser(['admin']), validationMiddleware(GetDataDto), ratingGetAllController)

// Get single rating details
router.get('/details/:id', authorizeUser(['admin']), ratingGetIdController)

// Create rating on subCategory
router.post('/create', validationMiddleware(CreateRatingDto), ratingCreateController)

// CSV export
router.get('/csv/export', authorizeUser(['admin']), validationMiddleware(GetDataDto), exportDataRatings)

export default router
