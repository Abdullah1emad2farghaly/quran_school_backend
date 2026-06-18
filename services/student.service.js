import db from "../config/db.js";
import appErrors from "../utils/appErrors.js";
import httpStatusText from "../utils/httpStatusText.js";

//create student
const createStudent = async ({ name, parentId, groupId }) => {
    const [result] = await db.query(
        'INSERT INTO Students (name, parentId, groupId) VALUES (?, ?, ?)',
        [name, parentId, groupId]
    );

    const studentId = result.insertId;
    const [rows] = await db.query(
        'SELECT * FROM Students WHERE id = ?',
        [studentId]
    );
    const resultStudent = rows[0];
    return resultStudent;
}

// update student
const updateStudent = async (studentId, { name, groupId }) => {
    const [result] = await db.query(
        'UPDATE Students SET name = ?, groupId = ? WHERE id = ?',
        [name, groupId, studentId]
    );
    if (result.affectedRows === 0) {
        throw appErrors.create(`Student with id ${studentId} not found`, 404, httpStatusText.FAIL);
    }
    const [rows] = await db.query(
        'SELECT * FROM Students WHERE id = ?',
        [studentId]
    );

    return rows[0];
}

// delete student
const deleteStudent = async (studentId) => {
    const [result] = await db.query(
        'DELETE FROM Students WHERE id = ?',
        [studentId]
    );
    
    if (result.affectedRows === 0) {
        throw appErrors.create(`Student with id ${studentId} not found`, 404, httpStatusText.FAIL);
    }
}

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
    createStudent,
    deleteStudent,
    updateStudent,
    deleteStudentFromGroup,
}


export default studentSerivces;