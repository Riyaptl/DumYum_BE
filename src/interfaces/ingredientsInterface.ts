
export interface Common {
    name: string;
    image?: string;
    type?: string;
    size?: string;
    tagline?: string;
    sellingPrice?: string | null;
    gst?: string | null;
    gstValue?: string | null;
    finalPrice?: string | null;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}


export interface CreateIngredientInterface extends Common { 
    entry: string
}

export interface UpdateIngredientInterface extends Common { 
    entry: string,
}