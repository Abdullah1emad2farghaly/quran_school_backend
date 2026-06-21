import { validationResult } from "express-validator";
import { asyncWrapper } from "../middleWares/asyncWrapper.js";
import appErrors from "../utils/appErrors.js";
import memorizationService from "../services/memorization.service.js";
import httpStatusText from "../utils/httpStatusText.js";

const createMemorization = asyncWrapper(
    async (req, res, next) => {
        const userId = req.currentUser.id;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(appErrors.create(errors.array(), 400, httpStatusText.FAIL));
        }

        try {
            const result = await memorizationService.createMemorization(req.body, userId);
            const data = {
                status: httpStatusText.SUCCESS,
                msg: 'Memorization created successfully',
                data: null
            }
            res.status(201).json(data);
        }
        catch (error) {
            next(error);
        }
    }
)


const memorizationController = {
    createMemorization
}

export default memorizationController;