import {IUser} from "../../User/entity/user.entity";

export interface IRegisterMailDto {
    user: IUser;
}

export interface IEmailService {
    sendRegisterMail(data: IRegisterMailDto): Promise<void>
}



