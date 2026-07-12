import { body } from "express-validator";

const validateCreateGroup = [
    body("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage({en: "Group name must be between 2 and 100 characters", ar: "يجب أن يكون اسم المجموعة بين 2 و 100 حرفًا"}),
    body("maxStudents")
        .isInt({ min: 1, max: 100 })
        .withMessage({en: "Invalid max students value", ar: "قيمة الحد الأقصى للطلاب غير صالحة"}),
];

const validateGroup = {
    validateCreateGroup,
};

export default validateGroup;