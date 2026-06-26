import { Router } from "express";
import usersController from "../controllers/users.controller.js";
import validationUser from "../middleWares/validationUser.js";  
import verifyToken from "../middleWares/verifyToken.js";
import allowTo from "../middleWares/allowTo.js";
import Roles from "../utils/userRoles.js";
const router = Router();
router.use(verifyToken)
router.use(allowTo(Roles.ADMIN));

router.route("/")
    .get(usersController.getAllUsers)
    .post(validationUser, usersController.createUser)

router.route("/:id")
    .get(usersController.getUserById)
    .patch(validationUser, usersController.updateUser)
    .delete(usersController.deleteUser);


export default router;