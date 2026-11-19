# Chat WebSocket con RabbitMQ

Aplicacion educativa de chat en tiempo real con Spring Boot, WebSocket, STOMP y RabbitMQ. El navegador se conecta a Spring por WebSocket; Spring usa un relay STOMP para que RabbitMQ distribuya los mensajes a los clientes suscritos.

## Arquitectura

```text
Navegador -- WebSocket/STOMP --> Spring Boot -- STOMP relay --> RabbitMQ
    ^                                                           |
    +----------------------- /topic/public ---------------------+
```

El cliente se conecta a `/ws`, envia mensajes a `/app/chat.sendMessage` y se suscribe a `/topic/public`. Spring dirige los mensajes `/app` al `ChatController`; el relay envia los destinos `/topic` y `/queue` a RabbitMQ. En esta rama el broker simple en memoria no se usa.

## Requisitos

- Java 17 o posterior.
- Docker Desktop con Docker Compose.
- El Maven Wrapper incluido (`mvnw.cmd`); no hace falta instalar Maven globalmente.

RabbitMQ debe tener habilitado el plugin STOMP. El archivo `rabbitmq/enabled_plugins` lo habilita junto al panel de administracion. El relay usa el puerto STOMP `61613`; el panel web usa `15672`. No se expone el puerto AMQP `5672`, porque esta implementacion no usa AMQP directamente.

## Ejecutar y demostrar

Desde la raiz del proyecto:

1. Inicia RabbitMQ:

   ```powershell
   docker compose up -d
   docker compose ps
   ```

   Espera a que el contenedor muestre estado `healthy`. El panel de RabbitMQ esta en `http://localhost:15672`; las credenciales locales predeterminadas son `chatws` / `chatws-demo`.

2. Inicia Spring Boot en una terminal separada:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

3. Abre `http://localhost:8080` en dos pestañas o navegadores.
4. En cada uno, escribe un nombre distinto y pulsa **Conectar**. Ambos deben indicar **Conectado**.
5. Envia un mensaje desde una ventana. Debe aparecer en ambas sin recargar la pagina.
6. Pulsa **Desconectar** en cada cliente. Para detener RabbitMQ, ejecuta `docker compose down`.

## Configuracion

La conexion STOMP se configura con variables de entorno. Los valores predeterminados son para una demostracion local; no los uses en un servidor expuesto.

| Variable | Predeterminado | Uso |
| --- | --- | --- |
| `RABBITMQ_HOST` | `localhost` | Host del broker STOMP |
| `RABBITMQ_STOMP_PORT` | `61613` | Puerto del plugin STOMP |
| `RABBITMQ_USERNAME` | `chatws` | Usuario local de RabbitMQ |
| `RABBITMQ_PASSWORD` | `chatws-demo` | Clave local de demostracion |
| `RABBITMQ_VIRTUAL_HOST` | `/` | Virtual host de RabbitMQ |

El mismo usuario y clave se comparten con Docker Compose para crear el usuario local del broker y con Spring para el relay. Si cambias estas variables, define los valores antes de iniciar ambos procesos.

## Para entender el flujo

1. SockJS abre `/ws` y establece la conexion del navegador con Spring.
2. STOMP manda el mensaje a `/app/chat.sendMessage`.
3. `ChatController` recibe el mensaje y lo publica en `/topic/public`.
4. `WebSocketConfig` reenvia ese destino por STOMP al broker RabbitMQ.
5. RabbitMQ distribuye el mensaje a todos los clientes suscritos a `/topic/public`.

WebSocket es el transporte; STOMP define los destinos; RabbitMQ es el broker compartido. `spring-boot-starter-amqp` no es necesario para este relay porque la aplicacion habla STOMP con RabbitMQ, no AMQP con `RabbitTemplate`.
