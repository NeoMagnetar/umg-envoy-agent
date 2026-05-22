import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
export function projectControlledActionGatePolicy() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    const gate = JSON.parse(fs.readFileSync(path.join(packageRoot, 'fixtures', 'action-gates', 'controlled-action-gate-example.json'), 'utf8'));
    const routes = gate.actionRoutes.map((route) => ({
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
            approvalRequiredCount: routes.filter((x) => x.approvalRequired).length,
            previewOnlyCount: routes.filter((x) => x.allowedExecutionMode === 'preview_only').length,
            forbiddenCount: routes.filter((x) => x.allowedExecutionMode === 'forbidden').length,
        },
        bridgePolicies: gate.bridgePolicies,
        routes,
        metadataVisibility: gate.metadataVisibility,
    };
}
