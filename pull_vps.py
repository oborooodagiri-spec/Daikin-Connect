import paramiko
import sys

host = "72.61.209.78"
user = "root"
password = "n0Idxo4x4Y:mkybr"

try:
    print("Connecting to SSH...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=user, password=password, timeout=10)
    
    print("Running pull and build script...")
    
    script = """
cd /root/Daikin-Connect
git pull origin main
pm2 stop all
rm -rf .next
npm run build
pm2 start all
    """
    
    stdin, stdout, stderr = ssh.exec_command(script, get_pty=True)
    for line in iter(stdout.readline, ""):
        print(line, end="")
        
    ssh.close()
    print("Server updated successfully!")
except Exception as e:
    print(f"Error: {e}")
