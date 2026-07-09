import { asyncWrapper } from "../middleWares/asyncWrapper.js";
import teacherService from "../services/teachers.service.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";


const getAllTeachers = asyncWrapper(async (req, res, next) => {
    try{
        const teachers = await teacherService.getAllTeachers();
        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: teachers
        });
    }catch(error){
        next(error)
    }
})
const getTeacherById = asyncWrapper(async (req, res, next) => {
    const userId = req.params.id;

    try{
        const teachers = await teacherService.getTeacherById(userId);
        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: teachers
        });
    }catch(error){
        next(error)
    }
})

const getMyGroups = asyncWrapper(async (req, res, next) => {
    const teacherId = req.currentUser.id;

    try {
        const groups = await teacherService.getTeacherGroups(teacherId);
        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: groups
        });
    }catch(error){
        next(error)
    }
    
});


const getMyGroupStudents = asyncWrapper(async (req, res, next) => {
    const userId = req.currentUser.id;
    const groupId = req.params.id;
    const students = await teacherService.getMyGroupStudents(userId, groupId);

    const data = {
        status: httpStatusText.SUCCESS,
        data:  students 
    }

    res.json({ data })

})

const teachersController = {
    getMyGroups,
    getMyGroupStudents,
    getAllTeachers,
    getTeacherById
}

export default teachersController