import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const designPath = path.join(packageRoot, 'fixtures', 'native-sleeves', 'umg-phasebridge-observer-native-v1.design.json');
const design = JSON.parse(fs.readFileSync(designPath, 'utf8'));

if (design.designStatus !== 'read_only_observer_design_only') throw new Error('designStatus drift');
if (design.baselineVersion !== packageJson.version) throw new Error('baselineVersion drift');
if (design.hardBoundaries.approvedOnly !== true) throw new Error('approvedOnly drift');
if (design.hardBoundaries.allowlistedOnly !== true) throw new Error('allowlistedOnly drift');
if (design.hardBoundaries.readOnlyOnly !== true) throw new Error('readOnlyOnly drift');
if (design.hardBoundaries.phaseBridgeActionsEnabled !== false) throw new Error('phaseBridgeActionsEnabled drift');
if (design.hardBoundaries.commandExecutionEnabled !== false) throw new Error('commandExecutionEnabled drift');
if (design.hardBoundaries.bridgeMutationEnabled !== false) throw new Error('bridgeMutationEnabled drift');
if (design.hardBoundaries.directSourceEnabled !== false) throw new Error('directSourceEnabled drift');
if (design.hardBoundaries.automaticResponseTakeover !== false) throw new Error('automaticResponseTakeover drift');
if (design.graphIntent.sourceMode !== 'sleeve_native') throw new Error('sourceMode drift');
if (design.graphIntent.routePurity !== 'clean_native') throw new Error('routePurity drift');
if (design.graphIntent.sampleFallbackUsed !== false) throw new Error('sampleFallbackUsed drift');
if (design.graphIntent.legacyPreviewResidueDetected !== false) throw new Error('legacyPreviewResidueDetected drift');
if (!Array.isArray(design.observationModel.allowedReadOnlyRoutes) || design.observationModel.allowedReadOnlyRoutes.length === 0) throw new Error('allowedReadOnlyRoutes missing');
if (!Array.isArray(design.observationModel.blockedVisibleRoutes) || design.observationModel.blockedVisibleRoutes.length === 0) throw new Error('blockedVisibleRoutes missing');
if (!Array.isArray(design.bundleAlignment) || design.bundleAlignment.length < 2) throw new Error('bundleAlignment missing');

console.log(JSON.stringify({
  ok: true,
  packageVersion: packageJson.version,
  sleeveId: design.sleeveId,
  designStatus: design.designStatus,
  allowedReadOnlyRouteCount: design.observationModel.allowedReadOnlyRoutes.length,
  blockedVisibleRouteCount: design.observationModel.blockedVisibleRoutes.length,
  bundleAlignment: design.bundleAlignment,
  sourceMode: design.graphIntent.sourceMode,
  routePurity: design.graphIntent.routePurity,
}, null, 2));
