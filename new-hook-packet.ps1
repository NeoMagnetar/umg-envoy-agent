[CmdletBinding(DefaultParameterSetName = 'task')]
param(
    [Parameter(Mandatory = $true)] [ValidateSet('task','result','ack','error')] [string] $PacketType,
    [Parameter(Mandatory = $true)] [string] $TaskId,
    [Parameter(Mandatory = $true)] [string] $FromAgent,
    [Parameter(Mandatory = $true)] [string] $ToAgent,
    [string] $ProtocolVersion = 'hook-task-v1',

    [string] $TaskType,
    [string] $Goal,
    [string[]] $Instructions = @(),
    [string] $PluginName,
    [string[]] $ExpectedChecks = @(),
    [string] $ReturnMode,
    [string] $ReturnTarget,

    [string] $Status,
    [string] $Summary,
    [string[]] $Findings = @(),
    [string[]] $Errors = @(),
    [string[]] $Warnings = @(),
    [string[]] $Artifacts = @(),
    [string] $NextRecommendedAction
)

$packet = [ordered]@{
    protocol_version = $ProtocolVersion
    packet_type      = $PacketType
    task_id          = $TaskId
    from_agent       = $FromAgent
    to_agent         = $ToAgent
    sent_at          = (Get-Date).ToUniversalTime().ToString('o')
}

switch ($PacketType) {
    'task' {
        if (-not $TaskType) { throw 'TaskType is required for packet_type=task' }
        if (-not $Goal) { throw 'Goal is required for packet_type=task' }
        $packet.task_type = $TaskType
        $packet.goal = $Goal
        $packet.instructions = @($Instructions)
        $context = [ordered]@{}
        if ($PluginName) { $context.plugin_name = $PluginName }
        if ($ExpectedChecks.Count -gt 0) { $context.expected_checks = @($ExpectedChecks) }
        if ($context.Count -gt 0) { $packet.context = $context }
        if ($ReturnMode) { $packet.return_mode = $ReturnMode }
        if ($ReturnTarget) { $packet.return_target = $ReturnTarget }
    }
    'result' {
        if (-not $Status) { throw 'Status is required for packet_type=result' }
        if (-not $Summary) { throw 'Summary is required for packet_type=result' }
        $packet.status = $Status
        $packet.summary = $Summary
        $packet.findings = @($Findings)
        $packet.errors = @($Errors)
        $packet.warnings = @($Warnings)
        $packet.artifacts = @($Artifacts)
        if ($NextRecommendedAction) { $packet.next_recommended_action = $NextRecommendedAction }
    }
    'ack' {
        if (-not $Status) { $Status = 'accepted' }
        if (-not $Summary) { throw 'Summary is required for packet_type=ack' }
        $packet.status = $Status
        $packet.summary = $Summary
    }
    'error' {
        if (-not $Status) { $Status = 'failed' }
        if (-not $Summary) { throw 'Summary is required for packet_type=error' }
        $packet.status = $Status
        $packet.summary = $Summary
        $packet.errors = @($Errors)
        if ($NextRecommendedAction) { $packet.next_recommended_action = $NextRecommendedAction }
    }
}

$packet | ConvertTo-Json -Depth 20
