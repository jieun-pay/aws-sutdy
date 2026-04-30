import CryptoJS from 'crypto-js';

export const generateEncData = async (merchantID, ediDate, goodsAmt, merchantKey) => {
  const encoder = new TextEncoder();
  const data = merchantID + ediDate + goodsAmt + merchantKey;
  const encoded = encoder.encode(data);

  // SHA-256 해시 (바이너리)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);

  // 바이너리 -> hex 문자열로 변환
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexString = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hexString;
};

export const getFormattedDate = (date = new Date()) => {
  const now = new Date(date);

  const Y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const H = String(now.getHours()).padStart(2, '0');
  const i = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  return `${Y}${m}${d}${H}${i}${s}`;
};

export const generateEncData2 = () => {
  const MID_KEY = process.env.EXPO_PUBLIC_MERCHANTKEY32;
  const cardInfo = 'cardNo=5409269963968083&expireYyMm=3205&ordAuthNo=921006&cardPw=53';
  const useFixedIv = false;
  const utf8 = (s) => CryptoJS.enc.Utf8.parse(s);

  // AES/CBC/PKCS5Padding 암호화 후 Base64로 인코딩
  const encryptAES256CBC = (plainText, keyStr, opts = {}) => {
    const keyWA = utf8(keyStr);
    const ivWA = opts.iv ? utf8(opts.iv) : CryptoJS.lib.WordArray.random(16); // 16바이트 IV

    const encrypted = CryptoJS.AES.encrypt(plainText, keyWA, {
      iv: ivWA,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7, // JS에서 PKCS5와 동일
    });

    return {
      ivBase64: CryptoJS.enc.Base64.stringify(ivWA),
      dataBase64: encrypted.toString(), // CryptoJS 기본 Base64 반환
    };
  };

  const opts = useFixedIv ? { iv: FIXED_IV } : {};
  const encrypted = encryptAES256CBC(cardInfo, MID_KEY, opts);

  return encrypted;
};
