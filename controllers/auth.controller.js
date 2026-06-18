import db from "../config/db.js";
import { asyncWrapper } from "../middleWares/asyncWrapper.js";
import appErrors from "../utils/appErrors.js";
import generate_jwt from "../utils/generate_jwt.js";
import httpStatusText from "../utils/httpStatusText.js";
import bcrypt from "bcryptjs";

const login = asyncWrapper(async (req, res, next) => {
    const { phone, password } = req.body;

    const [users] = await db.query(
        `SELECT * FROM users WHERE phone = ?`,
        [phone]
    );

    const user = users[0];

    if (!user) {
        return next(
            appErrors.create(
                "User not found",
                404,
                httpStatusText.FAIL
            )
        );
    }

    const matchedPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!matchedPassword) {
        return next(
            appErrors.create(
                "Invalid password",
                400,
                httpStatusText.FAIL
            )
        );
    }

    const {accessToken, refreshToken} = generate_jwt(user);

    const { password: _, ...userData } = user;
    

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            user: userData,
            accessToken,
            refreshToken
        }
    });
});

const authController = {
    login
}
export default authController