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
          "SELECT * FROM users WHERE usuario = ? AND password = ?",
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
          "DELETE FROM course WHERE idCourse = ? AND idTeacher = ?",
          [idCourse, idTeacher]
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



app.listen(port, () => {
  console.log(`Servidor backend corriendo en el puerto ${port}`);
});
