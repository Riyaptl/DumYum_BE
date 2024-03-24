import { Document, Schema, model } from 'mongoose';

interface Special{
    name: string;
    tagline?: string;
    description?: string | null;
    images?: string[];
    smallImages?: string[] | null;
    type?: string;
    subCategories?: Array<Schema.Types.ObjectId | string>;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const SpecialSchema = new Schema<Special>({
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
        enum: ["animation", "regular"],
        default: "regular",
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

export const SpecialModel = model<Special>('Special', SpecialSchema);
