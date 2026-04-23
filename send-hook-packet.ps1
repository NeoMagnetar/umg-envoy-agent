[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $BaseUrl,
    [Parameter(Mandatory = $true)] [string] $HookToken,
    [Parameter(Mandatory = $true)] [string] $PacketJson,
    [string] $Route = '/hooks/agent',
    [string] $AgentId = 'main',
    [string] $Name = 'HookDispatch',
    [ValidateSet('now','next-heartbeat')] [string] $WakeMode = 'now',
    [bool] $Deliver = $false,
    [ValidateSet('x-openclaw-token','Authorization')] [string] $AuthMode = 'x-openclaw-token'
)

$normalizedBase = $BaseUrl.TrimEnd('/')
$normalizedRoute = if ($Route.StartsWith('/')) { $Route } else { '/' + $Route }
$uri = "$normalizedBase$normalizedRoute"

try {
    $packetObject = $PacketJson | ConvertFrom-Json
} catch {
    throw "PacketJson is not valid JSON: $($_.Exception.Message)"
}

$minifiedPacketJson = $packetObject | ConvertTo-Json -Depth 20 -Compress
$outerBodyObject = [ordered]@{
    message  = $minifiedPacketJson
    name     = $Name
    agentId  = $AgentId
    wakeMode = $WakeMode
    deliver  = $Deliver
}
$outerBodyJson = $outerBodyObject | ConvertTo-Json -Depth 10

$headers = @{}
switch ($AuthMode) {
    'x-openclaw-token' { $headers['x-openclaw-token'] = $HookToken }
    'Authorization'    { $headers['Authorization'] = "Bearer $HookToken" }
}

$response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -ContentType 'application/json' -Body $outerBodyJson
$response | ConvertTo-Json -Depth 10
