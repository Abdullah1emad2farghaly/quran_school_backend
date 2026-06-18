import { validationResult } from "express-validator";
import { asyncWrapper } from "../middleWares/asyncWrapper.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";
import groupScheduleService from "../services/groupSchedule.service.js";

// get group schedule by group id
const getGroupScheduleByGroupId = asyncWrapper(async (req, res, next) => {
    try {
        const  groupId  = req.params.id;
        const schedule = await groupScheduleService.getGroupScheduleByGroupId(groupId);
        const data = {
            status: httpStatusText.SUCCESS,
            msg: "Group schedule retrieved successfully",
            data: { schedule }
        }
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
});

// add group schedule
const addGroupSchedule = asyncWrapper(async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = appErrors.create(errors.array(), 400, httpStatusText.FAIL);
            return next(error);
        }

        const scheduleData = req.body;
        const result = await groupScheduleService.addGroupSchedule(scheduleData);
        const data = {
            status: httpStatusText.SUCCESS,
            msg: "Group schedule added successfully",
            data: { schedule: { id: result.insertId, ...scheduleData } }
        };
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
});


// update group schedule by schedule id
const updateGroupSchedule = asyncWrapper(async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = appErrors.create(errors.array(), 400, httpStatusText.FAIL);
            return next(error);
        }

        const scheduleData = req.body;
        const scheduleId = req.params.id;
        const result = await groupScheduleService.updateGroupSchedule(scheduleId, scheduleData);
        const data = {
            status: httpStatusText.SUCCESS,
            msg: "Group schedule updated successfully",
            data: { schedule: [{ id: scheduleId, ...result }] }
        };
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

// delete group schedule by schedule id
const deleteGroupSchedule = asyncWrapper(async (req, res, next) => {
    try {
        const scheduleId = req.params.id;
        await groupScheduleService.deleteGroupSchedule(scheduleId);
        const data = {
            status: httpStatusText.SUCCESS,
            msg: "Group schedule deleted successfully"
        };
        res.status(204).json(data);
    } catch (error) {
        next(error);
    }
});

const groupScheduleController = {
    addGroupSchedule,
    getGroupScheduleByGroupId,
    updateGroupSchedule,
    deleteGroupSchedule,
}

export default groupScheduleController;