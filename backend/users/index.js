// 1. Serviço de Usuários (Porta 8001)
// users/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 8001;

app.use(express.json());

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados de usuários.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        rfid TEXT NOT NULL,
        hasPermission BOOLEAN DEFAULT 1
    )`);
});

app.post('/users', (req, res) => {
    const { name, email, rfid } = req.body;
    db.run('INSERT INTO users (name, email, rfid) VALUES (?, ?, ?)', [name, email, rfid], function (err) {
        if (err) {
            res.status(500).send('Erro ao inserir usuário.');
        } else {
            res.status(201).json({ id: this.lastID });
        }
    });
});

app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).send('Erro ao buscar usuários.');
        } else {
            res.json(rows);
        }
    });
});

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).send('Erro ao deletar usuário.');
        } else {
            res.status(204).send();
        }
    });
});

app.patch('/users/:id/permission', (req, res) => {
    const { id } = req.params;
    const { hasPermission } = req.body;
    db.run('UPDATE users SET hasPermission = ? WHERE id = ?', [hasPermission, id], function (err) {
        if (err) {
            res.status(500).send('Erro ao atualizar permissão.');
        } else {
            res.status(200).send();
        }
    });
});

app.listen(PORT, () => {
    console.log(`Serviço de Usuários rodando na porta ${PORT}`);
});

