// Estrutura completa do backend e frontend

// 1. Serviço de Usuários (Porta 8001)
// Código já fornecido acima

// 2. Serviço de Logs (Porta 8002)
// Código já fornecido acima

// 3. Frontend em React Native
// Navegue até a pasta raiz do projeto React Native e inicie com:
// expo init rfid-app

// Substitua o conteúdo de App.js pelo seguinte:
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Button, TextInput, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const apiBaseUrl = 'http://192.168.2.20:8000';

// Tela de Logs
function LogsScreen() {
  const [logs, setLogs] = useState([]);
  const [totals, setTotals] = useState({ total: 0, allowed: 0 });

  useEffect(() => {
    fetch(`${apiBaseUrl}/logs`)
      .then((response) => response.json())
      .then((data) => {
        setLogs(data);
        const total = data.length;
        const allowed = data.filter((log) => log.allowed).length;
        setTotals({ total, allowed });
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Total de tentativas: {totals.total}</Text>
      <Text>Permitidas: {totals.allowed}</Text>
      <Text>Negadas: {totals.total - totals.allowed}</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text>{item.name || 'Desconhecido'}</Text>
            <Text>{new Date(item.datetime).toLocaleString()}</Text>
            <Text style={{ color: item.allowed ? 'green' : 'red' }}>
              {item.allowed ? 'Permitido' : 'Negado'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// Tela de Cadastro
function AddUserScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rfid, setRfid] = useState('');

  const handleReadRfid = () => {
    fetch(`${apiBaseUrl}/read-rfid`)
      .then((response) => response.json())
      .then((data) => setRfid(data.rfid))
      .catch((error) => alert('Erro ao ler o RFID.'));
  };

  const handleSubmit = () => {
    fetch(`${apiBaseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, rfid }),
    })
      .then((response) => {
        if (response.ok) alert('Usuário cadastrado com sucesso!');
      })
      .catch((error) => alert('Erro ao cadastrar usuário.'));
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Nome" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="RFID" style={styles.input} value={rfid} editable={false} />
      <TouchableOpacity style={styles.button} onPress={handleReadRfid}>
        <Text style={styles.buttonText}>Ler RFID</Text>
      </TouchableOpacity>
      <View style={styles.spacing} />
      <Button title="Cadastrar" onPress={handleSubmit} />
    </View>
  );
}

// Tela de Usuários
function UsersScreen() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${apiBaseUrl}/users`)
      .then((response) => response.json())
      .then((data) => setUsers(data));
  }, []);

  const handleDelete = (id) => {
    fetch(`${apiBaseUrl}/users/${id}`, { method: 'DELETE' })
      .then(() => setUsers((prev) => prev.filter((user) => user.id !== id)));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>{item.name}</Text>
            <Text>{item.email}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteButton}>Deletar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Logs" component={LogsScreen} />
        <Tab.Screen name="Cadastrar Usuário" component={AddUserScreen} />
        <Tab.Screen name="Usuários" component={UsersScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logItem: {
    padding: 10,
    borderBottomWidth: 1,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
  },
  deleteButton: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: 'green',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  spacing: {
    marginVertical: 10,
  },
});

// Inicialização do Expo:
// 1. Instale dependências: npm install
// 2. Inicie o projeto: expo start
// 3. Altere o IP base (apiBaseUrl) para o IP da máquina que está rodando o backend.
