import { Types } from "mongoose";
import { PredefinedOrder } from "../models/orderModel";
import { AddressDetailsInterface } from "../models/customerModel";



export interface CreateOrderInterface {
    customerId: string
    predefinedOrder: PredefinedOrder[];
    message?: string | null | undefined;
    orderFor?: string | null | undefined;
    predefinedPrice: number | undefined;
    predefinedQuantity: number | undefined;
    gst: number,
    gstPrice?: number; 
    finalPrice: number; 
    etp: number | undefined;
    addressDetails: AddressDetailsInterface;
    // etd?: string | null | undefined ;
    // ecd?: string | null | undefined;
    // priceLimit?: string | null | undefined;
}

export interface UpdateTimeOrderInterface {
    etd?: string;
    etp?: number;
}

export interface UpdatePriceOrderInterface {
    ecd?: string;
    extraDiscount?: number;
}

export interface UpdatePaymentOrderInterface {
    paymentStatus?: string;
    paymentMethod?: string;
}

export interface CloseOrderInterface {
    type: 'closed' | 'cancelled'
    closedBy?: string;
    closedAt?: Date;
    orderStatus?: string;
    delivered?: string;
}