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
  res.send("Servidor funcionando POR FIN; YA ERA HORA");
});

app.post("/login", async (req, res) => {
  const { usuario, password } = req.body;
  console.log("Usuario recibido: ",usuario,password)

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
    res.status(500).json({ success: false, message: "Error en el servidor; no puede ingresar al login",req:req,res:res });
  }
});


app.listen(port, () => {
  console.log(`Servidor backend corriendo en el puerto ${port}`);
});
