import { IsNotEmpty, IsOptional, IsString } from "class-validator";

class CommonDto {
    
    @IsOptional()
    @IsString()
    type?: string;
    
    @IsOptional()
    @IsString()
    size?: string;
    
    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    tagline?: string;

    @IsOptional()
    @IsString()
    sellingPrice?: string;

    @IsOptional()
    @IsString()
    gst?: string;

    constructor(type: string, size: string,image: string, tagline: string, sellingPrice: string, gst: string){
        this.type = type,
        this.size = size,
        this.image = image,
        this.tagline = tagline,
        this.sellingPrice = sellingPrice,
        this.gst = gst
    }
}

export class CreateIngredientDto extends CommonDto {

    @IsNotEmpty()
    @IsString()
    entry: String

    @IsNotEmpty()
    @IsString()
    name: string;

    constructor(type: string, size: string, image: string, name: string, tagline: string, sellingPrice: string, gst: string, entry: string){
        super(type, size, image, tagline, sellingPrice, gst)
        this.name = name
        this.entry = entry
    }
}

export class GetEachItemDto {

    @IsNotEmpty()
    @IsString()
    entry: String

    constructor(entry: string){
        this.entry = entry
    }
}

export class UpdateIngredientDto extends CommonDto {

    @IsNotEmpty()
    @IsString()
    entry: String

    @IsOptional()
    @IsString()
    name?: string;

    constructor(type: string, size: string, image: string, name: string, tagline: string, sellingPrice: string, gst: string, entry: string){
        super(type, size, image, tagline, sellingPrice, gst)
        this.name = name
        this.entry = entry
    }
}