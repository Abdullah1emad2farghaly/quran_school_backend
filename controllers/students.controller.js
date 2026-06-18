import studentSerivces from "../services/student.service.js"
import { asyncWrapper } from '../middleWares/asyncWrapper.js';
import httpStatusText from '../utils/httpStatusText.js';
import db from '../config/db.js';
import appErrors from "../utils/appErrors.js";
import { validationResult } from "express-validator";

const getStudents = asyncWrapper(
    async (req, res) => {
        const [rows] = await db.query(
            `SELECT s.id AS id, s.name AS studentName, u.name AS TeacherName, g.name AS groupName, u.phone AS parentPhone 
            FROM students s 

            LEFT JOIN Groupss g ON s.groupId = g.id

            LEFT JOIN Teachers t ON g.teacherId = t.id
            LEFT JOIN Users u ON t.userId = u.id

            LEFT JOIN Parents p ON s.parentId = p.id
            LEFT JOIN Users up ON p.userId = up.id
            `
        );
        const data = {
            status: httpStatusText.SUCCESS,
            data: { students: rows }
        }
        res.json({ data });
    }
)

// create student
const postStudents = asyncWrapper(
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = appErrors.create(errors.array(), 400, httpStatusText.FAIL);
            return next(error);
        }
        const { name, parentId, groupId } = req.body;
        try {
            const student = await studentSerivces.createStudent({ name, parentId, groupId });
            console.log(student);
            res.status(201).json({
                status: httpStatusText.SUCCESS,
                data: { student }
            });
        } catch (error) {
            next(error);
        }
    }
);

// update student
const updateStudent = asyncWrapper(
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = appErrors.create(errors.array(), 400, httpStatusText.FAIL);
            return next(error);
        }
        const id = req.params.id;
        const { name, groupId } = req.body;
        try {
            const student = await studentSerivces.updateStudent(id, { name, groupId });
            res.json({
                status: httpStatusText.SUCCESS,
                data: { student }
            });
        } catch (error) {
            next(error);
        }
    }
);

// delete student
const deleteStudent = asyncWrapper(
    async (req, res, next) => {

        const id = req.params;
        try {
            await studentSerivces.deleteStudent(id);
            res.json({
                status: httpStatusText.SUCCESS,
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
);

// delete student from group
const deleteStudentFromGroup = asyncWrapper(
    async (req, res, next) => {
        const id = req.params.id;   
        try {
            await studentSerivces.deleteStudentFromGroup(id);
            res.json({
                status: httpStatusText.SUCCESS,
                msg: "Student removed from group successfully",
                data: null
            }); 
        } catch (error) {
            next(error);
        }
    }
);




const studentsController = {
    getStudents,
    postStudents,
    deleteStudent,
    updateStudent,
    deleteStudentFromGroup
}

export default studentsController;