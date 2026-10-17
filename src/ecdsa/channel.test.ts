import {expect,test} from 'vitest';
import {Channel,bytes,toHex,enc} from './channel.ts';
import {p256} from '@noble/curves/nist.js';
test('RFC 6979 A.2.5 P-256 / SHA-256 / sample r and low-s transformed published s',()=>{
 const key=bytes('C9AFA9D845BA75166B5C215767B1D6934E50C3DB36E89B127B8A622B120F6721');
 const sig=p256.sign(enc.encode('sample'),key,{lowS:true});
 expect(toHex(sig.subarray(0,32))).toBe('efd48b2aacb6a8fd1140dd9cd45e81d69d2c877b56aaf991c34d0ea84eaf3716');
 expect(toHex(sig.subarray(32))).toBe('0834e36ad29a83bf2bc9385e491d6099c8fdf9d1ed67aa7ea5f51f93782857a9'); // RFC 6979 P-256 / SHA-256 low-s normalized s
});
test('same input under RFC 6979 is identical and WebCrypto independently accepts',async()=>{const c=new Channel();const a=c.deterministic(),b=c.deterministic();expect(toHex(a)).toBe(toHex(b));expect(await c.verify(a)).toBe(true);expect(await c.crossVerify(a,c.message+'tamper')).toBe(false);});
test('bounded bit-selection produces genuine signatures with each bit',async()=>{const c=new Channel();for(const bit of [0,1] as const){const x=await c.encode(bit,64);expect(x).toBeDefined();expect(x!.bit).toBe(bit);expect(c.decode(x!.bytes)).toBe(bit);expect(x!.verified).toBe(true);expect(x!.externalVerified).toBe(true);} });
test('malformed encoding is rejected and changed message fails',async()=>{const c=new Channel(),sig=c.randomized();expect(()=>c.decode(sig.slice(1))).toThrow();expect(await c.verify(sig,c.message+' changed')).toBe(false);});

test('reject unsupported symbol and preserve strict signature encoding',async()=>{const c=new Channel();await expect(c.encode(2 as never,4)).rejects.toThrow(/Bit must be exactly/);expect(()=>c.decode(new Uint8Array(65))).toThrow(/64-byte/);});
