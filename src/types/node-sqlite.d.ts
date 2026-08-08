declare module "node:sqlite" {
  export class StatementSync {
    all(params?: Record<string, unknown>): unknown[];
    get(params?: Record<string, unknown>): unknown;
    run(params?: Record<string, unknown>): { changes: number; lastInsertRowid: number | bigint };
  }
  export class DatabaseSync {
    constructor(path: string, options?: Record<string, unknown>);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
