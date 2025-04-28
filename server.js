import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser"; // Para leer req.body

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Conexión a Railway
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT),
});

// Ruta para login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length > 0) {
      res.json({ success: true, message: "Login exitoso", user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
