import {createHash} from 'node:crypto';
import {access,copyFile,cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {displayColor,displayOrigin,displaySize,displayTitle,publicPairNotes,silhouetteProfile} from '../storefront-utils.js';

const ROOT=path.resolve(import.meta.dirname,'..');
const OUT=path.join(ROOT,'_site');
const CACHE=path.join(ROOT,'.image-cache');
const API_URL='https://qgjkxtolyhbwpvncwtkn.supabase.co/rest/v1/fadewell_storefront_products';
const API_KEY='sb_publishable_4I4sJO02Tudp00ALX2xbaQ_DHptnBLb';
const SITE='https://fadewell.eu';
const FIELDS='vinted_item_id,title,brand,dna_tagged_size,dna_fit,dna_origin,dna_era,dna_color,garment_type,description_raw,measurements,photos,price_pln,vinted_url,available,sold,first_seen_at,last_seen_at,sold_at,updated_at';
const STATIC_FILES=['404.html','CNAME','archive.html','fadewell-lockup.png','fadewell-wordmark.png','favicon.svg','finder.html','guides.html','how-to-measure-jeans-flat.html','index.html','jeans-fit-silhouette-guide.html','jeans-waist-size-vs-flat-measurement.html','pair.html','robots.txt','shop.html','storefront-utils.js','storefront.css','storefront.js'];
const STATIC_HTML=STATIC_FILES.filter(file=>file.endsWith('.html'));
let ASSETS={css:'/storefront.css',js:'/storefront.js'};

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const inlineJson=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const absolute=url=>url?.startsWith('/')?`${SITE}${url}`:url;
const exists=target=>access(target).then(()=>true,()=>false);

export function relatedProducts(product,products,limit=4){
  const waist=Number(product.measurements?.waist?.cm);
  const silhouette=silhouetteProfile(product).label;
  const colour=displayColor(product);
  return products
    .filter(candidate=>candidate.available&&!candidate.sold&&String(candidate.vinted_item_id)!==String(product.vinted_item_id))
    .map(candidate=>{
      const candidateWaist=Number(candidate.measurements?.waist?.cm);
      const score=(candidate.brand===product.brand?5:0)+(silhouetteProfile(candidate).label===silhouette?6:0)+(displayColor(candidate)===colour?3:0)+(Number.isFinite(waist)&&Number.isFinite(candidateWaist)?Math.max(0,5-Math.abs(waist-candidateWaist)):0);
      return {candidate,score};
    })
    .sort((a,b)=>b.score-a.score||Number(b.candidate.vinted_item_id)-Number(a.candidate.vinted_item_id))
    .slice(0,limit)
    .map(item=>item.candidate);
}

async function fetchProducts(){
  const response=await fetch(`${API_URL}?select=${FIELDS}&order=updated_at.desc`,{headers:{apikey:API_KEY,Authorization:`Bearer ${API_KEY}`}});
  if(!response.ok)throw new Error(`Supabase storefront fetch failed: ${response.status}`);
  const rows=await response.json();
  if(!Array.isArray(rows)||!rows.length)throw new Error('Refusing to deploy an empty storefront projection');
  return rows;
}

export async function cachedImage(url,variant,resize){
  const key=createHash('sha256').update(`${url}|${variant}|v2`).digest('hex').slice(0,24);
  const cacheFile=path.join(CACHE,`${key}.webp`);
  if(!await exists(cacheFile)){
    const response=await fetch(url);
    if(!response.ok)throw new Error(`Image fetch failed (${response.status}): ${url}`);
    const length=Number(response.headers.get('content-length')||0);
    if(length>15_000_000)throw new Error(`Image exceeds 15 MB safety limit: ${url}`);
    const input=Buffer.from(await response.arrayBuffer());
    if(input.length>15_000_000)throw new Error(`Image exceeds 15 MB safety limit: ${url}`);
    await mkdir(CACHE,{recursive:true});
    await sharp(input,{limitInputPixels:50_000_000}).rotate().resize({...resize,fit:'inside',withoutEnlargement:true}).webp({quality:variant==='card'?68:72,effort:5}).toFile(cacheFile);
  }
  const publicPath=`/generated/images/${key}.webp`;
  const outputFile=path.join(OUT,publicPath.slice(1));
  await mkdir(path.dirname(outputFile),{recursive:true});
  await copyFile(cacheFile,outputFile);
  return publicPath;
}

async function enrichImages(product){
  const photos=Array.isArray(product.photos)?product.photos.filter(Boolean):[];
  if(process.env.FADEWELL_SKIP_IMAGES==='1'||!photos.length)return {...product,card_photo_url:photos[0]||'',display_photos:photos};
  const display=[];
  for(const url of photos){
    try{display.push(await cachedImage(url,'display',{width:900,height:1200}));}
    catch(error){console.warn(error.message);display.push(url);}
  }
  let card=display[0]||photos[0]||'';
  try{card=await cachedImage(photos[0],'card',{width:480,height:640});}
  catch(error){console.warn(error.message);}
  return {...product,card_photo_url:card,display_photos:display};
}

async function optimizeHeroImages(){
  for(let index=1;index<=5;index+=1){
    const source=path.join(ROOT,index===1?'hero.jpg':`hero${index}.jpg`);
    for(const width of [640,1200]){
      const output=path.join(OUT,'generated',`hero-${index}-${width}.webp`);
      await mkdir(path.dirname(output),{recursive:true});
      await sharp(source).rotate().resize({width,withoutEnlargement:true}).webp({quality:80,effort:5}).toFile(output);
    }
  }
}

function relatedMarkup(products){
  if(!products.length)return '';
  return `<section class="shell section pair-related"><div class="section-head"><div><p class="eyebrow">Continue through the wardrobe</p><h2>Related pairs</h2></div><a class="text-link" href="/shop.html">See the full shop →</a></div><div class="product-grid">${products.map(product=>`<article class="product-card"><a class="card-photo" data-pair-link data-pair-id="${escapeHtml(product.vinted_item_id)}" href="/pairs/${encodeURIComponent(product.vinted_item_id)}/"><img loading="lazy" decoding="async" src="${escapeHtml(product.card_photo_url||product.display_photos?.[0]||product.photos?.[0]||'')}" alt="${escapeHtml(displayTitle(product))}"><span class="badge">${escapeHtml(product.garment_type==='JEANS'?'Jeans':'Trousers')}</span></a><div class="card-body"><h3 class="card-title"><a data-pair-link data-pair-id="${escapeHtml(product.vinted_item_id)}" href="/pairs/${encodeURIComponent(product.vinted_item_id)}/">${escapeHtml(displayTitle(product))}</a></h3></div></article>`).join('')}</div></section>`;
}

export function pairHtml(product,related=[]){
  const title=displayTitle(product);
  const description=publicPairNotes(product);
  const canonical=`${SITE}/pairs/${encodeURIComponent(product.vinted_item_id)}/`;
  const image=absolute(product.display_photos?.[0]||product.photos?.[0]||'');
  const schema={
    '@context':'https://schema.org','@type':'Product',name:title,description,image:product.display_photos?.map(absolute)||product.photos?.map(absolute)||[],
    sku:String(product.vinted_item_id),brand:product.brand?{'@type':'Brand',name:product.brand}:undefined,
    color:['Not recorded','Not decoded'].includes(displayColor(product))?undefined:displayColor(product),
    size:displaySize(product),
    offers:{'@type':'Offer',priceCurrency:'PLN',price:product.price_pln??undefined,url:product.vinted_url,availability:product.available?'https://schema.org/InStock':'https://schema.org/OutOfStock',itemCondition:'https://schema.org/UsedCondition'}
  };
  const measurements=Object.entries(product.measurements||{}).filter(([,value])=>value?.cm!=null).map(([key,value])=>`<div class="measure-row"><span>${escapeHtml(key.replaceAll('_',' '))}</span><strong>${escapeHtml(value.display||`${value.cm} cm`)}</strong></div>`).join('');
  const staticCopy=`<article class="pair-index-copy"><p class="pair-sub">Measured · checked · worn well</p><h1>${escapeHtml(title)}</h1>${image?`<img src="${escapeHtml(product.display_photos?.[0]||product.photos?.[0])}" alt="${escapeHtml(title)}">`:''}<p>${escapeHtml(description)}</p><dl><dt>Brand</dt><dd>${escapeHtml(product.brand||'Not stated')}</dd><dt>Size</dt><dd>${escapeHtml(displaySize(product))}</dd><dt>Silhouette</dt><dd>${escapeHtml(silhouetteProfile(product).label)}</dd><dt>Origin</dt><dd>${escapeHtml(displayOrigin(product))}</dd><dt>Colour</dt><dd>${escapeHtml(displayColor(product))}</dd></dl><div class="measure-table">${measurements}</div>${product.available?`<a href="${escapeHtml(product.vinted_url)}">View and buy on Vinted</a>`:'<p>Sold — retained in the Pair Archive.</p>'}</article>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} — FADEWELL</title><meta name="description" content="${escapeHtml(description.slice(0,160))}"><link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="product"><meta property="og:site_name" content="FADEWELL"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description.slice(0,200))}"><meta property="og:url" content="${canonical}">${image?`<meta property="og:image" content="${escapeHtml(image)}"><meta name="twitter:card" content="summary_large_image">`:''}<link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="${ASSETS.css}"><script type="application/ld+json">${inlineJson(schema)}</script></head><body data-page="pair"><header data-site-header></header><main class="shell pair-page" data-pair>${staticCopy}</main>${relatedMarkup(related)}<footer data-site-footer></footer><script>globalThis.__FADEWELL_PAIR__=${inlineJson(product)}</script><script type="module" src="${ASSETS.js}"></script></body></html>`;
}

async function copyStatic(){
  for(const file of STATIC_FILES)await copyFile(path.join(ROOT,file),path.join(OUT,file));
}

async function fingerprintAssets(){
  const css=await readFile(path.join(ROOT,'storefront.css'),'utf8'),js=await readFile(path.join(ROOT,'storefront.js'),'utf8');
  const cssName=`storefront.${createHash('sha256').update(css).digest('hex').slice(0,12)}.css`;
  const jsName=`storefront.${createHash('sha256').update(js).digest('hex').slice(0,12)}.js`;
  ASSETS={css:`/${cssName}`,js:`/${jsName}`};
  await Promise.all([writeFile(path.join(OUT,cssName),css,'utf8'),writeFile(path.join(OUT,jsName),js,'utf8')]);
  for(const file of STATIC_HTML){
    const target=path.join(OUT,file),html=await readFile(target,'utf8');
    await writeFile(target,html.replace(/(?:\/)?storefront\.css/g,ASSETS.css).replace(/(?:\/)?storefront\.js/g,ASSETS.js),'utf8');
  }
}

async function main(){
  await rm(OUT,{recursive:true,force:true});
  await mkdir(OUT,{recursive:true});
  await copyStatic();
  await fingerprintAssets();
  await optimizeHeroImages();
  const source=await fetchProducts();
  const products=[];
  for(const product of source)products.push(await enrichImages(product));
  await writeFile(path.join(OUT,'storefront-data.json'),JSON.stringify(products),'utf8');
  const today=new Date().toISOString().slice(0,10);
  const urls=[
    {loc:`${SITE}/`,lastmod:today,changefreq:'daily',priority:'1.0'},
    {loc:`${SITE}/shop.html`,lastmod:today,changefreq:'daily',priority:'0.9'},
    {loc:`${SITE}/finder.html`,lastmod:today,changefreq:'monthly',priority:'0.8'},
    {loc:`${SITE}/archive.html`,lastmod:today,changefreq:'daily',priority:'0.8'},
    {loc:`${SITE}/guides.html`,lastmod:today,changefreq:'monthly',priority:'0.7'},
    {loc:`${SITE}/how-to-measure-jeans-flat.html`,lastmod:today,changefreq:'yearly',priority:'0.7'},
    {loc:`${SITE}/jeans-waist-size-vs-flat-measurement.html`,lastmod:today,changefreq:'yearly',priority:'0.7'},
    {loc:`${SITE}/jeans-fit-silhouette-guide.html`,lastmod:today,changefreq:'yearly',priority:'0.7'},
  ];
  for(const product of products){
    const directory=path.join(OUT,'pairs',String(product.vinted_item_id));
    await mkdir(directory,{recursive:true});
    const related=relatedProducts(product,products);
    await writeFile(path.join(directory,'index.html'),pairHtml(product,related),'utf8');
    urls.push({loc:`${SITE}/pairs/${encodeURIComponent(product.vinted_item_id)}/`,lastmod:String(product.updated_at||today).slice(0,10),changefreq:product.available?'weekly':'yearly',priority:product.available?'0.8':'0.5'});
  }
  const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${escapeHtml(url.loc)}</loc><lastmod>${url.lastmod}</lastmod><changefreq>${url.changefreq}</changefreq><priority>${url.priority}</priority></url>`).join('\n')}\n</urlset>\n`;
  await writeFile(path.join(OUT,'sitemap.xml'),sitemap,'utf8');
  await writeFile(path.join(OUT,'sitemap.txt'),`${urls.map(url=>url.loc).join('\n')}\n`,'utf8');
  console.log(`Built ${products.length} Pair Files and ${urls.length} sitemap URLs.`);
}

if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename))await main();
