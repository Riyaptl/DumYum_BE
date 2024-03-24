import mongoose, { Document, Schema, model, Types } from 'mongoose';

interface SubCategory extends Document {
    name: string;
    description?: string | null;
    tagline?: string | null;
    tags?: string[];
    images?: string[] | null;
    smallImages?: string[] | null;
    categoryId: Types.ObjectId ;
    category: string;
    etp?: string | null;
    costPrice?: string | null; 
    sellingPrice?: string | null; 
    discount?: string | null; 
    discountedPrice?: string | null; 
    gst?: string | null; 
    gstPrice?: string | null; 
    finalPrice?: string | null; 
    quantity?: string | null;
    hold: boolean
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const SubCategorySchema = new Schema<SubCategory>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    tagline: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    images: [{
        type: String,
        trim: true,
    }],
    smallImages: [{
        type: String,
        trim: true,
    }],
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    category: {
        type: String,
        trim: true,
    },
    etp: {
        type: String,
        trim: true,
    },
    costPrice: {
        type: String,
        trim: true,
    },
    sellingPrice: {
        type: String,
        trim: true,
    },
    discount: {
        type: String,
        trim: true
    },
    discountedPrice: {
        type: String,
        trim: true
    },
    gst: {
        type: String,
        trim: true,
    },
    gstPrice: {
        type: String,
        trim: true,
    },
    finalPrice:{
        type: String,
        trim: true,
    },
    quantity:{
        type: String,
        trim: true,
    },
    hold: {
        type: Boolean,
        default: false
    },
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

export const SubCategoryModel = model<SubCategory>('SubCategory', SubCategorySchema);
