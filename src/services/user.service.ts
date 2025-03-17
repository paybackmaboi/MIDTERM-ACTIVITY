import { Repository } from 'typeorm';
import { AppDataSource } from '../database/db';
import { User } from '../entities/user.entity';
import { Employee } from '../entities/employee.entity';

export class UserService {
    private userRepository: Repository<User>;
    private employeeRepository: Repository<Employee>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.employeeRepository = AppDataSource.getRepository(Employee);
    }

    async create(userData: { email: string; password: string; employeeId: number }) {
        const employee = await this.employeeRepository.findOne({ where: { id: userData.employeeId } });

        if (!employee) {
            throw new Error('Employee not found');
        }

        const user = this.userRepository.create({
            email: userData.email,
            password: userData.password,
            employee: employee
        });

        return this.userRepository.save(user);
    }

    async getAll() {
        return this.userRepository.find({ relations: ['employee'] });
    }

    async getById(id: number) {
        return this.userRepository.findOne({ where: { id }, relations: ['employee'] });
    }

    async update(id: number, userData: { email?: string; password?: string; employeeId?: number }) {
        const user = await this.userRepository.findOne({ where: { id }, relations: ['employee'] });

        if (!user) {
            throw new Error('User not found');
        }

        if (userData.email) {
            user.email = userData.email;
        }

        if (userData.password) {
            user.password = userData.password;
        }

        if (userData.employeeId) {
            const employee = await this.employeeRepository.findOne({ where: { id: userData.employeeId } });

            if (!employee) {
                throw new Error('Employee not found');
            }

            user.employee = employee;
        }

        return this.userRepository.save(user);
    }

    async delete(id: number) {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new Error('User not found');
        }

        await this.userRepository.remove(user);
        return true;
    }

    async login(email: string, password: string) {
        const user = await this.userRepository.findOne({ where: { email }, relations: ['employee'] });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (user.password !== password) {
            throw new Error('Invalid email or password');
        }

        return user.employee;
    }
}