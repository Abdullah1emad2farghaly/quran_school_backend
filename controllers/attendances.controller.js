import { validationResult } from "express-validator";
import { asyncWrapper } from "../middleWares/asyncWrapper.js";
import attendanceService from "../services/attendance.service.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";


const createAttendance = asyncWrapper(async (req, res, next) => {

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return next(appErrors.create(errors.array(), 400, httpStatusText.FAIL));
    }

    try {
        const result = await attendanceService.createAttendance(req.body);
        const data = {
            status: httpStatusText.SUCCESS,
            msg: 'Attendance created successfully',
            data: null
        }
        res.status(201).json(data);
    }
    catch (error) {
        next(error);
    }
});

const getAllAttendance = asyncWrapper(async (req, res, next) => {
    try {
        const rows = await attendanceService.getAllAttendance();
        const data = {
            status: httpStatusText.SUCCESS,
            msg: 'Attendance records retrieved successfully',
            data: rows
        }
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});

const getAttendanceByStudent = asyncWrapper(async (req, res, next) => {
    try {
        const { studentId } = req.params;

        const rows = await attendanceService.getAttendanceByStudent(studentId);
        const data = {
            status: httpStatusText.SUCCESS,
            msg: 'Attendance records retrieved successfully',
            data: rows
        }
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});

// delete attendance by id
const deleteAttendanceById = asyncWrapper(async (req, res, next) => {
    try {
        const { attendanceId } = req.params;
        const result = await attendanceService.deleteAttendanceById(attendanceId);
        const data = {
            status: httpStatusText.SUCCESS,
            msg: 'Attendance record deleted successfully',
            data: null
        }
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});

const attendanceController = {
    createAttendance,
    getAllAttendance,
    getAttendanceByStudent,
    deleteAttendanceById
};

export default attendanceController;
