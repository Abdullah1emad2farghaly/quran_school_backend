import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

// get all groups with their schedules and teacher info
const getGroups = async () => {
    const [rows] = await db.query(`
        SELECT
            g.id AS groupId,
            g.name AS groupName,
            g.isActive,
            t.id AS teacherId,
            u.name AS teacherName,

            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'day', gs.dayOfWeek,
                    'startTime', TIME_FORMAT(gs.startTime, '%H:%i:%s'),
                    'endTime', TIME_FORMAT(gs.endTime, '%H:%i:%s')
                )
            ) AS schedules

        FROM Groupss g
        LEFT JOIN Teachers t ON g.teacherId = t.id
        LEFT JOIN Users u ON t.userId = u.id
        LEFT JOIN GroupSchedules gs ON g.id = gs.groupId

        GROUP BY
            g.id,
            g.name,
            g.isActive,
            t.id,
            u.name
    `);

    return rows;
}

// Create Group
const createGroup = async (groupData) => {
    const { name, teacherId, maxStudents, isActive } = groupData;

    const [result] = await db.query(
        "INSERT INTO Groupss (name, teacherId, maxStudents, isActive) VALUES (?, ?, ?, ?)",
        [name, teacherId, maxStudents, true ? 1 : 0]
    );

    return result;
};

// Update Group
const updateGroup = async (groupId, groupData) => {
    const { name, teacherId, maxStudents, isActive } = groupData;

    const [result] = await db.query(
        "UPDATE Groupss SET name = ?, teacherId = ?, maxStudents = ?, isActive = ? WHERE id = ?",
        [name, teacherId, maxStudents, isActive ? 1 : 0, groupId]
    );

    return result;
};

// Delete Group
const deleteGroup = async (groupId) => {
    const [result] = await db.query("DELETE FROM Groupss WHERE id = ?", [groupId]);

    if (result.affectedRows === 0) {
        throw appErrors.create(`Group with id ${groupId} is not found`, 404, httpStatusText.FAIL)
    }
}

// get group by id with schedules and teacher info
const getGroupById = async (groupId) => {
    const [rows] = await db.query(`
        SELECT
            g.id AS groupId,
            g.name AS groupName,
            g.isActive,
            t.id AS teacherId,
            u.name AS teacherName,

            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', id,
                        'day', gs.dayOfWeek,
                        'startTime', TIME_FORMAT(gs.startTime, '%H:%i:%s'),
                        'endTime', TIME_FORMAT(gs.endTime, '%H:%i:%s')
                    )
                )
                FROM GroupSchedules gs
                WHERE gs.groupId = g.id
            ) AS schedules,

            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id,
                        'name', s.name
                    )
                )
                FROM Students s
                WHERE s.groupId = g.id
            ) AS students

        FROM Groupss g
        LEFT JOIN Teachers t ON g.teacherId = t.id
        LEFT JOIN Users u ON t.userId = u.id

        WHERE g.id = ?
    `,
    [groupId]
);
    if(!rows.length)
        throw appErrors.create(`Group with id ${groupId} is not found`, 404, httpStatusText.FAIL)
    return rows[0];
}


// toggle activate the group
const toggleGroupActivation = async (groupId) => {

    const [result] = await db.query(
        "UPDATE Groupss SET isActive = NOT isActive WHERE id = ?",
        [groupId]
    );

    if (result.affectedRows === 0) {
        throw appErrors.create(`Group with id ${groupId} is not found`, 404, httpStatusText.FAIL)
    }

    return result;
}

const groupService = {
    getGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    toggleGroupActivation,
};

export default groupService;