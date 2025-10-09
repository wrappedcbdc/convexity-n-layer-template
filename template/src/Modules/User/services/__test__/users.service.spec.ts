import {jest, expect, describe, it, beforeEach} from '@jest/globals';
import UsersRepository from '../../repository/user.repository';

jest.mock('../../repository/user.repository', () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
    },
}));

jest.mock('../../../../Core/Events/event.bus', () => ({
    __esModule: true,
    eventBus: {
        publish: jest.fn(),
        subscribe: jest.fn(),
    },
}));

import UsersService from '../../services/users.service';
import {ICreateUser, IUser} from '../../entity/user.entity';
import {eventBus} from '../../../../Core/Events/event.bus';
import {EventType} from '../../../../Core/Events/event.types';

beforeEach(() => {
    jest.clearAllMocks();
});

describe('UsersService Test Suite', () => {
    let userServiceInstance: any;

    const mockUser: IUser = {
        id: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'test@example.com',
        password: 'hashed-password',
        firstname: 'Test User',
        lastname: 'Example',
        phone: '+1234567890',
    };

    const mockLoginDto: ICreateUser = {
        email: 'test@example.com',
        password: 'hashed-password',
        firstname: 'Test User',
        lastname: 'Example',
        phone: '+1234567890',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        userServiceInstance = UsersService;
        (UsersRepository.create as jest.Mock).mockResolvedValue(mockUser as never);
    });

    describe('User Service Test Suite', () => {
        it('should successfully register a new user', async () => {
            const result = await userServiceInstance.RegisterNewUser(mockLoginDto);

            expect(UsersRepository.create).toHaveBeenCalledWith(mockLoginDto);
            expect(eventBus.publish).toHaveBeenCalledWith(
                EventType.SEND_WELCOME_MAIL,
                expect.objectContaining({
                    user: mockUser,
                }),
            );

            // Service returns the created user object
            expect(result).toEqual(mockUser);
        });
    });
});