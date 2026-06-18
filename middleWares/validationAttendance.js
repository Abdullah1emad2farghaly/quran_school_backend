
import { body, validationResult } from 'express-validator';
import appErrors from '../utils/appErrors.js';
import httpStatusText from '../utils/httpStatusText.js';

const validateAttendance = [
    body('studentId').isInt().withMessage('studentId must be an integer'),
    body('groupId').isInt().withMessage('groupId must be an integer'),
    body('status').isIn(['Present', 'Absent']).withMessage('status must be present or absent'),
];

export default validateAttendance;