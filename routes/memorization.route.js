import { Router } from "express";
import memorizationController from "../controllers/memorization.controller.js";
import verifyToken from "../middleWares/verifyToken.js";
import allowTo from "../middleWares/allowTo.js";
import Roles from "../utils/userRoles.js";


const router = Router();

router.use(verifyToken)
router.use(allowTo(Roles.TEACHER));

router.route("/")
    .post(memorizationController.createMemorization)

export default router;