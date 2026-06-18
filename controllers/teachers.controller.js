import { asyncWrapper } from "../middleWares/asyncWrapper.js";
import teacherService from "../services/teachers.service.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

const getMyGroups = asyncWrapper(async (req, res) => {
    const teacherId = req.currentUser.id;

    const groups = await teacherService.getTeacherGroups(teacherId);
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: groups
    });
    
});


const getMyGroupStudents = asyncWrapper(async (req, res, next) => {
    const userId = req.currentUser.id;
    const groupId = req.params.id;
    const students = await teacherService.getMyGroupStudents(userId, groupId);
    
    const data = {
        status: httpStatusText.SUCCESS,
        data: {students}
    }

    console.log(students)

    res.json({data})

})

const teachersController = {
    getMyGroups,
    getMyGroupStudents
}

export default teachersController