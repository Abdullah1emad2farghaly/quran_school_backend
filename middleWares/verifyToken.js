import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";
import  jwt  from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if(!authHeader){
        const error = appErrors.create("Authorization header missing", 401, httpStatusText.UNAUTHORIZED)
        return next(error)
    }

    const token = authHeader.split(" ")[1];

    try{
        const currentUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.currentUser = currentUser
        // console.log("currentUser: ", currentUser);

        next();
    }catch(err ){
        const error = appErrors.create("Invalid or expired token", 401, httpStatusText.UNAUTHORIZED);
        next(error);
    }
}

export default verifyToken