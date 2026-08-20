import assert from 'node:assert/strict';
import {latestTimestampAgeMinutes} from './verify-live-storefront.mjs';

const now=Date.parse('2026-08-20T12:00:00Z');
assert.equal(latestTimestampAgeMinutes([
  {updated_at:'2026-08-20T10:00:00Z'},
  {updated_at:'2026-08-20T11:45:00Z'},
],now),15);
assert.throws(()=>latestTimestampAgeMinutes([],now),/empty/);
assert.throws(()=>latestTimestampAgeMinutes([{updated_at:null}],now),/freshness/);
console.log('PASS: Storefront freshness watchdog');
