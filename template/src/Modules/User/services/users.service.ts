import {IUser, IUserService, ICreateUser} from "../entity/user.entity";
import UserRepository from "../repository/user.repository";
import {EventType} from "../../../Core/Events/event.types";
import {eventBus} from "../../../Core/Events/event.bus";

// Implement a service decorator to catch and report errors
// @ReportErrorsAll()
class UsersService implements IUserService {

    public repository = UserRepository;
    private static instance: UsersService;

    // Singleton: prevent direct construction calls with the `new` operator
    static getInstance(): UsersService {
        if (!UsersService.instance) {
            UsersService.instance = new UsersService();
        }
        return UsersService.instance;
    }

    public async RegisterNewUser(data: ICreateUser): Promise<IUser> {
        const user = await this.repository.create(data);
        await this.notifyRegister(user);
        return user;
    }

    private async notifyRegister(user: IUser): Promise<void> {
        const payload = { user };
        // Trigger the event to send a welcome email
        eventBus.publish(EventType.SEND_WELCOME_MAIL, payload);
    }

}

export default UsersService.getInstance();