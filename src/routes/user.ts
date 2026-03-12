import { Router } from "express";

import { upload } from "../config/multer";
import { createUsers, getUser, getUsers, removeUser } from "../controller/user";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/users/:id", requireAuth, upload.single("file"), createUsers);
router.get("/users/:id", requireAuth, getUsers);
router.get("/user/:id", requireAuth, getUser);
router.delete("/user/:id", requireAuth, removeUser);

export default router;
