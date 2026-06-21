import { param, body } from "express-validator"

//validation for creating student
const validateCreateStudent = [
    body('name').notEmpty().withMessage('Name is required').isString({ min: 2, max: 100 }).withMessage('Name must be a string between 2 and 100 characters'),
    body('gender').notEmpty().withMessage('gender is required'),
]

//validation for deleting student
const validateDeleteStudent = [
    param('id').notEmpty().withMessage('Student ID is required').isInt({ min: 1 }).withMessage('Student ID must be a positive integer'),
]

const validateStudent = {
    validateCreateStudent,
    validateDeleteStudent
}


export default validateStudent;