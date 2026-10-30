import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = process.cwd();
const output = mkdtempSync(path.join(tmpdir(), 'iposcore-official-verification-'));
const config = path.join(output, 'tsconfig.json');
writeFileSync(config, JSON.stringify({
  extends: path.join(root, 'tsconfig.json'),
  compilerOptions: { noEmit: false, incremental: false, module: 'commonjs', moduleResolution: 'node',
    target: 'ES2022', rootDir: root, outDir: output, resolveJsonModule: true,
    typeRoots: [path.join(root, 'node_modules', '@types')], types: ['node'] },
  include: [path.join(root, 'scripts', 'verify-official.ts'), path.join(root, 'next-env.d.ts')], exclude: [path.join(root, 'node_modules')],
}, null, 2));
const compiled = spawnSync(process.execPath, [path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '--project', config], { cwd: root, stdio: 'inherit' });
if (compiled.status !== 0) process.exit(compiled.status || 1);

// Rewrite only generated CommonJS aliases, never source files or repository imports.
function resolveCompiledAliases(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) resolveCompiledAliases(file);
    else if (entry.name.endsWith('.js')) {
      const source = readFileSync(file, 'utf8');
      const rewritten = source.replace(/require\((["'])@\/([^"']+)\1\)/g, (_match, _quote, relative) => {
        const target = path.resolve(output, 'src', relative);
        if (!target.startsWith(`${path.resolve(output, 'src')}${path.sep}`)) throw new Error('Compiled alias escaped the temporary source directory.');
        return `require(${JSON.stringify(target)})`;
      });
      if (rewritten !== source) writeFileSync(file, rewritten);
    }
  }
}
resolveCompiledAliases(output);
const result = spawnSync(process.execPath, [path.join(output, 'scripts', 'verify-official.js'), ...process.argv.slice(2)], {
  cwd: root, stdio: 'inherit',
  env: { ...process.env, NODE_PATH: [path.join(root, 'node_modules'), process.env.NODE_PATH].filter(Boolean).join(path.delimiter) },
});
process.exit(result.status ?? 1);
