import express, {Request, Response} from "express"
import { categoryCreateController, categoryDeleteController, categoryGetAllController, categoryGetOneController, categoryGetSubCatController, categoryUpdateController, exportDataCategory } from "../controllers/categoryController"
import { validationMiddleware } from "../middlewares/validationDTO"
import { CreateCategoryDto, UpdateCategoryDto } from "../dto/categoryDto"
import authorizeUser from "../utils/authorizeUser"
import { GetDataDto } from "../dto/adminDto"
import { uploadImagesMiddleware } from "../middlewares/uploadImges"
import path from "path"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()

// Admin panel
// create category, get all categories, get single category, update category, delete
// get all subcategories of given category, csv export, view images

// website
// get all categories, get all subcategories of given category, view images

// Images
// view images, upload images, edit images

// Get all categories
router.get('/',  validationMiddleware(GetDataDto), categoryGetAllController)

// Get single category
router.get('/:id', categoryGetOneController)

// Get subCategories of single category
router.get('/subCategories/:id', categoryGetSubCatController)

// Apply authentication middleware
router.use(authenticateUser)

// Create single category
router.post('/create', authorizeUser(['admin']), validationMiddleware(CreateCategoryDto), categoryCreateController)

// Update single category
router.post('/:id',  authorizeUser(['admin']), validationMiddleware(UpdateCategoryDto), categoryUpdateController)

// Delete single category - Dont allow
router.delete('/:id', authorizeUser(['admin']), categoryDeleteController)

// CSV export
router.get('/csv/export', authorizeUser(['admin']), validationMiddleware(GetDataDto), exportDataCategory)

// view images

export default router
