import { Router } from "express";
import groupScheduleController from "../controllers/groupSchedule.controller.js";
import validateGroupSchedule from "../middleWares/validationGroupSchedule.js";
import verifyToken from "../middleWares/verifyToken.js";

const router = Router();
router.use(verifyToken)

router.route("/")
    .post(validateGroupSchedule, groupScheduleController.addGroupSchedule)

router.route("/:id")
    .get(groupScheduleController.getGroupScheduleByGroupId)
    .put(validateGroupSchedule, groupScheduleController.updateGroupSchedule)
    .delete(groupScheduleController.deleteGroupSchedule)

export default router;