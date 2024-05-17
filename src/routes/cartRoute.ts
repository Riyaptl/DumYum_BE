import express from "express"
import { AddCartController, UpdateQuantityCartController, CheckoutCartController, DeleteCartController, GetCartController, RemoveSubCategoryCartController, SubCatIdsCartController, AddBucketCartController, UpdateAddressCartController, AddMessageController } from "../controllers/cartController"
import { validationMiddleware } from "../middlewares/validationDTO"
import { AddBucketCartDto, AddCartDto, AddMessageDto, CheckoutCartDto, RemoveCartDto, SubCatQuantityDto, UpdateQuantityCartDto } from "../dto/cartDto"
import authenticateUser from "../middlewares/authenticateUser"
import { AddressDetailsDto } from "../dto/customerDto"
const router = express.Router()

// 2 schemas for predefined and customised items

// website
// create or add item - hold and whether we deliver
// remove item - delete
// update quantity of item
// get cart
// checkout - add "for oneself or message"
// change overall gst

// Apply authentication middleware
router.use(authenticateUser)

// Create / add
router.post('/add', validationMiddleware(AddCartDto), AddCartController)

// Create / add
router.post('/message', validationMiddleware(AddMessageDto), AddMessageController)

// Create / add bucket
router.post('/bucket/add', validationMiddleware(AddBucketCartDto), AddBucketCartController)

// Update quantity of item
router.post('/update/quantity', validationMiddleware(UpdateQuantityCartDto), UpdateQuantityCartController)

// Get cart
router.get('/', GetCartController)

// Remove
router.post('/product/remove', validationMiddleware(RemoveCartDto), RemoveSubCategoryCartController)

// Delete
router.post('/delete', DeleteCartController)

// Update cart addressDetails
router.post('/update/address', validationMiddleware(AddressDetailsDto), UpdateAddressCartController)

// Checkout
router.post('/checkout', validationMiddleware(CheckoutCartDto), CheckoutCartController)

// Get array subCategory ids existing in cart of logged in user
router.post('/subCat/quantity', validationMiddleware(SubCatQuantityDto), SubCatIdsCartController)

export default router