import { body } from "express-validator";

const validateCreateGroup = [
    body("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Group name must be between 2 and 100 characters"),
    body("maxStudents")
        .isInt({ min: 1, max: 100 })
        .withMessage("Invalid max students value"),
];

const validateGroup = {
    validateCreateGroup,
};

export default validateGroup;