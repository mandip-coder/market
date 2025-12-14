// decrypt.ts
import * as crypto from 'crypto';

// The secret key from your Java code, Base64 encoded
const SECRET_KEY_BASE64: string = 'dG9waWFzdGFuZGFyZGVkZW5jcnlwdGRlY3J5cHQyMDI1';

/**
 * Decrypts an AES-ECB encrypted Base64 string using Node.js built-in crypto module.
 * @param encryptedToken The token to decrypt.
 * @returns The original token, or null if decryption fails.
 */
export function decryptToken(encryptedToken: string): string {
        const algorithm: string = 'aes-256-ecb';
        
        // Decode the secret key from Base64 into a buffer
        const key: Buffer = Buffer.from(SECRET_KEY_BASE64, 'base64');
        
        // Create a decipher object.
        // The type is Decipheriv, not Decipher.
        const decipher: crypto.Decipher = crypto.createDecipheriv(algorithm, key, null);
        
        // Decode the encrypted token from Base64
        const encryptedData: Buffer = Buffer.from(encryptedToken, 'base64');
        
        // Decrypt the data
        let decrypted: Buffer = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        // Convert the decrypted buffer to a UTF-8 string
        return decrypted.toString('utf8');
 
}

