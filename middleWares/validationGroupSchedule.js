
import { body, validationResult } from "express-validator";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

const validateGroupSchedule = [
    body("groupId")
    .isInt().
    withMessage({en: "Group ID must be an integer", ar: "معرف المجموعة يجب أن يكون عددًا صحيحًا"}),
    body("dayOfWeek")
    .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
    .withMessage({en: "Day of the week must be a valid day", ar: "يجب أن يكون يوم الأسبوع يومًا صالحًا"}),
    body("startTime")
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage({en: "Start time must be in HH:MM:SS format", ar: "يجب أن يكون وقت البدء في تنسيق HH:MM:SS"}),
    body("endTime")
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage({en: "End time must be in HH:MM:SS format", ar: "يجب أن يكون وقت الانتهاء في تنسيق HH:MM:SS"}),
];

export default validateGroupSchedule;