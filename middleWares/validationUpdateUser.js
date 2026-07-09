import { body } from "express-validator";

const validateUpdateUser = [
    body('name')
        .isString()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3, max: 255 })
        .withMessage('Name must be at least 3 characters long'),
    body('phone')
        .notEmpty()
        .withMessage('Phone is required')
        .isLength({ min: 11, max: 11 })
        .withMessage("the phone must be 11 digits")
];

export default validateUpdateUser