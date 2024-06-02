import mongoose, { Document, Schema, model, Types } from 'mongoose';
import { AddressDetailsInterface, AddressDetailsSchema } from './customerModel';

// CustomisedOrder Schema
interface CustomisedOrder extends Document {
    chocolate: string;
    recipe?: string | null;
    dryFruit?: string | null;
    flavour?: string | null;
    box?: string | null;
    quantity?: string | null;
    price?: string | null;
}

const CustomisedOrderSchema = new Schema<CustomisedOrder>(
    {
        chocolate: {
            type: String,
            required: true,
            trim: true,
        },
        recipe: {
            type: String,
            trim: true,
        },
        dryFruit: {
            type: String,
            trim: true,
        },
        flavour: {
            type: String,
            trim: true,
        },
        box: {
            type: String,
            trim: true,
        },
        quantity: {
            type: String,
            trim: true,
        },
        price: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

// PredefinedOrder Schema
export interface PredefinedOrder {
    category?: string | undefined;
    special?: string | undefined;
    subCategory: string | undefined;
    subCategoryId?: Types.ObjectId;
    image?: string;
    quantity?: number;
    price?: string | null;
}

export const PredefinedOrderSchema = new Schema<PredefinedOrder>(
    {
        category: {
            type: String,
            trim: true,
        },
        special: {
            type: String,
            trim: true,
        },
        subCategory: {
            type: String,
            required: true,
            trim: true,
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
            default: 0
        },
        price: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

// Order Schema
interface Order extends Document {
    customisedOrder?: CustomisedOrder[];
    predefinedOrder?: PredefinedOrder[];
    orderId: string
    seq: string
    message?: string | null;
    orderFor: 'oneself' | 'other';
    predefinedPrice?: number;
    predefinedQuantity?: number;
    customisedPrice?: number;
    customisedQuantity?: number;
    totalPrice?: number;
    totalQuantity?: number;
    gst?: number; 
    gstPrice?: number; 
    finalPrice?: number; 
    etp?: number;
    addressDetails: AddressDetailsInterface;
    etd?: string | null;
    ecd?: string | null;
    priceLimit?: string | null;
    delivered?: 'ontime' | 'delayed' | null
    orderStatus: string;
    paymentStatus?: string;
    paymentMethod?: string;
    extraDiscount?: number;
    discountdPrice?: string | null;
    customerId: Types.ObjectId;
    closedAt?: Date | null;
    closedBy?: string;
    createdAt?: Date;
    updatedBy: string;
    updatedAt?: Date;
}

const OrderSchema = new Schema<Order>({
    customisedOrder: [CustomisedOrderSchema],
    predefinedOrder: [PredefinedOrderSchema],
    orderId: {
        type: String,
        trim: true
    },
    seq: {
        type: String,
        trim: true
    },
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
    predefinedPrice: {
        type: Number,
        default: 0
    },
    predefinedQuantity: {
        type: Number,
        default: 0
    },
    customisedPrice: {
        type: Number,
        default: 0
    },
    customisedQuantity: {
        type: Number,
        default: 0
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
        type: Number
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
    etd: {
        type: String,
        trim: true,
    },
    ecd: {
        type: String,
        trim: true,
    },
    priceLimit: {
        type: String,
        trim: true,
    },
    delivered: {
        type: String,
        enum: ['ontime', 'delayed'],
        trim: true
    },
    orderStatus: {
        type: String,
        enum: ['active', 'closed', 'cancelled'],
        default: 'active',
        trim: true,
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid'],
        trim: true,
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Cash'],
        trim: true,
    },
    extraDiscount: {
        type: Number,
        default: 0
    },
    discountdPrice: {
        type: String,
        trim: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    closedAt: {
        type: Date,
    },
    closedBy: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedBy:{
        type: String,
        trim: true,
    },
    updatedAt: {
        type: Date,
    },
});

export const OrderModel = model<Order>('Order', OrderSchema);
