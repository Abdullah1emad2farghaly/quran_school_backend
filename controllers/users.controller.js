import db from "../config/db.js";
import { asyncWrapper } from "../middleWares/asyncWrapper.js";
import appError from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

const getAllUsers = async (req, res) => {
    const [rows] = await db.query("SELECT * FROM users");
    console.log(rows);
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

        let { name, phone, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword;
        // check the number phone is exists or not
        const [user] = await db.query(`
            SELECT * FROM users WHERE phone = ?
        `, [phone]);
        if(user[0]){
            const error = appError.create("the number phone already exists", 400, httpStatusText.FAIL)
            next(error)
        }
        
        const [result] = await db.query("INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)", [name, phone, password, role]);
        if(role === "Parent"){
            await db.query("INSERT INTO parents (userId) VALUES (?)", [result.insertId]);
        }else if(role === "Teacher"){
            await db.query("INSERT INTO teachers (userId) VALUES (?)", [result.insertId]);
        }

        const data = {
            status: httpStatusText.SUCCESS,
            data: { id: result.insertId, name, phone, role }
        };
        res.status(201).json({ data });
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
        let { name, username, password, role } = req.body;
        const hashedPassword = bcrypt.hash(password, 10);
        password = hashedPassword;
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