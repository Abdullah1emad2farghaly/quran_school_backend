import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";


const getParents = async () => {
    const [rows] = await db.query(`
        SELECT
            p.id,
            u.id AS userId,
            u.name,
            u.phone,
            u.createdAt,
            COUNT(s.id) AS totalStudents
        FROM Parents p

        INNER JOIN Users u
            ON p.userId = u.id

        LEFT JOIN Students s
            ON s.parentId = p.id

        GROUP BY
            p.id,
            u.name,
            u.phone,
            u.createdAt
        ORDER BY u.name;
    `);

    return rows;
};

const getParentById = async (parentId) => {
    const [[parent]] = await db.query(`
        SELECT  
            p.id,
            u.id AS userId,
            u.name,
            u.phone,
            u.createdAt
        FROM Parents p
        INNER JOIN Users u ON p.userId = u.id
        WHERE p.id = ?
    `, [parentId]);

    return parent;
};

export const getParentChildren = async (parentId) => {
    // Check parent exists
    const [[parent]] = await db.query(
        `
        SELECT id
        FROM Parents
        WHERE id = ?
        `,
        [parentId]
    );

    if (!parent) {
        throw appErrors.create(
            "Parent not found",
            404,
            httpStatusText.NOT_FOUND
        );
    }

    const [rows] = await db.query(`
        SELECT
            s.id,
            s.name,
            s.gender,
            s.birthDate,
            s.createdAt,

            g.id AS groupId,
            g.name AS groupName,

            tu.name AS teacherName,

            sm.surahName AS currentSurah

        FROM Students s

        LEFT JOIN Groupss g
            ON s.groupId = g.id

        LEFT JOIN Teachers t
            ON g.teacherId = t.id

        LEFT JOIN Users tu
            ON t.userId = tu.id

        LEFT JOIN GroupSessions gs
            ON gs.id = (
                SELECT gs2.id
                FROM GroupSessions gs2
                WHERE gs2.groupId = g.id
                ORDER BY gs2.sessionDate DESC, gs2.id DESC
                LIMIT 1
            )

        LEFT JOIN SessionMemorization sm
            ON sm.sessionId = gs.id

        WHERE s.parentId = ?

        ORDER BY s.name;
    `, [parentId]);

    return rows;
};

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
                CASE
                    WHEN gs.id IS NOT NULL THEN
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
                END
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
    getMyChildById, 
    getParents,
    getParentChildren,
    getParentById
}

export default parentService;