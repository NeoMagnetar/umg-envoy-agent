import { projectControlledActionGatePolicy } from '../dist/action-gate-policy-projection.js';

const projection = projectControlledActionGatePolicy();

if (projection.executionAuthorityExpanded !== false) throw new Error('executionAuthorityExpanded drift');
if (projection.metadataVisibility.executionEnabled !== false) throw new Error('executionEnabled drift');
if (projection.bridgePolicies.desktopBridge.enabledNow !== false) throw new Error('desktopBridge enabledNow drift');
if (projection.bridgePolicies.phaseBridge.enabledNow !== false) throw new Error('phaseBridge enabledNow drift');
if (!Array.isArray(projection.routes) || projection.routes.length < 3) throw new Error('routes missing');
if (!projection.routes.some((route) => route.allowedExecutionMode === 'preview_only')) throw new Error('preview_only route missing');
if (!projection.routes.some((route) => route.allowedExecutionMode === 'forbidden')) throw new Error('forbidden route missing');
if (!projection.routes.some((route) => route.approvalRequired === true)) throw new Error('approval-required route missing');
if (!projection.routes.every((route) => route.enabledNow === false)) throw new Error('enabledNow drift');
if (!projection.routes.every((route) => route.routeVisibleAsMetadata === true)) throw new Error('routeVisibleAsMetadata drift');

console.log(JSON.stringify({
  ok: true,
  packageVersion: projection.packageVersion,
  gateId: projection.gateId,
  gateVersion: projection.gateVersion,
  executionAuthorityExpanded: projection.executionAuthorityExpanded,
  summary: projection.summary,
  bridgePolicies: projection.bridgePolicies,
  metadataVisibility: projection.metadataVisibility,
  routes: projection.routes,
}, null, 2));
