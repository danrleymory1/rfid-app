#include <ESP8266WiFi.h>
#include <MFRC522.h>
#include <ESP8266HTTPClient.h> // Biblioteca para HTTP


// Configuração do leitor RFID
#define RST_PIN D5  // Alterado para D5
#define SS_PIN D4   // Mantido no D4

// LED RGB
#define LED_R D1
#define LED_G D2
#define LED_B D0  

// Configuração do Wi-Fi
const char* ssid = "Netzwerkverbindung";
const char* password = "Dibilaikaguil";
const char* serverUrl = "http://192.168.2.20:8000"; // Gateway do backend

WiFiClient client;
MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  Serial.println("Iniciando...");
  
  // Conectar ao Wi-Fi
  WiFi.begin(ssid, password);
  
  int retries = 0;  // Tentar até 10 vezes
  while (WiFi.status() != WL_CONNECTED && retries < 10) {
    delay(1000);  // Espera 1 segundo
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Conectado ao Wi-Fi");
    // Acende o LED em amarelo por 3 segundos após conectar
    setLEDColor(255, 255, 0); // Amarelo (vermelho + verde)
    delay(3000); // Espera 3 segundos
    setLEDColor(0, 0, 0); // Desliga os LEDs
  } else {
    Serial.println("Falha ao conectar ao Wi-Fi");
    setLEDColor(255, 0, 0); // Vermelho (indica falha)
    while (true);  // Fica em loop para indicar erro
  }
  
  // Inicializar o leitor RFID
  SPI.begin();
  mfrc522.PCD_Init();
  
  // Configurar os pinos do LED RGB
  pinMode(LED_R, OUTPUT);
  pinMode(LED_G, OUTPUT);
  pinMode(LED_B, OUTPUT);
}

void loop() {
  // Verifica se há um cartão presente
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    delay(500);
    return;
  }
  
  String rfid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    rfid += String(mfrc522.uid.uidByte[i], HEX);
  }
  rfid.toUpperCase();
  
  Serial.println("RFID Lido: " + rfid);

  // Enviar para o servidor
  if (sendRFIDToServer(rfid)) {
    digitalWrite(LED_G, HIGH);
    delay(1000);
    digitalWrite(LED_G, LOW);
  } else {
    digitalWrite(LED_R, HIGH);
    delay(1000);
    digitalWrite(LED_R, LOW);
  }
}

bool sendRFIDToServer(String rfid) {
  HTTPClient http;
  String url = String(serverUrl) + "/logs/access"; // Construção da URL
  http.begin(url); // Apenas a URL é passada aqui
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"rfid\":\"" + rfid + "\"}";
  int httpCode = http.POST(payload);

  Serial.println("Resposta do Servidor: " + String(httpCode));

  http.end();
  return httpCode == 200;
}

// Função para configurar a cor do LED RGB
void setLEDColor(int red, int green, int blue) {
  analogWrite(LED_R, red);
  analogWrite(LED_G, green);
  analogWrite(LED_B, blue);
}
