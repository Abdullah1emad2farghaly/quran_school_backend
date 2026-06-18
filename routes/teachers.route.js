import { Router } from "express"; 
import teachersController from "../controllers/teachers.controller.js";
import verifyToken from "../middleWares/verifyToken.js";
import allowTo from "../middleWares/allowTo.js";
import Roles from "../utils/userRoles.js";

const router = Router();
router.use(verifyToken)
router.use(allowTo(Roles.TEACHER))


router.route("/")
    .get(teachersController.getMyGroups);
router.route("/:id")
    .get(teachersController.getMyGroupStudents)

export default router;