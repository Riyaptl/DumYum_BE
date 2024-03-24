import { IsNotEmpty, IsOptional, IsSemVer, IsString } from "class-validator";


export class CreateLocationDto {
    
    @IsNotEmpty()
    @IsString()
    pincode!: string;
    
    @IsNotEmpty()
    @IsString()
    ecd!: string;
    
    @IsNotEmpty()
    @IsString()
    etd!: string;

    @IsOptional()
    @IsString()
    area?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    priceLimit?: string;

    constructor(pincode: string, ecd: string, etd:string, area: string, city: string, state: string, priceLimit: string){
        this.pincode = pincode 
        this.ecd = ecd 
        this.etd = etd
        this.area = area
        this.city= city
        this.state = state
        this.priceLimit = priceLimit
    }
}

export class UpdateLocationDto {
    
    @IsOptional()
    @IsString()
    pincode?: string;
    
    @IsOptional()
    @IsString()
    ecd?: string;
    
    @IsOptional()
    @IsString()
    etd?: string;

    @IsOptional()
    @IsString()
    area?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    priceLimit?: string;

    constructor(pincode: string, ecd: string, etd:string, area: string, city: string, state: string, priceLimit: string){
        this.pincode = pincode 
        this.ecd = ecd 
        this.etd = etd
        this.area = area
        this.city= city
        this.state = state
        this.priceLimit = priceLimit
    }
}

export class ChangesLocationDto {
    
    @IsOptional()
    @IsString()
    ecd?: string;
    
    @IsOptional()
    @IsString()
    etd?: string;

    @IsOptional()
    @IsString()
    priceLimit?: string;

    @IsOptional()
    @IsString()
    area?: string;

    @IsOptional()
    @IsString()
    city?: string;



    constructor(ecd: string, etd:string, area: string, city: string, priceLimit: string){
        this.ecd = ecd 
        this.etd = etd
        this.area = area
        this.city= city
        this.priceLimit = priceLimit
    }
}