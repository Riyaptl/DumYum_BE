import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateCategoryDto {

    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    tagline?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    @IsIn(['menubar', 'products'])
    type?: string;

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    images?: string[];

    constructor(name: string, tagline: string, description: string, type: string, images: string[]){
        this.name = name
        this.description = description
        this.tagline = tagline
        this.type = type
        this.images = images
    }
}

export class UpdateCategoryDto{
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    tagline?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    @IsIn(['menubar', 'products'])
    type?: string;

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    images?: string[];

    constructor(name: string, tagline: string, description: string, type: string, images: string[]){
        this.name = name
        this.description = description
        this.tagline = tagline
        this.type = type
        this.images = images
    }
}