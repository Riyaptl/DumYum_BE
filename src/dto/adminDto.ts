// src/dto/create-user.dto.js

import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateAdminDto {

    constructor(name: string, email: string, password: string) {
      this.name = name;
      this.email = email;
      this.password = password
    }

    @IsNotEmpty()
    @IsString()
    name!: string;
    
    @IsNotEmpty()
    @IsEmail()
    email!: string;
    
    @IsNotEmpty()
    @IsString()
    password!: string;
    
}

export class GetDataDto {
  constructor(value: string){
    this.value = value
  }

  @IsOptional()
  @IsString()
  value?: string 
}


export class UpdateAdminDto {
  constructor(name: string, email: string){
    this.name = name
    this.email = email
  }

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string
}

export class ResetPassDto {

  @IsNotEmpty()
  @IsString()
  oldPassword!: string;

  @IsNotEmpty()
  @IsString()
  newPassword!: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword!: string;

  constructor(oldPassword: string, newPassword: string, confirmPassword: string){
    this.oldPassword = oldPassword
    this.newPassword = newPassword
    this.confirmPassword = confirmPassword
  }
}
export class sendOTPDto {

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email!: string;

  constructor(email: string){
    this.email = email
  }
}
export class ForgotPassDto {

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  otp!: string;

  @IsNotEmpty()
  @IsString()
  newPassword!: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword!: string;

  constructor(email: string, otp: string, newPassword: string, confirmPassword: string){
    this.email = email
    this.otp = otp
    this.newPassword = newPassword
    this.confirmPassword = confirmPassword
  }
}
