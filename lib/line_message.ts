export async function replyMessage(token: string, replyToken: string, messages: any[]){
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ replyToken, messages })
  })
}
