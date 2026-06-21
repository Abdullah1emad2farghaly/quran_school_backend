import db from "../config/db.js";
import { asyncWrapper } from "../middleWares/asyncWrapper.js";
import appError from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import userService from "../services/user.service.js";

const getAllUsers = async (req, res, next) => {

    try {
        const rows = await userService.getAllUsers();
        const data = {
            status: httpStatusText.SUCCESS,
            data: { users: rows }
        }
        res.json({ data });
    } catch (error) {
        next(error);
    }

}

const createUser = asyncWrapper(
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
            return next(error);
        }
        let { name, phone, password, role } = req.body;

        try {
            const result = await userService.createUser({ name, phone, password, role });

            const data = {
                status: httpStatusText.SUCCESS,
                data: { id: result.insertId, name, phone, role }
            };
            res.status(201).json({ data });
        }catch(error){
            next(error);
        }
        

    }
)

const updateUser = asyncWrapper(
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
            return next(error);
        }
        const userId = req.params.id;
        let { name, phone, role } = req.body;
        try {
            const result = await userService.updateUser({ name, phone, role, userId })
            const data = {
                status: httpStatusText.SUCCESS,
                data: { user: { id: userId, name, phone, role } }
            };
            res.json({ data });
        } catch (error) {
            next(error)
        }
    }
)

const deleteUser = asyncWrapper(
    async (req, res, next) => {
        try {
            const userId = req.params.id;
            const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);

            const data = {
                status: httpStatusText.SUCCESS,
                msg: `User with id ${userId} deleted successfully`,
                data: null
            };
            res.status(200).json({ data });
        } catch (error) {
            next(error);
        }
    }
)

const getUserById = asyncWrapper(
    async (req, res, next) => {
        const userId = req.params.id;

        try {
            const [rows] = await userService.getUserById(userId);
            const data = {
                status: httpStatusText.SUCCESS,
                data: { user: rows }
            };
            res.json({ data });
        } catch (error) {
            next(error)
        }
    }
)

const usersController = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
}


export default usersController;