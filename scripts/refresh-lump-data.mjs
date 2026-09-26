import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {places} from '../lump-data.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const livePath=path.join(root,'lump-live.json');
const anydays=places.filter(place=>place.name.startsWith('Anydays'));
const strip=html=>html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replaceAll('&nbsp;',' ').replace(/\s+/g,' ');
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Warsaw'}).format(new Date());

function currentPrice(text,address){
  const start=text.toLocaleLowerCase('pl').indexOf(address.toLocaleLowerCase('pl'));
  if(start<0)return null;
  const block=text.slice(start,start+550);
  const match=block.match(/Dzisiaj\s+(.+?)(?=\s+\d{2}\.\d{2}\s|$)/i);
  return match?.[1]?.replace(/\s*(Lux)\s*/i,'; LUX ').trim()||null;
}

async function officialPrices(){
  const response=await fetch('https://anydays.pl/prices',{headers:{'user-agent':'FADEWELL Lump data refresh'}});
  if(!response.ok)throw new Error(`Anydays returned ${response.status}`);
  const text=strip(await response.text()),prices={};
  for(const place of anydays){
    const price=currentPrice(text,place.address);
    if(price)prices[place.id]=price;
  }
  if(Object.keys(prices).length!==anydays.length)throw new Error(`Only ${Object.keys(prices).length}/${anydays.length} Anydays prices parsed; leaving published data unchanged`);
  return prices;
}

async function googleHours(){
  const key=process.env.GOOGLE_MAPS_API_KEY;
  if(!key)return {};
  const result={};
  for(const place of places){
    const response=await fetch('https://places.googleapis.com/v1/places:searchText',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.currentOpeningHours,places.formattedAddress'},body:JSON.stringify({textQuery:`${place.name}, ${place.address}, Warszawa, Poland`,languageCode:'pl',maxResultCount:1})});
    if(!response.ok)continue;
    const match=(await response.json()).places?.[0]?.currentOpeningHours;
    if(match)result[place.id]={openNow:Boolean(match.openNow),weekdayDescriptions:match.weekdayDescriptions||[]};
  }
  return result;
}

const previous=JSON.parse(await readFile(livePath,'utf8'));
const prices=await officialPrices();
const hours=await googleHours();
const next={updatedAt:new Date().toISOString(),prices,googleHours:Object.keys(hours).length?hours:previous.googleHours||{}};
await writeFile(livePath,`${JSON.stringify(next,null,2)}\n`,'utf8');
console.log(`Updated ${Object.keys(prices).length} official prices${Object.keys(hours).length?` and ${Object.keys(hours).length} Google Places records`:''} for ${today()}.`);
