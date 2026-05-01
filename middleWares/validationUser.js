import e from "express";
import { body } from "express-validator";

const validateUser = [
    body('name')
        .isString()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3, max: 255 })
        .withMessage('Name must be at least 3 characters long'),
    body('username')
        .isString()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 255 })
        .withMessage('Username must be at least 3 characters long'),
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