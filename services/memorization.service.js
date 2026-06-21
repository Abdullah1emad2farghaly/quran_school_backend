import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";


// create memorization to specific student in specific group schedule
const createMemorization = async (reqBody, userId) => {
    let { studentId, memorizationScore, revision, tajweedScore, fluencyScore, totalScore, notes, date, groupId } = reqBody;
    
    let [teacherId] = await db.query(`
        SELECT t.id FROM Teachers t WHERE t.userId = ?
    `, [userId]);

    teacherId = teacherId[0].id;

    date = new Date().toISOString().split('T')[0];

    //check if the student exists
    const [student] = await db.query("SELECT * FROM students WHERE id = ?", [studentId]);
    if (!student) {
        throw appErrors.create("Student not found", 404, httpStatusText.NOT_FOUND);
    }

    // check if the teacher exists
    const [teacher] = await db.query("SELECT * FROM teachers WHERE id = ?", [teacherId]);
    if (!teacher) {
        throw appErrors.create("Teacher not found", 404, httpStatusText.NOT_FOUND);
    }

    // check if the group exists
    const [group] = await db.query("SELECT * FROM groupss WHERE id = ?", [groupId]);
    if (!group) {
        throw appErrors.create("Group not found", 404, httpStatusText.NOT_FOUND);
    }

    // check if the student in this group or not
    const [res] = await db.query(`
        SELECT * FROM Students
        WHERE id = ? AND groupId = ?
    `, [studentId, groupId]);

    if(!res){
        throw appErrors.create("This student not found in this group", 404, httpStatusText.NOT_FOUND);
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
        throw appErrors.create('memorization already recorded', 400, httpStatusText.FAIL);
    }

    const [newMemorization] = await db.query(
        `INSERT INTO memorizationRecords (studentId, teacherId, memorizationScore, revision, tajweedScore, fluencyScore, totalScore, notes, date, groupId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [studentId, teacherId, memorizationScore, revision, tajweedScore, fluencyScore, totalScore, notes, date, groupId]
    );

    if(!newMemorization) {
        throw appErrors.create("Failed to create memorization record", 500, httpStatusText.ERROR);
    }

    return newMemorization;
};


const memorizationService = {
    createMemorization,
};

export default memorizationService;