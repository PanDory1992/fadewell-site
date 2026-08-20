const API_URL='https://qgjkxtolyhbwpvncwtkn.supabase.co/rest/v1/fadewell_storefront_products';
const API_KEY='sb_publishable_4I4sJO02Tudp00ALX2xbaQ_DHptnBLb';

export function latestTimestampAgeMinutes(rows,now=Date.now()){
  if(!Array.isArray(rows)||!rows.length)throw new Error('Published Storefront snapshot is empty');
  const timestamps=rows.map(row=>Date.parse(row.updated_at)).filter(Number.isFinite);
  if(!timestamps.length)throw new Error('Published Storefront snapshot has no freshness timestamp');
  return (now-Math.max(...timestamps))/60000;
}

async function fetchJson(url,options={},attempts=5){
  let lastError;
  for(let attempt=1;attempt<=attempts;attempt+=1){
    try{
      const response=await fetch(url,options);
      if(response.ok)return response.json();
      lastError=new Error(`${url} returned ${response.status}`);
    }catch(error){lastError=error}
    if(attempt<attempts)await new Promise(resolve=>setTimeout(resolve,attempt*5000));
  }
  throw lastError;
}

async function main(){
  const maxAge=Number(process.argv[2]||90);
  const cacheBust=Date.now();
  const [published,live]=await Promise.all([
    fetchJson(`https://fadewell.eu/storefront-data.json?health=${cacheBust}`,{cache:'no-store'}),
    fetchJson(`${API_URL}?select=updated_at&order=updated_at.desc&limit=1`,{headers:{apikey:API_KEY,Authorization:`Bearer ${API_KEY}`}}),
  ]);
  const publishedAge=latestTimestampAgeMinutes(published);
  const liveAge=latestTimestampAgeMinutes(live);
  if(publishedAge>maxAge){
    throw new Error(`Static Storefront is ${publishedAge.toFixed(0)} minutes old; deployment recovery is required`);
  }
  if(liveAge>maxAge){
    throw new Error(`Live Storefront data is ${liveAge.toFixed(0)} minutes old; HQ refresh recovery is required`);
  }
  console.log(`Verified Storefront freshness: static ${publishedAge.toFixed(0)} min, live ${liveAge.toFixed(0)} min`);
}

if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(fileURLToPath(import.meta.url)))await main();
import path from 'node:path';
import {fileURLToPath} from 'node:url';
