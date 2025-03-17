import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    ManyToMany,
    ManyToOne,
    OneToOne,
    JoinTable,
    JoinColumn
} from 'typeorm';
import { Department } from './department.entity';
import { Project } from './project.entity';
import { User } from './user.entity';

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    position: string;

    @Column({ nullable: true }) 
    jobTitle: string;

    @Column()
    salary: number;

    @ManyToOne(() => Department)
    department: Department;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    hireDate: Date;

    @ManyToMany(() => Project, project => project.employees)
    @JoinTable()
    projects: Project[];

    @OneToOne(() => User, user => user.employee)
    user: User;
}