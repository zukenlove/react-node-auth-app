import express from "express";
import type { Response, Request } from "express";

const app = express();
const PORT = 4000;

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});