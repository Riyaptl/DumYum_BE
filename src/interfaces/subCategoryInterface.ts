

export interface CreateSubCategoryInterface{
    name: string;
    description?: string;
    tagline?: string;
    tags?: string[];
    images?: string[];
    category?: string;
    special?: string;
    categoryId: string;
    etp?: string;
    costPrice?: string ; 
    sellingPrice?: string; 
    discount?: string; 
    discountedPrice?: string; 
    gst?: string; 
    gstPrice?: string; 
    finalPrice?: string; 
    quantity?: string;
    hold: boolean
    createdBy?: string;
}

export interface EtpSubCategoryInterface{
    etp: string;
    updatedBy?: string;
    updatedAt?: Date;
}

export interface UpdateSubCategoryPriceInterface{
    costPrice?: string ; 
    sellingPrice?: string; 
    discount?: string; 
    discountedPrice?: string; 
    gst?: string; 
    gstPrice?: string; 
    finalPrice?: string; 
    updatedBy?: string;
    updatedAt?: Date;
}

export interface UpdateSubCategoryBasicInterface{
    name: string;
    description?: string;
    tagline?: string;
    images?: string[];
    category?: string; 
    special?: string; 
    categoryId: string; 
    quantity?: string;
    updatedBy?: string;
    updatedAt?: Date;
}