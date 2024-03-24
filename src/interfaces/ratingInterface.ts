import { Types } from "mongoose";

export interface Review{
    title?: string;
    description?: string;
    rating: string;
    customer: string;
    createdAt?: Date;
}

export interface CreateRatingInterface {
    subCategoryId: Types.ObjectId | string;
    subCategory: string;
    review: Review
    rating?: string
}