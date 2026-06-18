import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";


const createAttendance = async (reqBody) => {
    let {
        studentId,
        groupId,
        date,
        status
    } = reqBody;
    // make the date with current date
    if (!date) {
        date = new Date().toISOString().split('T')[0];
    }

    // check if student exists or not
    const [rows] = await db.query(
        `
        SELECT id FROM Students WHERE id = ?
        `,
        [studentId]
    );

    if (rows.length === 0) {
        throw appErrors.create(`Student with id ${studentId} does not exist`, 404, httpStatusText.NOT_FOUND);
    }

    // check if group exists or not
    const [groupRows] = await db.query(
        `
        SELECT id FROM \`Groupss\` WHERE id = ?
        `,
        [groupId]
    );

    if (groupRows.length === 0) {
        throw appErrors.create(`Group with id ${groupId} does not exist`, 404, httpStatusText.NOT_FOUND);
    }

    // check if student in the group or not
    const [membership] = await db.query(
        `
        SELECT id FROM Students WHERE id = ? AND groupId = ?
        `,
        [studentId, groupId]
    );

    if (membership.length === 0) {
        throw appErrors.create(`Student with id ${studentId} is not in group with id ${groupId}`, 400, httpStatusText.FAIL);
    }

    // Get current day and time
    const now = new Date();

    const currentDay = now.toLocaleDateString('en-US', {
        weekday: 'long'
    });

    const currentTime = now.toTimeString().slice(0, 8);

    // Check if group has a schedule now
    const [schedule] = await db.query(
        `
        SELECT *
        FROM GroupSchedules
        WHERE groupId = ?
        AND dayOfWeek = ?
        AND ? BETWEEN startTime AND endTime
        `,
        [groupId, currentDay, currentTime]
    );

    if (schedule.length === 0) {
        throw appErrors.create(`Group with id ${groupId} does not have a schedule at the current time`, 400, httpStatusText.FAIL);
    }

    // Prevent duplicate attendance
    const [existing] = await db.query(
        `
        SELECT id
        FROM Attendance
        WHERE studentId = ?
        AND date = ?
        `,
        [studentId, date]
    );

    if (existing.length > 0) {
        throw appErrors.create('Attendance already recorded', 400, httpStatusText.FAIL);
    }

    const [result] = await db.query(
        `
        INSERT INTO Attendance
        (studentId, groupId, date, status)
        VALUES (?, ?, ?, ?)
        `,
        [
            studentId,
            groupId,
            date,
            status
        ]
    );

    return result;
};

const getAllAttendance = async () => {
    const [rows] = await db.query(`
        SELECT
            a.*,
            s.name AS studentName,
            g.name AS groupName
        FROM Attendance a
        JOIN Students s ON a.studentId = s.id
        JOIN \`Groupss\` g ON a.groupId = g.id
        ORDER BY a.\`date\` DESC
    `);

    return rows;
};

const getAttendanceByStudent = async (studentId) => {
    const [rows] = await db.query(`
        SELECT * FROM Attendance
        WHERE studentId = ?
        ORDER BY date DESC`,
        [studentId]
    );

    if (rows.length === 0) {
        throw appErrors.create(`No attendance records found for student with id ${studentId}`, 404, httpStatusText.NOT_FOUND);
    }

    return rows;
};

// delete attendance by id
const deleteAttendanceById = async (attendanceId) => {
    const [result] = await db.query(`
        DELETE FROM Attendance
        WHERE id = ?
    `, [attendanceId]);

    if(result.affectedRows === 0) {
        throw appErrors.create(`Attendance with id ${attendanceId} does not exist`, 404, httpStatusText.NOT_FOUND);
    }
    return result;
};


const attendanceService = {
    createAttendance,
    getAllAttendance,
    getAttendanceByStudent,
    deleteAttendanceById
}

export default attendanceService;