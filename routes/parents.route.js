import { Router } from "express";
import parentController from "../controllers/parents.controller.js";
import verifyToken from "../middleWares/verifyToken.js";
import allowTo from "../middleWares/allowTo.js";
import Roles from "../utils/userRoles.js";

const router = Router();

router.use(verifyToken)
router.use(allowTo(Roles.PARENT));

router.route("/")
    .get(parentController.getMyChildren);

router.route("/:id")
    .get(parentController.getMyChildById);

export default router;