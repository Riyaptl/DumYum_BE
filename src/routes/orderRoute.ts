import express, {Request, Response} from "express"
import { exportDataOrders, orderCloseController, orderCustomerController, orderGetAllController, orderGetAllCustController, orderGetOneController, orderUpdatePaymentController, orderUpdatePriceController, orderUpdateTimeController } from "../controllers/orderController"
import { validationMiddleware } from "../middlewares/validationDTO"
import { GetDataDto } from "../dto/adminDto"
import { UpdatePaymentOrderDto, UpdatePriceOrderDto, UpdateTimeOrderDto } from "../dto/orderDto"
import authorizeUser from "../utils/authorizeUser"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()

// get all orders -admin and customer
// get predefined orders of given order - admin and cutomer
// update etp, etd (time) - admin
// update extraDiscount, ecd (cost) - admin
// update payment status, method - admin
// close/cancel order - admin
// get customer details - admin
// csv export - admin

// Apply authentication middleware
router.use(authenticateUser)

// Get all orders - customer
router.get('/customer', validationMiddleware(GetDataDto), orderGetAllCustController)

// Get all orders
router.get('/', validationMiddleware(GetDataDto), orderGetAllController)

// Get predefined orders of single 
router.get('/predefined/:id', orderGetOneController)

// Update time
router.post('/time/:id', authorizeUser(['admin']), validationMiddleware(UpdateTimeOrderDto), orderUpdateTimeController)

// Update price
router.post('/price/:id', authorizeUser(['admin']), validationMiddleware(UpdatePriceOrderDto), orderUpdatePriceController)

// Update payment
router.post('/payment/:id', authorizeUser(['admin']), validationMiddleware(UpdatePaymentOrderDto), orderUpdatePaymentController)

// Close order
router.post('/close/:id', validationMiddleware(UpdatePaymentOrderDto), authorizeUser(['admin']), orderCloseController)

// Get customer details
router.get('/customer/:id', authorizeUser(['admin']),  orderCustomerController)

// CSV export
router.get('/csv/export', authorizeUser(['admin']), validationMiddleware(GetDataDto), exportDataOrders)

export default router
