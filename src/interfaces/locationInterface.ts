

export interface CreateLocationInterface {
    area?: string;
    city?: string;
    state?: string;
    pincode: string;
    ecd: string;
    priceLimit?: string;
    etd: string;
    createdBy?: string;
}

export interface UpdateLocationInterface {
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    ecd?: string;
    priceLimit?: string;
    etd?: string;
    updatedBy?: string;
    updatedAt?: Date;
}

export interface ChangesLocationInterface {
    area?: string;
    city?: string;
    ecd?: string;
    priceLimit?: string;
    etd?: string;
    updatedBy?: string;
    updatedAt?: Date;
}