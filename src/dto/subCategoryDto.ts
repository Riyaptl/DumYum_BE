import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSubCategoryDto{

    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    category!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    tagline?: string;
    
    @IsOptional()
    @IsArray()
    @IsString({each: true})
    tags?: string[];

    @IsOptional()
    @IsString()
    etp?: string;

    @IsOptional()
    @IsString()
    costPrice?: string ; 

    @IsOptional()
    @IsString()
    sellingPrice?: string; 

    @IsOptional()
    @IsString()
    discount?: string; 

    @IsOptional()
    @IsString()
    gst?: string; 

    @IsOptional()
    @IsString()
    quantity?: string;

    constructor(name: string, description: string, tagline: string, tags: string[], category: string, etp: string, costPrice: string, sellingPrice: string, discount: string, gst: string, quantity: string){
        this.name = name
        this.description = description
        this.tagline = tagline
        this.tags = tags
        this.category = category
        this.etp = etp
        this.costPrice = costPrice
        this.sellingPrice = sellingPrice
        this.discount = discount
        this.gst = gst
        this.quantity = quantity
    }
}

export class EtpSubCategoryDto{

    @IsNotEmpty()
    @IsString()
    etp: string;

    constructor(etp: string){
        this.etp = etp
    }
}

export class UpdateSubCategoryPriceDto{

    @IsOptional()
    @IsString()
    costPrice?: string ; 

    @IsOptional()
    @IsString()
    sellingPrice?: string; 

    @IsOptional()
    @IsString()
    discount?: string; 

    @IsOptional()
    @IsString()
    gst?: string; 

    @IsOptional()
    @IsString()
    quantity?: string;

    constructor(costPrice: string, sellingPrice: string, discount: string, gst: string, quantity: string){
        this.costPrice = costPrice
        this.sellingPrice = sellingPrice
        this.discount = discount
        this.gst = gst
        this.quantity = quantity
    }
}

export class UpdateSubCategoryBasicDto{

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    tagline?: string;

    @IsOptional()
    @IsString()
    quantity?: string;

    constructor(name: string, description: string, tagline: string, category: string, quantity: string){
        this.name = name
        this.description = description
        this.tagline = tagline
        this.category = category
        this.quantity = quantity
    }
}