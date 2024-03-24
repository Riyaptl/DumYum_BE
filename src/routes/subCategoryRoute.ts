import express, {Request, Response} from "express"
import { exportDataSubCategory, subCategoryCreateController, subCategoryDeleteController, subCategoryGetAllController, subCategoryGetAllOfCategoryController, subCategoryGetOneController, subCategoryHoldController, subCategoryUpdateBasicController, subCategoryUpdateEtpController, subCategoryUpdatePriceController, subCatsGetAllController } from "../controllers/subCategoryController"
import { validationMiddleware } from "../middlewares/validationDTO"
import { CreateSubCategoryDto, EtpSubCategoryDto, UpdateSubCategoryBasicDto, UpdateSubCategoryPriceDto } from "../dto/subCategoryDto"
import { GetDataDto } from "../dto/adminDto"
import authorizeUser from "../utils/authorizeUser"
import { uploadImagesMiddleware } from "../middlewares/uploadImges"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()

// Admin panel
// create, get all, get single, update single - basic entry, update single - price entry, edit etp ,delete single, hold orders
// csv export, view images

// website
// get single, view images

// Images
// upload, view, remove


// Get all subCategories
router.post('/', authorizeUser(['admin']), validationMiddleware(GetDataDto),subCategoryGetAllController)

// Get all subCategories - dropdown
router.get('/all/subCats', authorizeUser(['admin']), subCatsGetAllController)

// Get single subCategory
router.get('/:id', subCategoryGetOneController)

// Get all subCategories of category (for website)
router.get('/all/:catId', subCategoryGetAllOfCategoryController)

// Apply authentication middleware
router.use(authenticateUser)

// Create single subCategory
router.post('/create', authorizeUser(['admin']), validationMiddleware(CreateSubCategoryDto), subCategoryCreateController)

// Update single subCategory Basic details
router.post('/basic/:id', authorizeUser(['admin']), validationMiddleware(UpdateSubCategoryBasicDto), subCategoryUpdateBasicController)

// Update single subCategory Price details
router.post('/price/:id', authorizeUser(['admin']), validationMiddleware(UpdateSubCategoryPriceDto), subCategoryUpdatePriceController)

// Edit single subCategory etp
router.post('/etp/:id', authorizeUser(['admin']), validationMiddleware(EtpSubCategoryDto), subCategoryUpdateEtpController)

// Hold single subCategory
router.post('/hold/:id', authorizeUser(['admin']), subCategoryHoldController)

// Delete single subCategory
router.delete('/:id', authorizeUser(['admin']), subCategoryDeleteController)

// CSV export
router.get('/csv/export', authorizeUser(['admin']), validationMiddleware(GetDataDto), exportDataSubCategory)

// view images


export default router
