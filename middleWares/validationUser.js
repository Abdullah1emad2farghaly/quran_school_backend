import e from "express";
import { body } from "express-validator";

const validateUser = [
    body('name')
        .isString()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3, max: 255 })
        .withMessage('Name must be at least 3 characters long'),
    body('phone')
        .isInt()
        .notEmpty()
        .withMessage('Phone is required')
        .isLength({ min: 11, max: 11 })
        .withMessage("the phone must be 11 digits"),

    body('password')
        .isString()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6, max: 255 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .isString()
        .notEmpty()
        .withMessage('Role is required')
];

export default validateUser;