import {Schema, Document, model} from "mongoose";

interface Location extends Document {
    area?: string | null;
    city?: string | null;
    state?: string | null;
    pincode: string;
    ecd: string;
    priceLimit?: string | null;
    etd: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const LocationSchema = new Schema<Location>({
    area: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true,
        default: 'Ahmedabad'
    },
    state: {
        type: String,
        trim: true,
        default: 'Gujarat'
    },
    pincode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }, 
    ecd: {
        type: String,
        required: true,
        trim: true
    },
    priceLimit: {
        type: String,
        trim: true
    },
    etd : {
        type: String,
        required: true,
        trim: true,
    },
    createdBy: {
        type: String,
        trim: true
    }, 
    updatedBy: {
        type: String,
        trim: true
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
})

export const LocationModel = model<Location>('Location', LocationSchema)