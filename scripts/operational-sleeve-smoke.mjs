import { demoOperationalSleeve, inspectOperationalSleeve, listOperationalSleeves } from '../dist/runtime-spec/operational-sleeve.js';

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

const sleeves = listOperationalSleeves();
ensure(sleeves.length >= 3, 'should list at least three demo sleeves');
ensure(sleeves.some((s) => s.sleeve_id === 'SL.UMG.LIBRARY_RESEARCH_DEMO.v0.1'), 'library sleeve should be listed');
ensure(sleeves.every((s) => s.demo_ready === true), 'all demo sleeves should be demo ready');

const libraryDemo = demoOperationalSleeve({ sleeve_id: 'SL.UMG.LIBRARY_RESEARCH_DEMO.v0.1', query: 'langchain bridge', kind: 'neostack', limit: 3, display_mode: 'developer' });
ensure(libraryDemo.status === 'executed_demo', 'library sleeve should execute metadata demo');
ensure(libraryDemo.mode === 'demo_metadata', 'library sleeve should be metadata demo');
ensure(libraryDemo.tool_plan.metadata_only.includes('resolver.library_search'), 'library sleeve should use resolver.library_search');
ensure(Boolean(libraryDemo.runtime_display), 'library sleeve should include runtime display');
ensure(libraryDemo.execution_boundary.file_contents_read === false, 'library sleeve should not read file contents');

const localReadonlyDemo = demoOperationalSleeve({ sleeve_id: 'SL.UMG.LOCAL_READONLY_WORKSPACE_DEMO.v0.1', root_path: 'C:\\.openclaw\\workspace\\umg-envoy-agent-release-clean', recursive: false, max_depth: 2, max_items: 100, display_mode: 'developer' });
ensure(localReadonlyDemo.status === 'planned_only' || localReadonlyDemo.status === 'blocked', 'local readonly sleeve should be plan-only by default');
ensure(localReadonlyDemo.mode === 'demo_plan_only', 'local readonly sleeve should be demo_plan_only');
ensure(
  (localReadonlyDemo.demo_payload && localReadonlyDemo.demo_payload.scope_hash) ||
  (localReadonlyDemo.approval_checkpoint && localReadonlyDemo.approval_checkpoint.scope_hash) ||
  (localReadonlyDemo.approval_checkpoint && localReadonlyDemo.approval_checkpoint.preflight && localReadonlyDemo.approval_checkpoint.preflight.scope_hash),
  'local readonly sleeve should expose scope hash'
);
ensure(localReadonlyDemo.execution_boundary.statement.includes('No scan') || localReadonlyDemo.execution_boundary.statement.includes('planned only'), 'local readonly sleeve should not auto-scan');

const langchainInspect = inspectOperationalSleeve({ sleeve_id: 'SL.UMG.LANGCHAIN_BRIDGE_DEMO.v0.1', include_molt_map: true, include_ir_matrix: true, display_mode: 'developer' });
ensure(langchainInspect.sleeve_id === 'SL.UMG.LANGCHAIN_BRIDGE_DEMO.v0.1', 'langchain inspect should return sleeve id');
ensure(langchainInspect.active_runtime.selected_neostacks.includes('NS.UMG.LANGCHAIN_BRIDGE.v0.1'), 'langchain inspect should include selected neostack');
ensure(langchainInspect.tool_plan.requested.includes('langchain_bridge'), 'langchain inspect should include langchain_bridge');
ensure(langchainInspect.tool_plan.requested.includes('langchain.agent_mode'), 'langchain inspect should include langchain.agent_mode');

const langchainDemo = demoOperationalSleeve({ sleeve_id: 'SL.UMG.LANGCHAIN_BRIDGE_DEMO.v0.1', query: 'Plan a governed LangChain bridge workflow', display_mode: 'debug' });
ensure(langchainDemo.status === 'planned_only', 'langchain demo should be planned only');
ensure(langchainDemo.mode === 'demo_handoff_only', 'langchain demo should be handoff only');
ensure(Boolean(langchainDemo.handoff), 'langchain demo should generate governed handoff');
ensure(Boolean(langchainDemo.approval_checkpoint), 'langchain demo should generate approval/checkpoint projection');
ensure(Boolean(langchainDemo.runtime_display), 'langchain demo should include runtime display');
ensure(langchainDemo.execution_boundary.langchain_agent_started === false, 'langchain agent must not start');
ensure(langchainDemo.execution_boundary.external_calls_performed === false, 'langchain demo must not perform external calls');

const unknownSleeve = demoOperationalSleeve({ sleeve_id: 'SL.UNKNOWN.DEMO.v0.1' });
ensure(unknownSleeve.status === 'not_found', 'unknown sleeve should be blocked as not found');

console.log(JSON.stringify({ ok: true, sleeves, libraryDemo, localReadonlyDemo, langchainInspect, langchainDemo, unknownSleeve }, null, 2));
