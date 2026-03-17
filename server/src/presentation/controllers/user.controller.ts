import { User } from "../../domain/aggregate/User";
import { UserService } from "../../application/services/UserService";
import type { Request, Response } from "express";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { AuthService } from "../../application/services/AuthService";

const userService = new UserService(new PrismaUserRepository());
const authService = new AuthService(new PrismaUserRepository());


export interface AuthRequest extends Request {
  userId?: string;
}

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.register({ username, email, password });
    const userCreated = await userService.create(user);
    res.status(201).json(userCreated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// List all users
export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.list();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.findById(id as string);
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
export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const user = await userService.findByEmail(email as string);
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

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    // Only allow user to update themselves
    if (req.userId !== id) {
      return res.status(403).json({ error: "You can only update your own account" });
    }

    const user = await userService.findById(id as string);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await userService.update({id: id as string, username, email});

    res.status(200).json(updatedUser);

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userService.delete(id as string);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};      

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "User ID is required" });
    }     

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Verification code is required" });
    }
    const trimmedCode = code.trim();

    // Attempt to verify email using the service
    const updatedUser = await userService.verifyEmail(id as string, trimmedCode);

    if (!updatedUser) {
      return res.status(404).json({ error: "Invalid or expired verification code" });
    }
    // Success
    res.status(200).json({ message: "Email verified successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


export const changePassword = async (req: Request, res: Response) => {
  try {   
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "Email, current password, and new password are required" });
    }             
  const updatedUser = await userService.changePassword(email, currentPassword, newPassword);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    // Success
    res.status(200).json({ message: "Password reset successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email , password} = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    await userService.forgotPassword(email, password);

    return res.status(200).json({
      message: "Password reset successfully."
    });

  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "email and password are required" });
    }

    const result = await authService.login(email, password);

    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });

  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};