import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateQueryDto {

    @IsNotEmpty()
    @IsString()
    title: string
   
    @IsNotEmpty()
    @IsString()
    orderId: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsString()
    image?: string

    constructor(title: string, orderId: string, description: string, image: string){
        this.title = title
        this.orderId = orderId
        this.description = description
        this.image = image
    }
}
