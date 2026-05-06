import { buildUMGEnvoyAlphaDemo } from '../dist/runtime-spec/alpha-demo.js';
import { renderUMGRuntimeDisplay } from '../dist/runtime-spec/runtime-display.js';

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

const demo = buildUMGEnvoyAlphaDemo({ query: 'langchain bridge', kind: 'neostack', limit: 3, display_mode: 'compact', include_display: true });
ensure(demo.library.status_available === true, 'alpha demo should include library status');
ensure(demo.search_sample.limit <= 10, 'alpha demo search sample should be bounded');
ensure(demo.capabilities.metadata_alpha_targets.includes('resolver.library_search'), 'alpha demo should include metadata alpha targets');
ensure(demo.capabilities.local_readonly_surfaces.includes('umg_envoy_local_readonly_plan'), 'alpha demo should include local readonly plan surface');
ensure(demo.capabilities.blocked_capabilities.includes('automatic local scan'), 'alpha demo should list blocked capabilities');
ensure(Boolean(demo.display), 'alpha demo should include runtime display');
ensure(renderUMGRuntimeDisplay(demo.display).includes('Active Runtime:'), 'runtime display should include active runtime section');
ensure(renderUMGRuntimeDisplay(demo.display).includes('MOLT Map:'), 'runtime display should include MOLT Map or honest state');
ensure(renderUMGRuntimeDisplay(demo.display).includes('IR Matrix:'), 'runtime display should include IR Matrix section');
ensure(demo.execution_boundary.file_contents_read === false, 'alpha demo should not read file contents');
ensure(demo.execution_boundary.write_performed === false, 'alpha demo should not write');
ensure(demo.execution_boundary.delete_performed === false, 'alpha demo should not delete');
ensure(demo.execution_boundary.shell_command_executed === false, 'alpha demo should not run shell');
ensure(demo.execution_boundary.external_calls_performed === false, 'alpha demo should not make external calls');
ensure(demo.local_readonly.automatic_scan_performed === false, 'alpha demo should not perform automatic local scan');

console.log(JSON.stringify({ ok: true, demo, rendered: renderUMGRuntimeDisplay(demo.display) }, null, 2));
