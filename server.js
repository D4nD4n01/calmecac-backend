import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,      // mysql-production-afe9.up.railway.app
  port: process.env.DB_PORT,      // <PUERTO>
  user: process.env.DB_USER,      // root
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  pool.query(
    "SELECT * FROM users WHERE usuario = ? AND password = ?",
    [username, password],
    (error, results) => {
      if (error) {
        console.error("Error al consultar:", error);
        return res.status(500).json({ success: false, message: "Error del servidor" });
      }

      if (results.length > 0) {
        res.json({ success: true, user: results[0] });
      } else {
        res.status(401).json({ success: false, message: "Credenciales incorrectas" });
      }
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
