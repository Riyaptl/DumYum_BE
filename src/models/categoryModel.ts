import { Document, Schema, model } from 'mongoose';

interface Category extends Document {
    name: string;
    tagline?: string;
    type?: 'menubar' | 'products';
    description?: string | null;
    images?: string[];
    smallImages?: string[];
    subCategories?: Array<Schema.Types.ObjectId | string>;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const CategorySchema = new Schema<Category>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    tagline: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
    },
    images: [{
        type: String,
        trim: true,
    }],
    smallImages: [{
        type: String,
        trim: true,
    }],
    type: {
        type: String,
        enum: ['menubar', 'products'],
        default: 'products',
        trim: true,
    },
    subCategories: [{
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
    }],
    createdBy: {
        type: String,
        trim: true,
    },
    updatedBy: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
    },
});

export const CategoryModel = model<Category>('Category', CategorySchema);
