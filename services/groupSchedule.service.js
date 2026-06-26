import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

// get group schedule by group id
const getGroupScheduleByGroupId = async (groupId) => {
    // Check if group exists
    const [groups] = await db.query(
        `SELECT id FROM Groupss WHERE id = ?`,
        [groupId]
    );

    if (groups.length === 0) {
        throw appErrors.create(`Group with id ${groupId} is not found`, 404, httpStatusText.NOT_FOUND)
    }

    // Get schedules
    const [rows] = await db.query(
        `
        SELECT 
            gs.groupId,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', gs.id,
                    'dayOfWeek', gs.dayOfWeek,
                    'startTime', TIME_FORMAT(gs.startTime, '%H:%i:%s'),
                    'endTime', TIME_FORMAT(gs.endTime, '%H:%i:%s')
                )
            ) AS schedules
        FROM GroupSchedules gs
        WHERE gs.groupId = ?
        GROUP BY gs.groupId
        `,
        [groupId]
    );

    if (rows.length === 0) {
        return {
            groupId,
            schedules: []
        };
    }

    return {
        groupId: rows[0].groupId,
        schedules: JSON.parse(rows[0].schedules)
    };
};

// add group schedule
const addGroupSchedule = async (scheduleData) => {
    const { groupId, dayOfWeek, startTime, endTime } = scheduleData;

    const [result] = await db.query(
        "INSERT INTO GroupSchedules (groupId, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)",
        [groupId, dayOfWeek, startTime, endTime]
    );

    if (result.affectedRows === 0)
        throw appErrors.create(`Group with id ${groupId} is not found`, 404, httpStatusText.FAIL)

    return result;
};

// update group schedule by schedule id
const updateGroupSchedule = async (scheduleId, scheduleData) => {
    const { groupId, dayOfWeek, startTime, endTime } = scheduleData;
    const [result] = await db.query(
        "UPDATE GroupSchedules SET groupId = ?, dayOfWeek = ?, startTime = ?, endTime = ? WHERE id = ?",
        [groupId, dayOfWeek, startTime, endTime, scheduleId]
    );

    const [groupSchedules] = await db.query(`
        SELECT
            groupId,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', id,
                    'dayOfWeek', dayOfWeek,
                    'startTime', TIME_FORMAT(startTime, '%H:%i:%s'),
                    'endTime', TIME_FORMAT(endTime, '%H:%i:%s')
                )
            ) AS schedules
        FROM GroupSchedules
        WHERE groupId = ?
        GROUP BY groupId
        `,
        [groupId]
    );

    if (result.affectedRows === 0)
        throw appErrors.create(`Group schedule with id ${scheduleId} is not found`, 404, httpStatusText.FAIL)

    return groupSchedules[0];
}

// delete group schedule by schedule id
const deleteGroupSchedule = async (scheduleId) => {
    const [result] = await db.query("DELETE FROM GroupSchedules WHERE id = ?", [scheduleId]);

    if (result.affectedRows === 0)
        throw appErrors.create(`Group schedule with id ${scheduleId} is not found`, 404, httpStatusText.FAIL)

}

const groupScheduleService = {
    addGroupSchedule,
    getGroupScheduleByGroupId,
    updateGroupSchedule,
    deleteGroupSchedule,
}

export default groupScheduleService;