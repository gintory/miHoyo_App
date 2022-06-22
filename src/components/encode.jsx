import JSEncrypt from 'jsencrypt';

const pubKey = `-----BEGIN PUBLIC KEY-----
  MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKoqw0AfDnmVubjWqCFEKxyWAm
  Grt7M95G9barVZt6vQu2msZElEgAegVNHjKfquqYjEn5cNTD9g2jaTI36mu4ffGH
  SXoyulCteLWwIXU7fl4BcPBlGwnZldUJRClDc1yP88/ZhOUSny9pX903r/YPLfnt
  XyUNDTl8ikEFR0A6MQIDAQAB
  -----END PUBLIC KEY-----`;
const priKey = `-----BEGIN RSA PRIVATE KEY-----
  MIICWwIBAAKBgQCKoqw0AfDnmVubjWqCFEKxyWAmGrt7M95G9barVZt6vQu2msZE
  lEgAegVNHjKfquqYjEn5cNTD9g2jaTI36mu4ffGHSXoyulCteLWwIXU7fl4BcPBl
  GwnZldUJRClDc1yP88/ZhOUSny9pX903r/YPLfntXyUNDTl8ikEFR0A6MQIDAQAB
  AoGAGTRoEHCF5uVn1UkJoyqh0YbmFydnDIgqkkYb9txyjwcNuR48i71Vtdh5XELw
  Oz0st51R2arc09/JLPt0KNxSxwxWVH7FEh10hl0ent7EEddcsM0ws8wuyiMqo8XL
  5hiejRIjbO8+bd7DJZjWFmz90WXkBvfdG2LWw6LLRykX5v0CQQDK2X43tKdrAlZa
  ikSlzJd+RyMxLWFds0nNPtRaLAamxfgXqHisMc6n71jlyiv/YoGYJflKV2d9tq3t
  +jxJjHzjAkEArvXmBj5GF/eQbWiW4CBYTC37qlGzQd6k4h3IGhozyR18aHyRHC2w
  AyyiPCjvDD/3TOAeBfoHyybLvaq3G2pM2wJAeVgJrQEgdV78kUTNM/FjXmLnpm9j
  I04xA9pl5VsYz4L1mhFpvng9CzCemTeLgkZHB+EPc209t3IkMYvTrJuhyQJAIImi
  ia6zImnr9izpQi1BvokesIIZMDrTtymKuS/+SXyuUlA4PGFSxoRad421RzXuK+HS
  M5JYOLOyWEeTXgna2QJAO2mkDs6h7BHgB2SujX+cTdAtzqp19GycwRkKQiE8QaY+
  DwPT74M/um/1tzjSmLzCg2uJIS4M88iGvnTAyLa8Og==
  -----END RSA PRIVATE KEY-----`;
const encryptor = new JSEncrypt();
encryptor.setPublicKey(pubKey);

export function encrypt(password) {
  return encryptor.encrypt(password);
}
