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
