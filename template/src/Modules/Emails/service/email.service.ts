import { eventBus } from "../../../Core/Events/event.bus";
import {IEmailService, IRegisterMailDto} from "../entities/email.entities";
import {EventType} from "../../../Core/Events/event.types";

export class EmailService implements IEmailService {

    constructor() {
        eventBus.subscribe(EventType.SEND_WELCOME_MAIL, this.sendRegisterMail.bind(this), "EmailService");
    }

    public async sendRegisterMail(data: IRegisterMailDto): Promise<void> {
        try {
            console.log(`Sending welcome email to ${data.user.email}`);
            // Here you would integrate with an actual email service provider
            // Simulating email sending with a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`Welcome email sent to ${data.user.email}`);
        }
        catch (error) {
            console.error("Error sending redeem failed email: ", error);
        }
    }

}
