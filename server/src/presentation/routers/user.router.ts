import { Router } from "express";
import {
  createUser,
  getUserById,
  getUserByEmail,
  listUsers,
  updateUser,
  deleteUser,
  verifyEmail,
  forgotPassword,
  changePassword,
  login,
} from "../controllers/user.controller";
import { authMiddleware } from "../../middleware/AuthMiddleware";

const router = Router();

// Create a new user
router.post("/", createUser);

// List all users
router.get("/", listUsers);

// Get a user by ID
router.get("/id/:id", getUserById);

// Get a user by email
router.get("/email/:email", getUserByEmail);

//forgrt password
router.post("/password", forgotPassword);  


// Update a user
router.put("/id/:id", authMiddleware, updateUser);

// Soft delete a user
router.delete("/id/:id", deleteUser);

// Verify email
router.get("/verify-email/id/:id", verifyEmail);

// Change password
router.post("/active/change-password",authMiddleware, changePassword);   

// Login
router.post("/login", login);

export default router;