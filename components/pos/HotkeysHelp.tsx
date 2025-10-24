'use client'
export default function HotkeysHelp(){
  return <div className="text-xs opacity-80 space-y-1">
    <div><kbd className="px-1 bg-white/20 rounded">Alt</kbd> + <kbd className="px-1 bg-white/20 rounded">1..9</kbd> : เพิ่มสินค้าลำดับที่ 1-9</div>
    <div><kbd className="px-1 bg-white/20 rounded">Alt</kbd> + <kbd className="px-1 bg-white/20 rounded">C</kbd> : ชำระเงินสด</div>
    <div><kbd className="px-1 bg-white/20 rounded">Alt</kbd> + <kbd className="px-1 bg-white/20 rounded">V</kbd> : Void บิล</div>
    <div><kbd className="px-1 bg-white/20 rounded">Ctrl</kbd> + <kbd className="px-1 bg-white/20 rounded">Enter</kbd> : ชำระรวม</div>
  </div>
}
