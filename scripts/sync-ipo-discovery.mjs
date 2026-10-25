import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = process.cwd();
const output = mkdtempSync(path.join(tmpdir(), 'iposcore-discovery-'));
const compile = spawnSync(process.execPath, [path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'),
  '--target', 'ES2022', '--module', 'commonjs', '--moduleResolution', 'node', '--rootDir', root,
  '--outDir', output, '--esModuleInterop', '--skipLibCheck', path.join(root, 'scripts', 'sync-ipo-discovery.ts')],
{ cwd: root, stdio: 'inherit' });
if (compile.status !== 0) process.exit(compile.status || 1);
const result = spawnSync(process.execPath, [path.join(output, 'scripts', 'sync-ipo-discovery.js'), ...process.argv.slice(2)],
  { cwd: root, stdio: 'inherit', env: { ...process.env, NODE_PATH: path.join(root, 'node_modules') } });
process.exit(result.status ?? 1);
