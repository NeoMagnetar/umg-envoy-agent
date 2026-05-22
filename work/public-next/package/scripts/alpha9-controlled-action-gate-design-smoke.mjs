import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const designPath = path.join(packageRoot, 'fixtures', 'native-sleeves', 'umg-controlled-action-gate-v1.design.json');
const design = JSON.parse(fs.readFileSync(designPath, 'utf8'));

if (design.designStatus !== 'gate_design_only') throw new Error('designStatus drift');
if (design.baselineVersion !== packageJson.version) throw new Error('baselineVersion drift');
if (design.executionAuthorityExpanded !== false) throw new Error('executionAuthorityExpanded drift');
if (design.hardBoundaries.approvedOnly !== true) throw new Error('approvedOnly drift');
if (design.hardBoundaries.allowlistedOnly !== true) throw new Error('allowlistedOnly drift');
if (design.hardBoundaries.readOnlyOnly !== true) throw new Error('readOnlyOnly drift');
if (design.hardBoundaries.directSourceEnabled !== false) throw new Error('directSourceEnabled drift');
if (design.hardBoundaries.automaticResponseTakeover !== false) throw new Error('automaticResponseTakeover drift');
if (design.hardBoundaries.desktopBridgeActionsEnabled !== false) throw new Error('desktopBridgeActionsEnabled drift');
if (design.hardBoundaries.phaseBridgeActionsEnabled !== false) throw new Error('phaseBridgeActionsEnabled drift');
if (design.hardBoundaries.fileWritesEnabled !== false) throw new Error('fileWritesEnabled drift');
if (design.hardBoundaries.commandExecutionEnabled !== false) throw new Error('commandExecutionEnabled drift');
if (!Array.isArray(design.actionClasses) || design.actionClasses.length < 5) throw new Error('actionClasses missing');
if (!design.blockedCategories.includes('automatic_response_takeover')) throw new Error('blockedCategories drift');
if (design.bridgeSpecificGateConcepts.desktopBridge.enabledNow !== false) throw new Error('desktopBridge enabledNow drift');
if (design.bridgeSpecificGateConcepts.phaseBridge.enabledNow !== false) throw new Error('phaseBridge enabledNow drift');
if (design.metadataVisibility.executionEnabled !== false) throw new Error('metadataVisibility executionEnabled drift');

console.log(JSON.stringify({
  ok: true,
  packageVersion: packageJson.version,
  designId: design.designId,
  actionClassCount: design.actionClasses.length,
  blockedCategoryCount: design.blockedCategories.length,
  desktopBridgeEnabledNow: design.bridgeSpecificGateConcepts.desktopBridge.enabledNow,
  phaseBridgeEnabledNow: design.bridgeSpecificGateConcepts.phaseBridge.enabledNow,
  executionAuthorityExpanded: design.executionAuthorityExpanded,
}, null, 2));
