import path from 'node:path';
import {fileURLToPath} from 'node:url';

const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));

export function deploymentMarkerMatches(marker,expectedToken,now=Date.now(),maxAgeMinutes=15){
  if(!marker||typeof marker!=='object')return false;
  if(String(marker.deployment_token||'')!==String(expectedToken||''))return false;
  const generatedAt=Date.parse(marker.generated_at);
  if(!Number.isFinite(generatedAt))return false;
  const ageMinutes=(now-generatedAt)/60000;
  return ageMinutes>=-5&&ageMinutes<=maxAgeMinutes;
}

async function fetchJson(url,options={},attempts=5){
  let lastError;
  for(let attempt=1;attempt<=attempts;attempt+=1){
    try{
      const response=await fetch(url,options);
      if(response.ok)return response.json();
      lastError=new Error(`${url} returned ${response.status}`);
    }catch(error){lastError=error}
    if(attempt<attempts)await wait(attempt*5000);
  }
  throw lastError;
}

async function main(){
  const expectedToken=process.argv[2];
  const timeoutSeconds=Number(process.argv[3]||120);
  if(!expectedToken)throw new Error('Expected deployment token is required');
  const deadline=Date.now()+timeoutSeconds*1000;
  let lastMarker;
  do{
    try{
      lastMarker=await fetchJson(`https://fadewell.eu/deployment-health.json?health=${Date.now()}`,{cache:'no-store'},1);
      if(deploymentMarkerMatches(lastMarker,expectedToken)){
        const published=await fetchJson(`https://fadewell.eu/storefront-data.json?health=${Date.now()}`,{cache:'no-store'});
        if(!Array.isArray(published)||!published.length)throw new Error('Published Storefront snapshot is empty');
        console.log(`Verified deployed Storefront ${expectedToken}: ${published.length} products`);
        return;
      }
    }catch(error){lastMarker={error:error.message}}
    if(Date.now()<deadline)await wait(5000);
  }while(Date.now()<deadline);
  throw new Error(`Storefront deployment ${expectedToken} did not become live within ${timeoutSeconds}s; last marker: ${JSON.stringify(lastMarker)}`);
}

if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(fileURLToPath(import.meta.url)))await main();
