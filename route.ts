import { EmployeeController } from "./controller/EmployeeController";
import { DepartmentController } from "./controller/DepartmentController";
import { Router } from "express";
import { ProductController } from "./controller/productController"; // Corrected import statement

const router = Router();
const employeeController = new EmployeeController();

export const Routes = [{
    method: "get",
    route: "/employees",
    controller: EmployeeController,
    action: "getAllEmployees"
}, {
    method: "get",
    route: "/employees/search",
    controller: EmployeeController,
    action: "searchEmployeesByName"
}, {
    method: "get",
    route: "/employees/:id",
    controller: EmployeeController,
    action: "getEmployeeById"
}, 
{
    method: "get",
    route: "/products",
    controller: ProductController,
    action: "getAllProducts"
}, {
    method: "post",
    route: "/employees",
    controller: EmployeeController,
    action: "createEmployee"
}, {
    method: "put",
    route: "/employees/:id",
    controller: EmployeeController,
    action: "updateEmployee"
}, {
    method: "delete",
    route: "/employees/:id",
    controller: EmployeeController,
    action: "deleteEmployee"
}, {
    method: "get",
    route: "/departments",
    controller: DepartmentController,
    action: "getAllDepartments"
}, {
    method: "get",
    route: "/departments/:id",
    controller: DepartmentController,
    action: "getDepartmentById"
}, {
    method: "post",
    route: "/departments",
    controller: DepartmentController,
    action: "createDepartment"
}, {
    method: "put",
    route: "/departments/:id",
    controller: DepartmentController,
    action: "updateDepartment"
}, {
    method: "delete",
    route: "/departments/:id",
    controller: DepartmentController,
    action: "deleteDepartment"
}, {
    method: "post",
    route: "/employees/:id/projects",
    controller: EmployeeController,
    action: "assignToProject"
}, {
    method: "put",
    route: "/employees/:id/salary",
    controller: EmployeeController,
    action: "updateEmployeeSalary"
}, {
    method: "get",
    route: "/tasks",
    controller: EmployeeController,
    action: "printTasks"
}, {
    method: "get",
    route: "/static-users",
    controller: (req, res) => {
        res.json(staticUsers);
    }
}];

const staticUsers = [
    { id: 1, name: "Chrystal Mae", email: "john.doe@example.com" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
    { id: 3, name: "Alice Johnson", email: "alice.johnson@example.com" }
];

// Apply routes to the router
Routes.forEach(route => {
    (router as any)[route.method](route.route, (req, res, next) => {
        const result = (new (route.controller as any))[route.action](req, res, next);
        if (result instanceof Promise) {
            result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)
                .catch(err => next(err));
        } else if (result !== null && result !== undefined) {
            res.json(result);
        }
    });
});

export default router;
