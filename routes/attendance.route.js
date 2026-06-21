import { Router } from "express";
import attendanceController from "../controllers/attendances.controller.js";
import { body } from "express-validator";
import verifyToken from "../middleWares/verifyToken.js";
import allowTo from "../middleWares/allowTo.js";
import Roles from "../utils/userRoles.js";

const router = Router();

router.use(verifyToken)
router.use(allowTo(Roles.TEACHER))

router.route("/")
    .post(attendanceController.createAttendance)
    .get(attendanceController.getAllAttendance);

router.route("/:attendanceId")
    .delete(attendanceController.deleteAttendanceById);

router.route("/student/:studentId")
    .get(attendanceController.getAttendanceByStudent);


export default router;