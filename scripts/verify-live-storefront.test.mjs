import assert from 'node:assert/strict';
import {deploymentMarkerMatches} from './verify-live-storefront.mjs';

const now=Date.parse('2026-08-20T12:00:00Z');
assert.equal(deploymentMarkerMatches({deployment_token:'run-1',generated_at:'2026-08-20T11:55:00Z'},'run-1',now),true);
assert.equal(deploymentMarkerMatches({deployment_token:'older-run',generated_at:'2026-08-20T11:55:00Z'},'run-1',now),false);
assert.equal(deploymentMarkerMatches({deployment_token:'run-1',generated_at:'2026-08-20T10:00:00Z'},'run-1',now),false);
assert.equal(deploymentMarkerMatches(null,'run-1',now),false);
console.log('PASS: Storefront deployment watchdog');
