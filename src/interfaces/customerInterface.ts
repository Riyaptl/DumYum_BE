import { AddressDetailsInterface } from "../models/customerModel";

export interface CreateCustomerInterface {
    name: string;
    email: string;
    phone?: string;
    password: string;
    addressDetails?: AddressDetailsInterface[]
    pincode: string;
    gender?: 'female' | 'male' | 'other';
    birthdate?: string;
    marraigeStatus?: 'married' | 'unmarried';
    kidsStatus?: 'yes' | 'no';
    anniversary?: string;
    kidsBirthdate?: string[];
}

export interface UpdateCustomerInterface {
    name?: string;
    email?: string;
    phone?: string;
    gender?: 'female' | 'male' | 'other';
    birthdate?: string;
    marraigeStatus?: 'married' | 'unmarried';
    kidsStatus?: 'yes' | 'no';
    anniversary?: string;
    kidsBirthdate?: string[];
    updatedAt?: Date;
}
