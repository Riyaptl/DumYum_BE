import express from "express"
import authorizeUser from "../utils/authorizeUser"
import { validationMiddleware } from "../middlewares/validationDTO"
import { exportDataIngredients, ingredientCreateController, ingredientDeleteEachController, ingredientGetAllController, ingredientGetEachController, ingredientGetIndividualController } from "../controllers/ingredientController"
import { CreateIngredientDto, GetEachItemDto, UpdateIngredientDto } from "../dto/ingredientsDto"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()

// Admin panel
// create individual ingredient and its items,
// get all the ingredients 
// get each ingredient item
// remove on each ingredient item 
// edit on each ingredient item 
// csv export
// view image

// website
// get single ingredient at a time

// Apply authentication middleware
router.use(authenticateUser)

// Create 
router.post('/create', authorizeUser(['admin']), validationMiddleware(CreateIngredientDto), ingredientCreateController)

// Get all 
router.get('/', authorizeUser(['admin']) ,ingredientGetAllController)

// Get each ingredient item 
router.post('/:id', authorizeUser(['admin']) ,validationMiddleware(GetEachItemDto), ingredientGetEachController)

// remove each ingredient item 
router.delete('/:id', authorizeUser(['admin']) ,validationMiddleware(GetEachItemDto), ingredientDeleteEachController)

// edit each ingredient item 
router.post('/edit/:id', authorizeUser(['admin']) ,validationMiddleware(UpdateIngredientDto), ingredientDeleteEachController)

// csv export
router.get('/csv/export', authorizeUser(['admin']) , exportDataIngredients)

// Get each ingredient item 
router.get('/individual', validationMiddleware(GetEachItemDto), ingredientGetIndividualController)

export default router