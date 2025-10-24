export async function GET(){ return new Response('name,price,sku,image_path,is_active\n', { headers:{ 'Content-Type':'text/csv' } }) }
