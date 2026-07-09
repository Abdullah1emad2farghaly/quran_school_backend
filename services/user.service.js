import db from "../config/db.js";
import bcrypt from "bcryptjs";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

const getAllUsers = async () => {
    const [rows] = await db.query(`
        SELECT 
            id,
            name,
            phone,
            role,
            createdAt 
        FROM users`);
    
    return rows;
}

const createUser = async ({ name, phone, password, role }) => {
    
    const hashedPassword = await bcrypt.hash(password, 10);
    password = hashedPassword;

    // check the number phone is exists or not
    const [user] = await db.query(`
            SELECT * FROM users WHERE phone = ?
        `, [phone]);
    if (user[0]) {
        throw appErrors.create("the number phone already exists", 400, httpStatusText.FAIL)
    }

    const [result] = await db.query("INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)", [name, phone, password, role]);
    if (role === "Parent") {
        await db.query("INSERT INTO parents (userId) VALUES (?)", [result.insertId]);
    } else if (role === "Teacher") {
        await db.query("INSERT INTO teachers (userId) VALUES (?)", [result.insertId]);
    }

    return result;
}

const updateUser = async ({ name, phone, userId }) => {
    
    const [result] = await db.query("UPDATE users SET name = ?, phone = ? WHERE id = ?", [name, phone, userId]);
    if(result.affectedRows === 0)
        throw appErrors.create(`User with id ${userId} not found`, 404, httpStatusText.NOT_FOUND);
    return result;
}


const getUserById = async (userId) => {
    const [rows] = await db.query(`
        SELECT id,
            name,
            phone,
            role,
            createdAt  
        FROM users WHERE id = ?`, [userId]);
    if (!rows.length ) {
        throw appErrors.create(`User with id ${userId} not found`, 404, httpStatusText.NOT_FOUND);
    }
    
    return rows;
}

const userService = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser
}

export default userService;