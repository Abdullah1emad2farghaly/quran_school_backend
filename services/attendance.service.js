import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";


const createAttendance = async (reqBody) => {
    let {
        groupId,
        attendances,
        date
    } = reqBody;

    // Use today's date if not provided
    if (!date) {
        date = new Date().toISOString().split("T")[0];
    }

    // Validate attendances array
    if (!attendances || !Array.isArray(attendances) || attendances.length === 0) {
        throw appErrors.create(
            "Attendances array is required",
            400,
            httpStatusText.FAIL
        );
    }

    // Check if group exists
    const [groupRows] = await db.query(
        `
        SELECT id
        FROM Groupss
        WHERE id = ?
        `,
        [groupId]
    );

    if (groupRows.length === 0) {
        throw appErrors.create(
            `Group with id ${groupId} does not exist`,
            404,
            httpStatusText.NOT_FOUND
        );
    }

    // Get current day and time
    const now = new Date();

    const currentDay = now.toLocaleDateString("en-US", {
        weekday: "long",
    });

    const currentTime = now.toTimeString().slice(0, 8);

    // Check if group has a schedule now
    const [schedule] = await db.query(
        `
        SELECT id
        FROM GroupSchedules
        WHERE groupId = ?
        AND dayOfWeek = ?
        AND ? BETWEEN startTime AND endTime
        `,
        [groupId, currentDay, currentTime]
    );

    if (schedule.length === 0) {
        throw appErrors.create(
            `Group with id ${groupId} does not have a schedule at the current time`,
            400,
            httpStatusText.FAIL
        );
    }

    // Check if attendance already exists for this group today
    const [existing] = await db.query(
        `
        SELECT id
        FROM Attendance
        WHERE groupId = ?
        AND date = ?
        LIMIT 1
        `,
        [groupId, date]
    );

    if (existing.length > 0) {
        throw appErrors.create(
            "Attendance for this group has already been recorded",
            400,
            httpStatusText.FAIL
        );
    }

    // Get all students that belong to this group
    const [groupStudents] = await db.query(
        `
        SELECT id
        FROM Students
        WHERE groupId = ?
        `,
        [groupId]
    );

    const groupStudentIds = new Set(
        groupStudents.map(student => student.id)
    );

    // Validate attendances
    for (const attendance of attendances) {
        if (!groupStudentIds.has(attendance.studentId)) {
            throw appErrors.create(
                `Student with id ${attendance.studentId} is not in group ${groupId}`,
                400,
                httpStatusText.FAIL
            );
        }
    }

    // Prepare bulk insert
    const values = attendances.map(attendance => [
        attendance.studentId,
        groupId,
        date,
        attendance.status
    ]);

    const [result] = await db.query(
        `
        INSERT INTO Attendance
        (studentId, groupId, date, status)
        VALUES ?
        `,
        [values]
    );

    return {
        message: "Attendance created successfully",
        insertedRows: result.affectedRows
    };
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
    const [attendance] = await db.query(
        `
        SELECT status, date
        FROM Attendance
        WHERE studentId = ?
        AND status = 'Absent'
        ORDER BY date DESC
    `,
        [studentId]
    );

    const [absenceStats] = await db.query(
        `
        SELECT COUNT(*) AS absentCountLast30Days
        FROM Attendance
        WHERE studentId = ?
            AND status = 'Present'
            AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `,
        [studentId]
    );

    console.log(absenceStats[0])


    const rows = { ...absenceStats[0], attendance };


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

    if (result.affectedRows === 0) {
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