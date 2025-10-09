import {IRegisterMailDto} from "../../Modules/Emails/entities/email.entities";

export enum EventType {
    SEND_WELCOME_MAIL = "SEND_WELCOME_MAIL",
}

export type EventPayloads = {
    [EventType.SEND_WELCOME_MAIL]: IRegisterMailDto;
};
