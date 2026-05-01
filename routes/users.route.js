import { Router } from "express";
import usersController from "../controllers/users.controller.js";
import validationUser from "../middleWares/validationUser.js";  
const router = Router();

router.route("/")
    .get(usersController.getAllUsers)
    .post(validationUser, usersController.createUser)

router.route("/:id")
    .get(usersController.getUserById)
    .put(validationUser, usersController.updateUser)
    .delete(usersController.deleteUser);


export default router;