import CryptopJS from 'crypto-js';

export const generateEncrption=({plaintext='',key=process.env.ENCRYPTION_KEY}={})=>{
       return CryptopJS.AES.encrypt(plaintext,key).toString();
}

export const decryptEncryption=({ciphertext='',key=process.env.ENCRYPTION_KEY}={})=>{

return CryptopJS.AES.decrypt(ciphertext,key).toString(CryptopJS.enc.Utf8);

}