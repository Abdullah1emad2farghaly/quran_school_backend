import e from "express";
import { body } from "express-validator";

const validateUser = [
    body('name')
        .isString()
        .notEmpty()
        .withMessage({en: 'Name is required', ar: 'الاسم مطلوب'})
        .isLength({ min: 3, max: 255 })
        .withMessage({en: 'Name must be at least 3 characters long', ar: 'يجب أن يكون الاسم 3 أحرف على الأقل'}),
    body('phone')
        .notEmpty()
        .withMessage({en: 'Phone is required', ar: 'رقم الهاتف مطلوب'})
        .isLength({ min: 11, max: 11 })
        .withMessage({en: 'the phone must be 11 digits', ar: 'يجب أن يكون رقم الهاتف 11 رقمًا'}),
    body('password')
        .isInt({min: 6})
        .withMessage({en: 'Password must be 6 digits at least', ar: 'يجب أن يكون كلمة المرور 6 أرقام على الأقل'}),
    body('role')
        .isString()
        .notEmpty()
        .withMessage({en: 'Role is required', ar: 'الدور مطلوب'})
];

export default validateUser;