import { Router } from "express";
import memorizationController from "../controllers/memorization.controller.js";
import verifyToken from "../middleWares/verifyToken.js";


const router = Router();
router.use(verifyToken)


router.route("/")
    .post(memorizationController.createMemorization)

export default router;