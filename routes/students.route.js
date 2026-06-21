import { Router } from "express";
import studentsController from "../controllers/students.controller.js";
import validateStudent from "../middleWares/ValidationStudent.js";
import verifyToken from "../middleWares/verifyToken.js";
import allowTo from "../middleWares/allowTo.js";
import Roles from "../utils/userRoles.js";

const router = Router();
router.use(verifyToken)

router.use(allowTo(Roles.ADMIN))


router.route('/')
    .get(studentsController.getStudents)
    .post(validateStudent.validateCreateStudent, studentsController.postStudents)

router.route('/:id')
    .delete(studentsController.deleteStudent)
    .patch(validateStudent.validateCreateStudent, studentsController.updateStudent)

router.route('/:id/remove-from-group')
    .patch(studentsController.deleteStudentFromGroup)


    
export default router;