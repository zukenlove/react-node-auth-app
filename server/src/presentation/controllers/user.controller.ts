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

// Get a user by ID
export const getUserById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get a user by email
export const getUserByEmail = async (req: any, res: any) => {
  try {
    const { email } = req.params;
    const user = await userService.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// List all users
export const listUsers = async (_req: any, res: any) => {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update a user
export const updateUser = async (req: any, res: any) => {
  try {
    const { id, username, email, password } = req.body;
    const user = User.register({ id, username, email, password }); // Use factory to maintain invariants
    const updatedUser = await userService.updateUser(user);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Soft delete a user
export const deleteUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};