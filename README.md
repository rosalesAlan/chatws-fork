# Chat WebSocket - Guía para Alumnos

Este proyecto implementa un sistema de chat en tiempo real utilizando **WebSocket** y el protocolo **STOMP** con Spring Boot. A continuación se explica el flujo completo de funcionamiento y los conceptos clave.

## 📝 Descripción del Proyecto

ChatWS es una aplicación de chat en tiempo real que permite a múltiples usuarios conectarse, enviar mensajes y recibir actualizaciones instantáneas sin necesidad de recargar la página. Utiliza una arquitectura basada en eventos donde los mensajes se propagan automáticamente a todos los clientes conectados.

**Tecnologías principales:**
- Spring Boot 4.1.1
- WebSocket para comunicación bidireccional
- STOMP como protocolo de mensajería
- SockJS para compatibilidad con navegadores antiguos
- Jackson para serialización JSON

---

## 🏗️ Arquitectura y Flujo

### Diagrama de Arquitectura

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│   Cliente Web   │ ◄────────────────────────► │   Servidor       │
│  (Navegador)    │     (ws://localhost:8080)  │   Spring Boot    │
└─────────────────┘                            └──────────────────┘
       │                                                 │
       │ 1. Conexión WebSocket                          │
       │ 2. Suscripción a /topic/public                 │
       │ 3. Envío a /app/chat.sendMessage               │
       │                                                 │
       │                                                 │
       │ 4. Recepción de mensajes                       │
       │    (broadcast desde /topic/public)             │
```

### Flujo Completo de un Mensaje

1. **Conexión:** El cliente web establece una conexión WebSocket con el servidor
2. **Suscripción:** El cliente se suscribe al canal `/topic/public` para recibir mensajes
3. **Envío:** El cliente envía un mensaje a `/app/chat.sendMessage`
4. **Procesamiento:** El `ChatController` recibe el mensaje
5. **Broadcast:** El mensaje se reenvía a todos los suscriptores de `/topic/public`
6. **Recepción:** Todos los clientes conectados reciben el mensaje simultáneamente

## ▶️ Ejecutar y probar

1. Inicia la aplicación desde VS Code con **Terminal → Run Task… → ChatWS: ejecutar con Maven Wrapper**, o desde una terminal en la raíz del proyecto con `.\mvnw.cmd spring-boot:run`. No necesitas instalar Maven globalmente.
2. Abre `http://localhost:8080` en dos pestañas o navegadores.
3. En cada ventana, escribe un nombre distinto y pulsa **Conectar**.
4. Envía un mensaje desde una ventana; debe aparecer en ambas sin recargar la página.

No se necesita instalar ni iniciar RabbitMQ: el ejemplo usa el broker simple en memoria de Spring. Para una conexión desde otra computadora, ambas deben poder alcanzar el servidor y se debe indicar su IP en el campo **IP del servidor**.

## 🔌 Configuración STOMP

- `/ws` es el endpoint SockJS al que se conecta el navegador.
- `/app` es el prefijo de los mensajes entrantes y dirige `/app/chat.sendMessage` al método `ChatController.enviarMensaje`.
- `/topic` y `/queue` son destinos administrados por el broker simple; el chat publica en `/topic/public`.

