import {MEASURE_LABELS,cleanNotes,colourProfile,displayColor,displayOrigin,displaySize,displayTitle,silhouetteProfile} from './storefront-utils.js';

const API_URL='https://qgjkxtolyhbwpvncwtkn.supabase.co/rest/v1/fadewell_storefront_products';
const API_KEY='sb_publishable_4I4sJO02Tudp00ALX2xbaQ_DHptnBLb';
const VINTED_PROFILE='https://www.vinted.pl/member/271911480-falkafalka35';
const NBP_EUR_URL='https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json';
const EUR_CACHE_KEY='fadewell-eur-rate-v1';
let products=[];
let currency='PLN',eurRate=null;

function header(){return `<div class="site-header"><nav class="nav shell" aria-label="Main navigation"><a class="wordmark" href="index.html" aria-label="FADEWELL home"><img src="fadewell-wordmark.png" alt="FADEWELL"></a><button class="mobile-toggle" aria-expanded="false">Menu</button><div class="nav-links"><a data-nav="shop" href="shop.html">Shop</a><a data-nav="finder" href="finder.html">Denim Finder</a><a data-nav="archive" href="archive.html">Pair Archive</a><a href="https://www.instagram.com/byfadewell/" target="_blank" rel="noopener">Journal ↗</a><button class="currency-toggle" type="button" data-currency-toggle aria-pressed="false" aria-label="Show prices in euro"><span>PLN</span><span aria-hidden="true">/</span><span>EUR</span></button><a class="button primary nav-vinted" href="${VINTED_PROFILE}" target="_blank" rel="noopener">Vinted ↗</a></div></nav></div>`}
function footer(){return `<div class="site-footer"><div class="shell"><div class="footer-grid"><div class="footer-brand"><img src="fadewell-wordmark.png" alt="FADEWELL"><p>Vintage Jeans &amp; Denim. Measured. Checked. Worn well.</p></div><nav class="footer-links" aria-label="Footer"><a href="https://www.instagram.com/byfadewell/" target="_blank" rel="noopener">Instagram @byfadewell</a><a href="https://share.google/fnyhYT1W28vR7XISJ" target="_blank" rel="noopener">Google profile</a><a href="mailto:hello@fadewell.eu">hello@fadewell.eu</a></nav></div><div class="footer-base">© 2026 FADEWELL · EST. 2023 — Warsaw, Poland.</div></div></div>`}

document.querySelector('[data-site-header]')?.insertAdjacentHTML('afterbegin',header());
document.querySelector('[data-site-footer]')?.insertAdjacentHTML('afterbegin',footer());
const page=document.body.dataset.page;
document.querySelector(`[data-nav="${page}"]`)?.setAttribute('aria-current','page');
document.querySelector('.mobile-toggle')?.addEventListener('click',event=>{const nav=document.querySelector('.nav-links');nav.classList.toggle('open');event.currentTarget.setAttribute('aria-expanded',String(nav.classList.contains('open')))});

async function getEurRate(){
  if(eurRate)return eurRate;
  try{
    const response=await fetch(NBP_EUR_URL);if(!response.ok)throw new Error(`NBP ${response.status}`);
    const data=await response.json(),mid=Number(data.rates?.[0]?.mid);if(!mid)throw new Error('NBP rate missing');
    eurRate={mid,effectiveDate:data.rates[0].effectiveDate};localStorage.setItem(EUR_CACHE_KEY,JSON.stringify(eurRate));return eurRate;
  }catch(error){
    const cached=JSON.parse(localStorage.getItem(EUR_CACHE_KEY)||'null');if(cached?.mid){eurRate=cached;return cached}throw error;
  }
}
function money(value){
  if(value==null)return 'Price on Vinted';
  const amount=currency==='EUR'&&eurRate?Number(value)/eurRate.mid:Number(value);
  return new Intl.NumberFormat('en-GB',{style:'currency',currency,maximumFractionDigits:currency==='EUR'?2:0}).format(amount);
}
function updatePrices(){document.querySelectorAll('[data-price-pln]').forEach(node=>{node.textContent=money(node.dataset.pricePln)})}
function syncCurrencyButton(){const button=document.querySelector('[data-currency-toggle]');if(!button)return;button.dataset.currency=currency;button.setAttribute('aria-pressed',String(currency==='EUR'));button.setAttribute('aria-label',currency==='PLN'?'Show prices in euro':'Show prices in Polish zloty');button.title=currency==='EUR'&&eurRate?`NBP average rate from ${eurRate.effectiveDate}: 1 EUR = ${eurRate.mid} PLN`:'Switch PLN / EUR'}
document.querySelector('[data-currency-toggle]')?.addEventListener('click',async event=>{const button=event.currentTarget;button.disabled=true;try{if(currency==='PLN'){await getEurRate();currency='EUR'}else currency='PLN';updatePrices();syncCurrencyButton()}catch(error){button.title='The NBP EUR rate is temporarily unavailable';console.error(error)}finally{button.disabled=false}});
syncCurrencyButton();

function safe(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function m(product,key){return product.measurements?.[key]?.cm}
function pairUrl(product){return `pair.html?id=${encodeURIComponent(product.vinted_item_id)}`}
function populateOptions(form,name,values,excluded=[]){const select=form.elements[name];[...new Set(values.filter(value=>value&&!excluded.includes(value)))].sort().forEach(value=>select.add(new Option(value,value)))}

function card(product,deltas,options={}){
  const photo=product.photos?.[0]||'',showPrice=options.showPrice!==false;
  return `<article class="product-card"><a class="card-photo" href="${pairUrl(product)}"><img loading="lazy" src="${safe(photo)}" alt="${safe(displayTitle(product))}"><span class="badge ${product.sold?'sold':''}">${product.sold?'Sold archive':safe(product.garment_type==='JEANS'?'Jeans':'Trousers')}</span></a><div class="card-body"><h3 class="card-title"><a href="${pairUrl(product)}">${safe(displayTitle(product))}</a></h3>${deltas?`<ul class="delta-list">${deltas.map(delta=>`<li>${safe(MEASURE_LABELS[delta.key])}: <strong>${delta.delta>0?'+':''}${delta.delta.toFixed(1)} cm</strong></li>`).join('')}</ul>`:''}${showPrice?`<p class="card-price"${product.sold?'':` data-price-pln="${safe(product.price_pln)}"`}>${product.sold?'Reference pair':money(product.price_pln)}</p>`:''}</div></article>`;
}

async function loadProducts(){
  const fields='vinted_item_id,title,brand,dna_tagged_size,dna_fit,dna_origin,dna_era,dna_color,garment_type,description_raw,measurements,photos,price_pln,vinted_url,available,sold,first_seen_at,last_seen_at,sold_at,updated_at';
  const response=await fetch(`${API_URL}?select=${fields}&order=updated_at.desc`,{headers:{apikey:API_KEY,Authorization:`Bearer ${API_KEY}`}});
  if(!response.ok)throw new Error(`Wardrobe unavailable (${response.status})`);
  return response.json();
}
function showError(node,error){node.innerHTML=`<p class="error">The wardrobe could not be loaded just now. <a href="${VINTED_PROFILE}" target="_blank" rel="noopener">Open FADEWELL on Vinted instead →</a></p>`;console.error(error)}

async function renderListings(){
  const node=document.querySelector('[data-products]');if(!node)return;
  try{
    products=await loadProducts();
    const archive=page==='archive';
    let shown=products.filter(product=>archive?product.sold:product.available&&!product.sold);
    if(page==='home')shown=[...shown].sort((a,b)=>(b.price_pln??-1)-(a.price_pln??-1)).slice(0,Number(node.dataset.limit||5));
    if(page==='shop')setupFilters(node,shown);
    else node.innerHTML=shown.length?shown.map(product=>card(product,null,{showPrice:page!=='home'})).join(''):`<p class="empty">${archive?'The Pair Archive is being assembled.':'No published pairs are available at this moment.'}</p>`;updatePrices();
  }catch(error){showError(node,error)}
}

function setupFilters(node,source){
  const form=document.querySelector('[data-filters]'),count=document.querySelector('[data-count]'),sort=document.querySelector('[data-sort]');
  populateOptions(form,'colour',source.map(product=>colourProfile(product).family),['Not decoded']);
  populateOptions(form,'silhouette',source.map(product=>silhouetteProfile(product).label),['Shape not decoded']);
  const draw=()=>{const data=new FormData(form),query=String(data.get('q')||'').toLowerCase(),type=data.get('type'),colour=data.get('colour'),silhouette=data.get('silhouette'),waist=Number(data.get('waist')||Infinity),inseam=Number(data.get('inseam')||0);let shown=source.filter(product=>(!query||`${product.title} ${product.brand} ${product.description_raw}`.toLowerCase().includes(query))&&(!type||product.garment_type===type)&&(!colour||colourProfile(product).family===colour)&&(!silhouette||silhouetteProfile(product).label===silhouette)&&(m(product,'waist')??Infinity)<=waist&&(m(product,'inseam')??0)>=inseam);shown.sort((a,b)=>sort.value==='price-asc'?(a.price_pln??Infinity)-(b.price_pln??Infinity):sort.value==='price-desc'?(b.price_pln??-1)-(a.price_pln??-1):sort.value==='waist'?(m(a,'waist')??Infinity)-(m(b,'waist')??Infinity):Number(b.vinted_item_id)-Number(a.vinted_item_id));count.textContent=`${shown.length} ${shown.length===1?'pair':'pairs'}`;node.innerHTML=shown.length?shown.map(product=>card(product)).join(''):'<p class="empty">No pair matches those filters. Try widening one measurement.</p>';updatePrices()};
  form.addEventListener('input',draw);form.addEventListener('reset',()=>setTimeout(draw));sort.addEventListener('change',draw);draw();
}

function galleryMarkup(product){
  const photos=product.photos||[],title=displayTitle(product);if(!photos.length)return '<div class="pair-photo-empty">No photo available</div>';
  return `<div class="pair-gallery" data-gallery><div class="pair-hero-photo">${photos.length>1?'<button class="hero-photo-arrow previous" type="button" data-gallery-hero-prev aria-label="Previous single photo">←</button>':''}<img loading="eager" data-gallery-hero src="${safe(photos[0])}" alt="${safe(title)}, selected photo">${photos.length>1?'<button class="hero-photo-arrow next" type="button" data-gallery-hero-next aria-label="Next single photo">→</button>':''}</div>${photos.length>1?`<div class="pair-gallery-rail"><button class="gallery-arrow" type="button" data-gallery-prev aria-label="Previous thumbnail page">←</button><div class="pair-thumbs" data-gallery-thumbs></div><button class="gallery-arrow" type="button" data-gallery-next aria-label="Next thumbnail page">→</button></div>`:''}</div>`;
}
function setupGallery(root,product){
  const gallery=root.querySelector('[data-gallery]'),photos=product.photos||[];if(!gallery||photos.length<2)return;
  const hero=gallery.querySelector('[data-gallery-hero]'),thumbs=gallery.querySelector('[data-gallery-thumbs]'),prev=gallery.querySelector('[data-gallery-prev]'),next=gallery.querySelector('[data-gallery-next]'),heroPrev=gallery.querySelector('[data-gallery-hero-prev]'),heroNext=gallery.querySelector('[data-gallery-hero-next]');let start=1,selected=0;
  const draw=()=>{const batch=photos.slice(start,start+4);thumbs.innerHTML=batch.map((url,offset)=>{const index=start+offset;return `<button type="button" class="gallery-thumb${index===selected?' active':''}" data-gallery-index="${index}" aria-label="Show photo ${index+1}"><img loading="lazy" src="${safe(url)}" alt=""></button>`}).join('');prev.disabled=start===1;next.disabled=start+4>=photos.length;heroPrev.disabled=selected===0;heroNext.disabled=selected===photos.length-1};
  const selectPhoto=index=>{selected=Math.max(0,Math.min(photos.length-1,index));hero.src=photos[selected];hero.alt=`${displayTitle(product)}, photo ${selected+1}`;if(selected>0&&(selected<start||selected>=start+4))start=1+Math.floor((selected-1)/4)*4;draw()};
  thumbs.addEventListener('click',event=>{const button=event.target.closest('[data-gallery-index]');if(!button)return;selectPhoto(Number(button.dataset.galleryIndex))});
  heroPrev.addEventListener('click',()=>selectPhoto(selected-1));heroNext.addEventListener('click',()=>selectPhoto(selected+1));
  prev.addEventListener('click',()=>{start=Math.max(1,start-4);draw()});next.addEventListener('click',()=>{const lastStart=1+Math.floor((photos.length-2)/4)*4;start=Math.min(lastStart,start+4);draw()});draw();
}

async function renderPair(){
  const node=document.querySelector('[data-pair]');if(!node)return;
  try{
    const id=new URLSearchParams(location.search).get('id');if(!id)throw new Error('Missing pair id');
    products=await loadProducts();const product=products.find(item=>String(item.vinted_item_id)===id);if(!product)throw new Error('Pair not found');
    document.title=`${displayTitle(product)} — FADEWELL`;
    const measures=Object.entries(MEASURE_LABELS).filter(([key])=>m(product,key)!=null).map(([key,label])=>`<div class="measure-row"><span>${label}</span><strong>${m(product,key)} cm</strong></div>`).join('');
    const buy=product.available?`<a class="button primary pair-cta" href="${safe(product.vinted_url)}" target="_blank" rel="noopener">View & buy on Vinted ↗</a>`:`<span class="button pair-cta" aria-disabled="true">Sold — kept in the Pair Archive</span>`;
    const notes=cleanNotes(product.description_raw);
    node.innerHTML=`<a class="back-link" href="${product.sold?'archive.html':'shop.html'}">← Back to ${product.sold?'archive':'shop'}</a><div class="pair-grid">${galleryMarkup(product)}<article class="pair-info"><p class="pair-sub">Measured · checked · worn well</p><h1>${safe(displayTitle(product))}</h1><div class="pair-purchase"><p class="pair-price"${product.sold?'':` data-price-pln="${safe(product.price_pln)}"`}>${product.sold?'Sold':money(product.price_pln)}</p>${buy}</div><div class="pair-details"><div class="pair-detail"><small>Brand</small>${safe(product.brand||'Not stated')}</div><div class="pair-detail"><small>Size</small>${safe(displaySize(product))}</div><div class="pair-detail"><small>Silhouette</small>${safe(silhouetteProfile(product).label)}</div><div class="pair-detail pair-detail-wide"><small>Origin</small>${safe(displayOrigin(product))}</div><div class="pair-detail"><small>Colour</small>${safe(displayColor(product))}</div></div><h2>Measurements</h2><div class="measure-table">${measures}</div><h2>The pair</h2><p class="pair-notes">${safe(notes||'Pair-specific notes are available on Vinted.')}</p></article></div>${product.available?`<a class="button primary sticky-buy" href="${safe(product.vinted_url)}" target="_blank" rel="noopener">View & buy on Vinted ↗</a>`:''}`;setupGallery(node,product);updatePrices();
  }catch(error){showError(node,error)}
}

async function setupFinder(){
  const form=document.querySelector('[data-finder]');if(!form)return;
  try{products=(await loadProducts()).filter(product=>product.available&&!product.sold);populateOptions(form,'colour',products.map(product=>colourProfile(product).family),['Not decoded']);populateOptions(form,'silhouette',products.map(product=>silhouetteProfile(product).label),['Shape not decoded'])}catch(error){console.error(error)}
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(form),colour=String(data.get('colour')||''),silhouette=String(data.get('silhouette')||'');
    const entries=[...data].filter(([key,value])=>key in MEASURE_LABELS&&String(value).trim()!=='');
    const errorNode=document.querySelector('[data-finder-error]');
    if(!entries.length&&!colour&&!silhouette){errorNode.hidden=false;return}
    errorNode.hidden=true;
    const wanted=Object.fromEntries(entries.map(([key,value])=>[key,Number(value)]));
    const candidates=products.filter(product=>(!colour||colourProfile(product).family===colour)&&(!silhouette||silhouetteProfile(product).label===silhouette));
    const ranked=candidates.map(product=>{const deltas=Object.keys(wanted).map(key=>({key,delta:(m(product,key)??999)-wanted[key]}));return {product,deltas,distance:deltas.reduce((sum,delta)=>sum+Math.abs(delta.delta),0)}}).filter(result=>result.deltas.every(delta=>Math.abs(delta.delta)<900)).sort((a,b)=>a.distance-b.distance||Number(b.product.vinted_item_id)-Number(a.product.vinted_item_id)).slice(0,12);
    const section=document.querySelector('[data-finder-results]'),node=document.querySelector('[data-finder-products]');section.hidden=false;node.innerHTML=ranked.length?ranked.map(result=>card(result.product,result.deltas)).join(''):'<p class="empty">No available pair has every selected measurement yet.</p>';updatePrices();section.scrollIntoView({behavior:'smooth'});
  });
}

renderListings();renderPair();setupFinder();
