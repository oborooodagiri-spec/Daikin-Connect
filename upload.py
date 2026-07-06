import urllib.request
import urllib.parse
import json
import os

url = "https://litterbox.catbox.moe/resources/internals/api.php"
file_path = "backup.gz"

with open(file_path, "rb") as f:
    file_data = f.read()

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="reqtype"\r\n\r\n'
    f'fileupload\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="time"\r\n\r\n'
    f'12h\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="fileToUpload"; filename="backup.gz"\r\n'
    f'Content-Type: application/gzip\r\n\r\n'
).encode('utf-8') + file_data + f'\r\n--{boundary}--\r\n'.encode('utf-8')

req = urllib.request.Request(url, data=body)
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

try:
    response = urllib.request.urlopen(req)
    print("Upload success!")
    print("Link: " + response.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
