/** P-256 ECDSA signed with RFC 6979 / hedged extra entropy via noble-curves v2.4.0.
 * The bit channel is *selection* of genuine signatures; no manual nonce manipulation. */
import {p256} from '@noble/curves/nist.js';
export const enc=new TextEncoder();
export const toHex=(u:Uint8Array)=>Array.from(u,b=>b.toString(16).padStart(2,'0')).join('');
export const bytes=(hex:string)=>{if(!/^(?:[0-9a-f]{2})+$/i.test(hex))throw new Error('Invalid hex');return new Uint8Array(hex.match(/../g)!.map(x=>parseInt(x,16)));};
export type SignatureSample={bytes:Uint8Array;bit:0|1;verified:boolean;externalVerified:boolean;attempts:number};
export class Channel{
 readonly keys=p256.keygen();
 readonly message='Fictional document: library board meeting at 14:00';
 async crossVerify(sig:Uint8Array,msg=this.message){
   try{const publicRaw=p256.getPublicKey(this.keys.secretKey,false);
     const pub=await crypto.subtle.importKey('raw',new Uint8Array(publicRaw),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
     return await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},pub,new Uint8Array(sig),enc.encode(msg));
   }catch{return false;}
 }
 decode(sig:Uint8Array):0|1{if(sig.length!==64)throw new Error('Non-canonical signature: expected 64-byte P1363');return (sig[31]!&1) as 0|1;}
 deterministic(msg=this.message):Uint8Array{return p256.sign(enc.encode(msg),this.keys.secretKey,{lowS:true});}
 randomized(msg=this.message):Uint8Array{return p256.sign(enc.encode(msg),this.keys.secretKey,{lowS:true,extraEntropy:crypto.getRandomValues(new Uint8Array(32))});}
 async verify(sig:Uint8Array,msg=this.message){return sig.length===64&&p256.verify(sig,enc.encode(msg),this.keys.publicKey)&&await this.crossVerify(sig,msg);}
 async encode(target:0|1,limit=64,msg=this.message):Promise<SignatureSample|undefined>{
   if(!Number.isInteger(limit)||limit<1||limit>128)throw new Error('Attempt budget must be 1–128');
   if(target!==0&&target!==1)throw new Error('Bit must be exactly 0 or 1');
   for(let attempts=1;attempts<=limit;attempts++){
     const signature=this.randomized(msg);
     const bit=this.decode(signature);
     if(bit!==target)continue;
     const verified=p256.verify(signature,enc.encode(msg),this.keys.publicKey);
     const externalVerified=await this.crossVerify(signature,msg);
     if(!verified||!externalVerified)throw new Error('Independent signature checks disagreed; abort');
     return {bytes:signature,bit,verified,externalVerified,attempts};
   }
   return undefined;
 }
}
