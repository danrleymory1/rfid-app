const express = require('express');
const app = express();
const axios = require('axios');

app.use(express.json());

const USERS_SERVICE_URL = 'http://192.168.2.20:8001';
const LOGS_SERVICE_URL = 'http://192.168.2.20:8002';

app.use('/users', async (req, res) => {
    console.log(`Requisição para /users: ${req.method} ${req.url}`);
    try {
      const response = await axios({
        method: req.method,
        // Corrigir a URL para garantir que a rota correta seja chamada no serviço de usuários
        url: `${USERS_SERVICE_URL}${req.originalUrl}`,  // Usar originalUrl para preservar a URL completa
        data: req.body,
      });
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error(`Erro ao encaminhar para o serviço de usuários: ${error}`);
      res.status(500).send('Erro ao acessar o serviço de usuários');
    }
  });
  
  app.use('/logs', async (req, res) => {
    console.log(`Requisição para /logs: ${req.method} ${req.url}`);
    try {
      const response = await axios({
        method: req.method,
        // Corrigir a URL para garantir que a rota correta seja chamada no serviço de logs
        url: `${LOGS_SERVICE_URL}${req.originalUrl}`,  // Usar originalUrl para preservar a URL completa
        data: req.body,
      });
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error(`Erro ao encaminhar para o serviço de logs: ${error}`);
      res.status(500).send('Erro ao acessar o serviço de logs');
    }
  });
  
  
app.listen(8000, () => console.log('API Gateway na porta 8000'));
