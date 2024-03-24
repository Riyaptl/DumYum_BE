import mongoose, { Document, Schema, model, Types } from 'mongoose';
import { AddressDetailsInterface, AddressDetailsSchema } from './customerModel';

// PredefinedOrder Schema
export interface PredefinedOrder {
    category?: string;
    subCategory?: string;
    subCategoryId?: Types.ObjectId;
    image?: string;
    quantity?: number;
    price?: string;
}

const PredefinedOrderSchema = new mongoose.Schema({
    category:{
        type:String,
        trim: true
    },
    subCategory: {
        type: String,
        trim: true
    },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory"
    },
    image: {
        type: String,
        trim: true,
    },
    quantity: {
        type: Number,
        default: 1
    },
    price: {
        type: String,
        trim: true,
    },
}, {_id: false})

// Cart Schema
export interface Cart extends Document {
    customerId: Types.ObjectId;
    addressDetails: AddressDetailsInterface;
    predefinedOrder?: PredefinedOrder[];
    message?: string | null;
    orderFor?: 'oneself' | 'other';
    totalPrice?: number;
    totalQuantity?: number;
    gst?: number; 
    gstPrice?: number; 
    finalPrice?: number; 
    etp?: number;
    // etd?: string | null;
    // ecd?: string | null;
    // priceLimit?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const CartSchema = new Schema <Cart>({
    customerId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    },
    predefinedOrder: [PredefinedOrderSchema],
    message: {
        type: String,
        trim: true,
    },
    orderFor: {
        type: String,
        enum: ['oneself', 'other'],
        default: 'oneself',
        trim: true,
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    totalQuantity: {
        type: Number,
        default: 0
    },
    gst: {
        type: Number,
        default: 0
    },
    gstPrice: {
        type: Number 
    },
    finalPrice:{
        type: Number,
        default: 0
    },
    etp: {
        type: Number,
        default: 0
    },
    addressDetails: AddressDetailsSchema,
    // etd: {
    //     type: String,
    //     trim: true,
    // },
    // ecd: {
    //     type: String,
    //     trim: true,
    // },
    // priceLimit: {
    //     type: String,
    //     trim: true,
    // },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
    },
})

export const CartModel = model<Cart>('Cart', CartSchema);
