import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

export const getAllTeachers = async () => {
    const [rows] = await db.query(`
        SELECT
            t.id ,
            u.id AS userId,
            u.name,
            u.createdAt,
            u.phone,
            COUNT(g.id) AS totalGroups
        FROM Teachers t
        INNER JOIN Users u
            ON t.userId = u.id
        LEFT JOIN Groupss g
            ON g.teacherId = t.id
        GROUP BY
            t.id,
            u.name,
            u.createdAt,
            u.phone
        ORDER BY u.name;
    `);

    return rows;
};


export const getTeacherById = async (userId) => {
    // Validate input
    if (!userId) {
        throw appErrors.create(
            "User id is required",
            400,
            httpStatusText.FAIL
        );
    }

    // Check that the user exists and is a teacher
    const [users] = await db.query(
        `
        SELECT
            u.id AS userId,
            t.id AS teacherId
        FROM Users u
        LEFT JOIN Teachers t
            ON u.id = t.userId
        WHERE u.id = ?;
        `,
        [userId]
    );

    if (users.length === 0) {
        throw appErrors.create(
            "User not found",
            404,
            httpStatusText.NOT_FOUND
        );
    }

    if (!users[0].teacherId) {
        throw appErrors.create(
            "This user is not a teacher",
            400,
            httpStatusText.FAIL
        );
    }

    const teacherId = users[0].teacherId;

    // Get teacher information
    const [teachers] = await db.query(
        `
        SELECT
            t.id,
            u.name,
            u.phone,
            u.createdAt
        FROM Teachers t
        INNER JOIN Users u
            ON t.userId = u.id
        WHERE t.id = ?;
        `,
        [teacherId]
    );

    if (teachers.length === 0) {
        throw appErrors.create(
            "Teacher not found",
            404,
            httpStatusText.NOT_FOUND
        );
    }

    // Get assigned groups
    // Get assigned groups
    const [groups] = await db.query(`
        SELECT
            g.id,
            g.name,
            g.maxStudents,
            COUNT(DISTINCT s.id) AS totalStudents,
            g.isActive,
            (
                SELECT sm.surahName
                FROM GroupSessions gs
                INNER JOIN sessionMemorization sm
                    ON gs.id = sm.sessionId
                WHERE gs.groupId = g.id
                ORDER BY gs.sessionDate DESC
                LIMIT 1
            ) AS currentSurah
        FROM Groupss g
        LEFT JOIN Students s
            ON s.groupId = g.id
        WHERE g.teacherId = ?
        GROUP BY
            g.id,
            g.name,
            g.maxStudents,
            g.isActive
        ORDER BY g.name;
    `, [teacherId]);

    return {
        ...teachers[0],
        totalGroups: groups.length,
        groups
    };
};

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
            g.maxStudents,

            COUNT(DISTINCT s.id) AS studentsCount,

            (
                SELECT sm.surahName
                FROM GroupSessions gs
                INNER JOIN SessionMemorization sm
                    ON sm.sessionId = gs.id
                WHERE gs.groupId = g.id
                ORDER BY gs.sessionDate DESC, gs.id DESC
                LIMIT 1
            ) AS currentSurah,

            COALESCE(
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'day', sch.dayOfWeek,
                            'startTime', TIME_FORMAT(sch.startTime, '%H:%i:%s'),
                            'endTime', TIME_FORMAT(sch.endTime, '%H:%i:%s')
                        )
                    )
                    FROM GroupSchedules sch
                    WHERE sch.groupId = g.id
                ),
                JSON_ARRAY()
            ) AS schedules

        FROM Groupss g

        LEFT JOIN Students s
            ON s.groupId = g.id

        WHERE g.teacherId = ?

        GROUP BY
            g.id,
            g.name,
            g.isActive,
            g.maxStudents

        ORDER BY g.id DESC;
    `, [teacherId]);

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
            {en: 'Group not found or you are not authorized to access this group', ar: 'المجموعة غير موجودة أو ليس لديك صلاحية الوصول لهذه المجموعة'},
            404,
            httpStatusText.FAIL
        );
    }

    // Check if there is an active schedule right now
    const [[schedule]] = await db.query(
        `
        SELECT id
        FROM GroupSchedules
        WHERE groupId = ?
            AND dayOfWeek = DAYNAME(CURDATE())
            AND CURTIME() BETWEEN startTime AND endTime
        LIMIT 1
        `,
        [groupId]
    );

    // If there is an active schedule, ensure today's session exists
    if (schedule) {
        const [[session]] = await db.query(
            `
            SELECT id
            FROM GroupSessions
            WHERE groupId = ?
                AND sessionDate = CURDATE()
            LIMIT 1
            `,
            [groupId]
        );
        var sessionId = session ? session.id : null;

        if (!session) {
            await db.query(
                `
                INSERT INTO GroupSessions (
                    groupId
                )
                VALUES (?)
                `,
                [groupId]
            );
        }
    }

    const [groupRows] = await db.query(
        `
        SELECT
            g.id,
            g.name AS groupName,
            g.maxStudents,
            g.isActive,
            g.createdAt,
            COALESCE(
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', gs.id,
                            'day', gs.dayOfWeek,
                            'startTime', TIME_FORMAT(gs.startTime, '%H:%i:%s'),
                            'endTime', TIME_FORMAT(gs.endTime, '%H:%i:%s')
                        )
                    )
                    FROM groupSchedules gs
                    WHERE gs.groupId = g.id
                ),
                JSON_ARRAY()
            ) AS schedules
        FROM Groupss g
        WHERE g.id = ?
    `,
        [groupId]
    );

    const [[lastSession]] = await db.query(`
        SELECT id
        FROM GroupSessions
        WHERE groupId = ?
            AND sessionDate < CURDATE()
        ORDER BY sessionDate DESC
        LIMIT 1
    `, [groupId]);

    const lastSessionId = lastSession?.id || null;

    const [students] = await db.query(
`
SELECT
    s.id,
    s.name AS studentName,
    s.birthDate,
    s.groupId,
    u.phone AS parentPhone,
    s.createdAt AS studentCreatedAt,

    a.status AS attendanceStatus,

    JSON_OBJECT(
        'sessionId', ?,
        'recordId', mr.id,
        'memorizationScore', mr.memorizationScore,
        'revisionScore', mr.revision,

        'memorization',
        CASE
            WHEN sm.id IS NULL THEN NULL
            ELSE JSON_OBJECT(
                'id', sm.id,
                'surahName', sm.surahName,
                'fromAyah', sm.fromAyah,
                'toAyah', sm.toAyah
            )
        END,

        'revision',
        CASE
            WHEN sr.id IS NULL THEN NULL
            ELSE JSON_OBJECT(
                'id', sr.id,
                'surahName', sr.surahName,
                'fromAyah', sr.fromAyah,
                'toAyah', sr.toAyah
            )
        END
    ) AS lastSession

FROM Students s

LEFT JOIN Parents p
    ON s.parentId = p.id

LEFT JOIN Users u
    ON p.userId = u.id

LEFT JOIN Attendance a
    ON a.studentId = s.id
    AND a.groupId = s.groupId
    AND DATE(a.date) = CURDATE()

LEFT JOIN MemorizationRecords mr
    ON mr.studentId = s.id
    AND mr.sessionId = ?

LEFT JOIN SessionMemorization sm
    ON sm.sessionId = ?

LEFT JOIN SessionRevision sr
    ON sr.sessionId = ?

WHERE s.groupId = ?

ORDER BY s.name;
`,
[
    lastSessionId, // sessionId in JSON
    lastSessionId, // MemorizationRecords
    lastSessionId, // SessionMemorization
    lastSessionId, // SessionRevision
    groupId
]
);

    const response = {
        sessionId: sessionId,
        groupInfo: groupRows[0] || null,
        students
    };

    return response;
};


const teacherService = {
    getTeacherGroups,
    getMyGroupStudents,
    getAllTeachers,
    getTeacherById
}

export default teacherService