"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// import routes
const adminRoute_1 = __importDefault(require("./routes/adminRoute"));
const customerRoute_1 = __importDefault(require("./routes/customerRoute"));
const orderRoute_1 = __importDefault(require("./routes/orderRoute"));
const queryRoute_1 = __importDefault(require("./routes/queryRoute"));
const locationRoute_1 = __importDefault(require("./routes/locationRoute"));
const categoryRoute_1 = __importDefault(require("./routes/categoryRoute"));
const specialRoute_1 = __importDefault(require("./routes/specialRoute"));
const subCategoryRoute_1 = __importDefault(require("./routes/subCategoryRoute"));
const ingredientRoute_1 = __importDefault(require("./routes/ingredientRoute"));
const authorizeUser_1 = __importDefault(require("./utils/authorizeUser"));
const ratingRoute_1 = __importDefault(require("./routes/ratingRoute"));
const cartRoute_1 = __importDefault(require("./routes/cartRoute"));
const bucketRoute_1 = __importDefault(require("./routes/bucketRoute"));
const imagesRoute_1 = __importDefault(require("./routes/imagesRoute"));
const passwordRoute_1 = __importDefault(require("./routes/passwordRoute"));
// Forgot and reset password
router.use('/password', passwordRoute_1.default);
// Admin
router.use('/admin', (0, authorizeUser_1.default)(['admin']), adminRoute_1.default);
// Customer
router.use('/customer', customerRoute_1.default);
// Query - multiple images - large
router.use('/query', queryRoute_1.default);
// Location
router.use('/location', locationRoute_1.default);
// Category - multiple image - large
router.use('/category', categoryRoute_1.default);
// Specials - multiple image - large
router.use('/special', specialRoute_1.default);
// SubCategory - multiple images (Maintain 2 arrays for small and large images)
router.use('/subCategory', subCategoryRoute_1.default);
// Rating
router.use('/rating', ratingRoute_1.default);
// Order - Payment
router.use('/order', orderRoute_1.default);
// Cart - single image - small
router.use('/cart', cartRoute_1.default);
// Ingredient - image
router.use('/ingredient', ingredientRoute_1.default);
// Bucket for customised order
router.use('/bucket', bucketRoute_1.default);
// Images
router.use('/images', imagesRoute_1.default);
// // Additional
// router.use('/customer', customerRoute)
exports.default = router;
