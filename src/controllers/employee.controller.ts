import { Router } from 'express';
import { EmployeeService } from '../services/employee.service';

const router = Router();
const employeeService = new EmployeeService();

employeeService.assignToProject(1, 2) // Assign Employee ID 1 to Project ID 2
    .then(result => console.log('Assignment successful:', result))
    .catch(error => console.error('Error:', error.message));
    
//get all employees
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const employees = await employeeService.getAllWithPagination(page, limit);
        // Return array directly to match the example
        res.json(employees);
    } catch (err) {
        console.error('Error in get employees:', err);
        next(err);
    }
});


// get single employee by id
router.get('/:id', async (req, res, next) => {
    try {
        const employeeId = parseInt(req.params.id);
        const employee = await employeeService.getById(employeeId);

        if (!employee) {
            return res.status(404).json({
                status: 'error',
                message: 'Employee not found'
            });
        }

        res.json({
            status: 'success',
            data: employee
        });
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching employee by ID'
        });
    }
});



// Create new employee
router.post('/', async (req, res, next) => {
    try {
        const { name, position, departmentId, hireDate, salary } = req.body;

        if (!name || !position || !departmentId || !hireDate || salary === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        const newEmployee = await employeeService.create({
            name,
            position,
            departmentId,
            hireDate,
            salary
        });

        res.status(201).json({
            status: 'success',
            message: 'Employee created successfully',
            data: newEmployee
        });
    } catch (error) {
        if (error.message === 'Department not found') {
            return res.status(404).json({
                status: 'error',
                message: 'Department not found'
            });
        }

        console.error('Error creating employee:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating employee'
        });
    }
});


// Update employee salary
router.put('/:id/salary', async (req, res, next) => {
    try {
        const employeeId = parseInt(req.params.id);
        const { salary } = req.body;

        if (salary === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'Salary is required'
            });
        }

        const updatedEmployee = await employeeService.updateSalary(employeeId, salary);

        if (!updatedEmployee) {
            return res.status(404).json({
                status: 'error',
                message: 'Employee not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Employee salary updated successfully',
            data: updatedEmployee
        });
    } catch (error) {
        console.error('Error updating employee salary:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating employee salary'
        });
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const employeeId = parseInt(req.params.id);
        
        const result = await employeeService.softDelete(employeeId);
        
        res.json({
            status: 'success',
            message: 'Employee deactivated successfully',
            data: result
        });
    } catch (err) {
        if (err.message === 'Employee not found') {
            return res.status(404).json({
                status: 'error',
                message: 'Employee not found'
            });
        }
        next(err);
    }
});

// Search employee by name
router.get('/search', async (req, res, next) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'Name query parameter is required'
            });
        }

        const employees = await employeeService.searchByName(name as string);

        res.json({
            status: 'success',
            data: employees
        });
    } catch (error) {
        console.error('Error searching employee by name:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error searching employee by name'
        });
    }
});



router.post('/:id/projects', async (req, res, next) => {
    try {
        const employeeId = parseInt(req.params.id);
        const { projectId } = req.body;

        if (!projectId) {
            return res.status(400).json({
                status: 'error',
                message: 'Project ID is required'
            });
        }

        const result = await employeeService.assignToProject(employeeId, projectId);
        
        res.status(200).json({
            status: 'success',
            message: 'Employee assigned to project successfully',
            data: result
        });
    } catch (error) {
        if (error.message === 'Employee not found') {
            return res.status(404).json({
                status: 'error',
                message: 'Employee not found'
            });
        }
        if (error.message === 'Project not found') {
            return res.status(404).json({
                status: 'error',
                message: 'Project not found'
            });
        }
        next(error);
    }
});






export default router;