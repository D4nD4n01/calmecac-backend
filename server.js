import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const cleanEnv = (val) => val?.trim().replace(/^=+/, "").replace(/^\t+/, "");

// Limpieza de variables de entorno
const dbConfig = {
  host: cleanEnv(process.env.DB_HOST),
  port: Number(cleanEnv(process.env.DB_PORT)),
  user: cleanEnv(process.env.DB_USER),
  password: cleanEnv(process.env.DB_PASSWORD),
  database: cleanEnv(process.env.DB_DATABASE),
};

console.log("Valores de conexión LIMPIOS:");
console.log("ola q ase")
console.log("HOST:", dbConfig.host);
console.log("PORT:", dbConfig.port);
console.log("USER:", dbConfig.user);
console.log("PASS:", dbConfig.password);
console.log("DB:", dbConfig.database);

// Crear conexión con valores limpios
const pool = mysql.createPool(dbConfig);


app.get("/", async (req, res) => {
  res.send("Servidor funcionando POR FIN; YA ERA HORA");
});

pool.getConnection()
  .then(() => console.log("✅ Conexión a la base de datos MySQL exitosa"))
  .catch(err => console.error("❌ Error al conectar con la base de datos:", err));


app.post("/wsCRUDlogin", async (req, res) => {
  const { intMode, usuario, password, id, newUsuario, newPassword } = req.body;

  try {
    switch (intMode) {
      case 0: // CONSULTAR
        const [rows] = await pool.query(
          "SELECT * FROM users WHERE BINARY usuario = ? AND BINARY password = ?",
          [usuario, password]
        );
        if (rows.length > 0) {
          res.json({ success: true, user: rows[0] });
        } else {
          res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
        break;

      case 1: // INSERTAR
        await pool.query(
          "INSERT INTO users (usuario, password) VALUES (?, ?)",
          [usuario, password]
        );
        res.json({ success: true, message: "Usuario registrado con éxito" });
        break;

      case 2: // EDITAR
        await pool.query(
          "UPDATE users SET usuario = ?, password = ? WHERE id = ?",
          [newUsuario, newPassword, id]
        );
        res.json({ success: true, message: "Usuario actualizado con éxito" });
        break;

      default:
        res.status(400).json({ success: false, message: "Modo inválido para login" });
    }
  } catch (error) {
    console.error("Error en wsCRUDlogin:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});


app.post("/wsCRUDcourse", async (req, res) => {
  const { intMode, idTeacher, idCourse, strSubject, intGrade, strClassroom, strHour } = req.body;

  try {
    switch (intMode) {
      case 0: // CONSULTAR
        const [rows] = await pool.query(
          "SELECT * FROM course WHERE idTeacher = ?",
          [idTeacher]
        );
        res.json({ success: true, data: rows });
        break;

      case 1: // INSERTAR
        await pool.query(
          "INSERT INTO course (idTeacher, strSubject, intGrade, strClassroom, strHour) VALUES (?, ?, ?, ?, ?)",
          [idTeacher, strSubject, intGrade, strClassroom, strHour]
        );
        res.json({ success: true, message: "Curso registrado con éxito" });
        break;

      case 2: // EDITAR
        await pool.query(
          "UPDATE course SET strSubject = ?, intGrade = ?, strClassroom = ?, strHour = ? WHERE idCourse = ? AND idTeacher = ?",
          [strSubject, intGrade, strClassroom, strHour, idCourse, idTeacher]
        );
        res.json({ success: true, message: "Curso actualizado con éxito" });
        break;

      case 3: // BORRAR
        await pool.query(
          "DELETE FROM course WHERE idCourse = ? ",
          [idCourse]
        );
        res.json({ success: true, message: "Curso eliminado con éxito" });
        break;

      default:
        res.status(400).json({ success: false, message: "Modo inválido para course" });
    }
  } catch (error) {
    console.error("Error en wsCRUDcourse:", error);
    res.status(500).json({ success: false, message: "Error en el servidor al procesar cursos" });
  }
});

app.post("/getcourse", async (req, res) => {
  try {
    const { idCourse } = req.body;

    // Validación básica del parámetro
    if (!idCourse || isNaN(idCourse)) {
      return res.status(400).json({
        success: false,
        message: "Parámetro 'idCourse' inválido o faltante",

      });
    }

    // Consulta a la base de datos
    const [rows] = await pool.query(
      "SELECT * FROM course WHERE idCourse = ?",
      [idCourse]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Curso no encontrado"
      });
    }

    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error("Error en /getcourse:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

app.post("/wsCRUDstudents", async (req, res) => {
  const { intMode, idCourse, strName, intNumberList, idStudent, intNumberControl } = req.body;

  try {
    let result;

    switch (intMode) {
      case 0: // Consultar estudiantes por curso
        [result] = await pool.query("SELECT * FROM students WHERE idCourse = ?", [idCourse]);
        break;

      case 1: // Insertar estudiante
        // Obtener strSubject desde la tabla course
        const [courseRows] = await pool.query(
          "SELECT strSubject FROM course WHERE idCourse = ?",
          [idCourse]
        );

        if (courseRows.length === 0) {
          return res.status(404).json({ success: false, message: "Curso no encontrado." });
        }

        const strSubject = courseRows[0].strSubject;

        // Insertar estudiante con strSubject
        [result] = await pool.query(
          "INSERT INTO students (idCourse, strName, intNumberList, strSubject, intNumberControl) VALUES (?, ?, ?, ?, ?)",
          [idCourse, strName, intNumberList, strSubject, intNumberControl]
        );
        break;

      case 2: // Editar estudiante
        [result] = await pool.query(
          "UPDATE students SET strName = ?, intNumberList = ?, intNumberControl = ? WHERE idStudent = ?",
          [strName, intNumberList, intNumberControl, idStudent]
        );
        break;

      case 3: // Eliminar estudiante
        [result] = await pool.query("DELETE FROM students WHERE idStudent = ?", [idStudent]);
        break;

      default:
        return res.status(400).json({ success: false, message: "intMode inválido." });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error en wsCRUDstudents:", error);
    res.status(500).json({ success: false, message: "Error del servidor." });
  }
});

app.get("/getstudents", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT idStudent, strName, intNumberList, intNumberControl, idCourse, strSubject
      FROM students
    `);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron estudiantes",
        data: [],
      });
    }

    // Agrupar por número de control
    const grouped = {};

    rows.forEach((row) => {
      const control = row.intNumberControl;

      if (!grouped[control]) {
        grouped[control] = {
          strName: row.strName,
          intNumberControl: control,
          course: [],
        };
      }

      grouped[control].course.push({
        idCourse: row.idCourse,
        strSubject: row.strSubject,
        idStudent: row.idStudent,
        intNumberList: row.intNumberList,
      });
    });

    const response = Object.values(grouped);

    return res.json({
      success: true,
      total: response.length,
      data: response,
    });

  } catch (error) {
    console.error("❌ Error en /getstudents:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

app.post("/wsCRUDattendance", async (req, res) => {
  const {
    intMode,
    strDate,
    idCourse,
    idStudent,
    blnAssist,
    idAttendance,
    intNumberControl,
    intNumberList,
    strName,
    strSubject,
  } = req.body;

  try {
    let result;

    switch (intMode) {
      case 0: // Consultar asistencia por fecha y curso
        const [existingRows] = await pool.query(
          "SELECT * FROM attendance WHERE strDate = ? AND idCourse = ?",
          [strDate, idCourse]
        );

        if (existingRows.length > 0) {
          const [totalStudents] = await pool.query(
            "SELECT COUNT(*) AS total FROM students WHERE idCourse = ?",
            [idCourse]
          );

          const total = totalStudents[0]?.total ?? 0;
          const attendedCount = existingRows.filter(row => row.blnAssist === 1).length;
          const allAttended = attendedCount === total;
          const notPresent = existingRows.filter(row => row.blnAssist === 0);

          return res.json({
            success: true,
            new: false,
            allAttended,
            totalStudents: total,
            attended: attendedCount,
            data: notPresent,
          });
        } else {
          return res.json({ success: true, new: true, data: [] });
        }

      case 1: // Insertar asistencia
        [result] = await pool.query(
          `INSERT INTO attendance 
           (strDate, idCourse, idStudent, blnAssist, intNumberControl, intNumberList, strName, strSubject) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            strDate,
            idCourse,
            idStudent,
            blnAssist,
            intNumberControl,
            intNumberList,
            strName,
            strSubject,
          ]
        );
        if (result.affectedRows > 0) {
          return res.json({ success: true, insertId: result.insertId });
        } else {
          return res.status(400).json({
            success: false,
            message: "No se pudo insertar el registro de asistencia.",
          });
        }
      case 2: // Actualizar asistencia
        [result] = await pool.query(
          "UPDATE attendance SET blnAssist = ? WHERE idAttendance = ?",
          [blnAssist, idAttendance]
        );

        if (result.affectedRows > 0) {
          return res.json({ success: true, affectedRows: result.affectedRows });
        } else {
          return res.status(404).json({
            success: false,
            message: "No se encontró el registro de asistencia para actualizar.",
          });
        }

      default:
        return res.status(400).json({
          success: false,
          message: "intMode inválido.",
        });
    }
  } catch (error) {
    console.error("Error en wsCRUDattendance:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor.",
    });
  }
});

app.post('/getattendance', async (req, res) => {
  const { idTeacher } = req.body;

  if (!idTeacher) {
    return res.status(400).json({ success: false, message: "idTeacher requerido" });
  }

  try {
    // 1. Obtener los cursos del maestro
    const [courses] = await pool.query(
      `SELECT idCourse, strSubject FROM course WHERE idTeacher = ?`,
      [idTeacher]
    );

    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: "El maestro no tiene cursos." });
    }

    const courseIds = courses.map(c => c.idCourse);

    // Verificar que courseIds no esté vacío
    if (courseIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 2. Obtener todas las asistencias relacionadas con los cursos
    const [attendances] = await pool.query(
      `
      SELECT a.idAttendance, a.strDate, a.idCourse,
             a.idStudent, a.blnAssist, a.intNumberControl, 
             a.intNumberList, a.strName, a.strSubject
      FROM attendance a
      WHERE a.idCourse IN (?)
      ORDER BY a.idCourse, a.idAttendance, a.idStudent
      `,
      [courseIds]
    );

    // 3. Estructurar la respuesta
    const groupedByCourse = {};

    attendances.forEach(record => {
      const {
        idCourse, strSubject, idAttendance, strDate,
        idStudent, blnAssist, intNumberControl,
        intNumberList, strName
      } = record;

      if (!groupedByCourse[idCourse]) {
        groupedByCourse[idCourse] = {
          idCourse,
          strSubject,
          assist: []
        };
      }

      const course = groupedByCourse[idCourse];

      let attendanceEntry = course.assist.find(a => a.strDate === strDate);

      if (!attendanceEntry) {
        attendanceEntry = {
          
          strDate,
          studentsAssist: []
        };
        course.assist.push(attendanceEntry);
      }

      attendanceEntry.studentsAssist.push({
        idAttendance,
        idStudent,
        blnAssist,
        intNumberControl,
        intNumberList,
        strName
      });
    });

    // 4. Convertir el objeto a arreglo
    const result = Object.values(groupedByCourse);

    return res.json({ success: true, data: result });

  } catch (error) {
    console.error("Error en /getattendance:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor." });
  }
});



app.listen(port, () => {
  console.log(`Servidor backend corriendo en el puerto ${port}`);
});
