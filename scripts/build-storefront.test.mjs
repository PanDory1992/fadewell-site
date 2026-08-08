import assert from 'node:assert/strict';
import {pairHtml,relatedProducts} from './build-storefront.mjs';

const base={vinted_item_id:'123',title:"Levi's 501 — W30 L32",brand:"Levi's",garment_type:'JEANS',description_raw:'Condition is honestly described.\nMeasurements:\nWaist: 40 cm',measurements:{waist:{cm:40}},photos:['https://img.test/one.webp'],display_photos:['/generated/one.webp'],card_photo_url:'/generated/card.webp',price_pln:129,vinted_url:'https://www.vinted.pl/items/123',available:true,sold:false,updated_at:'2026-08-02T00:00:00Z'};
const related=[{...base,vinted_item_id:'124',title:'Lee straight jeans',measurements:{waist:{cm:41}}}];
const html=pairHtml(base,related);
const rangedHtml=pairHtml({...base,measurements:{waist:{cm:40,min_cm:39,max_cm:41,display:'39–41 cm'}}},related);
assert.match(html,/<link rel="canonical" href="https:\/\/fadewell\.eu\/pairs\/123\/">/);
assert.match(html,/type="application\/ld\+json"/);
assert.match(html,/Condition is honestly described\./,'honest natural-language condition prose must remain');
assert.match(rangedHtml,/39–41 cm/,'static Pair Files must display explicit measurement ranges');
assert.match(html,/globalThis\.__FADEWELL_PAIR__/);
assert.match(html,/\/pairs\/124\//,'static Pair Files must expose related internal links');
const descriptionMeta=html.match(/<meta name="description" content="([^"]*)">/)?.[1]||'';
assert.doesNotMatch(descriptionMeta,/Measurements|Waist/,'duplicated measurement block must not enter metadata');
assert.match(html,/<article class="pair-index-copy">[\s\S]*Condition is honestly described\./,'Pair File must contain indexable product copy before JavaScript runs');
assert.equal(relatedProducts(base,related,4)[0].vinted_item_id,'124');
console.log('PASS: static Pair SEO, honest condition prose and related links');
