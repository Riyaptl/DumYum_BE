import { Document, Schema, model } from 'mongoose';
const bcrypt = require('bcrypt')

export interface AddressDetailsInterface {
    houseNumber?: string | null;
    street?: string | null;
    nearby?: string | null;
    city?: string | null;
    state?: string | null;
    pincode: string | null;
}

interface Customer extends Document {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: 'customer';
    addressDetails: AddressDetailsInterface[]
    defaultAddress: Schema.Types.ObjectId | string;
    gender?: 'female' | 'male' | 'other' | null;
    birthdate?: string | null;
    marraigeStatus?: 'married' | 'unmarried' | null;
    kidsStatus?: 'yes' | 'no' | null;
    anniversary?: string | null;
    kidsBirthdate?: string[] | null;
    otp?: string | null;
    otpValid?: Date;
    queryHistory?: Array<Schema.Types.ObjectId | string>;
    orderHistory?: Array<Schema.Types.ObjectId | string>;
    orderStatus?: 'active' | 'inactive' | null;
    queryStatus?: 'active' | 'inactive' | null;
    totalAmount?: number;
    totalNumber?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export const AddressDetailsSchema = new Schema <AddressDetailsInterface>({
    houseNumber: {
        type: String,
        trim: true,
    },
    street: {
        type: String,
        trim: true,
    },
    nearby: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
    },
    state: {
        type: String,
        trim: true,
    },
    pincode: {
        type: String,
        trim: true,
        required: true,
    },
})

const CustomerSchema = new Schema<Customer>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ["customer"],
        default: 'customer'
    },
    addressDetails: [AddressDetailsSchema],
    defaultAddress: {
        type: Schema.Types.ObjectId,
    },
    gender: {
        type: String,
        enum: ['female', 'male', 'other'],
        trim: true,
    },
    birthdate: {
        type: String,
        trim: true,
    },
    marraigeStatus: {
        type: String,
        enum: ['married', 'unmarried'],
        trim: true,
    },
    kidsStatus: {
        type: String,
        enum: ['yes', 'no'],
        trim: true,
    },
    anniversary: {
        type: String,
        trim: true,
    },
    kidsBirthdate: [{
        type: String,
        trim: true,
    }],
    otp: {
        type: String,
        trim: true,
    },
    otpValid: {
        type: Date,
    },
    queryHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Query',
    }],
    orderHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Order',
    }],
    orderStatus: {
        type: String,
        enum: ['active', 'inactive'],
        trim: true,
    },
    queryStatus: {
        type: String,
        enum: ['active', 'inactive'],
        trim: true,
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    totalNumber: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
    },
});

CustomerSchema.pre('save', async function(next) {
    if (!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

export const CustomerModel = model<Customer>('Customer', CustomerSchema);
