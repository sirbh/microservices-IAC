# Specify the list of your Docker container names
$containerNames = @("knsach-service-1-container", "knsach-service-2-container","knsach-monitor-container","knsach-rabbitmq-container","knsach-gateway-container")

$allContainersRunning = $true

foreach ($containerName in $containerNames) {
    # Check if the container is running
    $isRunning = docker inspect --format "{{.State.Running}}" $containerName

    if ($isRunning -ne "true") {
        Write-Host "Container $containerName is not running."
        $allContainersRunning = $false
    }
}

if (-not $allContainersRunning) {
    Write-Host "Not all containers are running. Task failed."
    exit 1
} else {
    Write-Host "All containers are running."
    exit 0
}
