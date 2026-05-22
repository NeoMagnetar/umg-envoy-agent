import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const schemaPath = path.join(packageRoot, 'schemas', 'umg-controlled-action-gate.schema.json');
const fixturePath = path.join(packageRoot, 'fixtures', 'action-gates', 'controlled-action-gate-example.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

if (schema.$id !== 'umg.controlled_action_gate.v1') throw new Error('schema $id drift');
if (fixture.gateVersion !== 'umg.controlled_action_gate.v1') throw new Error('fixture gateVersion drift');
if (fixture.baselineVersion !== packageJson.version) throw new Error('fixture baselineVersion drift');
if (fixture.executionAuthorityExpanded !== false) throw new Error('executionAuthorityExpanded drift');
if (!Array.isArray(fixture.actionRoutes) || fixture.actionRoutes.length < 3) throw new Error('actionRoutes missing');
if (!fixture.blockedActionCategories.includes('direct_source_enablement')) throw new Error('blockedActionCategories drift');
if (fixture.bridgePolicies.desktopBridge.enabledNow !== false) throw new Error('desktopBridge enabledNow drift');
if (fixture.bridgePolicies.phaseBridge.enabledNow !== false) throw new Error('phaseBridge enabledNow drift');
if (fixture.metadataVisibility.executionEnabled !== false) throw new Error('metadataVisibility executionEnabled drift');

for (const route of fixture.actionRoutes) {
  if (!route.actionId) throw new Error('actionId missing');
  if (!route.actionClass) throw new Error(`${route.actionId}: actionClass missing`);
  if (!route.riskLevel) throw new Error(`${route.actionId}: riskLevel missing`);
  if (!route.allowedExecutionMode) throw new Error(`${route.actionId}: allowedExecutionMode missing`);
  if (route.sleeveDeclaredPolicy.enabledNow !== false) throw new Error(`${route.actionId}: enabledNow drift`);
}

console.log(JSON.stringify({
  ok: true,
  packageVersion: packageJson.version,
  schemaId: schema.$id,
  gateId: fixture.gateId,
  actionRouteCount: fixture.actionRoutes.length,
  blockedCategoryCount: fixture.blockedActionCategories.length,
  desktopBridgeEnabledNow: fixture.bridgePolicies.desktopBridge.enabledNow,
  phaseBridgeEnabledNow: fixture.bridgePolicies.phaseBridge.enabledNow,
  executionAuthorityExpanded: fixture.executionAuthorityExpanded
}, null, 2));
