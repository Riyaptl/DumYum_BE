import { NextFunction, Request, Response} from "express";
import { asyncErrors } from "../middlewares/catchAsyncErrors";
import { Cart, CartModel, PredefinedOrder } from "../models/cartModel";
import { AddBucketCartInterface, AddCartInterface, RemoveCartInterface, SubCatQuantityInterface, UpdateQuantityCartInterface } from "../interfaces/cartInterface";
import { ErrorHandler } from "../utils/errorHandler";
import { findIdSubCat } from "./subCategoryController";
import { Types } from "mongoose";
import { LocationModel } from "../models/locationModel";
import { orderCreateController } from "./orderController";
import { CreateOrderInterface } from "../interfaces/orderInterface";

interface addCartAuthenticatedInterface extends Request {
    user: {pincode?: string, _id: string, _doc: any, addressDetails: any, state: string, city: string}
    body: AddCartInterface
}

interface addBucketCartAuthenticatedInterface extends Request {
    user: {pincode?: string, _id: string, _doc: any, addressDetails: any, state: string, city: string}
    body: AddBucketCartInterface
}

interface updateQuantityCartAuthenticatedInterface extends Request {
    user: {pincode?: string, _id: string}
    body: UpdateQuantityCartInterface
}

interface removeCartAuthenticatedInterface extends Request {
    user: {pincode?: string, _id: string}
    body: RemoveCartInterface
}

interface getCartAuthenticatedInterface extends Request {
    user: {_id: string, address: string, pincode: string, state: string, city: string}
}

interface updateAddressCartAuthenticatedDto extends Request {
    user: {_id: string, save: () => {}};
    body: {pincode: string, houseNumber: string, street: string, nearby: string, city:  string, state:  string}
}

interface deleteCartAuthenticatedInterface extends Request {
    user: {_id: string}
}

interface checkOutCartAuthenticatedInterface extends Request {
    user: {_id: string, _doc: any},
}

interface subCatQuantityAuthenticatedInterface extends Request {
    user: {_id: string},
    body: SubCatQuantityInterface
}

// used in category
export const updateCartOrder = async (model: any, name:string, newName: string, next:NextFunction) => {
    try {
        await model.updateMany(
            {'predefinedOrder.category': name}, 
            {'predefinedOrder.$.category': newName}
        )
        return
    } catch (error) {
        next(new ErrorHandler('Internal Server Error', 500))
    }
}

// used in subCategory - basic details
export const  editCartOrder = async (model: any, subCategoryId: string, newObj: {[key: string]: any}, next:NextFunction) => {
    try {
        await model.updateMany(
            {'predefinedOrder.subCategoryId': subCategoryId}, 
            {'predefinedOrder.$.category': newObj.category,
            'predefinedOrder.$.subCategory': newObj.subCategory
            }
        )
        return
    } catch (error) {
        next(new ErrorHandler('Internal Server Error', 500))
    }
}

// used in subCategory - price details
export const  editPriceCart = async (subCategoryId: string, price: string, next:NextFunction) => {
    try {
        const carts = await CartModel.find({'predefinedOrder.subCategoryId': subCategoryId})
        carts.forEach(async cart => {
            const subCat = cart.predefinedOrder?.find(obj => obj.subCategoryId!.toString() === subCategoryId)
            if (subCat) {
                // changes in totalPrice
                cart.totalPrice = cart.totalPrice! - (+subCat.price! * +subCat.quantity!) + (+price! * +subCat.quantity!)
                
                // update price in predefinedOrder
                subCat!.price = price

                // changes in gst price, final price
                cart.gstPrice! = cart.gst! * cart.totalPrice!
                cart.finalPrice! = cart.totalPrice! + cart.gstPrice!

                await cart.save()
            }
        })
        return
    } catch (error) {
        next(new ErrorHandler('Internal Server Error', 500))
    }
}

// Update etp - used in subCategory
export const updateEtpCart = async (subCategoryId: string, oldEtp: number, newEtp: number, next: NextFunction) => {
    try {
        // find all the carts
        const carts = await CartModel.find({'predefinedOrder.subCategoryId': subCategoryId})
        carts.forEach(async cart => {
            const subCat = cart.predefinedOrder?.find(obj => obj.subCategoryId!.toString() === subCategoryId)
            cart.etp = cart.etp! - (subCat!.quantity! * oldEtp) + (subCat!.quantity! * newEtp)
            await cart.save()
        })
        return
    } catch (error) {
        next(new ErrorHandler('Internal server error', 500))
    }
}

export const AddCartController =  asyncErrors( async(req:addCartAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    // // check address if doesn't exist
    // const requiredDetails = ['address', 'city', 'state', 'pincode']
    // const hasAllProperties = requiredDetails.every(entry => Object.keys(req.user._doc).includes(entry))
    // if (!hasAllProperties) {
    //     return next(new ErrorHandler('Address detail is required', 400))
    // }

    // get subCategory
    const {subCategoryId, quantity} = req.body
    if(quantity <= 0) return next(new ErrorHandler('Invalid entry', 400))
    
    const subCategory = await findIdSubCat(subCategoryId, next)
    if (subCategory){

        // // get location
        // const location = await LocationModel.findOne({pincode: req.user.pincode})
        // if (!location) return next(new ErrorHandler('We currently do not deliver at the location', 400))

        // if finalPrice or etp doesn't exist
        if (!subCategory.finalPrice || !subCategory.etp) return next(new ErrorHandler('Invalid entry', 400))
        
        // check if order is on hold
        if (subCategory.hold) {
            return next(new ErrorHandler(`We are not taking order for ${subCategory.name} at the moment`, 400))
        }

        // If cart doesn't exist make one
        let cart = await CartModel.findOne({customerId: req.user._id})
        if (!cart){
            cart = new CartModel({customerId:req.user._id})
        }
        
        // if already subCategory exist - add into it
        let subCatQuantity
        const subCatExists = cart.predefinedOrder?.find(obj => obj.subCategoryId?.toString() == subCategoryId)
        if (subCatExists){
            subCatExists.quantity! += +quantity
            subCatQuantity = subCatExists.quantity
        }else{
            // make predefinedObj 
            const predefinedObj:PredefinedOrder = {
                category: subCategory.category,
                subCategory: subCategory.name,
                subCategoryId: new Types.ObjectId(subCategory._id),
                quantity: +quantity,
                price: subCategory.finalPrice,
                image: subCategory.smallImages![0] || ''
            }
            cart.predefinedOrder?.push(predefinedObj)
            subCatQuantity = predefinedObj.quantity
        }  

        // make cartObj - price, quantity, etp
        cart.totalPrice! += (+subCategory.finalPrice * +quantity)
        cart.totalQuantity! += +quantity
        cart.gstPrice! = cart.gst! * cart.totalPrice!
        cart.finalPrice! = cart.totalPrice! + cart.gstPrice!
        cart.etp! += (+subCategory.etp * +quantity)
        
        
        const addressDetails = req.user.addressDetails.find((obj:any) => obj.pincode === req.user.pincode)
        cart.addressDetails = addressDetails
            // cart.addressDetails = location._id
            // cart.etd = location.etd
            // cart.ecd = location.ecd
            // cart.priceLimit = location.priceLimit || null
              
        // save changes
        await cart.save()
        res.status(200).json({"success": true, "message": `${subCategory.name} has been added to your cart successfully`, quantity: subCatQuantity})
    }
})

export const AddBucketCartController =  asyncErrors( async(req:addBucketCartAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {

    // get subCategory
    const {bucket} = req.body

    // If cart doesn't exist make one
    let cart = await CartModel.findOne({customerId: req.user._id})
    if (!cart){
        cart = new CartModel({customerId:req.user._id})
    }

    // total price, quantity, etp
    let totalPrice = 0
    let totalQuantity = 0
    let totalEtp = 0

    for(let item of bucket){
        const {subCategoryId, quantity} = item

        if(quantity <= 0) continue
        const subCategory = await findIdSubCat(subCategoryId, next)

        if (subCategory){

            // if finalPrice or etp doesn't exist
            if (!subCategory.finalPrice || !subCategory.etp) continue
            
            // check if order is on hold
            if (subCategory.hold) continue

            totalQuantity += quantity
            
            // if already subCategory exist - add into it
            const subCatExists = cart.predefinedOrder?.find(obj => obj.subCategoryId?.toString() == subCategoryId)
            if (subCatExists){
                totalEtp += -(+!subCatExists.quantity * +subCategory.etp) + (quantity * +subCategory.etp)
                totalPrice += -(+!subCatExists.quantity * +!subCatExists.price) + (+!subCatExists.price * +quantity)
                subCatExists.quantity! += +quantity
            }else{
                // make predefinedObj 
                const predefinedObj:PredefinedOrder = {
                    category: subCategory.category,
                    subCategory: subCategory.name,
                    subCategoryId: new Types.ObjectId(subCategory._id),
                    quantity: +quantity,
                    price: subCategory.finalPrice,
                    image: subCategory.smallImages![0] || ''
                }
                cart.predefinedOrder?.push(predefinedObj)
                totalPrice += (+!predefinedObj.price * +!predefinedObj.quantity)
                totalEtp += +subCategory.etp * +quantity
            }  
        }
    }

    cart.totalPrice! += totalPrice
    cart.totalQuantity! +=  totalQuantity
    cart.gstPrice! = cart.gst! * cart.totalPrice!
    cart.finalPrice! = cart.totalPrice! + cart.gstPrice!
    cart.etp! += totalEtp
            
    const addressDetails = req.user.addressDetails.find((obj:any) => obj.pincode === req.user.pincode)
    cart.addressDetails = addressDetails
                
    // console.log(cart);
    // save changes
    await cart.save()
    res.status(200).json({"success": true}) 
})

const removeSubCategroy = async (cart:Cart, subCategory: {[key: string]: any}, quantity: number, next: NextFunction) => {
    try {                   
        // remove predefinedOrder entry 
        cart.predefinedOrder = cart.predefinedOrder?.filter(obj => obj.subCategoryId?.toString() != subCategory._id.toString())

        // cart - remove from predefinedQuantity, price, totalQuantity, price, etp
        cart.totalPrice! -= (+quantity * +subCategory.finalPrice)
        cart.totalQuantity! -= +quantity
        cart.gstPrice! = cart.gst! * cart.totalPrice!
        cart.finalPrice = cart.gstPrice! + cart.totalPrice!
        cart.etp! -= (+quantity * +subCategory.etp)
        await cart.save()
        return cart
    } catch (error) {
        return next(new ErrorHandler('Internal server error', 500))
    }
}


// export const RemoveQuantityCartController =  asyncErrors( async(req:updateQuantityCartAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
//     // get subCategory
//    const {subCategoryId, type, quantity} = req.body
//    const subCategory = await findIdSubCat(subCategoryId, next)
//    if (subCategory){
        
//         // if finalPrice or etp doesn't exist
//         if (!subCategory.finalPrice || !subCategory.etp) return next(new ErrorHandler('Invalid entry', 400))

//         // find cart
//         let cart = await CartModel.findOne({customerId: req.user._id})
//         if (!cart) return next(new ErrorHandler('Cart not found', 404))

//         // find subCategory
//         const subCat = cart.predefinedOrder!.find(obj => obj.subCategoryId?.toString() == subCategoryId)
//         if (!subCat)  return next(new ErrorHandler('Invalid entry', 400))

//         // Whether only one quantity 
//         if (cart.totalQuantity == 1){
//             await DeleteCartController(req, res, next)
//         }else if (subCat.quantity === 1){
//             // Only one quantity of subCategory
//             const newCart = await removeSubCategroy(cart, subCategory, 1, next)
//             if (newCart){
//                 res.status(200).json({"success": true, "message": `Your cart has been updated successfully`, newCart})
//             }
//         }else{
//             subCat.quantity! -= 1
//             cart.totalQuantity! -= 1
//             cart.totalPrice! -= +subCategory.finalPrice
//             cart.gstPrice! = cart.gst! * cart.totalPrice!
//             cart.finalPrice = cart.gstPrice! + cart.totalPrice!
//             cart.etp! -= +subCategory.etp
//             await cart.save()
//             res.status(200).json({"success": true, "message": `Your cart has been updated successfully`, cart})
//         }       
//    }
// })


export const UpdateQuantityCartController =  asyncErrors( async(req:updateQuantityCartAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
     // get subCategory
    const {subCategoryId, quantity} = req.body
    if(quantity <= 0) return next(new ErrorHandler('Invalid entry', 400))

    const subCategory = await findIdSubCat(subCategoryId, next)
    if (subCategory){
         
        // if finalPrice or etp doesn't exist
        if (!subCategory.finalPrice || !subCategory.etp) return next(new ErrorHandler('Invalid entry', 400))

        // find cart
        let cart = await CartModel.findOne({customerId: req.user._id})
        if (!cart) return next(new ErrorHandler('Cart not found', 404))

        // find subCategory
        const subCat = cart.predefinedOrder!.find(obj => obj.subCategoryId?.toString() == subCategoryId)
        if (!subCat)  return next(new ErrorHandler('Invalid entry', 400))

        const prevQuantity = subCat.quantity

        // update quantity
        subCat.quantity! = +quantity

        // changes in total quantity
        cart.totalQuantity! = cart.totalQuantity! - prevQuantity! + quantity

        // changes in totalPrice
        cart.totalPrice = cart.totalPrice! - (+subCat.price! * prevQuantity!) + (+subCat.price! * +quantity!)
                
        // changes in gst price, final price
        cart.gstPrice! = cart.gst! * cart.totalPrice!
        cart.finalPrice! = cart.totalPrice! + cart.gstPrice!

        // changes in etp
        cart.etp! = cart.etp! - (+subCategory.etp * prevQuantity!) + (+subCategory.etp * quantity!)

        await cart.save()
        res.status(200).json({"success": true, "message": `Your cart has been updated successfully`, cart})

    }
})

export const RemoveSubCategoryCartController =  asyncErrors( async(req:removeCartAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    let {subCategoryId} = req.body
    console.log('hit');
    
    const subCategory = await findIdSubCat(subCategoryId, next)
    if (subCategory){
        
        // if finalPrice or etp doesn't exist
        if (!subCategory.finalPrice || !subCategory.etp) return next(new ErrorHandler('Invalid entry', 400))

        // find cart
        let cart = await CartModel.findOne({customerId: req.user._id})
        if (!cart) return next(new ErrorHandler('Cart not found', 404))

        // find subCategory
        const subCat = cart.predefinedOrder!.find(obj => obj.subCategoryId?.toString() == subCategoryId)
        if (!subCat)  return next(new ErrorHandler('Invalid entry', 400))

        const quantity = subCat.quantity!

        // Whether only one quantity 
        if (cart.predefinedOrder!.length == 1){
            await DeleteCartController(req, res, next)
        }else {
            const newCart = await removeSubCategroy(cart, subCategory, quantity, next)
            if (newCart){
                res.status(200).json({"success": true, "message": `${subCategory.name} has been removed from your cart successfully`, cart: newCart})
            }
        }          
    }
})

export const GetCartController =  asyncErrors( async(req:getCartAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    // get complete cart
    const cart = await CartModel.findOne({customerId: req.user._id})
    if (!cart) return next( new ErrorHandler('Cart not found', 404))
    res.status(200).json({"success": true, cart})
})

export const UpdateAddressCartController =  asyncErrors( async(req:updateAddressCartAuthenticatedDto, res:Response, next:NextFunction): Promise<void> => {
    const {houseNumber, street, nearby, city, state, pincode} = req.body
    const addressDetails = {houseNumber, street, nearby, city, state, pincode}
    const cart = await CartModel.findOneAndUpdate({customerId: req.user._id}, 
        {addressDetails},
        {new:true}
    )
    if (!cart) return next( new ErrorHandler('Cart not found', 404))
    res.status(200).json({"success": true, "message": `Cart address has been updated successfully`, cart})
})


export const DeleteCartController =  asyncErrors( async(req:deleteCartAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    await CartModel.findOneAndDelete({customerId: req.user._id})
    res.status(200).json({"success": true, "message": `Cart has been cleared successfully`, cart:null})
})


export const CheckoutCartController =  asyncErrors( async(req:checkOutCartAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    // check address if doesn't exist
    const requiredDetails = ['houseNumber', 'street', 'nearby', 'city', 'state', 'pincode']
    const hasAllProperties = requiredDetails.every(entry => Object.keys(req.user._doc).includes(entry))
    if (!hasAllProperties) {
        return next(new ErrorHandler('Address detail is required', 400))
    }
    
    // find cart
    let cart = await CartModel.findOne({customerId: req.user._id})
    if (!cart) return next(new ErrorHandler('Cart not found', 404))

    // do we deliver 
    const location = await LocationModel.findOne({pincode: cart.addressDetails.pincode})
    if (!location) return next(new ErrorHandler('We currently do not deliver at the location', 404))
    
    // add orderFor and message
    const {orderFor, message} = req.body
    cart.orderFor = orderFor
    cart.message = message
    // await cart.save()

    // go through all subCategories
    interface predefined {
        category: string | undefined;
        subCategory: string | undefined;
        quantity?: number;
        price?: string | null;
    }
    const preDefinedOrder: predefined[] = []
    cart.predefinedOrder?.forEach(obj => {
        // create preDefinedOrderObj
        const preDefinedOrderObj = {
            category: obj.category,
            subCategory: obj.subCategory,
            subCategoryId: obj.subCategoryId,
            price: obj.price,
            quantity: obj.quantity
        }
        preDefinedOrder.push({...preDefinedOrderObj})
    })

    // create orderObj
    const orderObj:CreateOrderInterface = {
        customerId: req.user._id,
        predefinedOrder: preDefinedOrder,
        message: cart.message,
        orderFor: cart.orderFor,
        predefinedPrice: cart.totalPrice,
        predefinedQuantity: cart.totalQuantity,
        gst: cart.gst!,
        gstPrice: cart.gstPrice,
        finalPrice: cart.finalPrice!,
        etp: cart.etp,
        addressDetails: cart.addressDetails
    }

    req.body = orderObj
    await orderCreateController(req, res, next) 

    // empty cart
    await CartModel.findOneAndDelete({customerId: req.user._id})

    res.status(200).json({"success": true,"message": "order is placed successfully"})
})

export const SubCatIdsCartController =  asyncErrors( async(req:subCatQuantityAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    // find cart
    const {subCategoryId} = req.body
    const cart = await CartModel.findOne({
        customerId: req.user._id, 'predefinedOrder.subCategoryId': subCategoryId 
    })
    let quantity = 0
    if (cart){
        quantity = cart.predefinedOrder?.find(obj => obj.subCategoryId?.toString() === subCategoryId)?.quantity || 0
    }
    res.status(200).json({"success": true, quantity})
})

