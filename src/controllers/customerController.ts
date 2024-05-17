import {Request, Response, NextFunction} from "express"
import { asyncErrors } from "../middlewares/catchAsyncErrors"
import { CustomerModel } from "../models/customerModel"
import {exportData, findEmailAdmin, getData, validateEmail} from "./adminController"
import { ErrorHandler } from "../utils/errorHandler"
import { customerFields } from "../headers"
import { CreateCustomerInterface, UpdateCustomerInterface } from "../interfaces/customerInterface"
import { GetDataInterface } from "../interfaces/adminInteface"
import { updateQuery } from "./queryController"
import { updateCartAddressDetails, updateCartAddressOnRemove } from "./cartController"
const {Parser} = require("json2csv")


// Extend the request type to add "user"
export interface createCustomerAuthenticatedDto extends Request {
    user: {name: string};
    body: CreateCustomerInterface
}

export interface getWebCustomerAuthenticatedDto extends Request {
    user: {_id: string};
}

export interface updateCustomerAuthenticatedDto extends Request {
    user: {name: string};
    body: UpdateCustomerInterface
}

export interface addPincodeCustomerAuthenticatedDto extends Request {
    user: {_id: string, pincode: string, houseNumber: string, street: string, nearby: string, city:  string, state:  string, save: () => {}};
    body: {pincode: string, houseNumber: string, street: string, nearby: string, city:  string, state:  string}
}


// get single customer by id - authentication
export const findIdCustomer = async (id:string, next:NextFunction) => {
    try {
        const customer = await CustomerModel.findById(id)
        if (!customer) return next( new ErrorHandler('Customer does not exist', 404))
        return customer
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

// internal use
const findId = async (id:string, req:any, next:NextFunction) => {
    try {
        if (req.user.role === 'customer' && id != req.user._id) return next( new ErrorHandler('Forbidden', 403))
        const customer = await CustomerModel.findById(id, {password:0, __v:0})
        if (!customer) return next( new ErrorHandler('Customer does not exist', 404))
        return customer
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}


// get single customer by email - signin
export const findEmailCustomer = async (email:string, next:NextFunction)=> {
    try {
        const customer = await CustomerModel.findOne({email})
        return customer
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

// during signup
export const customerCreateController = async (req:createCustomerAuthenticatedDto, res:Response, next:NextFunction) => {
    try {

        const createCustomerInput = {...req.body}        

        // validate email
        if (!validateEmail(createCustomerInput.email)) return next(new ErrorHandler('Invalid Email Id', 400)) 

        // check email duplication with admin
        const admin = await findEmailAdmin(createCustomerInput.email, next)
        if (admin) return next( new ErrorHandler('Email Id is taken', 409))

        // create customer        
        const newCustomer = new CustomerModel(createCustomerInput)
        newCustomer.defaultAddress = newCustomer.addressDetails[0]._id
        await newCustomer.save()
        const custId = newCustomer._id.toString()
        return custId

    } catch (error:any) {
        error.statusCode = error.statusCode || 500
        if (error.code === 11000){
            error.message = `Email Id is taken`
        }
        res.status(error.statusCode).json({success: false, message: error.message})
    }
}

export const customerGetAllController = asyncErrors( async(req:Request<{},{},GetDataInterface>, res:Response, next:NextFunction): Promise<void> => {
    const customers = await getData(req, CustomerModel, 'name')
    res.status(200).json({"success": true, customers})
})


export const customerGetOneController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const customer = await findId(id, req, next)
    if(customer){
        res.status(200).json({"success": true, customer})
    }
})

export const customerGetOneWebController = asyncErrors( async(req:getWebCustomerAuthenticatedDto, res:Response, next:NextFunction): Promise<void> => {
    const id = req.user._id  
    const customer = await findId(id, req, next)
    if(customer){
        res.status(200).json({"success": true, customer})
    }
})


export const customerUpdateController = asyncErrors( async(req:updateCustomerAuthenticatedDto, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const customer = await findId(id, req, next)
    if(customer){
        const updateCustomerInput:UpdateCustomerInterface = {...req.body}
        const {name, email, phone, ...other} = updateCustomerInput
        if (name || email || phone){
            const updateDetailInput: {[key: string]: string} = {}
            if (name) updateDetailInput["name"] = name 
            if (email) updateDetailInput["email"] = email
            if (phone) updateDetailInput["phone"] = phone
             // update in query
            await updateQuery(id,updateDetailInput,next)
        }
        updateCustomerInput["updatedAt"] = new Date()
        const updatedCustomer= await CustomerModel.findByIdAndUpdate(customer._id, updateCustomerInput, {new: true, projection: {password:0, __v:0}})
        res.status(200).json({"success": true, "message": "Customer is updated successfully", customer: updatedCustomer})
    }
})


export const customerGetAddressController = asyncErrors( async(req:addPincodeCustomerAuthenticatedDto, res:Response, next:NextFunction): Promise<void> => {
    const customer = await CustomerModel.findOne({_id: req.user._id})
    if (!customer) return next(new ErrorHandler('Customer not found', 404))

    // const addressDetails = customer.addressDetails.find(obj => obj.pincode === customer.pincode)  
    res.status(200).json({"succes": true, addressDetails: customer.addressDetails})
})

export const customerSelectAddressController = asyncErrors( async(req:addPincodeCustomerAuthenticatedDto, res:Response, next:NextFunction): Promise<void> => {
    const {id} = req.params
    await CustomerModel.findOneAndUpdate(
        {
            _id: req.user._id,
            'addressDetails._id': id
        },
        {$set: {
            defaultAddress: id,
        }}
    )
    res.status(200).json({"succes": true, "message": "Address is selected successfully"})
})

export const customerAddAddressController = asyncErrors( async(req:addPincodeCustomerAuthenticatedDto, res:Response, next:NextFunction): Promise<void> => {
    const {pincode, houseNumber, street, nearby, city, state} = req.body
    const customer = await CustomerModel.findOne(
        {
            _id: req.user._id,
        },
    )
    if (!customer)  return next(new ErrorHandler('Customer not found', 404))
    customer.addressDetails.push({pincode, houseNumber, street, nearby, city, state})
    await customer.save()
    res.status(200).json({"succes": true, "message": "Address is added successfully", address: customer.addressDetails})
})

export const customerUpdateAddressController = asyncErrors( async(req:addPincodeCustomerAuthenticatedDto, res:Response, next:NextFunction): Promise<void> => {
    const {pincode, houseNumber, street, nearby, city, state} = req.body
    const {id} = req.params
   
    await CustomerModel.findOneAndUpdate(
        {
            _id: req.user._id,
            'addressDetails._id': id
        },
        {$set: {
            'addressDetails.$.houseNumber': houseNumber,
            'addressDetails.$.pincode': pincode,
            'addressDetails.$.street': street,
            'addressDetails.$.nearby': nearby,
            'addressDetails.$.city': city,
            'addressDetails.$.state': state,
        }}
    )
    
    // update cart address details
    await updateCartAddressDetails(req.user._id, {pincode, houseNumber, street, nearby, city, state, _id: id}, next)

    res.status(200).json({"succes": true, "message": "Address is updated successfully"})
})


export const customerRemoveAddressController = asyncErrors( async(req:addPincodeCustomerAuthenticatedDto, res:Response, next:NextFunction): Promise<void> => {
    const {id} = req.params
    const customer = await CustomerModel.findOne(
        {
            _id: req.user._id,
        },
    )

    if (!customer) return next(new ErrorHandler('Customer not found', 404))

    if (customer.addressDetails.length === 1) return next(new ErrorHandler('Can not remove address', 400)) 

    customer.addressDetails = customer.addressDetails.filter((obj:any) => obj._id != id)
    if (customer.defaultAddress == id) {
        customer.defaultAddress = customer.addressDetails[0]._id || ""
    }

    // changes in cart address details
    await updateCartAddressOnRemove(req.user._id, id, customer.addressDetails[0], next)

    await customer.save()
    res.status(200).json({"succes": true, "message": "Address is updated successfully"})
})


export const customerDeleteController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const customer = await findId(id, req, next)
    if(customer){
        await CustomerModel.findByIdAndDelete(customer._id)
        res.status(200).json({"success": true, "message": "Customer is deleted successfully"})
    }
})

export const queryHistoryController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    // if customer exists
    const id = req.params.id
    const customer = await findId(id, req, next)
    if(customer){
        const queryHistory = await CustomerModel.findById(id)
                            .populate({
                                path: 'queryHistory', 
                                select: 'queryId title description queryStatus closedAt createdAt'
                            }).select('queryHistory -_id')
        res.status(200).json({"success": true, queryHistory: queryHistory!.queryHistory})
    }
})

export const orderHistoryController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const customer = await findId(id, req, next)
    if(customer){
        const orderHistory = await CustomerModel.findById(id)
                            .populate({
                                path: 'orderHistory', 
                                select: 'orderId message orderFor totalPrice totalQuantity orderStatus delivered paymentStatus paymentMethod extraDiscount discountdPrice closedAt createdAt'
                            }).select('orderHistory -_id')
        res.status(200).json({"success": true, orderHistory: orderHistory!.orderHistory})
    }
})

// CSV export
export const exportDataCustomer = asyncErrors( async (req:Request<{}, {}, GetDataInterface>, res:Response, next: NextFunction)  => {
    return await exportData(req, res, next, customerFields, CustomerModel, 'name', 'customers')
})


