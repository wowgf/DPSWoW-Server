import * as CryptoJS from 'crypto-js';


/**
 *  AES 加密函数
 */ 
export function aesEncrypt(data, key, iv) {
  // 将 JSON 对象转换为字符串
  const jsonString = JSON.stringify(data);
  
  // 执行 AES 加密
  const encrypted = CryptoJS.AES.encrypt(
    jsonString,
    CryptoJS.enc.Utf8.parse(key), // 密钥
    {
      iv: CryptoJS.enc.Utf8.parse(iv), // 偏移字符串
      mode: CryptoJS.mode.CBC, // 运算模式
      padding: CryptoJS.pad.Pkcs7 // 填充模式
    }
  );
  
  // 返回 Base64 编码的密文
  return encrypted.toString();
}

// 示例数据
// const dataToEncrypt = {
//   bundle: "com.aichat.aichat.gp",
//   deviceMac: "xxxxx",
//   conversationId: "c0aafcffbe2840e9bc1dbdb0ee4453be",
//   timestamp: 1700474554,
//   nonce: "8Vv7qvb94UOQcdmhQpi5143yprRMXKej",
//   question: "热空气为什么更轻",
//   signature: "cbf97d5fef2469845eca4ed6d639d12530c89345"
// };

// 密钥和偏移字符串
const key = "77ya5aSn6ISa5o+S";
const iv = "5pWw5o2u5p2l5rqQ";

// 加密
// const encryptedOutput = aesEncrypt(dataToEncrypt, key, iv);

// console.log("加密后的输出:", encryptedOutput);