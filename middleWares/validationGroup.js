import { body } from "express-validator";

const validateCreateGroup = [
    body("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Group name must be between 2 and 100 characters"),
    body("teacherId")
        .isInt({ min: 1 })
        .withMessage("Invalid teacher ID"),
        
    body("maxStudents")
        .isInt({ min: 5, max: 100 })
        .withMessage("Invalid max students value"),
    body("isActive")
        .isBoolean()
        .withMessage("isActive must be a boolean value")
];

const validateGroup = {
    validateCreateGroup,
};

export default validateGroup;