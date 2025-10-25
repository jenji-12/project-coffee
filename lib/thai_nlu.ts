const thaiDigits: Record<string, string> = { 'ศูนย์':'0','หนึ่ง':'1','สอง':'2','สาม':'3','สี่':'4','ห้า':'5','หก':'6','เจ็ด':'7','แปด':'8','เก้า':'9','สิบ':'10' }
export function normalizeQty(text: string){
  // extract first integer from Thai or Arabic numerals
  const keys = Object.keys(thaiDigits)
  for(const k of keys){
    if(text.includes(k)) return Number(thaiDigits[k])
  }
  const m = text.match(/(\d+)/)
  return m ? Number(m[1]) : 1
}
export function tokens(t: string){
  return t.toLowerCase().replace(/\s+/g,' ').trim().split(' ')
}
