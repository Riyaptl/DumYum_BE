// src/dto/create-user.dto.js

import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsIBAN, IsIn, IsArray, ValidateNested } from 'class-validator';


export class AddressDetailsDto {
    @IsNotEmpty()
    @IsString()
    pincode: string

    @IsOptional()
    @IsString()
    houseNumber?: string;

    @IsOptional()
    @IsString()
    street?: string;

    @IsOptional()
    @IsString()
    nearby?: string;
    
    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    constructor(houseNumber: string, street: string, nearby: string, city: string, state: string, pincode: string){
      this.houseNumber = houseNumber
      this.street = street
      this.nearby = nearby
      this.city = city
      this.state = state
      this.pincode = pincode
    }
}

export class CheckEmailDto {
    
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email!: string;

    constructor( email: string) {
      this.email = email;
    }
}

export class CreateCustomerDto {

    @IsNotEmpty()
    @IsString()
    name!: string;
    
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;

    @IsNotEmpty()
    @IsString()
    pincode: string

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => AddressDetailsDto)
    addressDetails?: AddressDetailsDto[];
    
    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;
    
    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    @IsIn(['female', 'male', 'other'])
    gender?: string;

    @IsOptional()
    @IsString()
    birthdate?: string;

    @IsOptional()
    @IsString()
    @IsIn(['married', 'unmarried'])
    marraigeStatus?: string;

    @IsOptional()
    @IsString()
    @IsIn(['yes', 'no'])
    kidsStatus?: string;

    @IsOptional()
    @IsString()    
    anniversary?: string;

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    kidsBirthdate?: string[];
    
    constructor(name: string, email: string, phone: string, password: string, addressDetails: AddressDetailsDto[], pincode: string, gender: string, birthdate: string, marraigeStatus: string, kidsStatus: string, anniversary: string, kidsBirthdate: string[]) {
      this.name = name;
      this.email = email;
      this.phone = phone;
      this.password = password
      this.addressDetails = addressDetails
      this.pincode = pincode
      this.gender = gender
      this.birthdate = birthdate
      this.marraigeStatus = marraigeStatus
      this.kidsStatus = kidsStatus
      this.kidsBirthdate = kidsBirthdate
      this.anniversary = anniversary
    }
}

export class UpdateCustomerDto {
    @IsOptional()
    @IsString()
    name?: string;
    
    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    @IsIn(['female', 'male', 'other'])
    gender?: string;

    @IsOptional()
    @IsString()
    birthdate?: string;

    @IsOptional()
    @IsString()
    @IsIn(['married', 'unmarried'])
    marraigeStatus?: string;

    @IsOptional()
    @IsString()
    @IsIn(['yes', 'no'])
    kidsStatus?: string;

    @IsOptional()
    @IsString()    
    anniversary?: string;

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    kidsBirthdate?: string[];
    
    constructor(name: string, email: string, phone: string, gender: string, birthdate: string, marraigeStatus: string, kidsStatus: string, anniversary: string, kidsBirthdate: string[]) {
      this.name = name;
      this.email = email;
      this.phone = phone;
      this.gender = gender
      this.birthdate = birthdate
      this.marraigeStatus = marraigeStatus
      this.kidsStatus = kidsStatus
      this.kidsBirthdate = kidsBirthdate
      this.anniversary = anniversary
    }
}


export class SelectPincodeCustomerDto {
  @IsNotEmpty()
  @IsString()
  pincode: string

  constructor(pincode: string){
    this.pincode = pincode
  }
}
