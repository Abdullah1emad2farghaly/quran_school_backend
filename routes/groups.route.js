import { Router } from "express";
import groupController from "../controllers/groups.controller.js";
import validateGroup from "../middleWares/validationGroup.js";
import verifyToken from "../middleWares/verifyToken.js";
import allowTo from "../middleWares/allowTo.js";
import Roles from "../utils/userRoles.js";
const router = Router();
router.use(verifyToken)

router.route("/")
    .get(allowTo(Roles.ADMIN), groupController.getAllGroups)
    .post(allowTo(Roles.ADMIN), validateGroup.validateCreateGroup, groupController.createGroup);

router.route("/:id")
    .delete(allowTo(Roles.ADMIN), groupController.deleteGroup)
    .put(allowTo(Roles.ADMIN), validateGroup.validateCreateGroup, groupController.updateGroup)
    .get(allowTo(Roles.ADMIN), groupController.getGroupById)
    .post(allowTo(Roles.TEACHER), groupController.createGroupSession)

router.route("/last-session/:id")
    .get(allowTo(Roles.TEACHER), groupController.getLastGroupSession)

router.route("/:id/toggle-active")
    .patch(allowTo(Roles.ADMIN), groupController.toggleGroupActivation)


export default router;