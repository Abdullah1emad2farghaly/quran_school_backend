
import { body, validationResult } from "express-validator";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

const validateGroupSchedule = [
    body("groupId")
    .isInt().
    withMessage("Group ID must be an integer"),
    body("dayOfWeek")
    .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
    .withMessage("Day of week must be a valid day"),
    body("startTime")
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage("Start time must be in HH:MM:SS format"),
    body("endTime")
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage("End time must be in HH:MM:SS format"),
];

export default validateGroupSchedule;