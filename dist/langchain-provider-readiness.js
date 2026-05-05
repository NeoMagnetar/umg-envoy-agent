function event(payload, event_type, message, data = {}) {
    return {
        event_type,
        timestamp_utc: new Date().toISOString(),
        sleeve_id: payload.sleeve_id ?? "UNKNOWN",
        neostack_id: payload.neostack_id ?? "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
        message,
        data
    };
}
export function checkLangChainProviderReadiness(payload) {
    const provider = payload.provider?.preferred ?? payload.provider?.model?.split(":")[0] ?? "openai";
    const traceEvents = [
        event(payload, "LANGCHAIN_AGENT_PREFLIGHT_STARTED", "LangChain agent preflight started."),
        event(payload, "LANGCHAIN_PROVIDER_SELECTED", "LangChain provider selected.", { provider })
    ];
    if (provider === "mock") {
        traceEvents.push(event(payload, "LANGCHAIN_CREDENTIAL_CHECK_STARTED", "Credential check started for mock provider.", { provider }));
        traceEvents.push(event(payload, "LANGCHAIN_CREDENTIAL_CHECK_SUCCEEDED", "Mock provider does not require credentials.", { provider }));
        return {
            readiness: {
                ok: true,
                provider,
                missing: [],
                canInvokeModel: true
            },
            traceEvents
        };
    }
    traceEvents.push(event(payload, "LANGCHAIN_CREDENTIAL_CHECK_STARTED", "Credential check started for provider.", { provider }));
    if (provider === "openai") {
        const missing = process.env.OPENAI_API_KEY ? [] : ["OPENAI_API_KEY"];
        if (missing.length > 0) {
            traceEvents.push(event(payload, "LANGCHAIN_CREDENTIAL_CHECK_FAILED", "Required model credentials are missing.", { provider, missing }));
            traceEvents.push(event(payload, "LANGCHAIN_AGENT_RUNTIME_UNAVAILABLE", "LangChain agent runtime is unavailable because required model credentials are missing.", { provider, missing }));
            traceEvents.push(event(payload, "LANGCHAIN_AGENT_INVOKE_SKIPPED", "LangChain agent invoke was skipped because provider readiness failed.", { provider, missing }));
            return {
                readiness: {
                    ok: false,
                    provider,
                    missing,
                    reason: "missing_model_credentials",
                    canInvokeModel: false
                },
                traceEvents
            };
        }
        traceEvents.push(event(payload, "LANGCHAIN_CREDENTIAL_CHECK_SUCCEEDED", "Required model credentials are available.", { provider }));
        return {
            readiness: {
                ok: true,
                provider,
                missing: [],
                canInvokeModel: true
            },
            traceEvents
        };
    }
    const missing = ["provider_configuration"];
    traceEvents.push(event(payload, "LANGCHAIN_CREDENTIAL_CHECK_FAILED", "Provider is unavailable because no supported credential/readiness contract exists yet.", { provider, missing }));
    traceEvents.push(event(payload, "LANGCHAIN_AGENT_RUNTIME_UNAVAILABLE", "LangChain agent runtime is unavailable for the selected provider.", { provider, missing }));
    traceEvents.push(event(payload, "LANGCHAIN_AGENT_INVOKE_SKIPPED", "LangChain agent invoke was skipped because provider readiness failed.", { provider, missing }));
    return {
        readiness: {
            ok: false,
            provider,
            missing,
            reason: "unsupported_provider",
            canInvokeModel: false
        },
        traceEvents
    };
}
