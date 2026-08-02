import {createHash} from 'node:crypto';

const API_URL='https://qgjkxtolyhbwpvncwtkn.supabase.co/rest/v1/fadewell_storefront_products';
const API_KEY='sb_publishable_4I4sJO02Tudp00ALX2xbaQ_DHptnBLb';
const response=await fetch(`${API_URL}?select=vinted_item_id,photos&order=vinted_item_id.asc`,{headers:{apikey:API_KEY,Authorization:`Bearer ${API_KEY}`}});
if(!response.ok)throw new Error(`Could not fingerprint storefront galleries (${response.status})`);
const products=await response.json();
if(!Array.isArray(products)||!products.length)throw new Error('Refusing an empty gallery fingerprint');
const fingerprint=createHash('sha256').update(JSON.stringify(products)).digest('hex').slice(0,20);
console.log(`key=${fingerprint}`);
