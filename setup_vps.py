import paramiko
import time
import sys

host = "72.61.209.78"
user = "root"
password = "n0Idxo4x4Y:mkybr"
local_file = "backup.gz"
remote_file = "/root/backup.gz"

try:
    print("Connecting to SSH...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=user, password=password, timeout=10)
    
    print("Uploading backup.gz...")
    sftp = ssh.open_sftp()
    sftp.put(local_file, remote_file)
    sftp.close()
    
    print("File uploaded. Running setup script (this might take a few minutes)...")
    
    script = """
apt-get update && apt-get install -y mysql-server
systemctl start mysql
systemctl enable mysql
mysql -e "CREATE DATABASE IF NOT EXISTS dasi_connect;"
mysql -e "CREATE USER IF NOT EXISTS 'dasi_user'@'localhost' IDENTIFIED BY 'DaikinSecure2026!';"
mysql -e "GRANT ALL PRIVILEGES ON dasi_connect.* TO 'dasi_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
gunzip -c /root/backup.gz | mysql dasi_connect
sed -i 's|^DATABASE_URL=.*|DATABASE_URL="mysql://dasi_user:DaikinSecure2026!@localhost:3306/dasi_connect"|' /root/Daikin-Connect/.env
cd /root/Daikin-Connect
npm i
pm2 stop all
rm -rf .next
npm run build
pm2 start all
    """
    
    stdin, stdout, stderr = ssh.exec_command(script, get_pty=True)
    for line in iter(stdout.readline, ""):
        print(line, end="")
        
    ssh.close()
    print("All done successfully!")
except Exception as e:
    print(f"Error: {e}")
