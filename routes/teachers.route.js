import { Router } from "express"; 
import teachersController from "../controllers/teachers.controller.js";
import verifyToken from "../middleWares/verifyToken.js";
import allowTo from "../middleWares/allowTo.js";
import Roles from "../utils/userRoles.js";

const router = Router();
router.use(verifyToken)


router.route("/")
    .get(allowTo(Roles.ADMIN),teachersController.getAllTeachers)

router.route("/my-groups")
    .get(allowTo(Roles.TEACHER), teachersController.getMyGroups);

router.route("/:id")
    .get(allowTo(Roles.ADMIN), teachersController.getTeacherById)
    
router.route("/my-groups/:id")
    .get(allowTo(Roles.TEACHER), teachersController.getMyGroupStudents)

export default router;