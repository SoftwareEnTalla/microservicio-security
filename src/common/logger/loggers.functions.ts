import { performance } from "perf_hooks";
import {
  HttpLoggerApiRest,
  ILoggerClient,
  LogContext,
  LogExecutionTimeOptions,
} from "src/interfaces/log-context";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@core/logs/logger";
import { KafkaLoggerClient } from "./kafka-logger.client";
import { HttpLoggerClient } from "./http-logger.client";

function getEnhancedContext(): LogContext {
  const error = new Error();
  const stack = error.stack?.split("\n") || [];

  if (stack.length > 2) {
    const match = stack[2].match(
      /at (?:(.+?)\.)?([^\.]+?) \(?(.+?):(\d+):\d+\)?/
    );
    if (match) {
      return {
        className: match[1] || "Global",
        functionName: match[2],
        filePath: match[3],
        lineNumber: parseInt(match[4]),
      };
    }
  }

  return { className: "Global", functionName: "anonymous" };
}

export function getRemoteApiLoggerUrl(): string {
  let createUrl: string = process.env.LOG_API_BASE_URL || "https://logs.api";
  createUrl += process.env.LOG_API_SCOPE
    ? `/${process.env.LOG_API_SCOPE}`
    : "/codetrace";
  createUrl += process.env.LOG_API_CREATE_ACTION
    ? `/${process.env.LOG_API_CREATE_ACTION}`
    : "/command";
  return createUrl;
}
export function LogExecutionTime(options: LogExecutionTimeOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const enabled =
      process.env.LOG_EXECUTION_TIME === "true" &&
      process.env.LOG_READY === "true";

    if (!enabled) return descriptor; // si no está habilitado

    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const uuid = uuidv4();
      const start = performance.now();
      const startTime = new Date().toISOString();
      const context = getEnhancedContext();

      const {
        layer = "default",
        refuuid,
        timeFormat = "ms",
        client, // ILoggerClient obligatorio
        callback, // Opcional
      } = options;

      logger.log(
        `[${layer}] [${target.constructor.name}.${propertyKey}] [${uuid}] Inicio ejecución` // Incluye el nombre de la clase
      );

      try {
        const result = await originalMethod.apply(this, args);

        const end = performance.now();
        const durationMs = end - start;
        const duration = calculateDuration(durationMs, timeFormat);

        logger.log(
          `[${layer}] [${target.constructor.name}.${propertyKey}] [${uuid}] Ejecución completada (${duration}${timeFormat})`
        );

        const logData: HttpLoggerApiRest = {
          endpoint: getRemoteApiLoggerUrl(),
          method: "POST",
          headers: process.env.LOG_API_AUTH_TOKEN
            ? { Authorization: `Bearer ${process.env.LOG_API_AUTH_TOKEN}` }
            : undefined,
          body: {
            layer,
            uuid,
            refuuid,
            className: target.constructor.name,
            functionName: `${target.constructor.name}.${propertyKey}`, // Nombre de la clase y método
            startTime,
            endTime: new Date().toISOString(),
            duration: durationMs,
            durationUnit: timeFormat,
            status: "success",
          },
        };

        await handleLogDelivery(client, logData, callback);

        return result;
      } catch (error: any) {
        const end = performance.now();
        const durationMs = end - start;
        const duration = calculateDuration(durationMs, timeFormat);

        logger.error(
          `[${layer}] [${target.constructor.name}.${propertyKey}] [${uuid}] Error en ejecución (${duration}${timeFormat}): ${error.message}`,
          error.stack
        );

        const errorLogData: HttpLoggerApiRest = {
          endpoint: getRemoteApiLoggerUrl(),
          method: "POST",
          headers: process.env.LOG_API_AUTH_TOKEN
            ? { Authorization: `Bearer ${process.env.LOG_API_AUTH_TOKEN}` }
            : undefined,
          body: {
            layer,
            uuid,
            refuuid,
            className: target.constructor.name,
            functionName: `${target.constructor.name}.${propertyKey}`, // Nombre de la clase y método
            startTime,
            endTime: new Date().toISOString(),
            duration: durationMs,
            durationUnit: timeFormat,
            status: "error",
            error: {
              message: error.message,
              stack: error.stack,
            },
          },
        };

        await handleLogDelivery(client, errorLogData, callback);

        throw error;
      }
    };

    return descriptor;
  };
}

// Función para obtener información del archivo y línea
function getFileInfo(): [string, number] {
  const stack = new Error().stack;
  if (!stack) return ["No se pudo obtener información del archivo", -1];

  const stackLines = stack.split("\n");

  // Buscamos la línea que contiene el nombre del método decorado
  const methodCallIndex = 2; // Ajusta este índice según la posición en la pila
  const match = stackLines[methodCallIndex]?.match(/\s*at\s+(.*?):(\d+):\d+/); // Captura el archivo y la línea

  if (match) {
    const filePath = match[1]; // Nombre del archivo
    const lineNumber = parseInt(match[2], 10); // Número de línea
    return [filePath, lineNumber];
  }

  return ["No se pudo obtener información del archivo", -1];
}
// Función auxiliar para manejar el envío de logs.
//
// Modos controlados por LOG_DELIVERY_MODE (case-insensitive):
//   KAFKA  (default) → Productor Kafka al tópico codetrace-execution-trace.
//                      Si Kafka no está disponible, hace fallback a REST.
//   EVENT            → Alias de KAFKA (compatibilidad hacia atrás).
//   REST             → Solo HTTP POST al endpoint de codetrace
//                      (LOG_API_BASE_URL + /codetraces/command).
//
// En cualquier modo, si LOG_API_BASE_URL está configurada el fallback REST
// utiliza un HttpLoggerClient interno (lazy singleton) sin necesidad de pasar
// `client` al decorator @LogExecutionTime.

let restClientSingleton: HttpLoggerClient | null = null;
let restClientUnavailable = false;
function getDefaultRestClient(): HttpLoggerClient | null {
  if (restClientUnavailable) return null;
  if (restClientSingleton) return restClientSingleton;
  const baseUrl = process.env.LOG_API_BASE_URL;
  if (!baseUrl) {
    restClientUnavailable = true;
    return null;
  }
  try {
    restClientSingleton = new HttpLoggerClient(
      baseUrl,
      process.env.LOG_API_STRICT_SSL !== "false",
    );
    return restClientSingleton;
  } catch (err: any) {
    logger.warn(
      `No se pudo inicializar HttpLoggerClient (${baseUrl}): ${err.message}`,
    );
    restClientUnavailable = true;
    return null;
  }
}

function buildRestLogData(logData: HttpLoggerApiRest, viaLabel: string): HttpLoggerApiRest {
  const serviceName = process.env.APP_NAME || "unknown-service";
  return {
    ...logData,
    headers: {
      ...(logData.headers || {}),
      "X-Trace-Source": serviceName,
    },
    body: {
      name: `[${serviceName}] ${logData.body.functionName || "unknown"}`.substring(0, 100),
      description: JSON.stringify({
        ...logData.body,
        sourceService: serviceName,
        deliveredVia: viaLabel,
      }),
      createdBy: serviceName,
      isActive: true,
    } as any,
  };
}

async function tryKafka(logData: HttpLoggerApiRest): Promise<boolean> {
  const kafkaClient = KafkaLoggerClient.getInstance();
  try {
    const connected = await kafkaClient.connect();
    if (!connected) return false;
    return await kafkaClient.send(logData);
  } catch (err: any) {
    logger.warn(`Kafka delivery falló: ${err.message}`);
    return false;
  }
}

async function tryRest(
  logData: HttpLoggerApiRest,
  viaLabel: string,
  client: ILoggerClient | undefined,
  callback:
    | ((data: HttpLoggerApiRest, client: ILoggerClient) => Promise<boolean>)
    | undefined,
): Promise<boolean> {
  const restLogData = buildRestLogData(logData, viaLabel);
  const effectiveClient: ILoggerClient | null = client || getDefaultRestClient();
  if (!effectiveClient) {
    logger.warn(
      "REST delivery no disponible: ni client ni LOG_API_BASE_URL configurados",
    );
    return false;
  }

  try {
    if (!effectiveClient.isConnected) {
      await effectiveClient.connect();
    }
    if (callback && client) {
      const success = await callback(restLogData, client);
      if (!success) {
        logger.warn("Callback REST devolvió false");
      }
      return !!success;
    }
    return await effectiveClient.send(restLogData);
  } catch (err: any) {
    logger.error(`Error en envío REST: ${err.message}`);
    return false;
  }
}

async function handleLogDelivery(
  client: ILoggerClient | undefined,
  logData: HttpLoggerApiRest,
  callback:
    | ((data: HttpLoggerApiRest, client: ILoggerClient) => Promise<boolean>)
    | undefined,
) {
  const mode = (process.env.LOG_DELIVERY_MODE || "KAFKA").toUpperCase();
  const restOnly = mode === "REST";

  if (!restOnly) {
    // Modo KAFKA / EVENT (default): intentar Kafka primero
    const kafkaOk = await tryKafka(logData);
    if (kafkaOk) return;
    logger.warn(
      "Kafka no entregó la traza, usando REST como fallback",
    );
    await tryRest(logData, "rest-fallback", client, callback);
    return;
  }

  // Modo REST explícito
  await tryRest(logData, "rest", client, callback);
}

function calculateDuration(
  durationMs: number,
  format: "s" | "ms" | "m"
): number {
  switch (format) {
    case "s":
      return parseFloat((durationMs / 1000).toFixed(3));
    case "m":
      return parseFloat((durationMs / 60000).toFixed(3));
    case "ms":
    default:
      return parseFloat(durationMs.toFixed(3));
  }
}

// Versión para funciones independientes (no métodos de clase)
export function withLogging<T extends (...args: any[]) => any>(
  fn: T,
  contextName = "Global"
): T {
  const functionName = fn.name || "anonymous";

  return async function (...args: Parameters<T>) {
    const start = performance.now();

    logger.log(`[${functionName}] Inicio ejecución`);

    try {
      const result = await fn(...args);

      const end = performance.now();
      const duration = (end - start).toFixed(3);

      logger.log(`[${functionName}] Ejecución completada (${duration} ms)`);

      return result;
    } catch (error: any | unknown) {
      const end = performance.now();
      const duration = (end - start).toFixed(3);
      logger.error(
        `[${functionName}] Error en ejecución (${duration} ms): ${error.message}`,
        error.stack
      );
      throw error;
    }
  } as T;
}

/**
 * Decorador para trazar llamadas a funciones/métodos
 * Registra el archivo y línea donde se invoca la función
 */
export function FunctionTrace(contextName?: string): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const enabled =
      process.env.LOG_EXECUTION_TIME === "true" &&
      process.env.LOG_READY === "true";
    // Guard clause para propiedades (no métodos)
    if (!descriptor || !descriptor.value || !enabled) {
      return;
    }

    const originalMethod = descriptor.value;
    const className = target.constructor?.name || "AnonymousClass";
    const methodName = String(propertyKey);

    descriptor.value = function (...args: any[]) {
      const [filePath, lineNumber] = getCallerInfo();
      const traceId = generateShortId();

      logger.debug(
        `[TRACE] ${className}.${methodName} called from ${filePath}:${lineNumber} (ID: ${traceId})`
      );

      try {
        const result = originalMethod.apply(this, args);

        // Manejar promesas para métodos async
        if (result instanceof Promise) {
          return result
            .then((res) => {
              logger.debug(
                `[TRACE] ${className}.${methodName} completed (ID: ${traceId})`
              );
              return res;
            })
            .catch((error) => {
              logger.error(
                `[TRACE] ${className}.${methodName} failed from ${filePath}:${lineNumber} (ID: ${traceId}): ${error.message}`
              );
              throw error;
            });
        }

        logger.debug(
          `[TRACE] ${className}.${methodName} completed (ID: ${traceId})`
        );
        return result;
      } catch (error: any) {
        logger.error(
          `[TRACE] ${className}.${methodName} failed from ${filePath}:${lineNumber} (ID: ${traceId}): ${error.message}`
        );
        throw error;
      }
    };

    return descriptor;
  };
}

// Función auxiliar para obtener información del llamador
function getCallerInfo(): [string, number] {
  const stack = new Error().stack?.split("\n") || [];

  // El índice 3 es donde está el llamador real (ajustar según necesidad)
  const callerLine = stack[3] || "";

  const match =
    callerLine.match(/\(?(.+):(\d+):\d+\)?/) ||
    callerLine.match(/\s+at\s+(.+):(\d+):\d+/);

  if (match) {
    return [match[1], parseInt(match[2])];
  }

  return ["unknown", 0];
}

// Genera un ID corto para trazar la llamada
function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8);
}
// Versión para funciones independientes
function traceFunction(fn: Function, contextName?: string) {
  const functionName = fn.name || "anonymous";

  return function (...args: any[]) {
    const [filePath, lineNumber] = getCallerInfo();
    const traceId = generateShortId();

    logger.debug(
      `[TRACE] ${functionName} called from ${filePath}:${lineNumber} (ID: ${traceId}) on contextName=[${contextName}]`
    );

    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result
          .then((res) => {
            logger.debug(`[TRACE] ${functionName} completed (ID: ${traceId})`);
            return res;
          })
          .catch((error) => {
            logger.error(
              `[TRACE] ${functionName} failed from ${filePath}:${lineNumber} (ID: ${traceId}): ${error.message}`
            );
            throw error;
          });
      }

      logger.debug(`[TRACE] ${functionName} completed (ID: ${traceId})`);
      return result;
    } catch (error: any) {
      logger.error(
        `[TRACE] ${functionName} failed from ${filePath}:${lineNumber} (ID: ${traceId}): ${error.message}`
      );
      throw error;
    }
  };
}
