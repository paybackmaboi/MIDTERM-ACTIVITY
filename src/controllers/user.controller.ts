import express, { Router, Request, Response, NextFunction } from "express";
import { User } from "../entities/user.entity"; 
import { StatusCodes } from "http-status-codes";
import * as database from "../users/user.database";
import bcrypt from "bcrypt"; 

const asyncHandler = (fn: Function) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

export const userRouter = Router();

userRouter.get("/users", asyncHandler(async (req: Request, res: Response) => {
    const allUsers: User[] = await database.findAll(); 
    res.status(StatusCodes.OK).json({ total_users: allUsers.length, allUsers });
}));

userRouter.get("/user/:id", asyncHandler(async (req: Request, res: Response) => {
    const user: User | null = await database.findOne(req.params.id); 
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found!' });
    }
    res.status(StatusCodes.OK).json(user);
}));

userRouter.post("/register", asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'All fields are required.' });
    }

    const existingUser = await database.findByEmail(email); 
    if (existingUser) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email is already registered.' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10); 

   
    const newUser = await database.create({ username, email, password: hashedPassword });
    res.status(StatusCodes.CREATED).json(newUser);
}));

userRouter.post("/login", asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "All fields are required." });
    }
    const user = await database.findByEmail(email);
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: "No user found with this email." });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Incorrect Password!' });
    }
    res.status(StatusCodes.OK).json({ message: "Login successful", user });
}));

userRouter.put("/user/:id", asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'All fields are required.' });
    }
    const user = await database.findOne(req.params.id);
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: `User with ID ${req.params.id} not found` });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await database.update(req.params.id, { username, email, password: hashedPassword });
    res.status(StatusCodes.OK).json(updatedUser);
}));

userRouter.delete("/user/:id", asyncHandler(async (req: Request, res: Response) => {
    const userExists = await database.findOne(req.params.id);
    if (!userExists) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
    }
    await database.remove(req.params.id);
    res.status(StatusCodes.OK).json({ message: "User deleted" });
}));