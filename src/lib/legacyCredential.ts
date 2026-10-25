import 'server-only';
import { scryptSync, timingSafeEqual } from 'node:crypto';

// Compatibility credentials from the preserved project baseline. Plaintext is never stored here.
// A configured ADMIN_SECRET takes precedence in adminAuth.ts.
const LEGACY_CREDENTIALS = [
  {
    "salt": "b4bcd62284719cd13181ed87a4620d0e",
    "hash": "099b764895971ca91b42bb4e49c2481333bf7dc8c70c6a82dea86d38602f902c21fce97d432f5c31632b708f6c2edcf731228ddc4372b855e1521a4cd1203c02"
  },
  {
    "salt": "01b5fed60ac97cb85b6a87c4aede683d",
    "hash": "ed4a485844cba00e322dd1eb09b11693a7160b48c7aca83aa26ad3b1014dcdc140522932f9698d8d79dc314d72b12fe131f376ba0811a26a2b3124e2c9fffd96"
  }
] as const;
const SCRYPT_OPTIONS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export function verifyLegacyCredential(input: string): boolean {
  if (typeof input !== 'string' || input.length === 0 || input.length > 512) return false;
  let matches = 0;
  for (const credential of LEGACY_CREDENTIALS) {
    const derived = scryptSync(input, credential.salt, 64, SCRYPT_OPTIONS);
    const expected = Buffer.from(credential.hash, 'hex');
    matches |= Number(timingSafeEqual(derived, expected));
    derived.fill(0);
  }
  return matches !== 0;
}
