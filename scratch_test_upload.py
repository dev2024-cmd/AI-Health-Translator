import urllib.request
import uuid
import json
import time

# 0. Request OTP
req_otp = urllib.request.Request(
    'http://localhost:8000/v1/auth/otp/request',
    data=json.dumps({'phone': '+919876543210'}).encode(),
    headers={'Content-Type': 'application/json'}
)
urllib.request.urlopen(req_otp)

# 1. Login
req2 = urllib.request.Request(
    'http://localhost:8000/v1/auth/otp/verify',
    data=json.dumps({'phone': '+919876543210', 'code': '123456'}).encode(),
    headers={'Content-Type': 'application/json'}
)
res2 = urllib.request.urlopen(req2)
data2 = json.loads(res2.read().decode())
token = data2['access_token']
user_id = data2['user']['id']
print('Authenticated token:', token[:20])

# 2. Upload sample report
boundary = '----WebKitFormBoundary' + uuid.uuid4().hex

with open('prescription-template-sample.jpg', 'rb') as f:
    file_bytes = f.read()

body = bytearray()
def add_field(name, val):
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{val}\r\n'.encode())

add_field('patient_id', 'pat-self')
add_field('source', 'web')
add_field('original_language', 'en')

body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="files"; filename="prescription-sample.jpg"\r\nContent-Type: image/jpeg\r\n\r\n'.encode())
body.extend(file_bytes)
body.extend(b'\r\n')
body.extend(f'--{boundary}--\r\n'.encode())

upload_req = urllib.request.Request(
    'http://localhost:8000/v1/reports',
    data=body,
    headers={
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Authorization': f'Bearer {token}'
    }
)
try:
    upload_res = urllib.request.urlopen(upload_req)
    resp_data = json.loads(upload_res.read().decode())
    print('Upload Response:', resp_data)
except urllib.error.HTTPError as e:
    print('HTTP Error Status:', e.code)
    print('HTTP Error Body:', e.read().decode())
    raise

# Wait 3 seconds for background pipeline processing
time.sleep(3)

# Check reports
req4 = urllib.request.Request(
    'http://localhost:8000/v1/reports',
    headers={'Authorization': f'Bearer {token}'}
)
res4 = urllib.request.urlopen(req4)
reports = json.loads(res4.read().decode())
print('Fetched Reports Count:', len(reports))
if reports:
    r = reports[0]
    print('Report Title:', r.get('test_title'))
    print('Status:', r.get('status'))
    print('Extracted Values:', len(r.get('extracted_values', [])))
    print('Explanations count:', len(r.get('explanations', [])))
