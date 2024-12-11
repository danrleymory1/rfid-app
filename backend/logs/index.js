// 2. Serviço de Logs (Porta 8002)
// logs/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 8002;

app.use(express.json());

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados de logs.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        datetime TEXT NOT NULL,
        allowed BOOLEAN NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`);
});

app.post('/logs/access', (req, res) => {
    const { rfid } = req.body;
    const datetime = new Date().toISOString();

    db.get('SELECT id, hasPermission FROM users WHERE rfid = ?', [rfid], (err, row) => {
        if (err) {
            res.status(500).send('Erro ao buscar usuário.');
        } else if (row) {
            const { id, hasPermission } = row;
            db.run('INSERT INTO logs (userId, datetime, allowed) VALUES (?, ?, ?)', [id, datetime, hasPermission], function (err) {
                if (err) {
                    res.status(500).send('Erro ao registrar log.');
                } else {
                    res.status(200).json({ allowed: hasPermission });
                }
            });
        } else {
            db.run('INSERT INTO logs (userId, datetime, allowed) VALUES (NULL, ?, ?)', [datetime, false], function (err) {
                if (err) {
                    res.status(500).send('Erro ao registrar log.');
                } else {
                    res.status(403).json({ allowed: false });
                }
            });
        }
    });
});

app.get('/logs', (req, res) => {
    db.all(`SELECT logs.id, users.name, logs.datetime, logs.allowed 
            FROM logs 
            LEFT JOIN users ON logs.userId = users.id`, [], (err, rows) => {
        if (err) {
            res.status(500).send('Erro ao buscar logs.');
        } else {
            res.json(rows);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Serviço de Logs rodando na porta ${PORT}`);
});
