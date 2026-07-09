import { Router } from "express";
import parentController from "../controllers/parents.controller.js";
import verifyToken from "../middleWares/verifyToken.js";
import allowTo from "../middleWares/allowTo.js";
import Roles from "../utils/userRoles.js";

const router = Router();

router.use(verifyToken)

router.route("/")
    .get(allowTo(Roles.ADMIN), parentController.getParents)
router.route("/:id/children")
    .get(allowTo(Roles.ADMIN), parentController.getParentChildren)
    
router.route("/:id")
    .get(allowTo(Roles.ADMIN), parentController.getParentById)

router.route("/my-children")
    .get(allowTo(Roles.PARENT), parentController.getMyChildren)

router.route("/my-childern/:id")
    .get(allowTo(Roles.PARENT), parentController.getMyChildById);

export default router;