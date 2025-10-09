import {ICreateUser, IUser, IUserRepository} from "../entity/user.entity";

let instance: UserRepository;

class UserRepository implements IUserRepository {

    constructor() {
        if (instance) {
            throw new Error("Error: Instantiation failed: Use UserRepository.getInstance() instead of new.");
        }
        instance = this;
    }

    getInstance(): UserRepository {
        return instance;
    }

    async create(data: ICreateUser): Promise<IUser> {
        // Implementation of user creation logic
        // User any ORM or database logic here
        return Promise.resolve({
            id: Math.random().toString(36).substring(2, 15), // Mock ID generation
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

}

const repo = new UserRepository();
export default repo.getInstance();