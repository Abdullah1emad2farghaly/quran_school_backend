import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

// get all groups with their schedules and teacher info
const getGroups = async () => {
    const [rows] = await db.query(`
        SELECT
            g.id,
            g.name AS groupName,
            g.maxStudents,
            g.isActive,

            sm.surahName AS currentSurah,

            g.teacherId,
            u.name AS teacherName,

            COUNT(DISTINCT sch.id) AS scheduleDaysCount,
            COUNT(DISTINCT st.id) AS studentsCount

        FROM Groupss g

        LEFT JOIN Teachers t
            ON g.teacherId = t.id

        LEFT JOIN Users u
            ON t.userId = u.id

        -- Latest session only
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

        LEFT JOIN GroupSchedules sch
            ON sch.groupId = g.id

        LEFT JOIN Students st
            ON st.groupId = g.id

        GROUP BY
            g.id,
            g.name,
            g.maxStudents,
            g.isActive,
            sm.surahName,
            g.teacherId,
            u.name

        ORDER BY g.id;
    `);

    return rows;
};
// Create Group
const createGroup = async (groupData) => {
    const { name, teacherId, maxStudents, isActive } = groupData;

    // Check teacher exists only if teacherId is provided
    if (teacherId !== null && teacherId !== undefined) {
        const [teachers] = await db.query(
            'SELECT id FROM Teachers WHERE id = ?',
            [teacherId]
        );

        if (teachers.length === 0) {
            throw appErrors.create(
                {en: `Teacher with id ${teacherId} not found`, ar: `المعلم بالمعرف ${teacherId} غير موجود`},
                404,
                httpStatusText.FAIL
            );
        }
    }

    const [result] = await db.query(
        `
        INSERT INTO Groupss
        (name, teacherId, maxStudents)
        VALUES (?, ?, ?)
        `,
        [
            name,
            teacherId ?? null,
            maxStudents,
        ]
    );

    const [rows] = await db.query(
        'SELECT * FROM Groupss WHERE id = ?',
        [result.insertId]
    );

    return rows[0];
};

// Update Group
const updateGroup = async (groupId, groupData) => {
    const { name, teacherId, maxStudents } = groupData;

    // Check group exists
    const [groups] = await db.query(
        'SELECT * FROM Groupss WHERE id = ?',
        [groupId]
    );

    if (groups.length === 0) {
        throw appErrors.create(
            {en: `Group with id ${groupId} not found`, ar: `المجموعة بالمعرف ${groupId} غير موجودة`},
            404,
            httpStatusText.FAIL
        );
    }

    // Check teacher exists if provided
    if (teacherId !== null && teacherId !== undefined) {
        const [teachers] = await db.query(
            'SELECT id FROM Teachers WHERE id = ?',
            [teacherId]
        );

        if (teachers.length === 0) {
            throw appErrors.create(
                'Teacher not found',
                404,
                httpStatusText.FAIL
            );
        }
    }

    await db.query(
        `
        UPDATE Groupss
        SET
            name = ?,
            teacherId = ?,
            maxStudents = ?
        WHERE id = ?
        `,
        [
            name,
            teacherId ?? null,
            maxStudents,
            groupId
        ]
    );

    const [rows] = await db.query(
        'SELECT * FROM Groupss WHERE id = ?',
        [groupId]
    );

    return rows[0];
};

// Delete Group
const deleteGroup = async (groupId) => {
    const [result] = await db.query("DELETE FROM Groupss WHERE id = ?", [groupId]);

    if (result.affectedRows === 0) {
        throw appErrors.create({en: `Group with id ${groupId} is not found`, ar: `المجموعة بالمعرف ${groupId} غير موجودة`}, 404, httpStatusText.FAIL)
    }
}

// get group by id with schedules and teacher info
const getGroupById = async (groupId) => {
    
    const [rows] = await db.query(`
        SELECT
    g.id AS groupId,
    g.name AS groupName,
    g.maxStudents,
    g.isActive,
    t.id AS teacherId,
    u.name AS teacherName,

    (
        SELECT sm.surahName
        FROM GroupSessions gs
        INNER JOIN SessionMemorization sm
            ON sm.sessionId = gs.id
        WHERE gs.groupId = g.id
        ORDER BY gs.sessionDate DESC, gs.id DESC
        LIMIT 1
    ) AS currentSurah,

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
    if (!rows.length)
        throw appErrors.create({en: `Group with id ${groupId} is not found`, ar: `المجموعة بالمعرف ${groupId} غير موجودة`}, 404, httpStatusText.FAIL)
    
    return rows[0];
}


// toggle activate the group
const toggleGroupActivation = async (groupId) => {

    const [result] = await db.query(
        "UPDATE Groupss SET isActive = NOT isActive WHERE id = ?",
        [groupId]
    );

    if (result.affectedRows === 0) {
        throw appErrors.create({en: `Group with id ${groupId} is not found`, ar: `المجموعة بالمعرف ${groupId} غير موجودة`}, 404, httpStatusText.FAIL)
    }

    return result;
}

// craeteGroupSession

const createGroupSession = async ({ groupId, memorization, revision }) => {

    // Check group exists
    const [groups] = await db.query(
        `
        SELECT id
        FROM Groupss
        WHERE id = ?
        `,
        [groupId]
    );

    if (groups.length === 0) {
        throw appErrors.create(
            {en: `Group with id ${groupId} not found`, ar: `المجموعة بالمعرف ${groupId} غير موجودة`},
            404,
            httpStatusText.NOT_FOUND
        );
    }

    // Check schedule
    const [schedule] = await db.query(`
        SELECT *
        FROM GroupSchedules
        WHERE groupId = ?
            AND dayOfWeek = DAYNAME(CURDATE())
            AND CURTIME() BETWEEN startTime AND endTime
        `,
        [groupId]
    );

    if (schedule.length === 0) {
        throw appErrors.create(
            {en: `Group with id ${groupId} does not have a schedule at the current time`, ar: `المجموعة ذات المعرف ${groupId} ليس لديها جدول في الوقت الحالي`},
            400,
            httpStatusText.FAIL
        );
    }

    // Check today's session
    const [existingSession] = await db.query(`
        SELECT id
        FROM GroupSessions
        WHERE groupId = ?
            AND sessionDate = CURDATE()
        
        `, [groupId]
    );

    if (existingSession.length > 0) {
        throw appErrors.create(
            {en: `Group with id ${groupId} already has a session today`, ar: `المجموعة ذات المعرف ${groupId} لديها جلسة بالفعل اليوم`},
            409,
            httpStatusText.FAIL
        );
    }

    // Create session
    const [result] = await db.query(
        `
        INSERT INTO GroupSessions (
            groupId
        )
        VALUES (?)
        `,
        [groupId]
    );

    const sessionId = result.insertId;

    // Create memorization
    await db.query(
        `
        INSERT INTO SessionMemorization (
            sessionId,
            surahName,
            fromAyah,
            toAyah
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            sessionId,
            memorization.surahName,
            memorization.fromAyah,
            memorization.toAyah
        ]
    );

    // Create revision
    await db.query(
        `
        INSERT INTO SessionRevision (
            sessionId,
            surahName,
            fromAyah,
            toAyah
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            sessionId,
            revision.surahName,
            revision.fromAyah,
            revision.toAyah
        ]
    );

    return {
        sessionId,
        groupId,
        memorization: memorization,
        revision: revision
    };

};


// get last group data
const getLastGroupSession = async (groupId, userId) => {
    const [group] = await db.query(`
        SELECT g.id
        FROM Groupss g
        INNER JOIN Teachers t
            ON t.id = g.teacherId
        WHERE g.id = ?
            AND t.userId = ?
    `, [groupId, userId]);

    if (group.length === 0) {
        throw appErrors.create(
            {en: "This group is not assigned to this teacher", ar: "هذه المجموعة غير مخصصة لهذا المعلم"},
            403,
            httpStatusText.FAIL
        );
    }

    const [sessions] = await db.query(`
        SELECT
            gs.id AS sessionId,
            gs.sessionDate,
            gs.createdAt,

            sm.surahName AS mSurah,
            sm.fromAyah AS mFromAyah,
            sm.toAyah AS mToAyah,

            sr.surahName AS rSurah,
            sr.fromAyah AS rFromAyah,
            sr.toAyah AS rToAyah

        FROM GroupSessions gs
        LEFT JOIN SessionMemorization sm
            ON sm.sessionId = gs.id
        LEFT JOIN SessionRevision sr
            ON sr.sessionId = gs.id
        WHERE gs.groupId = ?
        ORDER BY gs.id DESC
        LIMIT 1
    `, [groupId]);

    if (sessions.length === 0) {
        return null;
    }

    const session = sessions[0];

    return {
        sessionId: session.sessionId,
        sessionDate: session.sessionDate,
        createdAt: session.createdAt,

        memorization: {
            surahName: session.mSurah,
            fromAyah: session.mFromAyah,
            toAyah: session.mToAyah
        },

        revision: {
            surahName: session.rSurah,
            fromAyah: session.rFromAyah,
            toAyah: session.rToAyah
        }
    };
}


const groupService = {
    getGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    toggleGroupActivation,
    createGroupSession,
    getLastGroupSession
};

export default groupService;