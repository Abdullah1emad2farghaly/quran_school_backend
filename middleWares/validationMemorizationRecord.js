import { body } from "express-validator"

const createMemorizationRecordValidation = [
    body('memorizationScore')
        .isFloat({ min: 0, max: 10 })
        .withMessage({en: 'Memorization score must be a number between 0 and 10', ar: 'يجب أن يكون نتيجة الحفظ عددًا بين 0 و 10'}),
    body('revision')
        .isFloat({ min: 0, max: 10 })
        .withMessage({en: 'Revision score must be a number between 0 and 10', ar: 'يجب أن يكون نتيجة المراجعة عددًا بين 0 و 10'}),
];

export default createMemorizationRecordValidation;