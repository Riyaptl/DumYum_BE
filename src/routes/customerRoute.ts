import express, {Request, Response} from "express"
import { customerAddAddressController, customerCreateController, customerDeleteController, customerGetAddressController, customerGetAllController, customerGetOneController, customerGetOneWebController, customerRemoveAddressController, customerSelectAddressController, customerUpdateAddressController, customerUpdateController, exportDataCustomer, orderHistoryController, queryHistoryController } from "../controllers/customerController"
import authorizeUser from "../utils/authorizeUser"
// import { resetPassController } from "../controllers/adminController"
import { validationMiddleware } from "../middlewares/validationDTO"
import { AddressDetailsDto, CreateCustomerDto, UpdateCustomerDto } from "../dto/customerDto"
import { GetDataDto, ResetPassDto } from "../dto/adminDto"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()

// Admin panel -
// get all customers, get single customer, update customer, delete customer, view queryHistory, view orderHistory
// export csv

// Website - 
// get single customer, update customer, delete customer, reset password, view queryHistory, view orderHistory, 
// forgot password

// Apply authentication middleware
router.use(authenticateUser)

// Get all customers
router.post('/', authorizeUser(['admin']), validationMiddleware(GetDataDto), customerGetAllController)

// Get single customer
router.get('/:id', customerGetOneController)

// Get single customer - website
router.get('/info/profile', customerGetOneWebController)

// Update single customer
router.post('/:id', validationMiddleware(UpdateCustomerDto), customerUpdateController)

// Get address details
router.get('/get/address', customerGetAddressController)

// Add address
router.post('/add/address', validationMiddleware(AddressDetailsDto), customerAddAddressController)

// Select address
router.post('/select/address/:id', customerSelectAddressController)

// Update address
router.post('/update/address/:id', validationMiddleware(AddressDetailsDto), customerUpdateAddressController)

// Remove address
router.post('/remove/address/:id', customerRemoveAddressController)

// Delete single customer - Dont allow
router.delete('/:id', customerDeleteController)

// Reset password
// router.post('/reset/Pass', validationMiddleware(ResetPassDto), resetPassController)

// Query History
router.get('/qh/:id', queryHistoryController)

// Order History customer
router.get('/oh/:id', orderHistoryController)

// CSV export
router.get('/csv/export', authorizeUser(['admin']), validationMiddleware(GetDataDto), exportDataCustomer)

export default router
