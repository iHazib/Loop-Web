import '../env.js';
import * as db from '../portal/db.js';
import { syncBrand } from '../portal/sync.js';

/* Daily Keepa + Loop Protect run for every brand.
   Schedule on the server, e.g. crontab:  0 6 * * *  cd /srv/loop-web && npm run job:keepa
   (Vercel alternative: a cron calling POST /api/portal/cron/keepa with CRON_SECRET.) */

const brands = await db.listBrands();
let failed = 0;
for (const b of brands) {
  try {
    const r = await syncBrand(b.id);
    console.log(`[keepa] ${b.id}: ${r.asins} ASINs, ${r.opened} new cases, ${r.resolved} resolved, tokens left ${r.tokensLeft}`);
  } catch (e) {
    failed++;
    console.error(`[keepa] ${b.id}: ${e instanceof Error ? e.message : e}`);
  }
}
process.exit(failed ? 1 : 0);
