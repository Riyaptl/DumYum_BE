import express, {Request, Response} from "express"
import { exportDataLocations, locationChangesController, locationCreateController, locationDeleteController, locationDetailsController, locationGetAllController, locationGetAreaController, locationGetCityController, locationGetOneController, locationPincodeController, locationUpdateController } from "../controllers/locationController"
import { validationMiddleware } from "../middlewares/validationDTO"
import { ChangesLocationDto, CreateLocationDto, UpdateLocationDto } from "../dto/locationDto"
import { GetDataDto } from "../dto/adminDto"
import authorizeUser from "../utils/authorizeUser"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()

// Admin panel
// create location, get all locations, get single location, update single location, 
// delete single location, select area/city and set ecd, priceLimit, etd, export csv, Dropdown for area and city

// website
// add pincode to check estimated delivery time  

// Whether deliver
router.post('/pincode', locationPincodeController)

// Apply authentication middleware
router.use(authenticateUser)

// Get single location based on pincode
router.post('/details/pincode', locationDetailsController)

// adminPanel
router.use(authorizeUser(['admin']))

// Create single location
router.post('/create', validationMiddleware(CreateLocationDto), locationCreateController)

// Get all locations
router.post('/', validationMiddleware(GetDataDto), locationGetAllController)

// Get single location
router.get('/:id', locationGetOneController)

// Update single location
router.post('/:id',validationMiddleware(UpdateLocationDto), locationUpdateController)

// Delete single location - Don't allow
router.delete('/:id', locationDeleteController)

// Changes based on area/city
router.post('/price/changes', validationMiddleware(ChangesLocationDto),locationChangesController)

// CSV export
router.get('/csv/export', validationMiddleware(GetDataDto), exportDataLocations)

// Get unique areas
router.get('/unique/area', locationGetAreaController)

// Get unique cities
router.get('/unique/city', locationGetCityController)

export default router
