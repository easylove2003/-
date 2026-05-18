import * as duckdb from '@duckdb/duckdb-wasm';

let dbInstance: duckdb.AsyncDuckDB | null = null;
let connInstance: duckdb.AsyncDuckDBConnection | null = null;
let initPromise: Promise<duckdb.AsyncDuckDBConnection> | null = null;

export async function getDuckDB(): Promise<duckdb.AsyncDuckDBConnection> {
  if (connInstance) return connInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
    );
    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(worker_url);
    dbInstance = db;
    connInstance = await db.connect();
    return connInstance;
  })();
  return initPromise;
}

/** 把任意 JSON 数组注册为 DuckDB 的 table，覆盖已有同名表 */
export async function registerJsonAsTable(tableName: string, rows: any[]): Promise<void> {
  const conn = await getDuckDB();
  if (!rows || rows.length === 0) throw new Error('empty rows');
  // 用 CSV 文本注册（DuckDB-WASM 对 CSV 解析最稳定）
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
  const fileName = `${tableName}.csv`;
  await dbInstance!.registerFileText(fileName, csv);
  await conn.query(`DROP TABLE IF EXISTS ${tableName};`);
  await conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${fileName}', header=true);`);
}

export interface SQLResult {
  columns: string[];
  rows: any[];           // 普通对象数组
  rowCount: number;
  elapsedMs: number;
  error?: string;
}

export async function runSQL(sql: string): Promise<SQLResult> {
  const t0 = performance.now();
  try {
    const conn = await getDuckDB();
    const arrowResult = await conn.query(sql);
    const cols = arrowResult.schema.fields.map((f: any) => f.name);
    const rows = arrowResult.toArray().map((r: any) => {
      const obj: any = {};
      cols.forEach(c => {
        const v = r[c];
        // BigInt 转 Number（避免 JSON.stringify 报错）
        obj[c] = typeof v === 'bigint' ? Number(v) : v;
      });
      return obj;
    });
    return { columns: cols, rows, rowCount: rows.length, elapsedMs: Math.round(performance.now() - t0) };
  } catch (e: any) {
    return { columns: [], rows: [], rowCount: 0, elapsedMs: Math.round(performance.now() - t0), error: e.message || String(e) };
  }
}

/** 快速描述当前 dataset 表的 schema，便于 NL2SQL 把表结构注入 prompt */
export async function describeTable(tableName = 'dataset'): Promise<{field: string, type: string}[]> {
  const conn = await getDuckDB();
  const res = await conn.query(`DESCRIBE ${tableName};`);
  return res.toArray().map((r: any) => ({ field: r.column_name, type: r.column_type }));
}
