'use strict';
/* Netlify build: copies the site into dist/ and writes config.js from environment variables.
   Refuses to build if a secret / service_role key was supplied by mistake. */
const fs = require('fs'), path = require('path');
const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, ''), key = (process.env.SUPABASE_ANON_KEY || '').trim();
const fail = m => { console.error('\nBUILD STOPPED: ' + m + '\n'); process.exit(1); };
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) && !/^http:\/\/localhost:\d+$/.test(url)) fail('SUPABASE_URL must look like https://xxxxxxxx.supabase.co');
if (!key) fail('SUPABASE_ANON_KEY is missing');
if (key.startsWith('sb_secret_')) fail('That is a SECRET key. Use only the anon / publishable key.');
if (key.split('.').length === 3) {
  let role; try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role; } catch { fail('SUPABASE_ANON_KEY is not a valid key'); }
  if (role !== 'anon') fail(`That key has role "${role}". Only the "anon" key may be used in a website - never service_role.`);
} else if (!key.startsWith('sb_publishable_')) fail('Unrecognised key format. Use the anon (JWT) or sb_publishable_ key.');
fs.rmSync('dist', { recursive: true, force: true }); fs.mkdirSync('dist');
for (const f of fs.readdirSync('.')) if (fs.statSync(f).isFile() && /\.(html|css|js|jpe?g|png|webp|svg|ico)$/i.test(f) && !['build.js', 'config.js'].includes(f)) fs.copyFileSync(f, path.join('dist', f));
fs.writeFileSync('dist/config.js', `window.PF_CONFIG=${JSON.stringify({ url, key })};\n`);
console.log('Built dist/ with', fs.readdirSync('dist').length, 'files');
