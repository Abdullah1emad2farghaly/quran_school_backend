import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

const allowTo = (...roles)=>{
    return (req, res, next) => {
        const currentUserRole = req.currentUser.role;
        if (!roles.includes(currentUserRole)) {
            const error = appErrors.create("You are not allowed to access this operation", 403, httpStatusText.UNAUTHORIZED);
            return next(error);
        }
        next();
    }
}

export default allowTo;