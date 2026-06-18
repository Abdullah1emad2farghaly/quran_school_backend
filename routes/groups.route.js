import { Router } from "express";
import groupController from "../controllers/groups.controller.js";
import validateGroup from "../middleWares/validationGroup.js";
import verifyToken from "../middleWares/verifyToken.js";
import allowTo from "../middleWares/allowTo.js";
import Roles from "../utils/userRoles.js";
const router = Router();
router.use(verifyToken)
router.use(allowTo(Roles.ADMIN));

router.route("/")
    .get(groupController.getAllGroups)
    .post(validateGroup.validateCreateGroup, groupController.createGroup);

router.route("/:id")
    .delete(groupController.deleteGroup)
    .put(validateGroup.validateCreateGroup, groupController.updateGroup)
    .get(groupController.getGroupById)

router.route("/:id/toggle-active")
    .patch(groupController.toggleGroupActivation)


export default router;