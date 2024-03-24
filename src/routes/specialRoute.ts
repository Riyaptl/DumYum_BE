import express, {Request, Response} from "express"

import { validationMiddleware } from "../middlewares/validationDTO"
import { CreateCategoryDto, UpdateCategoryDto } from "../dto/categoryDto"
import authorizeUser from "../utils/authorizeUser"
import { GetDataDto } from "../dto/adminDto"
import { specialDeleteController, specialGetAllController, specialGetOneController, specialGetSubCatController, specialUpdateController, exportDataCategory, addSpecialController, specialCreateController, specialTypeController, specialGetAnimationController } from "../controllers/specialController"
import { AddSpecialDto, TypeSpecialDto } from "../dto/specialDto"
import { uploadImagesMiddleware } from "../middlewares/uploadImges"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()

// Admin panel
// create, add subCategories, get all, get single, update, delete, change type of special
// get all subcategories of given special, csv export

// website
// get all, get all subcategories of given special

// Images
// view images, upload images, edit images, remove images

// Get all specials
router.get('/', validationMiddleware(GetDataDto), specialGetAllController)

// Get single special
router.get('/:id', specialGetOneController)

// Get subCategories of single special
router.get('/subCategories/:id', specialGetSubCatController)

// All animation type specials
router.get('/type/animation', specialGetAnimationController)

// Apply authentication middleware
router.use(authenticateUser)

// Create single special
router.post('/create', authorizeUser(['admin']), validationMiddleware(CreateCategoryDto), specialCreateController)

// Add subCategories
router.post('/add/:id', authorizeUser(['admin']), validationMiddleware(AddSpecialDto), addSpecialController)

// Update single special
router.post('/:id',  authorizeUser(['admin']), validationMiddleware(UpdateCategoryDto), specialUpdateController)

// Change type of single special
router.post('/type/:id',  authorizeUser(['admin']), validationMiddleware(TypeSpecialDto), specialTypeController)

// Delete single special 
router.delete('/:id', authorizeUser(['admin']), specialDeleteController)

// CSV export
router.get('/csv/export', authorizeUser(['admin']), validationMiddleware(GetDataDto), exportDataCategory)

// view images

export default router
