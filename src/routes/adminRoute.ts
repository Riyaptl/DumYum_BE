import express, {Request, Response} from "express"
import { adminCreateController, adminDeleteController, adminGetAllController, adminGetOneController, adminUpdateController, exportDataAdmins } from "../controllers/adminController"
import {CreateAdminDto, ForgotPassDto, GetDataDto, ResetPassDto, UpdateAdminDto, sendOTPDto} from '../dto/adminDto'
import { validationMiddleware } from "../middlewares/validationDTO"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()
// Admin panel
// create admin, get all admins, get one admin, update admin, delete admin, export CSV

// Website
// reset pass, forgot pass

// Apply authentication middleware
router.use(authenticateUser)

// Create single admin
router.post('/create',validationMiddleware(CreateAdminDto), adminCreateController)

// Get all admins
router.post('/', validationMiddleware(GetDataDto), adminGetAllController)

// Get single admin
router.get('/:id', adminGetOneController)

// Update single admin
router.post('/:id', validationMiddleware(UpdateAdminDto), adminUpdateController)

// Delete single admin
router.delete('/:id', adminDeleteController)

// CSV export
router.get('/csv/export', validationMiddleware(GetDataDto), exportDataAdmins)

export default router
