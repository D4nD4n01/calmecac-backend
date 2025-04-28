import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,        // ej: mysql-production-afe9.up.railway.app
  user: process.env.DB_USER,        // ej: root
  password: process.env.DB_PASSWORD,// contraseña
  database: process.env.DB_DATABASE,// railway
  port: process.env.DB_PORT,        // 3306
});

app.get("/", async (req, res) => {
  res.send("Servidor funcionando 😎");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en el puerto ${port}`);
});
