import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";


// create memorization to specific student in specific group schedule
const createMemorization = async (reqBody, userId, groupId, studentId) => {
    console.log(reqBody)
    let { memorizationScore, revision, notes, date } = reqBody;

    let [teacherId] = await db.query(`
        SELECT t.id FROM Teachers t WHERE t.userId = ?
    `, [userId]);

    teacherId = teacherId[0].id;

    date = new Date().toISOString().split('T')[0];

    //check if the student exists
    const [student] = await db.query("SELECT * FROM students WHERE id = ?", [studentId]);
    if (!student) {
        throw appErrors.create({ en: "Student not found", ar: "الطالب غير موجود" }, 404, httpStatusText.NOT_FOUND);
    }

    // check if the teacher exists
    const [teacher] = await db.query("SELECT * FROM teachers WHERE id = ?", [teacherId]);
    if (!teacher) {
        throw appErrors.create({ en: "Teacher not found", ar: "المعلم غير موجود" }, 404, httpStatusText.NOT_FOUND);
    }

    // check if the group exists
    const [group] = await db.query("SELECT * FROM groupss WHERE id = ?", [groupId]);
    if (!group) {
        throw appErrors.create({ en: "Group not found", ar: "المجموعة غير موجودة" }, 404, httpStatusText.NOT_FOUND);
    }

    // check if the student in this group or not
    const [res] = await db.query(`
        SELECT * FROM Students
        WHERE id = ? AND groupId = ?
    `, [studentId, groupId]);

    if (!res) {
        throw appErrors.create({ en: "This student not found in this group", ar: "هذا الطالب غير موجود في هذه المجموعة" }, 404, httpStatusText.NOT_FOUND);
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
        throw appErrors.create({ en: `Group with id ${groupId} does not have a schedule at the current time`, ar: `المجموعة ذات المعرف ${groupId} لا تحتوي على جدول في الوقت الحالي` }, 400, httpStatusText.FAIL);
    }

    // Prevent duplicate memorization
    const [existing] = await db.query(
        `
        SELECT id
        FROM memorizationRecords
        WHERE studentId = ?
        AND date = ?
        `,
        [studentId, date]
    );

    if (existing.length > 0) {
        throw appErrors.create({ en: "Memorization already recorded for this student today", ar: "تم تسجيل الحفظ لهذا الطالب اليوم" }, 400, httpStatusText.FAIL);
    }

    // Get sessionId that the session before the currentDate for the group
    const [[session]] = await db.query(
        `
        SELECT id
        FROM GroupSessions
        WHERE groupId = ?
            AND sessionDate < CURDATE()
        ORDER BY sessionDate DESC
        LIMIT 1
    `,
        [groupId]
    );

    if(!session){
        throw appErrors.create({ en: "No previous session found for this group", ar: "لا توجد جلسة سابقة لهذه المجموعة" }, 404, httpStatusText.NOT_FOUND);
    }
    let sessionId = session ? session.id : null;

    console.log(sessionId);

    const [newMemorization] = await db.query(
        `INSERT INTO memorizationRecords (studentId, teacherId, memorizationScore, revision, notes, date, groupId, sessionId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [studentId, teacherId, memorizationScore, revision, notes, date, groupId, sessionId]
    );

    if (!newMemorization) {
        throw appErrors.create({ en: "Failed to create memorization record", ar: "فشل في إنشاء سجل الحفظ" }, 500, httpStatusText.ERROR);
    }

    return newMemorization;
};

const createMemorizationAssignments = async (groupId, data) => {

    let sessionId = null;

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

    if (!schedule) {
        throw appErrors.create(
            {
                en: "No active schedule found for this group at the current time",
                ar: "هذا ليس معاد الحلقه"
            },
            400,
            httpStatusText.FAIL
        );
    }

    // If there is an active schedule, ensure today's session exists
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

    if (session) {
        sessionId = session.id;
    } else {
        const [newSession] = await db.query(
            `
            INSERT INTO GroupSessions (
                groupId
            )
            VALUES (?)
            `,
            [groupId]
        );

        sessionId = newSession.insertId;
    }

    // Check if the session already has assignments
    const [existingAssignments] = await db.query(
        `
        SELECT id
        FROM sessionMemorization
        WHERE sessionId = ?
        `,
        [sessionId]
    );

    if (existingAssignments.length > 0) {
        throw appErrors.create(
            {
                en: "The memorization assignments already exist for this session",
                ar: "تكليفات الحفظ موجودة بالفعل لهذه الجلسة"
            },
            400,
            httpStatusText.FAIL
        );
    }

    // Validation on FromAyah and ToAyah
    if (data.fromAyah > data.toAyah) {
        throw appErrors.create(
            {
                en: "From Ayah cannot be greater than To Ayah",
                ar: "من الآية لا يمكن أن تكون أكبر من إلى الآية"
            },
            400,
            httpStatusText.FAIL
        );
    }

    const [newMemorizationAssignment] = await db.query(
        `
        INSERT INTO sessionMemorization (
            sessionId,
            surahName,
            fromAyah,
            toAyah
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            sessionId,
            data.surahName,
            data.fromAyah,
            data.toAyah
        ]
    );

    return newMemorizationAssignment;
};

const createRevisionAssignments = async (groupId, data) => {

    let sessionId = null;

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

    if (!schedule) {
        throw appErrors.create(
            {
                en: "No active schedule found for this group at the current time",
                ar: "هذا ليس معاد الحلقه"
            },
            400,
            httpStatusText.FAIL
        );
    }

    // If there is an active schedule, ensure today's session exists
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

    if (session) {
        sessionId = session.id;
    } else {
        const [newSession] = await db.query(
            `
            INSERT INTO GroupSessions (
                groupId
            )
            VALUES (?)
            `,
            [groupId]
        );


        sessionId = newSession.insertId;
    }

    // Check if the session already has assignments
    const [existingAssignments] = await db.query(
        `
        SELECT id
        FROM sessionRevision
        WHERE sessionId = ?
        `,
        [sessionId]
    );

    if (existingAssignments.length > 0) {
        throw appErrors.create(
            {
                en: "The revision assignments already exist for this session",
                ar: "تكليفات المراجعة موجودة بالفعل لهذه الجلسة"
            },
            400,
            httpStatusText.FAIL
        );
    }

    // Validation on FromAyah and ToAyah
    if (data.fromAyah > data.toAyah) {
        throw appErrors.create(
            {
                en: "From Ayah cannot be greater than To Ayah",
                ar: "من الآية لا يمكن أن تكون أكبر من إلى الآية"
            },
            400,
            httpStatusText.FAIL
        );
    }


    const [newRevisionAssignment] = await db.query(
        `
        INSERT INTO sessionRevision (
            sessionId,
            surahName,
            fromAyah,
            toAyah
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            sessionId,
            data.surahName,
            data.fromAyah,
            data.toAyah
        ]
    );

    return newRevisionAssignment;
};



const memorizationService = {
    createMemorization,
    createMemorizationAssignments,
    createRevisionAssignments
};

export default memorizationService;