[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $BaseUrl,
    [Parameter(Mandatory = $true)] [string] $HookToken,
    [Parameter(Mandatory = $true)] [string] $TaskId,
    [Parameter(Mandatory = $true)] [string] $FromAgent,
    [Parameter(Mandatory = $true)] [string] $ToAgent,
    [Parameter(Mandatory = $true)] [string] $TaskType,
    [Parameter(Mandatory = $true)] [string] $Goal,
    [string[]] $Instructions = @(),
    [string] $PluginName,
    [string[]] $ExpectedChecks = @(),
    [string] $ReturnMode,
    [string] $ReturnTarget,
    [string] $ProtocolVersion = 'hook-task-v1',
    [string] $Route = '/hooks/agent',
    [string] $AgentId = 'main',
    [string] $Name = 'HookDispatch',
    [ValidateSet('now','next-heartbeat')] [string] $WakeMode = 'now',
    [bool] $Deliver = $false,
    [ValidateSet('x-openclaw-token','Authorization')] [string] $AuthMode = 'x-openclaw-token'
)

$builderPath = Join-Path $PSScriptRoot 'new-hook-packet.ps1'
$senderPath = Join-Path $PSScriptRoot 'send-hook-packet.ps1'

if (-not (Test-Path $builderPath)) { throw "Missing packet builder: $builderPath" }
if (-not (Test-Path $senderPath)) { throw "Missing hook sender: $senderPath" }

$packetJson = & $builderPath `
    -PacketType task `
    -TaskId $TaskId `
    -FromAgent $FromAgent `
    -ToAgent $ToAgent `
    -TaskType $TaskType `
    -Goal $Goal `
    -Instructions $Instructions `
    -PluginName $PluginName `
    -ExpectedChecks $ExpectedChecks `
    -ReturnMode $ReturnMode `
    -ReturnTarget $ReturnTarget `
    -ProtocolVersion $ProtocolVersion

& $senderPath `
    -BaseUrl $BaseUrl `
    -HookToken $HookToken `
    -PacketJson $packetJson `
    -Route $Route `
    -AgentId $AgentId `
    -Name $Name `
    -WakeMode $WakeMode `
    -Deliver $Deliver `
    -AuthMode $AuthMode
