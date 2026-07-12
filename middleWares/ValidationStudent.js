import { param, body } from "express-validator"

//validation for creating student
const validateCreateStudent = [
    body('name').notEmpty().withMessage({en: 'Name is required', ar: 'اسم الطالب مطلوب'}).isString({ min: 2, max: 100 }).withMessage({en: 'Name must be a string between 2 and 100 characters', ar: 'يجب أن يكون اسم الطالب نصًا بين 2 و 100 حرفًا'}),
    body('gender').notEmpty().withMessage({en: 'Gender is required', ar: 'الجنس مطلوب'}),
    body('parentId').notEmpty().withMessage({en: 'Parent ID is required', ar: 'معرف ولي الأمر مطلوب'}).isInt({ min: 1 }).withMessage({en: 'Parent ID must be a positive integer', ar: 'يجب أن يكون معرف ولي الأمر عددًا صحيحًا موجبًا'}),
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