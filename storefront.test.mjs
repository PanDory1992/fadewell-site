import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const pages=['index.html','shop.html','pair.html','finder.html','archive.html'];
for(const page of pages){
  const html=readFileSync(new URL(page,import.meta.url),'utf8');
  assert.match(html,/<html lang="en">/,`${page} must remain English`);
  assert.match(html,/storefront\.css/,`${page} must use storefront styles`);
  assert.match(html,/storefront\.js/,`${page} must use the shared storefront app`);
}

const home=readFileSync(new URL('index.html',import.meta.url),'utf8');
assert.match(home,/data-limit="5"/,'home must request five pairs');
assert.match(home,/Measured &middot; checked &middot; worn well/i,'home must use the approved brand line');
assert.equal((home.match(/class="hero-img"/g)||[]).length,3,'hero must rotate three images');
assert.match(home,/Sweden, Denmark, Finland/,'shipping countries section must be restored');
assert.match(home,/hero-message-cycle[\s\S]*Find the pair<\/span><span>that already fits<\/span><span>your life\.<\/span>[\s\S]*fadewell-lockup\.png/,'hero message must use three fixed lines and alternate with the original lockup');
assert.match(home,/Wardrobe curated by me/i,'home wardrobe label must use approved copy');
assert.match(home,/One promise runs through the whole shop/,'decoded section must use original copy');
assert.match(home,/Real vintage, checked against the tells of reproductions and fakes/,'decoded features must use original copy');
assert.match(home,/buy with Vinted's buyer protection and bundle discounts/,'Vinted section must use original copy');
assert.doesNotMatch(home,/Open the shop|Not on Vinted\?/,'Vinted section must not show old action buttons');

const finder=readFileSync(new URL('finder.html',import.meta.url),'utf8');
assert.doesNotMatch(finder,/<input required/i,'Finder measurements must all be optional');
assert.match(finder,/One field is enough/,'Finder must explain partial measurement matching');
assert.match(finder,/finder-intro[\s\S]*<span>Enter one measurement[\s\S]*<span>We compare only those numbers/,'Finder intro sentences must be separate lines');
assert.match(finder,/finder-instructions[\s\S]*<span>Fasten it[\s\S]*<span>A difference is not automatically bad/,'Finder instructions must be separate lines');
assert.doesNotMatch(finder,/Every result opens a complete Pair File/,'Finder must omit the redundant Pair File sentence');

const app=readFileSync(new URL('storefront.js',import.meta.url),'utf8');
assert.match(app,/Vintage Jeans &amp; Denim\. Measured\. Checked\. Worn well\./,'footer must restore original tagline');
assert.match(app,/Google profile/,'footer must restore original links');
assert.doesNotMatch(app,/Shop on Vinted/,'footer must not include a Shop on Vinted link');
const css=readFileSync(new URL('storefront.css',import.meta.url),'utf8');
assert.match(css,/heroCopyText 10s/,'hero copy and logo must alternate every five seconds');
assert.match(css,/\.hero \.lede,\.decoded-head>p\{font-size:clamp\(16px,1\.8vw,19px\)/,'hero and decoded paragraphs must share the same font size');
assert.match(css,/translateX\(-115%\)/,'hero message must slide fully off-frame');
assert.doesNotMatch(css,/@keyframes heroCopy(?:Text|Logo)[^}]*opacity:0/,'hero slider must not ghost through an opacity crossfade');
assert.match(app,/fadewell_storefront_products/,'frontend must use the public storefront projection');
assert.doesNotMatch(app,/service[_-]?role/i,'frontend must never contain a service-role credential');
assert.doesNotMatch(app,/select=\*/,'frontend must request an explicit public field allowlist');
assert.match(app,/View & buy on Vinted/,'product pages must hand purchase off to Vinted');
assert.match(app,/product\.available&&!product\.sold/,'Shop and Finder must exclude unavailable or sold pairs');
assert.match(app,/archive\?product\.sold/,'Pair Archive must contain sold pairs');
assert.match(app,/sort\(\(a,b\)=>\(b\.price_pln/,'home must rank by highest price');
assert.match(app,/showPrice:page!==['"]home['"]/,'home cards must hide prices');
assert.match(app,/L \$\{m\(product,'overall_length'\)/,'cards must label overall length as L');
assert.doesNotMatch(app,/condition_label|vinted_category|size_label/,'product UI must not request Vinted condition, category or tagged size');
assert.match(app,/<small>Fit<\/small>/,'product page must show fit');
assert.match(app,/<small>Origin<\/small>/,'product page must show DNA origin');
assert.match(app,/<small>Color<\/small>/,'product page must show DNA color');
assert.match(app,/dna_origin,dna_era,dna_color/,'public query must request the new DNA display fields');
assert.match(app,/api\.nbp\.pl\/api\/exchangerates\/rates\/a\/eur/,'EUR switch must use the official NBP average-rate API');
assert.match(app,/data-gallery-thumbs/,'pair page must use a bounded thumbnail gallery');
assert.match(css,/\.pair-hero-photo img\{[^}]*object-fit:contain/,'pair hero photos must never be cropped');
assert.match(app,/String\(value\)\.trim\(\)!==''/,'Finder must compare only filled measurements');

const utilsSource=readFileSync(new URL('storefront-utils.js',import.meta.url),'utf8');
const utils=await import(`data:text/javascript;base64,${Buffer.from(utilsSource).toString('base64')}`);
const listing=`Authentic Levi’s 535-0285 regular fit jeans, carefully checked and hand-measured by me.\nA softly faded everyday pair.\n\nMeasurements, hand-measured flat by me:\nWaist: 40 cm\nRise: 28 cm\nOne-off piece — only one available in this size.\n⭐ 200+ five-star reviews – buy with confidence.\nFast shipping, happy to answer questions.`;
assert.equal(utils.cleanNotes(listing),'A softly faded everyday pair.','description must stop before measurements and closing clause');
assert.equal(utils.displaySize({title:"Levi's 535 — W30 L30 — Made in UK"}),'W30 L30','size must come from listing text');
assert.equal(utils.displayFit({title:'Regular straight jeans'}),'Straight');
assert.equal(utils.displayFit({title:'Relaxed tapered jeans'}),'Relaxed Tapered');
assert.equal(utils.displaySize({dna_tagged_size:'W36 L32',title:'Jeans W30 L30'}),'W36 L32','DNA size must win over listing text');
assert.equal(utils.displayFit({dna_fit:'Relaxed Tapered',title:'Straight jeans'}),'Relaxed Tapered','DNA fit must win over listing text');
assert.equal(utils.displayOrigin({dna_origin:'USA',dna_era:'1992'}),'Made in USA — 1992');
assert.equal(utils.displayColor({dna_color:'mid blue'}),'Mid Blue');
assert.equal(utils.displayTitle({title:'Levi’s 501 Selvedge White Oak Cone Denim – Mid Blue – W26 (28) L32 Size M – Rare Piece'}),'Levi’s 501 Selvedge White Oak Cone Denim');

const allHtml=pages.map(page=>readFileSync(new URL(page,import.meta.url),'utf8')).join('\n');
assert.doesNotMatch(allHtml,/<form[^>]+action=/i,'storefront must not implement a checkout form');
console.log(`PASS: checked ${pages.length} storefront pages, partial Finder input, cleaned pair copy and home contracts`);
