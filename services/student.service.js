import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";



const getStudents = async () => {
    const [rows] = await db.query(`
        SELECT
            s.id,
            s.name AS studentName,
            s.birthDate AS birthDate,
            s.gender AS gender,
            s.groupId AS groupId,

            g.name AS groupName,

            tu.name AS teacherName,
            tu.phone AS teacherPhone,

            pu.phone AS parentPhone

        FROM Students s

        LEFT JOIN Groupss g
            ON s.groupId = g.id

        LEFT JOIN Teachers t
            ON g.teacherId = t.id

        LEFT JOIN Users tu
            ON t.userId = tu.id

        LEFT JOIN Parents p
            ON s.parentId = p.id

        LEFT JOIN Users pu
            ON p.userId = pu.id
    `);

    return rows;
};

const getStudentById = async (id) => {
    const [rows] = await db.query(`
        SELECT
            s.id,
            s.name,
            s.birthDate,
            s.createdAt,
            s.gender,

            u.name AS parentName,
            u.phone AS parentPhone,

            g.id AS groupId,
            g.name AS groupName,

            tu.name AS teacherName,
            tu.phone AS teacherPhone,

            (
                SELECT sm.surahName
                FROM GroupSessions gs
                INNER JOIN SessionMemorization sm
                    ON sm.sessionId = gs.id
                WHERE gs.groupId = g.id
                ORDER BY gs.sessionDate DESC, gs.id DESC
                LIMIT 1
            ) AS currentSurah

        FROM Students s

        LEFT JOIN Groupss g
            ON s.groupId = g.id

        LEFT JOIN Teachers t
            ON g.teacherId = t.id

        LEFT JOIN Users tu
            ON t.userId = tu.id

        LEFT JOIN Parents p
            ON s.parentId = p.id

        LEFT JOIN Users u
            ON p.userId = u.id

        WHERE s.id = ?;
    `, [id]);

    if (rows.length === 0) {
        throw appErrors.create(
            "Student not found",
            404,
            httpStatusText.NOT_FOUND
        );
    }

    return rows[0];
};

const getStudentMemorizationRecords = async (id) => {
    const [[student]] = await db.query(
        `
        SELECT 1
        FROM Students
        WHERE id = ?
    `,
        [id]
    );

    if (!student) {
        throw appErrors.create(
            "Student not found",
            404,
            httpStatusText.NOT_FOUND
        );
    }

    const [[row]] = await db.query(`
        SELECT
            s.id AS studentId,
            s.name AS studentName,
            g.id AS groupId,
            g.name AS groupName,

            COALESCE(
                JSON_ARRAYAGG(
                    CASE
                        WHEN g.id IS NOT NULL AND gs.id IS NOT NULL THEN
                            JSON_OBJECT(
                                'sessionId', gs.id,
                                'sessionDate', gs.sessionDate,
                                'createdAt', gs.createdAt,
                                'memorizationScore', mr.memorizationScore,
                                'revisionScore', mr.revision,
                                'notes', mr.notes,

                                'memorization', JSON_OBJECT(
                                    'surahName', sm.surahName,
                                    'fromAyah', sm.fromAyah,
                                    'toAyah', sm.toAyah
                                ),

                                'revision', JSON_OBJECT(
                                    'surahName', sr.surahName,
                                    'fromAyah', sr.fromAyah,
                                    'toAyah', sr.toAyah
                                )
                            )
                    END
                ),
                JSON_ARRAY()
            ) AS sessions

        FROM Students s

        LEFT JOIN Groupss g
            ON s.groupId = g.id

        LEFT JOIN MemorizationRecords mr
            ON mr.studentId = s.id

        LEFT JOIN GroupSessions gs
            ON gs.groupId = mr.groupId && gs.sessionDate = mr.date

        LEFT JOIN SessionMemorization sm
            ON sm.sessionId = gs.id

        LEFT JOIN SessionRevision sr
            ON sr.sessionId = gs.id

        WHERE s.id = ?

        GROUP BY
            s.id,
            s.name,
            g.id,
            g.name;
    `, [id])

    if(row.sessions[0] === null)
        row.sessions = [];

    return row
}

const getStudentAttendance = async (studentId) => {
    // Check student exists
    const [[student]] = await db.query(
        `
        SELECT
            s.id,
            s.name
        FROM Students s
        WHERE s.id = ?
        `,
        [studentId]
    );

    if (!student) {
        throw appErrors.create(
            "Student not found",
            404,
            httpStatusText.NOT_FOUND
        );
    }

    const [[result]] = await db.query(`
        SELECT
            s.id AS studentId,
            s.name AS studentName,

            COALESCE(
                JSON_ARRAYAGG(
                    CASE
                        WHEN a.groupId IS NOT NULL THEN
                            JSON_OBJECT(
                                'attendanceId', a.id,
                                'sessionId', gs.id,
                                'sessionDate', gs.sessionDate,
                                'status', a.status,
                                'date', a.date
                            )
                    END
                ),
                JSON_ARRAY()
            ) AS attendance

        FROM Students s

        LEFT JOIN Attendance a
            ON a.studentId = s.id

        LEFT JOIN GroupSessions gs
            ON gs.groupId = a.groupId && gs.sessionDate = a.date

        WHERE s.id = ?

        GROUP BY
            s.id,
            s.name
    `, [studentId]);


    if(result.attendance[0] === null)
        result.attendance = []

    return result;
};

//create student
const createStudent = async (reqBody) => {
    const { name, parentId, groupId, gender, birthDate } = reqBody;

    // Check parent exists
    const [parents] = await db.query(
        'SELECT id FROM Parents WHERE id = ?',
        [parentId]
    );

    if (parents.length === 0) {
        throw appErrors.create(`Parent with id ${parentId} is not found`, 404, httpStatusText.NOT_FOUND)
    }

    // Check group exists if provided
    if (groupId !== null && groupId !== undefined) {
        const [groups] = await db.query(
            'SELECT id FROM Groupss WHERE id = ?',
            [groupId]
        );

        if (groups.length === 0) {
            throw appErrors.create(`Group with id ${groupId} is not found`, 404, httpStatusText.NOT_FOUND)
        }
    }

    // Check duplicate student name for same parent
    const [students] = await db.query(
        `
        SELECT id
        FROM Students
        WHERE parentId = ?
        AND name = ?
        `,
        [parentId, name]
    );

    if (students.length > 0) {
        throw appErrors.create(`This student already created for this parent`, 400, httpStatusText.FAIL)
    }

    // Create student
    const [result] = await db.query(
        `
        INSERT INTO Students
        (name, parentId, groupId, gender, birthDate)
        VALUES (?, ?, ?, ?, ?)
        `,
        [name, parentId, groupId, gender, birthDate]
    );

    const [rows] = await db.query(
        'SELECT * FROM Students WHERE id = ?',
        [result.insertId]
    );

    return rows[0];
};

// update student
const updateStudent = async (studentId, { name, groupId, gender, birthDate }) => {

    // Check student exists
    const [students] = await db.query(
        'SELECT * FROM Students WHERE id = ?',
        [studentId]
    );

    if (students.length === 0) {
        throw appErrors.create(
            `Student with id ${studentId} not found`,
            404,
            httpStatusText.FAIL
        );
    }

    const student = students[0];

    // Check group exists if provided
    if (groupId !== null && groupId !== undefined) {
        const [groups] = await db.query(
            'SELECT id FROM Groupss WHERE id = ?',
            [groupId]
        );

        if (groups.length === 0) {
            throw appErrors.create(
                'Group not found',
                404,
                httpStatusText.FAIL
            );
        }
    }

    // Check duplicate name for same parent
    const [duplicateStudents] = await db.query(
        `
        SELECT id
        FROM Students
        WHERE parentId = ?
            AND name = ?
            AND id <> ?
        `,
        [student.parentId, name, studentId]
    );

    if (duplicateStudents.length > 0) {
        throw appErrors.create(
            'This student already exists for this parent',
            400,
            httpStatusText.FAIL
        );
    }

    await db.query(
        `
        UPDATE Students
        SET
            name = ?,
            groupId = ?,
            gender = ?,
            birthDate = ?
        WHERE id = ?
        `,
        [name, groupId, gender, birthDate, studentId]
    );

    const [rows] = await db.query(
        'SELECT * FROM Students WHERE id = ?',
        [studentId]
    );

    return rows[0];
};

// delete student
// delete student
const deleteStudent = async (studentId) => {
    // Check student exists
    const [students] = await db.query(
        'SELECT * FROM Students WHERE id = ?',
        [studentId]
    );

    if (students.length === 0) {
        throw appErrors.create(
            `Student with id ${studentId} not found`,
            404,
            httpStatusText.FAIL
        );
    }

    // Delete student
    await db.query(
        'DELETE FROM Students WHERE id = ?',
        [studentId]
    );
};

// delete student from group
const deleteStudentFromGroup = async (studentId) => {
    const [result] = await db.query(
        'UPDATE Students SET groupId = NULL WHERE id = ?',
        [studentId]
    );

    if (result.affectedRows === 0) {
        throw appErrors.create(`Student with id ${studentId} not found`, 404, httpStatusText.FAIL);
    }
}

const assignStudentToGroup = async (studentId, groupId) => {
    // Check student exists
    const [students] = await db.query(
        `
        SELECT
            id,
            groupId
        FROM Students
        WHERE id = ?
        `,
        [studentId]
    );

    if (students.length === 0) {
        throw appErrors.create(
            "Student not found",
            404,
            httpStatusText.NOT_FOUND
        );
    }

    const student = students[0];

    // Already assigned to this group
    if (student.groupId === Number(groupId)) {
        throw appErrors.create(
            "Student is already assigned to this group",
            400,
            httpStatusText.FAIL
        );
    }

    // Check group exists and get capacity
    const [groups] = await db.query(
        `
        SELECT
            id,
            maxStudents
        FROM Groupss
        WHERE id = ?
        `,
        [groupId]
    );

    if (groups.length === 0) {
        throw appErrors.create(
            "Group not found",
            404,
            httpStatusText.NOT_FOUND
        );
    }

    // Count current students
    const [[count]] = await db.query(
        `
        SELECT
            COUNT(*) AS totalStudents
        FROM Students
        WHERE groupId = ?
        `,
        [groupId]
    );

    if (count.totalStudents >= groups[0].maxStudents) {
        throw appErrors.create(
            "This group is full",
            400,
            httpStatusText.FAIL
        );
    }

    // Assign student
    await db.query(
        `
        UPDATE Students
        SET groupId = ?
        WHERE id = ?
        `,
        [groupId, studentId]
    );

    // Return updated student
    const [rows] = await db.query(
        `
        SELECT
            s.id,
            s.name,
            s.groupId,
            g.name AS groupName
        FROM Students s
        LEFT JOIN Groupss g
            ON s.groupId = g.id
        WHERE s.id = ?
        `,
        [studentId]
    );

    return rows[0];
};


const studentSerivces = {
    getStudents,
    createStudent,
    deleteStudent,
    updateStudent,
    deleteStudentFromGroup,
    getStudentById,
    getStudentMemorizationRecords,
    getStudentAttendance,
    assignStudentToGroup
}


export default studentSerivces;