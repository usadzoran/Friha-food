// Firebase is disabled in favor of Supabase.
export const db = null as any;
export const auth = null as any;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.warn('Firebase is disabled. Use Supabase instead.', error, operationType, path);
}
