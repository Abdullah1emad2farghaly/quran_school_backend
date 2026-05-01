import db from "../config/db.js";
import { asyncWrapper } from "../middleWares/asyncWrapper.js";
import appError from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";
import { validationResult } from "express-validator";

const getAllUsers = async (req, res) => {
    const [rows] = await db.query("SELECT * FROM users");

    const data = {
        status: httpStatusText.SUCCESS,
        data: { users: rows }
    }
    res.json({ data });
}

const createUser = asyncWrapper(
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
            return next(error);
        }

        const { name, username, password, role } = req.body;
        const [result] = await db.query("INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)", [name, username, password, role]);

        const data = {
            status: httpStatusText.SUCCESS,
            data: { id: result.insertId, name, username, role }
        };
        res.status(201).json({ data });
    }
)

const updateUser = asyncWrapper(
    async (req, res, next) => {
        const userId = req.params.id;
        const { name, username, password, role } = req.body;
        const [result] = await db.query("UPDATE users SET name = ?, username = ?, password = ?, role = ? WHERE id = ?", [name, username, password, role, userId]);

        const data = {
            status: httpStatusText.SUCCESS,
            data: { user: { id: userId, name, username, role } }
        };
        res.json({ data });
    }
)

const deleteUser = asyncWrapper(
    async (req, res, next) => {
        const userId = req.params.id;
        const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);
        res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
    }
)

const getUserById = asyncWrapper(
    async (req, res, next) => {
        const userId = req.params.id;
        const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
        if (!rows.length) {
            const error = appError.create(`User with id ${userId} not found`, 404, httpStatusText.NOT_FOUND);
            return next(error);
        }

        const data = {
            status: httpStatusText.SUCCESS,
            data: { user: rows[0] }
        };
        res.json({ data });
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