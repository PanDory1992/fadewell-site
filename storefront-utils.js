export const MEASURE_LABELS={waist:'Waist, flat',rise:'Rise',inseam:'Inseam',leg_opening:'Leg opening, flat',overall_length:'Overall length',thigh:'Thigh, flat',hips:'Hips, flat'};

export function cleanNotes(value){
  const lines=String(value||'').replace(/\r/g,'').split('\n');
  const heading=/^\s*(?:measurements?|dimensions?)\b.*$/i;
  const measurement=/^\s*(?:[•*\-]\s*)?(?:waist|front rise|rise|inseam|inside leg|leg opening|overall length|outseam|thigh|hips?)\b/i;
  const cutAt=lines.findIndex(line=>heading.test(line)||(measurement.test(line)&&/\d/.test(line)));
  const before=(cutAt<0?lines:lines.slice(0,cutAt)).join('\n');
  return before.replace(/\bAuthentic[^\n]*?,\s*carefully checked and (?:hand-)?measured by me\.\s*/gi,'').replace(/\n{3,}/g,'\n\n').trim();
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
export function displayOrigin(product){
  const origin=String(product?.dna_origin||'').replace(/^made\s+in\s+/i,'').trim();
  const era=String(product?.dna_era||'').trim();
  const year=era.match(/\b(?:19|20)\d{2}\b/)?.[0]||era;
  if(!origin)return year?`Origin not recorded — ${year}`:'Not recorded';
  return `Made in ${titleCase(origin)}${year?` — ${year}`:''}`;
}
export function displayColor(product){return titleCase(product?.dna_color)||'Not recorded'}
