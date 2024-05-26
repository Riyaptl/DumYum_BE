import mongoose, { Document, Schema, model, Types } from 'mongoose';

interface Review {
    title?: string;
    description?: string;
    rating: string;
    customer: string;
    createdAt?: Date;
}

const ReviewSchema = new Schema<Review>({
    title: {
        type: String,
        trim: true,
        maxlength: 15
    },
    description: {
        type: String,
        trim: true,
        maxlength: 50
    },
    rating: {
        type: String,
        required: true,
        trim: true,
    },
    customer: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {_id: false});

interface Rating extends Document {
   category: string
   special: string
   subCategory: string
   subCategoryId: Types.ObjectId
   review: Review[],
   rating: string
}

const RatingSchema = new Schema<Rating>({
    category: {
        type: String,
        trim: true
    },
    special: {
        type: String,
        trim: true
    },
    subCategory: {
        type: String,
        required: true,
        trim: true
    },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory"
    },
    review: [ReviewSchema],
    rating: {
        type: String,
        trim: true
    }
});

export const RatingModel = model<Rating>('Rating', RatingSchema);
