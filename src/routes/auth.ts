import { Router } from "express";

import { getMe, refresh, signIn, signOut, signUp } from "../controller/auth";
import { requireAuth } from "../middleware/auth";

const router = Router();

// middleware can be added for this, but nvm, let's not have a url in the first place
if (process.env.NODE_ENV === "dev") router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.post("/signOut", requireAuth, signOut);
router.post("/refresh", refresh);
router.get("/me", requireAuth, getMe);

export default router;
