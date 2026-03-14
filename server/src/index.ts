import express from "express";
import type { Response, Request } from "express";
import  userRouter  from "./presentation/routers/user.router";

const app = express();
const PORT = 4000;

app.use(express.json());

// Register user routes
app.use("/users", userRouter);

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});