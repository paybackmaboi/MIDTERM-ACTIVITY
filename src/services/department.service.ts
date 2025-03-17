import { Repository } from 'typeorm';
import { AppDataSource } from '../database/db';
import { Department } from '../entities/department.entity';

export class DepartmentService {
    private departmentRepository: Repository<Department>;

    constructor() {
        this.departmentRepository = AppDataSource.getRepository(Department);
    }

    async create(departmentData: { name: string }) {
        const department = this.departmentRepository.create(departmentData);
        return this.departmentRepository.save(department);
    }


    async getAll() {
        return this.departmentRepository.find();
    }

    async getById(id: number) {
        return this.departmentRepository.findOne({
            where: { id },
            relations: ['employees']
        });
    }

}