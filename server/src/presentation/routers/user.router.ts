import { Router } from "express";
import {
  createUser,
  getUserById,
  getUserByEmail,
  listUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

const router = Router();

// Create a new user
router.post("/", createUser);

// List all users
router.get("/", listUsers);

// Get a user by ID
router.get("/id/:id", getUserById);

// Get a user by email
router.get("/email/:email", getUserByEmail);

// Update a user
router.put("/id/:id", updateUser);

// Soft delete a user
router.delete("/id/:id", deleteUser);

export default router;