$ErrorActionPreference = 'Stop'

# Server config
$server = "vigrsapi.top"
$port = 3022
$username = "root"
$password = "shy2000101"

# SSH commands
$cmd = "cd /opt/duanduantong-core && ls -la && docker --version && docker compose version && docker ps -a && ss -tlnp && ls -la gateway-server/.env 2>/dev/null || echo '.env not found' && ls -la admin-dashboard/dist 2>/dev/null || echo 'dist not found'"

# Create temp batch file with password pipe
$batchPath = "$env:TEMP\ssh_deploy_$PID.bat"
@"
echo $password | ssh -o StrictHostKeyChecking=no -o BatchMode=no -p $port $username@$server '$cmd'
"@ | Out-File -FilePath $batchPath -Encoding ASCII

# Execute
& $batchPath

# Cleanup
Remove-Item $batchPath -Force -ErrorAction SilentlyContinue
