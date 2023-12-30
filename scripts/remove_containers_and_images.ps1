# Stop and remove all running containers
docker ps -q | ForEach-Object { docker stop $_ }
docker ps -a -q | ForEach-Object { docker rm $_ }

# Remove all images
docker images -q | ForEach-Object { docker rmi $_ }
