

export interface AddCartInterface {
    subCategoryId: string
    quantity: number
}

export interface AddMessageInterface {
    message?: string,
    orderFor: "oneself" | 'other' | undefined
}

interface CartItems {
    subCategoryId: string
    quantity: number
}

export interface AddBucketCartInterface {
    bucket: Array<CartItems>
    
}

export interface SubCatQuantityInterface {
    subCategoryId: string
}

export interface UpdateQuantityCartInterface {
    subCategoryId: string
    quantity: number
}

export interface RemoveCartInterface {
    subCategoryId: string
    quantity: string
}

