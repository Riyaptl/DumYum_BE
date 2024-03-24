import { Schema, Document, model } from 'mongoose';
const bcrypt = require("bcrypt");

interface Admin extends Document {
    name: string;
    email: string;
    password: string;
    role: 'admin';
    otp?: string | null;
    otpGeneratedAt?: Date;
    createdBy?: string | null;
    createdAt?: Date;
    updatedBy?: string | null;
    updatedAt?: Date;
}

const AdminSchema = new Schema<Admin>({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum:["admin"],
        default: 'admin'
    },
    otp: {
        type: String,
        trim: true,
    },
    otpGeneratedAt: {
        type: Date,
    },
    createdBy: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: String,
        trim: true,
    },
    updatedAt: {
        type: Date,
    },
});

AdminSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)  
})

export const AdminModel = model<Admin>('Admin', AdminSchema);
