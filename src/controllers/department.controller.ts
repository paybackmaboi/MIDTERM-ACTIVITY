import { Router } from 'express';
import { DepartmentService } from '../services/department.service';

const router = Router();
const departmentService = new DepartmentService();

router.post('/', async (req, res, next) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'Department name is required'
            });
        }

        const newDepartment = await departmentService.create({ name });
        
        res.status(201).json({
            status: 'success',
            message: 'Department created successfully',
            data: newDepartment
        });
    } catch (err) {
        next(err);
    }
});


// Get all departments
router.get('/', async (req, res, next) => {
    try {
        const departments = await departmentService.getAll();
        res.json({
            status: 'success',
            data: departments
        });
    } catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching departments'
        });
    }
});


// Get department by ID
router.get('/:id', async (req, res, next) => {
    try {
        const departmentId = parseInt(req.params.id);
        const department = await departmentService.getById(departmentId);

        if (!department) {
            return res.status(404).json({
                status: 'error',
                message: 'Department not found'
            });
        }

        res.json({
            status: 'success',
            data: department
        });
    } catch (err) {
        console.error('Error fetching department by ID:', err);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching department by ID'
        });
    }
});

export default router;