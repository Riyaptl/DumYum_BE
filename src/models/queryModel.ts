import mongoose, { Document, Schema, model, Types } from 'mongoose';

interface Query extends Document {
    queryId: string;
    seq: string;
    title: string;
    description?: string | null;
    images?: string[];
    queryStatus: 'active' | 'inactive';
    customerId: Types.ObjectId ;
    name: string;
    email: string;
    phone?: string;
    closedAt?: Date | null;
    closedBy?: string;
    createdAt?: Date;
}

const QuerySchema = new Schema<Query>({
    queryId: {
        type: String, 
        trim: true
    },
    seq: {
        type: String,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    images: [{
        type: String,
        trim: true,
        unique: true
    }],
    queryStatus: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        trim: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    closedAt: {
        type: Date,
    },
    closedBy: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

export const QueryModel = model<Query>('Query', QuerySchema);
