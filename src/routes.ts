import express, {Request, Response} from "express"
const router = express.Router()

// import routes
import adminRoute from "./routes/adminRoute"
import customerRoute from "./routes/customerRoute"
import orderRoute from "./routes/orderRoute"
import queryRoute from "./routes/queryRoute"
import locationRoute from "./routes/locationRoute"
import categoryRoute from "./routes/categoryRoute"
import specialRoute from "./routes/specialRoute"
import subCategoryRoute from "./routes/subCategoryRoute"
import ingredientRoute from "./routes/ingredientRoute"
import authorizeUser from "./utils/authorizeUser"
import ratingRoute from "./routes/ratingRoute"
import cartRoute from "./routes/cartRoute"
import bucketRoute from "./routes/bucketRoute"
import imagesRoute from "./routes/imagesRoute"
import passwordRoute from "./routes/passwordRoute"

// Forgot and reset password
router.use('/password', passwordRoute)

// Admin
router.use('/admin', authorizeUser(['admin']), adminRoute)

// Customer
router.use('/customer', customerRoute)

// Query - multiple images - large
router.use('/query', queryRoute)

// Location
router.use('/location', locationRoute)

// Category - multiple image - large
router.use('/category', categoryRoute)

// Specials - multiple image - large
router.use('/special', specialRoute)

// SubCategory - multiple images (Maintain 2 arrays for small and large images)
router.use('/subCategory', subCategoryRoute)

// Rating
router.use('/rating', ratingRoute)

// Order - Payment
router.use('/order', orderRoute)

// Cart - single image - small
router.use('/cart', cartRoute)

// Ingredient - image
router.use('/ingredient', ingredientRoute)

// Bucket for customised order
router.use('/bucket', bucketRoute)

// Images
router.use('/images', imagesRoute)

// // Additional
// router.use('/customer', customerRoute)

export default router