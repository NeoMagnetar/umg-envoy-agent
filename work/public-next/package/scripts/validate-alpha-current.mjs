import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const version = packageJson.version;

const steps = [
  { name: 'check', cmd: 'npm', args: ['run', 'check'] },
  { name: 'build', cmd: 'npm', args: ['run', 'build'] },
  { name: 'alpha8-real-sleeve-native-graph-fixture-smoke', cmd: 'node', args: ['scripts/alpha8-real-sleeve-native-graph-fixture-smoke.mjs'] },
  { name: 'alpha8-real-sleeve-native-graph-runtime-integration-smoke', cmd: 'node', args: ['scripts/alpha8-real-sleeve-native-graph-runtime-integration-smoke.mjs'] },
  { name: 'alpha8-sleeve-graph-richness-smoke', cmd: 'node', args: ['scripts/alpha8-sleeve-graph-richness-smoke.mjs'] },
  { name: 'alpha8-sleeve-graph-native-route-cleanup-smoke', cmd: 'node', args: ['scripts/alpha8-sleeve-graph-native-route-cleanup-smoke.mjs'] },
  { name: 'alpha8-active-sleeve-session-state-smoke', cmd: 'node', args: ['scripts/alpha8-active-sleeve-session-state-smoke.mjs'] },
  { name: 'alpha8-bounded-read-only-orchestration-smoke', cmd: 'node', args: ['scripts/alpha8-bounded-read-only-orchestration-smoke.mjs'] },
  { name: 'alpha7-runtime-execution-chain-e2e-approved-read-only-smoke', cmd: 'node', args: ['scripts/alpha7-runtime-execution-chain-e2e-approved-read-only-smoke.mjs'] },
  { name: 'alpha6-working-runtime-path-smoke', cmd: 'node', args: ['scripts/alpha6-working-runtime-path-smoke.mjs'] },
  { name: 'alpha6-response-envelope-active-stack-recursion-fix-smoke', cmd: 'node', args: ['scripts/alpha6-response-envelope-active-stack-recursion-fix-smoke.mjs'] }
];

console.log(`[validate:alpha-current] package=${packageJson.name} version=${version}`);

for (const step of steps) {
  console.log(`\n==> ${step.name}`);
  const result = spawnSync(step.cmd, step.args, {
    cwd: packageRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    console.error(`\n[validate:alpha-current] FAILED at step: ${step.name}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\n[validate:alpha-current] PASS version=${version}`);
