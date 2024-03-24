// interfaces
export interface CreateAdminInterface {
    name: string;
    email: string;
    password: string;
    createdBy?: string
}

export interface GetDataInterface {
    value?: string
}

export interface UpdateAdminInterface {
    name?: string;
    email?: string;
    updatedBy?: string
    updatedAt?: Date
}

export interface ResetPassInterface {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}