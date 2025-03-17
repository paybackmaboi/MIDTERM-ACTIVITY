import { Router } from 'express';
import { UserService } from '../services/user.service';

const router = Router();
const userService = new UserService();

// Create new user
router.post('/', async (req, res, next) => {
    try {
        const { email, password, employeeId } = req.body;

        if (!email || !password || !employeeId) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        const newUser = await userService.create({
            email,
            password,
            employeeId
        });

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: newUser
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating user'
        });
    }
});

// Get all users
router.get('/', async (req, res, next) => {
    try {
        const users = await userService.getAll();
        res.json({
            status: 'success',
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching users'
        });
    }
});

// Get user by ID
router.get('/:id', async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user ID'
            });
        }

        const user = await userService.getById(userId);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: user
        });
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user by ID'
        });
    }
});

// Update user
router.put('/:id', async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user ID'
            });
        }

        const { email, password, employeeId } = req.body;

        const updatedUser = await userService.update(userId, {
            email,
            password,
            employeeId
        });

        if (!updatedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating user'
        });
    }
});

// Delete user
router.delete('/:id', async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user ID'
            });
        }

        const deletedUser = await userService.delete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting user'
        });
    }
});

// Login user
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
        }

        const employee = await userService.login(email, password);

        res.json({
            status: 'success',
            data: employee
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error logging in user'
        });
    }
});

export default router;