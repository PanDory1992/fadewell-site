import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const pages=['index.html','shop.html','pair.html','finder.html','archive.html'];
for(const page of pages){
  const html=readFileSync(new URL(page,import.meta.url),'utf8');
  assert.match(html,/<html lang="en">/,`${page} must remain English`);
  assert.match(html,/storefront\.css/,`${page} must use storefront styles`);
  assert.match(html,/storefront\.js/,`${page} must use the shared storefront app`);
}

const app=readFileSync(new URL('storefront.js',import.meta.url),'utf8');
assert.match(app,/fadewell_storefront_products/,'frontend must use the public storefront projection');
assert.doesNotMatch(app,/service[_-]?role/i,'frontend must never contain a service-role credential');
assert.doesNotMatch(app,/select=\*/,'frontend must request an explicit public field allowlist');
assert.match(app,/View & buy on Vinted/,'Pair Files must hand purchase off to Vinted');
assert.match(app,/p\.available&&!p\.sold/,'Shop and Finder must exclude unavailable or sold pairs');
assert.match(app,/archive\?p\.sold/,'Pair Archive must contain sold pairs');

const allHtml=pages.map(page=>readFileSync(new URL(page,import.meta.url),'utf8')).join('\n');
assert.doesNotMatch(allHtml,/<form[^>]+action=/i,'storefront must not implement a checkout form');
console.log(`PASS: checked ${pages.length} storefront pages and the public-data contract`);
