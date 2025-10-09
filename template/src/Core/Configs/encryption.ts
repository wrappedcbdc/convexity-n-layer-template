import * as crypto from "node:crypto";
import {env} from "./env";
import {ENCRYPTION_ALGORITHM} from "./constant";

export const encrypt = (text: any) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(env.ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export const decrypt = (hash: string) => {
    const [ivHex, encryptedHex] = hash.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(env.ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
