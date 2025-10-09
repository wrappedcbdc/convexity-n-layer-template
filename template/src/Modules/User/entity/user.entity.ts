
export interface IUser extends ICreateUser {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateUser {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    phone?: string;
}

export interface IUserRepository {
    create(data: ICreateUser): Promise<IUser>
}

export interface IUserService {
    RegisterNewUser(data: ICreateUser): Promise<IUser>
}