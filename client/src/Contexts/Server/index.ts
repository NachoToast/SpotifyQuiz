import { createContext } from 'react';
import { defaultServerContext } from './serverDefaults';

export type { Server, ServerControllers, IServerContext } from './Server';
export * from './serverDefaults';

export const ServerContext = createContext(defaultServerContext);
