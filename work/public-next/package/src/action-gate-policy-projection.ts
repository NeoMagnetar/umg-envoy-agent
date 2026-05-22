import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ActionGatePolicyProjection {
  packageVersion: string;
  gateId: string;
  gateVersion: string;
  executionAuthorityExpanded: boolean;
  summary: {
    actionRouteCount: number;
    blockedCategoryCount: number;
    approvalRequiredCount: number;
    previewOnlyCount: number;
    forbiddenCount: number;
  };
  bridgePolicies: {
    desktopBridge: {
      enabledNow: boolean;
      futureActionFamilies: string[];
    };
    phaseBridge: {
      enabledNow: boolean;
      futureActionFamilies: string[];
    };
  };
  routes: Array<{
    actionId: string;
    actionClass: string;
    riskLevel: string;
    allowedExecutionMode: string;
    approvalRequired: boolean;
    allowlistRequired: boolean;
    scopeKind: string;
    scopeTarget: string;
    dryRunRequired: boolean;
    backupRequired: boolean;
    auditRequired: boolean;
    enabledNow: boolean;
    routeVisibleAsMetadata: boolean;
    blockedCategories: string[];
  }>;
  metadataVisibility: {
    blockedRoutesVisibleAsMetadata: boolean;
    approvalNeededVisibleAsMetadata: boolean;
    riskSummariesVisibleAsMetadata: boolean;
    executionEnabled: boolean;
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

export function projectControlledActionGatePolicy(): ActionGatePolicyProjection {
  const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  const gate = JSON.parse(
    fs.readFileSync(
      path.join(packageRoot, 'fixtures', 'action-gates', 'controlled-action-gate-example.json'),
      'utf8',
    ),
  );

  const routes = gate.actionRoutes.map((route: any) => ({
    actionId: route.actionId,
    actionClass: route.actionClass,
    riskLevel: route.riskLevel,
    allowedExecutionMode: route.allowedExecutionMode,
    approvalRequired: route.approvalRequirements.approvalRequired,
    allowlistRequired: route.allowlistRequirements.allowlistRequired,
    scopeKind: route.scopeBoundary.scopeKind,
    scopeTarget: route.scopeBoundary.scopeTarget,
    dryRunRequired: route.previewRequirements.dryRunRequired,
    backupRequired: route.rollbackRequirements.backupRequired,
    auditRequired: route.auditRequirements.auditRequired,
    enabledNow: route.sleeveDeclaredPolicy.enabledNow,
    routeVisibleAsMetadata: route.sleeveDeclaredPolicy.routeVisibleAsMetadata,
    blockedCategories: route.blockedCategories ?? [],
  }));

  return {
    packageVersion: packageJson.version,
    gateId: gate.gateId,
    gateVersion: gate.gateVersion,
    executionAuthorityExpanded: gate.executionAuthorityExpanded,
    summary: {
      actionRouteCount: routes.length,
      blockedCategoryCount: gate.blockedActionCategories.length,
      approvalRequiredCount: routes.filter((x: any) => x.approvalRequired).length,
      previewOnlyCount: routes.filter((x: any) => x.allowedExecutionMode === 'preview_only').length,
      forbiddenCount: routes.filter((x: any) => x.allowedExecutionMode === 'forbidden').length,
    },
    bridgePolicies: gate.bridgePolicies,
    routes,
    metadataVisibility: gate.metadataVisibility,
  };
}
