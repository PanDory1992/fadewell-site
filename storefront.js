import {MEASURE_LABELS,cleanNotes,displayFit,displaySize} from './storefront-utils.js';

const API_URL='https://qgjkxtolyhbwpvncwtkn.supabase.co/rest/v1/fadewell_storefront_products';
const API_KEY='sb_publishable_4I4sJO02Tudp00ALX2xbaQ_DHptnBLb';
const VINTED_PROFILE='https://www.vinted.pl/member/271911480-falkafalka35';
let products=[];

function header(){return `<div class="site-header"><nav class="nav shell" aria-label="Main navigation"><a class="wordmark" href="index.html" aria-label="FADEWELL home"><img src="fadewell-wordmark.png" alt="FADEWELL"></a><button class="mobile-toggle" aria-expanded="false">Menu</button><div class="nav-links"><a data-nav="shop" href="shop.html">Shop</a><a data-nav="finder" href="finder.html">Denim Finder</a><a data-nav="archive" href="archive.html">Pair Archive</a><a href="https://www.instagram.com/byfadewell/" target="_blank" rel="noopener">Journal ↗</a><a class="button primary nav-vinted" href="${VINTED_PROFILE}" target="_blank" rel="noopener">Vinted ↗</a></div></nav></div>`}
function footer(){return `<div class="site-footer"><div class="shell"><div class="footer-grid"><div class="footer-brand"><img src="fadewell-wordmark.png" alt="FADEWELL"><p>Vintage Jeans &amp; Denim. Measured. Checked. Worn well.</p></div><nav class="footer-links" aria-label="Footer"><a href="https://www.instagram.com/byfadewell/" target="_blank" rel="noopener">Instagram @byfadewell</a><a href="https://share.google/fnyhYT1W28vR7XISJ" target="_blank" rel="noopener">Google profile</a><a href="mailto:hello@fadewell.eu">hello@fadewell.eu</a></nav></div><div class="footer-base">© 2026 FADEWELL · EST. 2023 — Warsaw, Poland.</div></div></div>`}

document.querySelector('[data-site-header]')?.insertAdjacentHTML('afterbegin',header());
document.querySelector('[data-site-footer]')?.insertAdjacentHTML('afterbegin',footer());
const page=document.body.dataset.page;
document.querySelector(`[data-nav="${page}"]`)?.setAttribute('aria-current','page');
document.querySelector('.mobile-toggle')?.addEventListener('click',event=>{const nav=document.querySelector('.nav-links');nav.classList.toggle('open');event.currentTarget.setAttribute('aria-expanded',String(nav.classList.contains('open')))});

function safe(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function money(value){return value==null?'Price on Vinted':new Intl.NumberFormat('en-GB',{style:'currency',currency:'PLN',maximumFractionDigits:0}).format(Number(value))}
function m(product,key){return product.measurements?.[key]?.cm}
function pairUrl(product){return `pair.html?id=${encodeURIComponent(product.vinted_item_id)}`}

function card(product,deltas,options={}){
  const photo=product.photos?.[0]||'',showPrice=options.showPrice!==false;
  return `<article class="product-card"><a class="card-photo" href="${pairUrl(product)}"><img loading="lazy" src="${safe(photo)}" alt="${safe(product.title||'Vintage pair')}"><span class="badge ${product.sold?'sold':''}">${product.sold?'Sold archive':safe(product.garment_type==='JEANS'?'Jeans':'Trousers')}</span></a><div class="card-body"><div class="card-meta"><span>${safe(product.brand||'Unbranded')}</span><span>${safe(displaySize(product))}</span></div><h3 class="card-title"><a href="${pairUrl(product)}">${safe(product.title||'Untitled pair')}</a></h3><div class="card-measures"><span>W ${m(product,'waist')??'—'} cm</span><span>R ${m(product,'rise')??'—'} cm</span><span>L ${m(product,'overall_length')??'—'} cm</span></div>${deltas?`<ul class="delta-list">${deltas.map(delta=>`<li>${safe(MEASURE_LABELS[delta.key])}: <strong>${delta.delta>0?'+':''}${delta.delta.toFixed(1)} cm</strong></li>`).join('')}</ul>`:''}${showPrice?`<p class="card-price">${product.sold?'Reference pair':money(product.price_pln)}</p>`:''}</div></article>`;
}

async function loadProducts(){
  const fields='vinted_item_id,title,brand,dna_tagged_size,dna_fit,garment_type,description_raw,measurements,photos,price_pln,vinted_url,available,sold,first_seen_at,last_seen_at,sold_at,updated_at';
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
    else node.innerHTML=shown.length?shown.map(product=>card(product,null,{showPrice:page!=='home'})).join(''):`<p class="empty">${archive?'The Pair Archive is being assembled.':'No published pairs are available at this moment.'}</p>`;
  }catch(error){showError(node,error)}
}

function setupFilters(node,source){
  const form=document.querySelector('[data-filters]'),count=document.querySelector('[data-count]'),sort=document.querySelector('[data-sort]');
  const draw=()=>{const data=new FormData(form),query=String(data.get('q')||'').toLowerCase(),type=data.get('type'),waist=Number(data.get('waist')||Infinity),inseam=Number(data.get('inseam')||0);let shown=source.filter(product=>(!query||`${product.title} ${product.brand} ${product.description_raw}`.toLowerCase().includes(query))&&(!type||product.garment_type===type)&&(m(product,'waist')??Infinity)<=waist&&(m(product,'inseam')??0)>=inseam);shown.sort((a,b)=>sort.value==='price-asc'?(a.price_pln??Infinity)-(b.price_pln??Infinity):sort.value==='price-desc'?(b.price_pln??-1)-(a.price_pln??-1):sort.value==='waist'?(m(a,'waist')??Infinity)-(m(b,'waist')??Infinity):new Date(b.updated_at)-new Date(a.updated_at));count.textContent=`${shown.length} ${shown.length===1?'pair':'pairs'}`;node.innerHTML=shown.length?shown.map(product=>card(product)).join(''):'<p class="empty">No pair matches those filters. Try widening one measurement.</p>'};
  form.addEventListener('input',draw);form.addEventListener('reset',()=>setTimeout(draw));sort.addEventListener('change',draw);draw();
}

async function renderPair(){
  const node=document.querySelector('[data-pair]');if(!node)return;
  try{
    const id=new URLSearchParams(location.search).get('id');if(!id)throw new Error('Missing pair id');
    products=await loadProducts();const product=products.find(item=>String(item.vinted_item_id)===id);if(!product)throw new Error('Pair not found');
    document.title=`${product.title||'The pair'} — FADEWELL`;
    const measures=Object.entries(MEASURE_LABELS).filter(([key])=>m(product,key)!=null).map(([key,label])=>`<div class="measure-row"><span>${label}</span><strong>${m(product,key)} cm</strong></div>`).join('');
    const gallery=(product.photos||[]).map((url,index)=>`<img loading="${index?'lazy':'eager'}" src="${safe(url)}" alt="${safe(product.title||'Vintage pair')}, photo ${index+1}">`).join('');
    const buy=product.available?`<a class="button primary pair-cta" href="${safe(product.vinted_url)}" target="_blank" rel="noopener">View & buy on Vinted ↗</a>`:`<span class="button pair-cta" aria-disabled="true">Sold — kept in the Pair Archive</span>`;
    const notes=cleanNotes(product.description_raw);
    node.innerHTML=`<a class="back-link" href="${product.sold?'archive.html':'shop.html'}">← Back to ${product.sold?'archive':'shop'}</a><div class="pair-grid"><div class="pair-gallery">${gallery}</div><article class="pair-info"><p class="pair-sub">Measured · checked · worn well</p><h1>${safe(product.title||'Untitled pair')}</h1><p class="pair-price">${product.sold?'Sold':money(product.price_pln)}</p><div class="pair-details"><div class="pair-detail"><small>Brand</small>${safe(product.brand||'Not stated')}</div><div class="pair-detail"><small>Size</small>${safe(displaySize(product))}</div><div class="pair-detail"><small>Fit</small>${safe(displayFit(product))}</div></div><h2>Measurements</h2><div class="measure-table">${measures}</div><h2>The pair</h2><p class="pair-notes">${safe(notes||'Pair-specific notes are available on Vinted.')}</p>${buy}</article></div>${product.available?`<a class="button primary sticky-buy" href="${safe(product.vinted_url)}" target="_blank" rel="noopener">View & buy on Vinted ↗</a>`:''}`;
  }catch(error){showError(node,error)}
}

async function setupFinder(){
  const form=document.querySelector('[data-finder]');if(!form)return;
  try{products=(await loadProducts()).filter(product=>product.available&&!product.sold)}catch(error){console.error(error)}
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const entries=[...new FormData(form)].filter(([,value])=>String(value).trim()!=='');
    const errorNode=document.querySelector('[data-finder-error]');
    if(!entries.length){errorNode.hidden=false;return}
    errorNode.hidden=true;
    const wanted=Object.fromEntries(entries.map(([key,value])=>[key,Number(value)]));
    const ranked=products.map(product=>{const deltas=Object.keys(wanted).map(key=>({key,delta:(m(product,key)??999)-wanted[key]}));return {product,deltas,distance:deltas.reduce((sum,delta)=>sum+Math.abs(delta.delta),0)}}).filter(result=>result.deltas.every(delta=>Math.abs(delta.delta)<900)).sort((a,b)=>a.distance-b.distance).slice(0,12);
    const section=document.querySelector('[data-finder-results]'),node=document.querySelector('[data-finder-products]');section.hidden=false;node.innerHTML=ranked.length?ranked.map(result=>card(result.product,result.deltas)).join(''):'<p class="empty">No available pair has every selected measurement yet.</p>';section.scrollIntoView({behavior:'smooth'});
  });
}

renderListings();renderPair();setupFinder();
