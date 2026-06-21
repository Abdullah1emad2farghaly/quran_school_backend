import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

const getTeacherGroups = async (teacherId) => {

    const [user] = await db.query(`
        select t.id from users u left join teachers t on u.id = t.userId
        where u.id = ?
    `, [teacherId])
    teacherId = user[0].id;

    const [groups] = await db.query(`
        SELECT
            g.id,
            g.name AS groupName,
            g.isActive,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'day', gs.dayOfWeek,
                    'startTime', TIME_FORMAT(gs.startTime, '%H:%i:%s'),
                    'endTime', TIME_FORMAT(gs.endTime, '%H:%i:%s')
                )
            ) AS schedules
        FROM Groupss g
        LEFT JOIN GroupSchedules gs
            ON g.id = gs.groupId
        WHERE g.teacherId = ?
        GROUP BY
            g.id,
            g.name,
            g.isActive
        ORDER BY g.id DESC
    `, [teacherId]);

    console.log(groups, teacherId)
    return groups;
};

// get group students
const getMyGroupStudents = async (userId, groupId) => {

    const [user] = await db.query(`
        select t.id from users u left join teachers t on u.id = t.userId
        where u.id = ?
    `, [userId])
    const teacherId = user[0].id;
    
    const [group] = await db.query(
        `
        SELECT id, name
        FROM Groupss
        WHERE id = ?
        AND teacherId = ?
        `,
        [groupId, teacherId]
    );

    if (group.length === 0) {
        throw appErrors.create(
            "Group not found or does not belong to this teacher",
            404,
            httpStatusText.FAIL
        );
    }

    const [students] = await db.query(
        `
        SELECT
            s.id,
            s.name,
            g.name,
            u.phone AS parentPhone
        FROM Students s
        LEFT JOIN Parents p
            ON s.parentId = p.id
        LEFT JOIN Users u 
            ON p.userId = u.id
        LEFT JOIN Groupss g
            ON s.groupId = g.id
        WHERE s.groupId = ?
        ORDER BY s.name
        `,
        [groupId]
    );

    return students

};


const teacherService = {
    getTeacherGroups,
    getMyGroupStudents
}

export default teacherService