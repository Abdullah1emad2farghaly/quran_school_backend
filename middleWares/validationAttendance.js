
import { body, validationResult } from 'express-validator';
import appErrors from '../utils/appErrors.js';
import httpStatusText from '../utils/httpStatusText.js';

const validateAttendance = [
    body('studentId').isInt().withMessage({en: 'studentId must be an integer', ar: 'معرف الطالب يجب أن يكون عددًا صحيحًا'}),
    body('groupId').isInt().withMessage({en: 'groupId must be an integer', ar: 'معرف المجموعة يجب أن يكون عددًا صحيحًا'}),
    body('status').isIn(['Present', 'Absent']).withMessage({en: 'status must be present or absent', ar: 'يجب أن يكون الحالة حاضر أو غائب'}),
];

export default validateAttendance;