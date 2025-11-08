// 文件路径: ./node-functions/upload.js
// 访问路径: example.com/upload

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3配置
const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: 'https://ny-1s.enzonix.com',
  credentials: {
    accessKeyId: '1812kP8lxiNOA5',
    secretAccessKey: 'HoephXxSaQZ47UrBHXo63bNJKM4jyldOebaHmDe6'
  },
  forcePathStyle: true
});

export async function onRequestGet() {
  return new Response(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>文件上传</title>
</head>
<body>
  <input type="file" id="f">
  <div id="s"></div>
  <script>
    f.onchange = async () => {
      s.textContent = '上传中...';
      const fd = new FormData();
      fd.append('file', f.files[0]);
      try {
        const r = await fetch('', { method: 'POST', body: fd });
        s.textContent = await r.text();
      } catch (e) {
        s.textContent = '错误: ' + e.message;
      }
    };
  </script>
</body>
</html>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const file = formData.get('file');
    
    if (!file || file.size === 0) {
      return new Response('未选择文件', { status: 400 });
    }
    
    // 获取客户端IP
    const ip = context.clientIp || 'unknown';
    
    // 生成新文件名: 原文件名_时间戳_IP
    const timestamp = Date.now();
    const originalName = file.name;
    const dotIndex = originalName.lastIndexOf('.');
    const baseName = dotIndex > 0 ? originalName.substring(0, dotIndex) : originalName;
    const extension = dotIndex > 0 ? originalName.substring(dotIndex) : '';
    const newFileName = `${baseName}_${timestamp}_${ip.replace(/\D/g, '')}${extension}`;
    
    // 读取文件内容
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // 上传到S3
    const command = new PutObjectCommand({
      Bucket: 'bucket-1812-2434',
      Key: `UnknownUpload/${newFileName}`,
      Body: fileBuffer,
      ContentType: file.type || 'application/octet-stream'
    });
    
    await s3Client.send(command);
    
    return new Response('上传成功', { status: 200 });
    
  } catch (error) {
    console.error('上传错误:', error);
    return new Response(`上传失败: ${error.message}`, { status: 500 });
  }
}