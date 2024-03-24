import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Types } from "mongoose";

class Review {

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString()
    rating!: string;

    constructor(title: string, rating: string){
        this.title = title,
        this.rating = rating
    }

}

export class CreateRatingDto {
    @IsNotEmpty()
    @IsString()
    subCategoryId!: string;

    @ValidateNested({each: true})
    @Type( () => Review )
    review!: Review

    constructor(subCategoryId: string, review: Review){
        this.subCategoryId = subCategoryId
        this.review = review
    }
}