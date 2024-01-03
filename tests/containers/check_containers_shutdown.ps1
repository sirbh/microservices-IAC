$url = "http://localhost:8080/state"

# Replace 'your-data' with the data you want to send in the PUT request
$data = @{
    state = 'SHUTDOWN'
}

try {
    # Send a PUT request
    $response = Invoke-RestMethod -Uri $url -Method PUT -Body ($data | ConvertTo-Json) -ContentType "application/json"

    # Display the response
    $response

    Start-Sleep -Seconds 5

}
catch {
    # If an error occurs, display the error details
    Write-Host "Error: $_"
}

# List of container names to check
$containerNamesToCheck = @("knsach-service-1-container", "knsach-gateway-container", "knsach-service-2-container", "knsach-monitor-container", "knsach-rabbitmq-container")

# Get the status of the specified containers
$containers = $containerNamesToCheck | ForEach-Object { docker inspect --format '{{.Name}}:{{.State.Status}}' $_ }

# Check if any container is not in 'Exited' state
$runningContainers = $containers | Where-Object { $_ -notlike '*:exited' }

# If there are running containers, throw an error
if ($runningContainers.Count -gt 0) {
    $errorMessage = "Error: The following containers are still running: $($runningContainers -join ', ')"
    throw $errorMessage
}

# If all containers are stopped, display a success message
Write-Host "All specified containers are stopped."