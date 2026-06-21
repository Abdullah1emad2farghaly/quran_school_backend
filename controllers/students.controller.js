import studentSerivces from "../services/student.service.js"
import { asyncWrapper } from '../middleWares/asyncWrapper.js';
import httpStatusText from '../utils/httpStatusText.js';
import db from '../config/db.js';
import appErrors from "../utils/appErrors.js";
import { validationResult } from "express-validator";

const getStudents = asyncWrapper(
    async (req, res, next) => {
        
        try{
            const students = await studentSerivces.getStudents();
            console.log(students)
            const data = {
                status: httpStatusText.SUCCESS,
                data: { students: students }
            }
            res.json({ data });
        }catch(error){
            next(error)
        }
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
        // const { name, parentId, groupId } = req.body;
        try {
            const student = await studentSerivces.createStudent(req.body);
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
        const { name, groupId, gender, birthDate } = req.body;
        try {
            const student = await studentSerivces.updateStudent(id, { name, groupId, gender, birthDate });
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

        const id = req.params.id;
        try {
            const result = await studentSerivces.deleteStudent(id);
            res.json({
                status: httpStatusText.SUCCESS,
                msg: "Student deleted successfully",
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