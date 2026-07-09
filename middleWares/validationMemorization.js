import { body } from 'express-validator';

const createMemorizationValidation = [
    
    body('surahName')
        .notEmpty()
        .withMessage({en: 'Surah Name is required', ar: 'اسم السورة مطلوب'}),
    body('fromAyah')
        .notEmpty()
        .withMessage({en: 'From Ayah is required', ar: 'من الآية مطلوب'}),
    body('toAyah')
        .notEmpty()
        .withMessage({en: 'To Ayah is required', ar: 'إلى الآية مطلوب'})
];

export default createMemorizationValidation;