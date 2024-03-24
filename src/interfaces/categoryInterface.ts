

export interface CreateCategoryInterface {
    name: string;
    tagline?: string;
    type?: 'menubar' | 'products';
    description?: string;
    images?: string[];
    createdBy?: string;
}

export interface UpdateCategoryInterface {
    name?: string;
    tagline?: string;
    type?: 'menubar' | 'products';
    description?: string;
    images?: string[];
    updatedBy?: string;
    updatedAt?: Date;
}

export interface AddSpecialInterface {
    subCategories: string[]
    updatedBy?: string;
    updatedAt?: Date;
}