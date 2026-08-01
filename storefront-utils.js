export const MEASURE_LABELS={waist:'Waist, flat',rise:'Rise',inseam:'Inseam',leg_opening:'Leg opening, flat',overall_length:'Overall length',thigh:'Thigh, flat',hips:'Hips, flat'};

export function cleanNotes(value){
  const lines=String(value||'').replace(/\r/g,'').split('\n');
  const heading=/^\s*(?:measurements?|dimensions?)\b.*$/i;
  const measurement=/^\s*(?:[•*\-]\s*)?(?:waist|front rise|rise|inseam|inside leg|leg opening|overall length|outseam|thigh|hips?)\b/i;
  const cutAt=lines.findIndex(line=>heading.test(line)||(measurement.test(line)&&/\d/.test(line)));
  const before=(cutAt<0?lines:lines.slice(0,cutAt)).join('\n');
  return before
    .replace(/^\s*[^.!?\n]{1,500}?\bby me(?:\s*[.!?])?(?:\s*[^\p{L}\p{N}\n])*\s*/iu,'')
    .replace(/^\s*Authentic[^\n]*carefully checked and (?:hand-)?measured by me[^\n]*\n?/gim,'')
    .replace(/^\s*Condition\s*:[^\n]*\n?/gim,'')
    .replace(/\n{3,}/g,'\n\n')
    .trim();
}

function matchWaistLength(value){const match=String(value||'').match(/\bW\s*([2-6]\d)\b[\s\S]{0,32}?\bL\s*([2-4]\d)\b/i);return match?`W${match[1]} L${match[2]}`:null}
function cleanDnaSize(value){const text=String(value||'').trim();if(!text)return null;const both=matchWaistLength(text);if(both)return both;const waist=text.match(/\bW\s*([2-6]\d)\b/i);return waist?`W${waist[1]}`:null}
export function displaySize(product){const dna=cleanDnaSize(product?.dna_tagged_size);if(dna)return dna;const title=String(product?.title||''),description=String(product?.description_raw||'');const both=matchWaistLength(title)||matchWaistLength(description);if(both)return both;const waist=title.match(/\bW\s*([2-6]\d)\b/i);return waist?`W${waist[1]}`:'See measurements'}

export function displayFit(product){
  const dna=String(product?.dna_fit||'').trim();
  if(dna)return dna.replace(/\b\w/g,letter=>letter.toUpperCase());
  const text=`${product?.title||''} ${cleanNotes(product?.description_raw||'')}`.toLowerCase();
  const rules=[[/\brelaxed\b[\s-]*\btapered?\b|\btapered?\b[\s-]*\brelaxed\b/,'Relaxed Tapered'],[/\bslim\b[\s-]*\btapered?\b/,'Slim Tapered'],[/\brelaxed\b[\s-]*\bstraight\b/,'Relaxed Straight'],[/\bregular\b[\s-]*\bstraight\b/,'Straight'],[/\bwide[ -]?leg\b/,'Wide Leg'],[/\bbootcut\b/,'Bootcut'],[/\bflare(?:d)?\b/,'Flared'],[/\bskinny\b/,'Skinny'],[/\bslim\b/,'Slim'],[/\btapered?\b/,'Tapered'],[/\bstraight\b/,'Straight'],[/\brelaxed\b/,'Relaxed'],[/\bloose\b/,'Loose'],[/\bbaggy\b/,'Baggy']];
  return rules.find(([pattern])=>pattern.test(text))?.[1]||'See garment notes';
}

const TITLE_TRAILER=/\b(?:W\s*\d{2}|L\s*\d{2}|size\s+[a-z0-9]+|made\s+in|USA|United States|UK|United Kingdom|Japan|Mexico|Poland|Italy|France|Spain|Turkey|Tunisia|Portugal|Romania|Bulgaria|Morocco|China|Pakistan|Bangladesh|Sri Lanka|Egypt|mid[ -]?blue|dark[ -]?blue|light[ -]?blue|stonewash|black|grey|gray|indigo|navy|ecru|cream|white|brown|khaki|green|red|orange|rare piece|button fly|zip fly)\b/i;

export function displayTitle(product){
  const text=String(product?.title||'').trim();
  if(!text)return 'Untitled pair';
  const parts=text.split(/\s+(?:[|–—]|-(?=\s))\s+/).filter(Boolean);
  const cut=parts.findIndex((part,index)=>index>0&&TITLE_TRAILER.test(part));
  const clean=(cut<0?parts:parts.slice(0,cut)).join(' — ')
    .replace(/\s+W\s*\d{2}\b[\s\S]*$/i,'')
    .replace(/\s+Made\s+in\b[\s\S]*$/i,'')
    .trim();
  return clean||text;
}

function titleCase(value){const text=String(value||'').trim();return /^(?:usa|uk)$/i.test(text)?text.toUpperCase():text.replace(/\b\w/g,letter=>letter.toUpperCase())}
function measurement(product,key){const value=Number(product?.measurements?.[key]?.cm);return Number.isFinite(value)?value:null}
export function displayOrigin(product){
  const origin=String(product?.dna_origin||'').replace(/^made\s+in\s+/i,'').trim();
  const era=String(product?.dna_era||'').trim();
  const year=era.match(/\b(?:19|20)\d{2}\b/)?.[0]||era;
  if(!origin)return year?`Origin not recorded — ${year}`:'Not recorded';
  return `Made in ${titleCase(origin)}${year?` — ${year}`:''}`;
}

export function colourProfile(product){
  const raw=String(product?.dna_color||'').trim(),text=raw.toLowerCase();
  if(!raw)return {raw:'',family:'Not decoded',tone:null,finish:null,label:'Not decoded',source:'Missing DNA'};
  const family=[
    [/\b(?:grey|gray|charcoal|graphite|silver)\b/,'Grey'],
    [/\b(?:blue|indigo|navy)\b/,'Blue'],
    [/\bblack\b/,'Black'],[/\b(?:white|ivory)\b/,'White'],[/\b(?:ecru|cream)\b/,'Ecru'],
    [/\b(?:beige|sand|khaki|tan)\b/,'Beige'],[/\bbrown\b/,'Brown'],[/\b(?:green|olive)\b/,'Green'],
    [/\b(?:red|burgundy|maroon)\b/,'Red'],[/\borange\b/,'Orange'],[/\byellow\b/,'Yellow'],[/\bpurple\b/,'Purple'],
  ].find(([pattern])=>pattern.test(text))?.[1]||titleCase(raw);
  const tone=/\b(?:dark|black|charcoal|navy)\b/.test(text)?'Dark':/\b(?:light|pale|bleach|white|ecru|cream)\b/.test(text)?'Light':/\b(?:mid|medium)\b/.test(text)?'Mid':null;
  const finish=[
    [/acid[ -]?wash/,'Acid Wash'],[/stone[ -]?wash/,'Stonewash'],[/\b(?:faded|fade)\b/,'Faded'],
    [/\braw\b/,'Raw'],[/\brinse\b/,'Rinse'],[/over[ -]?dyed/,'Overdyed'],[/\bcoated\b/,'Coated'],[/\bbleach(?:ed)?\b/,'Bleached'],
  ].find(([pattern])=>pattern.test(text))?.[1]||null;
  const label=`${tone?`${tone} `:''}${family}${finish?` · ${finish}`:''}`;
  return {raw,family,tone,finish,label,source:'DNA'};
}

export function silhouetteProfile(product){
  const dna=String(product?.dna_fit||'').trim(),fallback=displayFit(product),raw=dna||fallback;
  const text=raw.toLowerCase(),thigh=measurement(product,'thigh'),opening=measurement(product,'leg_opening');
  const ratio=thigh&&opening?opening/thigh:null;
  let label=null,ease=null,legShape=null,explicitShape=false;
  if(/\b(?:wide|baggy)\b/.test(text)){label='Wide & Relaxed';ease='Loose';legShape='Wide';explicitShape=true}
  else if(/\bflare(?:d)?\b/.test(text)){label='Flared';legShape='Flared';explicitShape=true}
  else if(/\bbootcut\b/.test(text)){label='Bootcut';legShape='Bootcut';explicitShape=true}
  else if(/\bskinny\b/.test(text)){label='Narrow & Tapered';ease='Skinny';legShape='Tapered';explicitShape=true}
  else if(/\bslim\b.*\btapered?\b|\btapered?\b.*\bslim\b/.test(text)){label='Narrow & Tapered';ease='Slim';legShape='Tapered';explicitShape=true}
  else if(/\b(?:relaxed|loose)\b.*\btapered?\b|\btapered?\b.*\b(?:relaxed|loose)\b/.test(text)){label='Roomy Top · Tapered Leg';ease='Relaxed';legShape='Tapered';explicitShape=true}
  else if(/\bregular\b.*\btapered?\b|\btapered?\b.*\bregular\b/.test(text)){label='Regular Tapered';ease='Regular';legShape='Tapered';explicitShape=true}
  else if(/\bslim\b.*\bstraight\b|\bstraight\b.*\bslim\b/.test(text)){label='Slim Straight';ease='Slim';legShape='Straight';explicitShape=true}
  else if(/\b(?:relaxed|loose)\b.*\bstraight\b|\bstraight\b.*\b(?:relaxed|loose)\b/.test(text)){label='Roomy Straight';ease='Relaxed';legShape='Straight';explicitShape=true}
  else if(/\bstraight\b/.test(text)){label='Clean Straight';ease=/\bregular\b/.test(text)?'Regular':null;legShape='Straight';explicitShape=true}
  else if(/\btapered?\b/.test(text)){label='Tapered Leg';legShape='Tapered';explicitShape=true}
  if(!explicitShape&&ratio!=null){
    const tapered=ratio<=.68;
    if(/\b(?:relaxed|loose)\b/.test(text)){label=tapered?'Roomy Top · Tapered Leg':'Roomy Straight';ease='Relaxed';legShape=tapered?'Tapered':'Straight'}
    else if(/\bslim\b/.test(text)){label=tapered?'Narrow & Tapered':'Slim Straight';ease='Slim';legShape=tapered?'Tapered':'Straight'}
    else if(/\bregular\b/.test(text)){label=tapered?'Regular Tapered':'Clean Straight';ease='Regular';legShape=tapered?'Tapered':'Straight'}
    else {label=tapered?'Tapered Leg':'Straight Leg';legShape=tapered?'Tapered':'Straight'}
  }
  if(!label){
    if(/\b(?:relaxed|loose)\b/.test(text)){label='Relaxed Fit';ease='Relaxed'}
    else if(/\bslim\b/.test(text)){label='Slim Fit';ease='Slim'}
    else if(/\bregular\b/.test(text)){label='Regular Fit';ease='Regular'}
    else label='Shape not decoded';
  }
  const source=dna?'DNA':fallback!=='See garment notes'?'Listing':ratio!=null?'Measurements':'Insufficient evidence';
  const confidence=dna&&explicitShape?'high':explicitShape||ratio!=null?'medium':'low';
  return {raw:dna||'',label,ease,legShape,ratio,source,confidence};
}

export function displayColor(product){return colourProfile(product).label}
