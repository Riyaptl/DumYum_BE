import { Type } from "class-transformer";
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class AddCartDto {
    @IsNotEmpty()
    @IsString()
    subCategoryId!: string;
    
    @IsNotEmpty()
    @IsNumber()
    quantity!: number;

    constructor(subCategoryId: string, quantity: number){
        this.subCategoryId = subCategoryId
        this.quantity = quantity
    }
}

export class AddMessageDto {
    @IsOptional()
    @IsString()
    orderFor?: string;
    
    @IsOptional()
    @IsString()
    message?: number;

    constructor(orderFor: string, message: number){
        this.orderFor = orderFor
        this.message = message
    }
}

class ClassItemsDto {
    @IsNotEmpty()
    @IsString()
    subCategoryId!: string;
    
    @IsNotEmpty()
    @IsNumber()
    quantity!: number;

    constructor(subCategoryId: string, quantity: number){
        this.subCategoryId = subCategoryId
        this.quantity = quantity
    }
}

export class AddBucketCartDto {

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => ClassItemsDto)
    bucket!: ClassItemsDto[]

    constructor(bucket: Array<ClassItemsDto>){
        this.bucket = bucket
    }
}

export class SubCatQuantityDto {
    @IsNotEmpty()
    @IsString()
    subCategoryId!: string;

    constructor(subCategoryId: string){
        this.subCategoryId = subCategoryId
    }
}

export class UpdateQuantityCartDto {

    @IsNotEmpty()
    @IsString()
    subCategoryId: string;

    @IsOptional()
    @IsNumber()
    quantity?: number

    constructor(subCategoryId: string, quantity: number){
        this.subCategoryId = subCategoryId
        this.quantity = quantity
    }
}

export class RemoveCartDto {
    @IsNotEmpty()
    @IsString()
    subCategoryId!: string;


    constructor(subCategoryId: string){
        this.subCategoryId = subCategoryId
    }
}


export class CheckoutCartDto {
    @IsOptional()
    @IsString()
    @IsIn(['oneself', 'other'])
    orderFor?: string 
    
    @IsOptional()
    @IsString()
    message?: string 

    constructor(orderFor: string, message: string){
        this.orderFor = orderFor
        this.message = message
    }
}
