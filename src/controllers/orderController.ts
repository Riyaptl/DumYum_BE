import {NextFunction, Request, Response} from "express"
import { CloseOrderInterface, CreateOrderInterface, UpdatePaymentOrderInterface, UpdatePriceOrderInterface, UpdateTimeOrderInterface } from "../interfaces/orderInterface";
import { squence } from "./queryController";
import { asyncErrors } from "../middlewares/catchAsyncErrors";
import { OrderModel, PredefinedOrderSchema } from "../models/orderModel";
import { ErrorHandler } from "../utils/errorHandler";
import { GetDataInterface } from "../interfaces/adminInteface";
import { validEntry } from "./subCategoryController";
import { exportData } from "./adminController";
import { ordersFileds } from "../headers";
import { findIdCustomer } from "./customerController";
import { LocationModel } from "../models/locationModel";
const {DateTime} = require('luxon')

interface getOrderAuthenticatedInterface extends Request{
    user: {_id: string, role: string}
    body: GetDataInterface
}

interface updateTimeAuthenticatedInterface extends Request{
    user: {name: string}
    body: UpdateTimeOrderInterface
}

interface updatePriceAuthenticatedInterface extends Request{
    user: {name: string, totalAmount: number, save: () => {}}
    body: UpdatePriceOrderInterface
}

interface updatePaymentAuthenticatedInterface extends Request{
    user: {name: string}
    body: UpdatePaymentOrderInterface
}

interface closeAuthenticatedInterface extends Request{
    user: {name: string}
    body: CloseOrderInterface
}

interface getOrderAuthenticatedInterface extends Request{
    user: {_id: string, role: string}
    body: GetDataInterface
}

export const orderCreateController = asyncErrors(async (req: any, res:Response, next:NextFunction): Promise<void> => {
    let createOrder: {[key: string]: any} = {}
    const orderObj = req.body
    createOrder = {...orderObj}
    
    // orderId
    const lastOrder = await squence(OrderModel)
    let seq
    if (lastOrder){
        seq = `${+lastOrder.seq + 1}`
    }else{
        seq = '1'
    }
    const todayInIST = DateTime.now().setZone('Asia/Kolkata').toLocaleString(DateTime.DATE_SHORT);;
    const orderId = todayInIST+'_ORD_'+seq 
    createOrder["orderId"] = orderId
    createOrder["seq"] = seq

    // get location
    const location = await LocationModel.findOne({pincode: createOrder.addressDetails.pincode})
    if (!location) return next(new ErrorHandler('We currently do not deliver at the location', 404))
    
    // calculate prices 
    createOrder["totalPrice"] = createOrder.predefinedPrice
    if (location) {
        const {ecd, priceLimit} = location
        if (ecd && priceLimit && createOrder.finalPrice < +priceLimit ){
            createOrder["finalPrice"] += +ecd 
        }
    }   
    createOrder["totalQuantity"] = createOrder.predefinedQuantity
    
    // create order  
    const newOrder = new OrderModel(createOrder)

    // add to customer creating it
    // totalAmount, totalNumber
    req.user.orderHistory.push(newOrder._id)
    req.user.orderStatus = 'active'
    req.user.totalAmount += newOrder.finalPrice
    req.user.totalNumber += newOrder.totalQuantity

    // save
    await req.user.save()
    await newOrder.save()

    return
})

const getOrderData = async (req: getOrderAuthenticatedInterface, model:any, param: string ) => {
    try {
        // Define query
        let query: { [key: string]: any} = {}

        if (req.user.role === 'customer') {
            query["customerId"] = req.user._id
        }
        
        // If "value" is passed for search
        if (req.body.value){
            query[param] = {"$regex": req.body.value, "$options": "i"}
        }

        // Get all data
        const data = await model.find(query, {password:0, __v:0}).sort({createdAt: -1})
        return data
    } catch (error) {
        return error
    }
}

export const orderGetAllController = asyncErrors( async(req:getOrderAuthenticatedInterface, res:Response): Promise<void> => {
    const orders = await getOrderData(req, OrderModel, 'orderId')
    res.status(200).json({"success":true, orders})
})

export const orderGetAllCustController = asyncErrors( async(req:getOrderAuthenticatedInterface, res:Response): Promise<void> => {
    const customerId = req.user._id
    const orders = await OrderModel.find({customerId}).select({orderFor:1, finalPrice:1, totalQuantity:1, createdAt:1, delivered:1, orderStatus:1, paymentStatus:1, paymentMethod:1}).sort({createdAt:-1})
    res.status(200).json({"success":true, orders})
})

// export const orderGetProductController = asyncErrors( async(req:getOrderAuthenticatedInterface, res:Response): Promise<void> => {
//     const customerId = req.user._id
//     const subCategoryId = req.params.id
//     const orders = await OrderModel.find({customerId, 'predefinedOrder.subCategoryId': subCategoryId}).sort({createdAt:-1}).select('predefinedOrder')
//     res.status(200).json({"success":true, orders})
// })


export const orderGetOneController = asyncErrors( async(req:any, res:Response): Promise<void> => {
    const id = req.params.id
    const customerId = req.user._id
    const order = await OrderModel.findOne({_id:id, customerId})
    res.status(200).json({"success":true, orders: order?.predefinedOrder})
})


export const orderUpdateTimeController = asyncErrors ( async(req:updateTimeAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const {etd, etp} = req.body
    const id = req.params.id
    const order = await OrderModel.findById(id)
    if(!order) return next(new ErrorHandler('Order not found', 400))

    // if allredy closed
    if (order.orderStatus !== 'active') return next(new ErrorHandler('Order is not active', 400)) 

    if (etp) order.etp = +etp
    if (etd) order.etd = etd
    if (etp || etd) order.updatedBy = req.user.name
    await order.save()
    res.status(200).json({"success": true, "message":"Order has been updated successfully"})
})

export const orderUpdatePriceController = asyncErrors ( async(req:updatePriceAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const {extraDiscount, ecd} = req.body
    const id = req.params.id
    const order = await OrderModel.findById(id)
    if(!order) return next(new ErrorHandler('Order not found', 400))

    // if allredy closed
    if (order.orderStatus !== 'active') return next(new ErrorHandler('Order is not active', 400)) 

    if (ecd) {
        order.ecd = ecd
        order.finalPrice = order.totalPrice! + order.gstPrice! + +ecd
    }
    if (extraDiscount && !validEntry(`${extraDiscount}`, next)) return next( new ErrorHandler('Invalid Discount entry', 400))
    if (extraDiscount){
        req.user.totalAmount -= order.finalPrice!
        order.extraDiscount = +extraDiscount
        order.discountdPrice = (order.totalPrice! - (+extraDiscount * order.totalPrice!)).toFixed(2)
        order.gstPrice = order.gst! * +order.discountdPrice
        order.finalPrice = +order.discountdPrice! + order.gstPrice! 
        if (order.ecd) order.finalPrice += +order.ecd
        req.user.totalAmount += +order.finalPrice
    }
    if (ecd || extraDiscount) order.updatedBy = req.user.name
    await order.save()
    await req.user.save()
    res.status(200).json({"success": true, "message":"Order has been updated successfully"})
})

export const orderUpdatePaymentController = asyncErrors ( async(req:updatePaymentAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const {paymentStatus, paymentMethod} = req.body
    const id = req.params.id
    const order = await OrderModel.findById(id)
    if(!order) return next(new ErrorHandler('Order not found', 400))

    // if allredy closed
    if (order.orderStatus !== 'active') return next(new ErrorHandler('Order is not active', 400)) 

    if (paymentStatus) order.paymentStatus = paymentStatus
    if (paymentMethod) order.paymentMethod = paymentMethod
    if (paymentStatus || paymentMethod) order.updatedBy = req.user.name
    await order.save()
    res.status(200).json({"success": true, "message":"Order has been updated successfully"})
})

export const orderCloseController = asyncErrors ( async(req:closeAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const order = await OrderModel.findById(id)
    if(!order) return next(new ErrorHandler('Order not found', 400))

    // if allredy closed
    if (order.orderStatus !== 'active') return next(new ErrorHandler('Order is not active', 400)) 

    const {type} = req.body
    
    // close - closedAt, closedBy, orderStatus
    order.closedAt = new Date()
    order.closedBy = req.user.name 
    order.orderStatus = type

    if (type === 'closed'){
        // delivered
        const val = Math.floor(order.etp!) * 24 * 60 * 60 * 1000
        const expectedDate = order.createdAt!.getTime() + val 
        if (expectedDate > Date.now()){
            order.delivered = 'ontime'
        }else{
            order.delivered = 'delayed'
        }
    }
    
    // change orderStatus in customer
    const customer = await findIdCustomer(order.customerId.toString(), next)
    if (customer) {
        customer.orderStatus = 'inactive'
        await customer.save()
    }

    await order.save()
    res.status(200).json({"success": true, "message":"Order has been updated successfully"})
})

export const orderCustomerController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const order = await OrderModel.findById(id).populate({
        path: 'customerId',
        select: 'name email phone pincode totalAmount totalNumber queryStatus orderStatus'
    }).select('customerId')
    if(!order) return next(new ErrorHandler('Order not found', 400))

    res.status(200).json({"success": true, customerDetails: order.customerId})
})

export const exportDataOrders = asyncErrors(async (req:Request, res:Response, next:NextFunction) => {
    return await exportData(req, res, next, ordersFileds, OrderModel, 'orderId', 'orders')
})

