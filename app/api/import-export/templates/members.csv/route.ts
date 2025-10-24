export async function GET(){ return new Response('name,phone,points,cups_bought\n', { headers:{ 'Content-Type':'text/csv' } }) }
