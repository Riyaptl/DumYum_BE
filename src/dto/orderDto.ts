import { IsIn, IsNotEmpty, IsOptional, IsString, isIBAN } from "class-validator";

export class UpdateTimeOrderDto{

    @IsOptional()
    @IsString()
    etd?: string;

    @IsOptional()
    @IsString()
    etp?: string;
    constructor(etd: string, etp: string){
        this.etd = etd,
        this.etp = etp
    }
}
export class UpdatePriceOrderDto{

    @IsOptional()
    @IsString()
    extraDiscount?: string;

    @IsOptional()
    @IsString()
    ecd?: string;
    constructor(extraDiscount: string, ecd: string){
        this.extraDiscount = extraDiscount,
        this.ecd = ecd
    }
}
export class UpdatePaymentOrderDto{

    @IsOptional()
    @IsString()
    @IsIn(['paid', 'unpaid'])
    paymentStatus?: string;

    @IsOptional()
    @IsString()
    @IsIn(['UPI', 'Cash'])
    paymentMethod?: string;

    constructor(paymentStatus: string, paymentMethod: string){
        this.paymentStatus = paymentStatus,
        this.paymentMethod = paymentMethod
    }
}

export class ClosePaymentOrderDto{

    @IsNotEmpty()
    @IsString()
    @IsIn(['closed', 'cancelled'])
    type: string;

    @IsOptional()
    @IsString()
    @IsIn(['UPI', 'Cash On Delivery'])
    paymentMethod?: string;

    constructor(type: string, paymentMethod: string){
        this.type = type
        this.paymentMethod = paymentMethod
    }
}