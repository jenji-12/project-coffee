export class EscPosEncoder {
  private chunks: number[] = []
  private push(...bytes: number[]){ this.chunks.push(...bytes) }
  init(){ this.push(0x1B,0x40); return this }                // ESC @
  align(mode:'left'|'center'|'right'){ const m = mode==='left'?0:mode==='center'?1:2; this.push(0x1B,0x61,m); return this }
  bold(on:boolean){ this.push(0x1B,0x45,on?1:0); return this }
  text(t:string){ const enc = new TextEncoder(); const b = Array.from(enc.encode(t)); this.push(...b, 0x0A); return this }
  feed(n=1){ for(let i=0;i<n;i++) this.push(0x0A); return this }
  cut(){ this.push(0x1D,0x56,0x01); return this }            // partial cut
  bytes(){ return new Uint8Array(this.chunks) }
}
