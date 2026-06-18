import { Router } from "express";
import authController from '../controllers/auth.controller.js'
const router = Router();

router.route("/login")
    .post(authController.login);

export default router;