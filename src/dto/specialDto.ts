import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";



export class AddSpecialDto {

    @IsNotEmpty()
    @IsArray()
    @IsString({each: true})
    subCategoryIds!: string[];

    constructor(subCategoryIds: string[]){
        this.subCategoryIds = subCategoryIds
    }
}

export class TypeSpecialDto {

    @IsNotEmpty()
    @IsString()
    @IsIn(["animation", "regular"])
    type!: string;

    constructor(type: string){
        this.type = type
    }
}