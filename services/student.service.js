import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";



const getStudents = async () => {
    const [rows] = await db.query(`
        SELECT
            s.id,
            s.name AS studentName,

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

const studentSerivces = {
    getStudents,
    createStudent,
    deleteStudent,
    updateStudent,
    deleteStudentFromGroup,
}


export default studentSerivces;