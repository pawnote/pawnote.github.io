PAWNOTE API (Cloudflare Worker) - setup, about 10 minutes
=========================================================
This is the only place your Razorpay SECRET lives. It is never in the website files.

1. Google Sheet
   - Open your Apps Script project, paste google-apps-script.gs (in the source folder), Save.
   - Project Settings > Script properties > add  TOKEN = any long random text (e.g. 30+ characters).
   - Delete the old "Orders" tab (headers changed), then Deploy > New deployment > Web app,
     Execute as: Me, Who has access: Anyone. Copy the /exec URL.
2. Cloudflare Worker
   - Free account at cloudflare.com. In a terminal in this worker folder:
       npm i -g wrangler
       wrangler login
       wrangler deploy
       wrangler secret put RAZORPAY_KEY_SECRET     (paste the secret when asked)
       wrangler secret put SHEET_URL               (the /exec URL from step 1)
       wrangler secret put SHEET_TOKEN             (the same TOKEN as step 1)
   - Edit wrangler.toml: ALLOWED_ORIGIN = your site, e.g. https://shrey-iitk.github.io  (no path, no slash)
   - Optional vars: COUPONS and CATALOG as JSON to change coupons/prices without editing code.
3. Website: copy the Worker URL into  apiBase  in config.js (e.g. https://pawnote-api.you.workers.dev), then run
       npm install && node build.mjs
   and upload the CONTENTS of the dist folder to GitHub.
4. Test: open https://<worker-url>/api/health. Then make a gift, pay with Razorpay TEST mode
   (card 4111 1111 1111 1111, any future date, any CVV; or UPI success@razorpay).
5. Going live: ROTATE your Razorpay secret (it was pasted in chat), switch to Live keys,
   update RAZORPAY_KEY_ID in wrangler.toml and run `wrangler secret put RAZORPAY_KEY_SECRET` again.
   Razorpay dashboard > Settings > Payment capture: Automatic.
Local use: copy .env.example to .env (never commit it). The .gitignore already excludes it.
