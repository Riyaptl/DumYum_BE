import { Document, Schema, model, Types } from 'mongoose';

// Common interface
interface Common extends Document {
    name: string;
    tagline?: string;
    sellingPrice?: string | null;
    gst?: string | null;
    gstPrice?: string | null;
    finalPrice?: string | null;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

// Common schema
const CommonSchema = new Schema<Common>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        tagline: {
            type: String,
            trim: true,
        },
        sellingPrice: {
            type: String,
            trim: true,
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
    },
    { _id: false }
);

const ChocolateSchema = new Schema<Common>(
    CommonSchema.obj
);

const RecipeSchema = new Schema<Common>(
    CommonSchema.obj
);

const DryFruitSchema = new Schema<Common>(
    CommonSchema.obj
);

const FlavourSchema = new Schema<Common>(
    CommonSchema.obj
);

// Box Interface
interface Box extends Document {
    type?: 'regular' | 'gift';
    size?: string;
    image?: string;
    name?: string | null;
    tagline?: string;
    sellingPrice?: string | null;
    gst?: string | null;
    gstPrice?: string | null;
    finalPrice?: string | null;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const BoxSchema = new Schema<Box>(
    {...CommonSchema.obj,
    type: {
        type: String,
        enum: ['regular', 'gift'],
        default: 'regular',
        trim: true,
    },
    size: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        trim: true,
    }
    }
);

export const ChocolateModel = model<Common>('Chocolate', ChocolateSchema);
export const RecipeModel = model<Common>('Recipe', RecipeSchema);
export const DryFruitModel = model<Common>('DryFruit', DryFruitSchema);
export const FlavourModel = model<Common>('Flavour', FlavourSchema);
export const BoxModel = model<Box>('Box', BoxSchema);
