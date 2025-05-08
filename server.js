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


app.post("/login", async (req, res) => {
  const { usuario, password } = req.body;
  console.log("Usuario recibido: ", usuario, password)

  //console.log("req de la solicitud:", req); // Verifica lo que llega al servidor
  //console.log("res de la solicitud:", res);
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE usuario = ? AND password = ?",
      [usuario, password]
    );

    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ success: false, message: "Error en el servidor; no puede ingresar al login", req: req, res: res });
  }
});

app.post("/course", async (req, res) => {
  const { idTeacher } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM course WHERE idTeacher = ?",
      [idTeacher]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Error al obtener cursos:", error);
    res.status(500).json({ success: false, message: "Error al obtener los cursos" });
  }
});


app.listen(port, () => {
  console.log(`Servidor backend corriendo en el puerto ${port}`);
});
