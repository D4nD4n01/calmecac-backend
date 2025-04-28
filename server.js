require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Crear conexión
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'mysql-production-afe9.up.railway.app',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'CgMIXsYWjNGDLmfKVXgzFPLOMznDxEcq',
  database: process.env.MYSQL_DATABASE || 'railway',
  port: process.env.MYSQL_PORT || 3306,
});

// Ruta para login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  connection.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (error, results) => {
      if (error) {
        console.error('Error en la consulta:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
      }

      if (results.length > 0) {
        res.json({ success: true, user: results[0] });
      } else {
        res.json({ success: false, message: 'Credenciales incorrectas' });
      }
    }
  );
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando en Railway 🎯');
});

// Arrancar server
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

