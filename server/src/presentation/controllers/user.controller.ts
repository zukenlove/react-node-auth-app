import { User } from "../../domain/entities/User";
import { UserService } from "../../application/services/UserService";
import { PrismaUserRepository } from "../../infrastructure/repositories/UserRepository";

// Assume userRepository is an instance of a class implementing IUserRepository
// For example: new PrismaUserRepository()

const userService = new UserService(new PrismaUserRepository());

// Create a new user
export const createUser = async (req: any, res: any) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.register({ username, email, password });
    await userService.create(user);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// List all users
export const listUsers = async (req: any, res: any) => {
  try {
    const users = await userService.list();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get user by ID
export const getUserById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get user by email
export const getUserByEmail = async (req: any, res: any) => {
  try {
    const { email } = req.params;
    const user = await userService.findByEmail(email);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update user
export const updateUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;
    const user = await userService.findById(id);
    if (user) {
      user.setUsername(username);
      user.setEmail(email);
      if (password) {
        user.setPassword(password); // This will hash the password
      }
      await userService.update(user);
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Delete user
export const deleteUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await userService.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};      