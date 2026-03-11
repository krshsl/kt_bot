import { Router } from "express";

import { health } from "../controller/health";

const router = Router();

router.get("/", health);

export default router;
