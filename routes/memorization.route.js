import { Router } from "express";
import memorizationController from "../controllers/memorization.controller.js";
import verifyToken from "../middleWares/verifyToken.js";
import allowTo from "../middleWares/allowTo.js";
import Roles from "../utils/userRoles.js";
import createMemorizationValidation from "../middleWares/validationMemorization.js";
import createMemorizationRecordValidation from "../middleWares/validationMemorizationRecord.js";


const router = Router();

router.use(verifyToken)
router.use(allowTo(Roles.TEACHER));

router.route("/group/:groupId/student/:studentId")
    .post(createMemorizationRecordValidation, memorizationController.createMemorization)

router.route("/assignments/:groupId")
    .post(createMemorizationValidation, memorizationController.createMemorizationAssignments)

router.route("/revisions/:groupId")
    .post(createMemorizationValidation, memorizationController.createRevisionAssignments)

export default router;