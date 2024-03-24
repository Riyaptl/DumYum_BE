import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateQueryDto {

    @IsNotEmpty()
    @IsString()
    title: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsString()
    image?: string

    constructor(title: string, description: string, image: string){
        this.title = title
        this.description = description
        this.image = image
    }
}
