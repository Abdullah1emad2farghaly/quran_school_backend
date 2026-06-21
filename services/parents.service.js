import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

const getMyChildren = async (userId) => {
    const [parents] = await db.query(
        `
        SELECT id
        FROM Parents
        WHERE userId = ?
        `,
        [userId]
    );

    if (parents.length === 0) {
        throw appErrors.create(`User with id ${userId} is not found`, 404, httpStatusText.NOT_FOUND);
    }


    const parentId = parents[0].id;


    const [children] = await db.query(`
        SELECT 
            s.id AS studentId,
            s.name AS studentName,
            s.groupId AS groupId,
            g.name AS groupName,
            u.name AS teacherName
        FROM Students s
        LEFT JOIN Groupss g
            ON g.id = s.groupId
        LEFT JOIN Teachers t
            ON t.id = g.teacherId
        LEFT JOIN Users u
            ON u.id = t.userId
        WHERE s.parentId = ?
    `, [parentId]);
    return children;
};

const getMyChildById = async (userId, studentId) => {
    const [parents] = await db.query(
        `
        SELECT id
        FROM Parents
        WHERE userId = ?
        `,
        [userId]
    );

    if (parents.length === 0) {
        throw appErrors.create(`User with id ${userId} is not found`, 404, httpStatusText.NOT_FOUND);
    }
    const parentId = parents[0].id;

    // Check ownership
    const [students] = await db.query(`
            SELECT id
            FROM Students
            WHERE id = ?
            AND parentId = ?
        `,
        [studentId, parentId]
    );

    if (students.length === 0) {
        throw appErrors.create(
            "This student does not belong to this parent",
            403,
            httpStatusText.FAIL
        );
    }

    const [attendance] = await db.query(`
        SELECT
            id,
            date,
            status
        FROM Attendance
        WHERE studentId = ?
        AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ORDER BY date DESC
        `,
        [studentId]
    );
    

    

    const [studentDetails] = await db.query(`
        SELECT 
            s.id AS studentId,
            s.name AS studentName,
            g.name AS groupName,

            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'sessionId', gs.id,
                    'createdAt', gs.createdAt,

                    'memorizationScore', mr.memorizationScore,
                    'revisionScore', mr.revision,

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
            ) AS sessions

        FROM Students s

        LEFT JOIN Groupss g
            ON s.groupId = g.id

        LEFT JOIN MemorizationRecords mr
            ON mr.studentId = s.id

        LEFT JOIN GroupSessions gs
            ON gs.groupId = g.id
        AND gs.sessionDate = mr.date

        LEFT JOIN SessionMemorization sm
            ON sm.sessionId = gs.id

        LEFT JOIN SessionRevision sr
            ON sr.sessionId = gs.id

        WHERE s.id = ?

        GROUP BY
            s.id,
            s.name,
            g.name
    `, [studentId]);

    console.log(studentDetails[0])

    return studentDetails[0]
}

const parentService = {
    getMyChildren,
    getMyChildById
}

export default parentService;