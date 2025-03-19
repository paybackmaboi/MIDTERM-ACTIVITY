import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Employee } from "../entity/employee";
import { Project } from "../entity/Project";
import { Like } from "typeorm";

export class EmployeeController {
  private employeeRepository = AppDataSource.getRepository(Employee);
  private projectRepository = AppDataSource.getRepository(Project);

  // Get all employees
  async getAllEmployees(req: Request, res: Response) {
    try {
      const employees = await this.employeeRepository.find({
        relations: ["department"],
      });
      return res.json(employees);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error fetching employees", error });
    }
  }

  // Get employee by ID
  async getEmployeeById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const employee = await this.employeeRepository.findOne({
        where: { id },
        relations: ["department"],
      });

      if (!employee) {
        return await res.status(404).json({ message: "Employee not found" });
      }
      return res.json(employee);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error fetching employee", error });
    }
  }

  // Create new employee
  async createEmployee(req: Request, res: Response) {
    try {
      const employee = this.employeeRepository.create(req.body);
      const result = await this.employeeRepository.save(employee);
      return res.status(201).json(result);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error creating employee", error });
    }
  }

  // Update employee
  async updateEmployee(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      let employee = await this.employeeRepository.findOneBy({ id });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      this.employeeRepository.merge(employee, req.body);
      const result = await this.employeeRepository.save(employee);
      return res.json(result);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error updating employee", error });
    }
  }

  // Delete employee
  async deleteEmployee(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      let employee = await this.employeeRepository.findOneBy({ id });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      await this.employeeRepository.remove(employee);
      return res.status(204).send();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error deleting employee", error });
    }
  }

  // Assign employee to a project
  async assignToProject(req: Request, res: Response) {
    try {
      const employeeId = parseInt(req.params.id);
      const { projectId } = req.body;

      // Validate input
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }

      // Find employee
      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId },
        relations: ["projects"]
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Find project
      const project = await this.projectRepository.findOneBy({ id: projectId });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Add project to employee's projects
      if (!employee.projects) {
        employee.projects = [];
      }
      
      // Check if project is already assigned to avoid duplicates
      const isAlreadyAssigned = employee.projects.some(p => p.id === project.id);
      
      if (!isAlreadyAssigned) {
        employee.projects.push(project);
        await this.employeeRepository.save(employee);
        return res.status(200).json({ 
          message: "Employee assigned to project successfully",
          employee
        });
      } else {
        return res.status(400).json({ 
          message: "Employee is already assigned to this project" 
        });
      }
    } catch (error) {
      return res.status(500).json({ 
        message: "Error assigning employee to project", 
        error 
      });
    }
  }

  // Search employees by name
  async searchEmployeesByName(req: Request, res: Response) {
    try {
      let { name } = req.query;
      
      if (!name) {
        return res.status(400).json({ message: "Name parameter is required" });
      }
      
      // Convert name to string if it's not already
      name = String(name);
      
      // Remove quotes if they exist
      if (name.startsWith('"') && name.endsWith('"')) {
        name = name.substring(1, name.length - 1);
      }

      const employees = await this.employeeRepository.find({
        where: {
          name: Like(`%${name}%`)
        },
        relations: ["department"]
      });

      return res.json(employees);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error searching employees", error });
    }
  }

  // Update employee salary
  async updateEmployeeSalary(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { salary, role } = req.body;

      // Basic validation
      if (salary === undefined || isNaN(Number(salary))) {
        return res.status(400).json({ message: "Valid salary is required" });
      }

      // Authorization check - ensure only HR can update salaries
      if (role !== 'HR') {
        return res.status(403).json({ 
          message: "Only HR personnel can update employee salaries" 
        });
      }

      // Find employee
      let employee = await this.employeeRepository.findOneBy({ id });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Update only the salary
      employee.salary = Number(salary);
      const result = await this.employeeRepository.save(employee);
      
      return res.json({
        message: "Employee salary updated successfully",
        employee: result
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error updating employee salary", error });
    }
  }

  // Calculate employee tenure
  async getEmployeeTenure(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      // Find employee
      const employee = await this.employeeRepository.findOneBy({ id });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Calculate tenure in years
      const hireDate = new Date(employee.hireDate);
      const currentDate = new Date();
      
      // Calculate difference in milliseconds
      const timeDiff = currentDate.getTime() - hireDate.getTime();
      
      // Convert to years (approximate)
      const yearsDiff = timeDiff / (1000 * 3600 * 24 * 365.25);
      
      // Round to 2 decimal places for precision
      const tenure = Math.round(yearsDiff * 100) / 100;

      return res.json({
        employeeId: employee.id,
        name: employee.name,
        hireDate: employee.hireDate,
        tenure: tenure,
        unit: "years"
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error calculating employee tenure", error });
    }
  }

  async printTasks(req: Request, res: Response) {
    // Example implementation
    const tasks = ["Smile", "Drink Water", "Take a shower"];
    res.json(tasks);
  }
}