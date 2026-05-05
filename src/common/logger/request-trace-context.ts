import { AsyncLocalStorage } from "async_hooks";

export interface RequestTraceContext {
  authorizationHeader?: string;
  requestPath?: string;
}

const requestTraceStorage = new AsyncLocalStorage<RequestTraceContext>();

export function runWithRequestTraceContext<T>(
  context: RequestTraceContext,
  callback: () => T,
): T {
  return requestTraceStorage.run(context, callback);
}

export function getCurrentRequestTraceContext(): RequestTraceContext | undefined {
  return requestTraceStorage.getStore();
}

export function getCurrentAuthorizationHeader(): string | undefined {
  const authorizationHeader = getCurrentRequestTraceContext()?.authorizationHeader;
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return undefined;
  }

  const normalizedHeader = authorizationHeader.trim();
  if (!normalizedHeader.toLowerCase().startsWith("bearer ")) {
    return undefined;
  }

  return normalizedHeader;
}

export function getCurrentRequestPath(): string | undefined {
  const requestPath = getCurrentRequestTraceContext()?.requestPath;
  return typeof requestPath === "string" && requestPath.trim() ? requestPath.trim() : undefined;
}
