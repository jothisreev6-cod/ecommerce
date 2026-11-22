(() => {
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CATS = ['Cup Sambarani', 'Agarbathi', 'Dhoop & Cones', 'Pooja Essentials'];
const TABS = [['overview', '📊 Overview'], ['products', '📦 Products'], ['delivery', '🚚 Free Delivery'], ['hero', '🖼 Hero Banner'], ['flash', '⚡ Flash Sale'], ['favs', '❤ Favourites'], ['company', '🏢 Company']];
let data, tab = 'overview', dirty = false, editing = null, q = '', tt;
const cfg = window.PF_CONFIG || {}, sb = cfg.url && window.supabase ? window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
const loadAll = async () => {
  const [s, p] = await Promise.all([sb.from('site_settings').select('*').eq('id', 1).single(), sb.from('products').select('*').order('sort').order('created_at')]);
  if (s.error || p.error) throw (s.error || p.error); return PF.map(s.data, p.data);
};
const toast = (m, ok = true) => { const t = $('#toast'); t.textContent = m; t.className = 'show ' + (ok ? 'ok' : 'no'); clearTimeout(tt); tt = setTimeout(() => t.className = '', 3200); };
const setDirty = d => { dirty = d; $('#dirty').hidden = !d; };
const g = (o, p) => p.split('.').reduce((a, k) => a?.[k], o), st = (o, p, v) => { const k = p.split('.'), l = k.pop(); k.reduce((a, x) => a[x], o)[l] = v; };
const src = u => !u ? '' : /^(https?:|\/)/.test(u) ? u : '/' + u;
const thumb = u => u ? `<img src="${esc(src(u))}" alt="" onerror="this.parentNode.textContent='Not found'">` : 'No image';
/* form helpers: a = 'p' (page data) or 'e' (product being edited) */
const mk = (a, get) => ({
  F: (l, p, o = {}) => `<label class="f"><span>${l}</span>${o.area ? `<textarea data-${a}="${p}" rows="${o.area}" placeholder="${esc(o.ph)}">${esc(g(get(), p))}</textarea>` : `<input data-${a}="${p}" type="${o.type || 'text'}" ${o.type === 'number' ? 'min="0"' : ''} value="${esc(g(get(), p))}" placeholder="${esc(o.ph)}">`}${o.hint ? `<small>${o.hint}</small>` : ''}</label>`,
  C: (l, p) => `<label class="chk"><input type="checkbox" data-${a}="${p}" ${g(get(), p) ? 'checked' : ''}> ${l}</label>`,
  I: (l, p) => `<div class="f"><span>${l}</span><div class="imgrow"><div class="thumb">${thumb(g(get(), p))}</div><div><input data-${a}="${p}" value="${esc(g(get(), p))}" placeholder="Image link or file name"><button type="button" class="b2" data-upl="${a}:${p}">⬆ Upload new image</button></div></div></div>`
});
const M = mk('p', () => data), E = mk('e', () => editing);
const card = (h, d, b) => `<section class="card"><h3>${h}</h3><p>${d}</p>${b}</section>`;

/* ---------- views ---------- */
const V = {
  overview() {
    const p = data.products, n = (f) => p.filter(f).length;
    return `<div class="stats"><div class="st"><b>${p.length}</b><span>Products</span></div><div class="st"><b>${n(x => x.available)}</b><span>Available</span></div><div class="st"><b>${n(x => x.featured)}</b><span>Featured</span></div><div class="st"><b>₹${data.settings.freeShip}</b><span>Free delivery above</span></div><div class="st"><b>${data.flash.enabled ? 'ON' : 'OFF'}</b><span>Flash sale</span></div></div>` +
      card('Welcome, Owner 🙏', 'Everything you change here is stored in the database and appears on your website as soon as you press <b>Save Changes</b>.', `<div class="tools">${TABS.slice(1).map(([k, l]) => `<button class="b2" data-tab="${k}">${l}</button>`).join('')}</div>`);
  },
  products() {
    const l = data.products.filter(x => !q || (x.name + x.ta + x.c).toLowerCase().includes(q.toLowerCase()));
    return `<div class="tools"><button class="btn" data-new>＋ Add product</button><input id="pq" type="search" placeholder="Search products…" value="${esc(q)}"></div><div class="card tw"><table><thead><tr><th></th><th>Product</th><th>Price</th><th>Available</th><th>Featured</th><th>Favourite</th><th></th></tr></thead><tbody>${l.map(x => { const ps = x.v.map(v => v.p).filter(Boolean); return `<tr><td><div class="thumb">${thumb(x.img)}</div></td><td><b>${esc(x.name)}</b><br><small>${esc(x.c)}</small></td><td>${ps.length ? '₹' + Math.min(...ps) + (Math.max(...ps) > Math.min(...ps) ? '–' + Math.max(...ps) : '') : '<small>Ask price</small>'}</td>${['available', 'featured', 'favourite'].map(k => `<td><input type="checkbox" data-flag="${x.id}:${k}" ${x[k] ? 'checked' : ''} aria-label="${k}"></td>`).join('')}<td><div class="row-a"><button class="b2" data-edit="${x.id}">Edit</button><button class="b2 dg" data-del="${x.id}">Delete</button></div></td></tr>`; }).join('') || '<tr><td colspan="7">No products found.</td></tr>'}</tbody></table></div>`;
  },
  delivery: () => card('Free Delivery Settings', 'Changing this updates the announcement bar, cart progress bar and delivery calculation across the website.', `<div class="g">${M.F('Minimum order for FREE delivery (₹)', 'settings.freeShip', { type: 'number', hint: 'Set 0 to make all deliveries free.' })}${M.F('Delivery charge below that amount (₹)', 'settings.shipFee', { type: 'number' })}</div>`),
  hero: () => card('Hero Banner', 'The large banner at the top of your homepage.', `<div class="g">${M.F('Heading', 'hero.heading')}${M.F('Promotional offer tag', 'hero.offer')}${M.F('Corner badge', 'hero.badge')}</div><br>${M.F('Description', 'hero.desc', { area: 3 })}<br>${M.I('Banner image', 'hero.image')}<br><div class="g">${M.F('Button 1 text', 'hero.btn1.text')}${M.F('Button 1 link', 'hero.btn1.link', { hint: 'e.g. #products or https://…' })}${M.F('Button 2 text', 'hero.btn2.text')}${M.F('Button 2 link', 'hero.btn2.link')}</div>`),
  flash: () => card('Flash Sale Banner', 'A highlighted strip shown above the hero when turned on.', `${M.C('Show Flash Sale on website', 'flash.enabled')}<br><div class="g">${M.F('Title', 'flash.title', { ph: 'Diwali Mega Sale – 20% off' })}${M.F('Button text', 'flash.btnText')}${M.F('Button link', 'flash.link')}</div><br>${M.F('Offer details', 'flash.text', { area: 2 })}<br>${M.I('Sale image', 'flash.image')}`),
  favs: () => card('Favourite Product Management', 'Customers keep their own private wishlist in their browser. You decide whether it is offered and which products are highlighted.', `${M.C('Enable ♥ wishlist buttons for customers', 'favourites.enabled')}<p style="margin-top:12px">Mark <b>Featured</b> (shown first, ⭐) and <b>Favourite</b> (❤ Customer Favourite label) per product:</p><div class="card tw" style="margin-top:8px"><table><tbody>${data.products.map(x => `<tr><td>${esc(x.name)}</td>${['featured', 'favourite'].map(k => `<td><label class="chk"><input type="checkbox" data-flag="${x.id}:${k}" ${x[k] ? 'checked' : ''}> ${k}</label></td>`).join('')}</tr>`).join('')}</tbody></table></div>`),
  company: () => card('Company Details', 'Shown in the header, footer and About section.', `<div class="g">${M.F('Company name', 'company.name')}${M.F('Tagline', 'company.tagline')}${M.F('Contact number', 'company.phone')}${M.F('WhatsApp number', 'company.whatsapp', { hint: 'With country code, digits only. Orders are sent here.' })}${M.F('Email address', 'company.email', { type: 'email' })}${M.F('Customer support hours / details', 'company.support')}</div><br>${M.I('Company logo', 'company.logo')}<br>${M.F('Company description', 'company.desc', { area: 3 })}<br>${M.F('Address', 'company.address', { area: 2 })}<br>${M.F('About Us', 'company.about', { area: 5 })}<br><div class="g">${M.F('Facebook link', 'company.social.facebook')}${M.F('Instagram link', 'company.social.instagram')}${M.F('YouTube link', 'company.social.youtube')}</div>`)
};
function render() {
  $('#nav').innerHTML = TABS.map(([k, l]) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''}">${l}</button>`).join('');
  $('#title').textContent = TABS.find(t => t[0] === tab)[1].slice(2); $('#view').innerHTML = V[tab]();
}

/* ---------- product editor ---------- */
function editor(p) {
  editing = JSON.parse(JSON.stringify(p)); editing.vtxt = editing.v.map(v => `${v.l} | ${v.p}`).join('\n');
  const d = $('#dlg');
  d.innerHTML = `<div class="dh">${p._new ? 'Add product' : 'Edit product'}</div><form class="db" id="pf">${E.F('Product name *', 'name')}${E.F('Tamil name', 'ta')}<div class="g"><label class="f"><span>Category</span><select data-e="c">${CATS.map(c => `<option ${c === editing.c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>${E.F('Badge text', 'badge', { ph: 'e.g. New' })}</div>${E.F('Description', 'frag', { area: 3 })}${E.I('Product image', 'img')}${E.F('Variants & prices *', 'vtxt', { area: 4, hint: 'One per line as <b>Label | Price</b>. Use price 0 for "Ask Price" (no cart button).' })}<div class="g">${E.C('Available for sale', 'available')}${E.C('Featured', 'featured')}${E.C('Customer favourite', 'favourite')}</div><div class="err" id="pe"></div></form><div class="df"><button class="b2" id="pc">Cancel</button><button class="btn" id="po">Apply</button></div>`;
  d.showModal();
}
function applyEdit() {
  const e = editing, v = e.vtxt.split('\n').map(x => x.trim()).filter(Boolean).map(x => { const i = x.lastIndexOf('|'); return { l: (i < 0 ? x : x.slice(0, i)).trim(), p: i < 0 ? 0 : Number(x.slice(i + 1).trim()) }; });
  const err = !e.name.trim() ? 'Product name is required' : !v.length ? 'Add at least one variant' : v.some(x => !x.l || !Number.isInteger(x.p) || x.p < 0) ? 'Each variant needs a label and a whole-number price (0 or more)' : '';
  if (err) { $('#pe').textContent = err; return; }
  const { vtxt, _new, ...p } = e; p.v = v; p.name = p.name.trim();
  const i = data.products.findIndex(x => x.id === p.id); i < 0 ? data.products.unshift(p) : data.products[i] = p;
  $('#dlg').close(); setDirty(true); render(); toast('Product updated — press Save Changes to publish');
}

/* ---------- image upload ---------- */
function pickImage(cb) {
  const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/jpeg,image/png,image/webp';
  i.onchange = () => {
    const f = i.files[0]; if (!f) return; const im = new Image(), u = URL.createObjectURL(f);
    im.onload = async () => {
      const k = Math.min(1, 1400 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      c.toBlob(async b => {
        try {
          toast('Uploading…'); const n = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
          const { error } = await sb.storage.from('site-images').upload(n, b, { contentType: 'image/jpeg', cacheControl: '31536000' }); if (error) throw error;
          cb(sb.storage.from('site-images').getPublicUrl(n).data.publicUrl); toast('Image uploaded');
        } catch (e) { toast(e.message, false); }
      }, 'image/jpeg', .85);
    };
    im.onerror = () => toast('That file is not a valid image', false); im.src = u;
  }; i.click();
}

/* ---------- events ---------- */
document.addEventListener('input', e => {
  const t = e.target, a = t.dataset.p ? 'p' : t.dataset.e ? 'e' : null; if (!a) { if (t.id === 'pq') { q = t.value; const p = t.selectionStart; render(); const n = $('#pq'); n.focus(); n.setSelectionRange(p, p); } return; }
  const path = t.dataset[a], obj = a === 'p' ? data : editing;
  st(obj, path, t.type === 'checkbox' ? t.checked : t.type === 'number' ? Math.max(0, parseInt(t.value, 10) || 0) : t.value);
  if (a === 'p') setDirty(true);
  const r = t.closest('.imgrow'); if (r) r.querySelector('.thumb').innerHTML = thumb(t.value);
});
document.addEventListener('click', async e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.tab) { tab = t.dataset.tab; render(); }
  if (t.dataset.upl) { const [a, p] = t.dataset.upl.split(':'); pickImage(u => { st(a === 'p' ? data : editing, p, u); if (a === 'p') setDirty(true); const inp = t.parentNode.querySelector('input'); inp.value = u; t.closest('.imgrow').querySelector('.thumb').innerHTML = thumb(u); }); }
  if (t.dataset.new) editor({ id: 'p-' + Date.now().toString(36), c: CATS[0], name: '', ta: '', frag: '', badge: 'New', h: 20, img: '', v: [{ l: 'Standard Pack', p: 0 }], available: true, featured: false, favourite: false, _new: true });
  if (t.dataset.edit) editor(data.products.find(x => x.id === t.dataset.edit));
  if (t.dataset.del) { const p = data.products.find(x => x.id === t.dataset.del); if (confirm(`Delete “${p.name}”? This takes effect when you press Save Changes.`)) { data.products = data.products.filter(x => x !== p); setDirty(true); render(); } }
  if (t.id === 'pc') { e.preventDefault(); $('#dlg').close(); }
  if (t.id === 'po') applyEdit();
  if (t.id === 'save') save();
  if (t.id === 'out') { await sb.auth.signOut(); location.reload(); }
});
document.addEventListener('change', e => { const t = e.target; if (t.dataset.flag) { const [id, k] = t.dataset.flag.split(':'); data.products.find(x => x.id === id)[k] = t.checked; setDirty(true); } });
addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
async function save() {
  const b = $('#save'); b.disabled = true; b.textContent = 'Saving…';
  try { const { error } = await sb.rpc('save_site', { p: data }); if (error) throw error; data = await loadAll(); setDirty(false); render(); toast('✓ Saved! Your website is updated.'); }
  catch (e) { if (e.code === '42501' || /JWT|permission|session/i.test(e.message || '')) { toast('Session expired or not allowed. Please sign in again.', false); setTimeout(() => location.reload(), 1800); } else toast(e.message || 'Save failed', false); }
  b.disabled = false; b.textContent = '💾 Save Changes';
}
$('#lf').onsubmit = async e => {
  e.preventDefault(); $('#le').textContent = '';
  try { const { error } = await sb.auth.signInWithPassword({ email: $('#em').value.trim(), password: $('#pw').value }); if (error) throw new Error('Invalid email or password'); $('#pw').value = ''; await boot(); } catch (x) { $('#le').textContent = x.message; }
};
async function boot() {
  const login = m => { $('#loginBox').hidden = false; $('#app').hidden = true; $('#le').textContent = m || ''; };
  try {
    if (!sb) return login('Supabase is not configured. Check config.js / Netlify environment variables.');
    const { data: { session } } = await sb.auth.getSession(); if (!session) return login();
    const { data: ok, error } = await sb.rpc('is_owner'); if (error) throw error;
    if (!ok) { await sb.auth.signOut(); return login('This account is not the website owner.'); }
    data = await loadAll(); $('#loginBox').hidden = true; $('#app').hidden = false; render();
  } catch (e) { login(e.message || 'Could not connect to Supabase'); }
}
boot();
})();
