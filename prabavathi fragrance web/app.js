(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = n => '₹' + n.toLocaleString('en-IN');
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } }
};
let FREE_SHIP = 499, SHIP_FEE = 40, wnum = WHATSAPP, products = PRODUCTS, fav = true, wish = store.get('pf_wish', []);
let cat = 'All', owner = false, lastOrder = null, timer;
let photos = store.get('pf_photos', {}), cart = store.get('pf_cart', []);
const pick = {};

const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(timer); timer = setTimeout(() => t.classList.remove('show'), 2400); };
const wa = text => window.open(`https://wa.me/${wnum}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');

/* ---------- Catalog ---------- */
function visual(p) {
  const src = photos[p.id] || (p.img && p.img);
  const ph = `<div class="ph" style="--h:${p.h}"><span>🪔</span><b>${esc(p.name.split(' ').slice(0, 2).join(' '))}</b><small>${esc(p.c.toUpperCase())}</small></div>`;
  return src ? `<img src="${esc(src)}" alt="${esc(p.name)}" loading="lazy" width="300" height="176" data-ph="${p.id}">` : ph;
}
function render() {
  const q = $('#search').value.trim().toLowerCase();
  const list = products.slice().sort((x, y) => !!y.featured - !!x.featured).filter(p => (cat === 'All' || (cat === '♥' ? wish.includes(p.id) : cat === '★' ? p.featured : p.c === cat)) && (!q || [p.name, p.frag, p.ta, p.c].some(s => s.toLowerCase().includes(q))));
  $('#resultCount').textContent = `Showing ${list.length} of ${products.length} products`;
  $('#grid').innerHTML = list.length ? list.map((p, i) => {
    const vi = pick[p.id] || 0, v = p.v[vi], priced = v.p > 0, has = photos[p.id] || p.img;
    return `<article class="pcard" style="animation-delay:${Math.min(i, 8) * 50}ms">
      <div><div class="pv" style="--h:${p.h}"><span class="badge">${p.featured ? '⭐ ' : ''}${esc(p.badge)}</span>${fav ? `<button class="heart${wish.includes(p.id) ? ' on' : ''}" data-wish="${p.id}" aria-pressed="${wish.includes(p.id)}" aria-label="Add to wishlist">♥</button>` : ''}
        ${owner ? `<div class="up"><button data-up="${p.id}">📷 ${has ? 'Change' : 'Upload'}</button>${photos[p.id] ? `<button class="del" data-del="${p.id}" aria-label="Remove custom photo">🗑</button>` : ''}<input type="file" accept="image/*" hidden id="f_${p.id}"></div>` : ''}
        <div class="pimg">${visual(p)}</div><span class="cat">${esc(p.c)}${p.favourite ? ' · ❤ Customer Favourite' : ''}</span></div>
      <div class="pb"><p class="ta">${esc(p.ta)}</p><h3>${esc(p.name)}</h3><p>✨ ${esc(p.frag)}</p>
        ${p.v.length > 1 ? `<div class="vars" role="group" aria-label="Variants">${p.v.map((x, j) => `<button data-var="${p.id}:${j}" aria-pressed="${j === vi}">${esc(x.l)}</button>`).join('')}</div>` : ''}</div></div>
      <div class="pf">${p.available === false ? '<span class="soon">Out of stock</span><button class="btn" disabled>Unavailable</button>' : priced
        ? `<div class="price">${inr(v.p)}<small>MRP listed pack</small></div><button class="btn add" data-add="${p.id}">🛒 Add to Cart</button>`
        : `<span class="soon">Details Updating Soon</span><button class="btn wa" data-enquire="${esc(p.name + ' - ' + v.l)}">💬 Ask Price</button>`}</div></article>`;
  }).join('') : `<div class="empty"><p>No products found${q ? ` for “${esc(q)}”` : ''}.</p><button class="link" id="clear">Reset filters</button></div>`;
}
const buildCats = () => {
  const l = [...CATEGORIES, ...(fav ? [['♥', '♥ My Wishlist']] : []), ...(products.some(p => p.featured) ? [['★', '⭐ Featured']] : [])];
  if (!l.some(x => x[0] === cat)) cat = 'All';
  $('#cats').innerHTML = l.map(([k, t]) => `<button role="tab" data-cat="${esc(k)}" aria-selected="${k === cat}">${esc(t)}${k === 'All' ? ' (' + products.length + ')' : ''}</button>`).join('');
};
$('#cats').onclick = e => { const b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat; $$('#cats button').forEach(x => x.setAttribute('aria-selected', x === b)); render(); };
let st; $('#search').oninput = () => { clearTimeout(st); st = setTimeout(render, 150); };

$('#grid').addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.id === 'clear') { $('#search').value = ''; cat = 'All'; buildCats(); render(); }
  if (t.dataset.var) { const [id, j] = t.dataset.var.split(':'); pick[id] = +j; render(); }
  if (t.dataset.wish) { const i = wish.indexOf(t.dataset.wish); i < 0 ? wish.push(t.dataset.wish) : wish.splice(i, 1); store.set('pf_wish', wish); render(); toast(i < 0 ? 'Added to your wishlist ♥' : 'Removed from wishlist'); }
  if (t.dataset.add) addToCart(t.dataset.add);
  if (t.dataset.up) $('#f_' + t.dataset.up).click();
  if (t.dataset.del) { delete photos[t.dataset.del]; store.set('pf_photos', photos); render(); toast('Reverted to default image'); }
});
$('#grid').addEventListener('change', e => { if (e.target.type === 'file') upload(e.target.id.slice(2), e.target.files[0]); });
$('#grid').addEventListener('error', e => { const i = e.target; if (i.tagName === 'IMG' && i.dataset.ph) { const p = products.find(x => x.id === i.dataset.ph); delete i.dataset.ph; i.parentElement.innerHTML = `<div class="ph" style="--h:${p.h}"><span>🪔</span><b>${esc(p.name.split(' ').slice(0, 2).join(' '))}</b><small>${esc(p.c.toUpperCase())}</small></div>`; } }, true);
document.addEventListener('click', e => { const b = e.target.closest('[data-enquire]'); if (b) { toast('Opening WhatsApp…'); wa(`Vanakkam Prabavathi Fragrance! I would like to know the price and availability for:\n• Product: ${b.dataset.enquire}`); } });

/* ---------- Owner photo upload ---------- */
function upload(id, file) {
  if (!file || !file.type.startsWith('image/')) return toast('Please choose an image file');
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const k = Math.min(1, 600 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    photos[id] = c.toDataURL('image/jpeg', .82);
    toast(store.set('pf_photos', photos) ? 'Photo saved!' : 'Photo shown, but browser storage is full'); render();
  };
  img.onerror = () => toast('Could not read that image'); img.src = url;
}

/* ---------- Cart ---------- */
const totals = () => { const sub = cart.reduce((s, i) => s + i.price * i.qty, 0); const del = sub && sub < FREE_SHIP ? SHIP_FEE : 0; return { sub, del, tot: sub + del, n: cart.reduce((s, i) => s + i.qty, 0) }; };
function addToCart(id) {
  const p = products.find(x => x.id === id), v = p.v[pick[id] || 0]; if (!v.p) return;
  const key = id + '_' + v.l, ex = cart.find(i => i.key === key);
  ex ? ex.qty++ : cart.push({ key, name: p.name, label: v.l, price: v.p, qty: 1 });
  saveCart(); toast(`Added ${p.name} (${v.l})`);
  $('#cartCount').classList.remove('bump'); void $('#cartCount').offsetWidth; $('#cartCount').classList.add('bump');
}
function saveCart() { store.set('pf_cart', cart); renderCart(); }
function renderCart() {
  const { sub, del, tot, n } = totals();
  $('#cartCount').textContent = n;
  $('#shipBar').style.width = Math.min(100, sub / FREE_SHIP * 100) + '%';
  $('#shipText').textContent = !sub ? `Free delivery on orders above ${inr(FREE_SHIP)}` : sub >= FREE_SHIP ? '🎉 You unlocked FREE delivery!' : `Add ${inr(FREE_SHIP - sub)} more for FREE delivery`;
  $('#cartFoot').hidden = !cart.length;
  $('#cartItems').innerHTML = cart.length ? cart.map(i => `<div class="ci"><div><h4>${esc(i.name)}</h4><span>${esc(i.label)}</span><b>${inr(i.price * i.qty)}</b></div>
    <div class="qty"><button data-q="${esc(i.key)}:-1" aria-label="Decrease">−</button><em>${i.qty}</em><button data-q="${esc(i.key)}:1" aria-label="Increase">+</button></div></div>`).join('')
    : `<div class="cempty"><i>🛍</i><h3>Your Pooja Basket is Empty</h3><p>Add Agarbathi or Sambrani packs with a listed price.</p><button class="btn maroon" data-close>Explore Products</button></div>`;
  $('#subT').textContent = inr(sub); $('#delT').textContent = del ? inr(del) : 'FREE'; $('#totT').textContent = inr(tot); $('#payAmt').textContent = inr(tot);
}
$('#cartItems').onclick = e => { const b = e.target.closest('[data-q]'); if (!b) return; const [k, d] = b.dataset.q.split(/:(?=-?1$)/); const i = cart.findIndex(x => x.key === k); if (i < 0) return; cart[i].qty += +d; if (cart[i].qty < 1) cart.splice(i, 1); saveCart(); };
const drawer = $('#drawer'), back = $('#backdrop');
function cartOpen(o) { drawer.classList.toggle('open', o); drawer.setAttribute('aria-hidden', !o); back.hidden = !o; document.body.style.overflow = o ? 'hidden' : ''; if (o) $('.x', drawer).focus(); }
$('#cartBtn').onclick = () => cartOpen(true); back.onclick = () => cartOpen(false);
drawer.addEventListener('click', e => e.target.closest('[data-close]') && (cartOpen(false), e.target.closest('.cempty') && $('#products').scrollIntoView()));

/* ---------- Checkout ---------- */
const dlg = $('#checkout');
$('#checkoutBtn').onclick = () => { if (!cart.length) return; cartOpen(false); $('#orderForm').hidden = false; $('#receipt').hidden = true; dlg.showModal(); };
$$('[data-dclose]').forEach(b => b.onclick = () => dlg.close());
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
$('#orderForm').onsubmit = e => {
  e.preventDefault();
  const g = id => $(id).value.trim(), t = totals();
  lastOrder = { id: 'PF-' + Date.now().toString().slice(-6), name: g('#cName'), phone: g('#cPhone'), addr: g('#cAddr'), city: g('#cCity'), pin: g('#cPin'),
    pay: $('input[name=pay]:checked').value, total: inr(t.tot), items: cart.map(i => `${i.name} (${i.label}) x${i.qty}`) };
  const o = lastOrder, row = (a, b) => `<div><span>${a}</span><strong>${esc(b)}</strong></div>`;
  $('#receiptBody').innerHTML = row('Order ID', o.id) + row('Customer', `${o.name} (${o.phone})`) + row('Delivery', `${o.city} - ${o.pin}`) + row('Items', o.items.join(', ')) + row('Payment', o.pay) + row('Total', o.total);
  $('#orderForm').hidden = true; $('#receipt').hidden = false; $('#orderForm').reset();
  cart = []; saveCart();
};
$('#sendWA').onclick = () => { const o = lastOrder; if (o) wa(`Vanakkam Prabavathi Fragrance! Here is my order:\n• Order ID: ${o.id}\n• Name: ${o.name} (${o.phone})\n• Address: ${o.addr}, ${o.city} - ${o.pin}\n• Items: ${o.items.join(', ')}\n• Payment: ${o.pay}\n• Total: ${o.total}`); };

/* ---------- Wholesale ---------- */
$('#wsForm').onsubmit = e => { e.preventDefault(); toast('Opening WhatsApp…'); wa(`Vanakkam Prabavathi Fragrance! I am interested in a Wholesale/Bulk Order.\n• Name/Shop: ${$('#wsName').value.trim()}\n• City: ${$('#wsCity').value.trim()}\n• Requirement: ${$('#wsReq').value}`); };

/* ---------- Header, menu, scroll effects ---------- */
const nav = $('#nav'), menuBtn = $('#menuBtn');
const menu = o => { nav.classList.toggle('open', o); menuBtn.setAttribute('aria-expanded', o); menuBtn.textContent = o ? '✕' : '☰'; };
menuBtn.onclick = () => menu(!nav.classList.contains('open'));
nav.onclick = e => e.target.closest('a') && menu(false);
document.addEventListener('click', e => { if (!e.target.closest('header')) menu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { menu(false); cartOpen(false); } });
const toTop = $('#toTop'); toTop.onclick = () => scrollTo({ top: 0 });
addEventListener('scroll', () => { $('#header').classList.toggle('scrolled', scrollY > 10); toTop.hidden = scrollY < 600; }, { passive: true });
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(x => x.isIntersecting && (x.target.classList.add('in'), io.unobserve(x.target))), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
  const links = $$('nav a'), so = new IntersectionObserver(es => es.forEach(x => x.isIntersecting && links.forEach(a => a.classList.toggle('active', a.hash === '#' + x.target.id))), { rootMargin: '-45% 0px -50%' });
  $$('main section[id]').forEach(s => so.observe(s));
} else $$('.reveal').forEach(el => el.classList.add('in'));


/* ---------- Owner-managed content (loaded from the database via /api/content) ---------- */
const okLink = u => /^(https?:\/\/|#|\/|mailto:|tel:)/i.test(u || '') ? u : '#';
const okImg = u => /^(https?:\/\/|\/uploads\/|[\w.-]+\.(jpe?g|png|webp|gif))$/i.test(u || '') ? (/^[\w.-]+$/.test(u) ? '/' + u : u) : '';
function applyContent(c) {
  FREE_SHIP = c.settings.freeShip; SHIP_FEE = c.settings.shipFee; fav = c.favourites.enabled; products = c.products;
  const co = c.company, h = c.hero, f = c.flash; wnum = (co.whatsapp || WHATSAPP).replace(/\D/g, '');
  $$('[data-fs]').forEach(e => e.textContent = inr(FREE_SHIP));
  document.title = `${co.name} | Traditional Agarbathi & Sambarani Store`;
  $('#brandName').textContent = co.name.toUpperCase(); $('#fName').textContent = co.name.toUpperCase(); $('#brandSub').textContent = co.tagline; $('#fDesc').textContent = co.desc;
  $('#logoBox').innerHTML = okImg(co.logo) ? `<img src="${esc(okImg(co.logo))}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : '🪔';
  $('#aboutTxt').textContent = co.about; $('#aboutTxt').hidden = !co.about;
  const soc = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['youtube', 'YouTube']].filter(([k]) => co.social[k]).map(([k, n]) => `<a href="${esc(okLink(co.social[k]))}" target="_blank" rel="noopener">${n}</a>`).join(' · ');
  $('#fContact').innerHTML = `<h4>Customer Care &amp; Bulk Orders</h4>${co.address ? `<p>📍 ${esc(co.address)}</p>` : ''}${co.phone ? `<p>📞 <a href="tel:${esc(co.phone.replace(/[^\d+]/g, ''))}">${esc(co.phone)}</a></p>` : ''}${co.support ? `<p>🕘 ${esc(co.support)}</p>` : ''}${co.email ? `<p>✉ <a href="mailto:${esc(co.email)}">${esc(co.email)}</a></p>` : ''}${soc ? `<p>${soc}</p>` : ''}<a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/${wnum}?text=Vanakkam%20Prabavathi%20Fragrance!">💬 Chat on WhatsApp</a>`;
  $$('a.fab').forEach(a => a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + wnum));
  $('#hOffer').textContent = '✨ ' + h.offer; $('#hOffer').hidden = !h.offer; $('#hDesc').textContent = h.desc; $('#hRibbon').textContent = h.badge; $('#hRibbon').hidden = !h.badge;
  const w = h.heading.split(' '), k = w.length > 2 ? 2 : 0; $('#hHead').innerHTML = esc(w.slice(0, w.length - k).join(' ')) + (k ? ` <em>${esc(w.slice(-k).join(' '))}</em>` : '');
  [['#hB1', h.btn1], ['#hB2', h.btn2]].forEach(([s, b]) => { const e = $(s); e.textContent = b.text; e.hidden = !b.text; e.href = okLink(b.link); });
  const box = $('#hBox'), im = new Image(); im.alt = h.heading; im.onerror = () => { box.innerHTML = `<div class="ph"><span>🪔</span><b>${esc(co.name.split(' ')[0])}</b></div>`; };
  box.replaceChildren(im); okImg(h.image) ? im.src = okImg(h.image) : im.onerror();
  const fl = $('#flash'); fl.hidden = !(f.enabled && f.title);
  fl.innerHTML = fl.hidden ? '' : `<div class="wrap flash-in">${okImg(f.image) ? `<img src="${esc(okImg(f.image))}" alt="" onerror="this.remove()">` : ''}<div><span class="tag">⚡ Flash Sale</span><h2>${esc(f.title)}</h2><p>${esc(f.text)}</p>${f.btnText ? `<a class="btn gold" href="${esc(okLink(f.link))}">${esc(f.btnText)}</a>` : ''}</div></div>`;
  wish = wish.filter(id => products.some(p => p.id === id));
  cart = cart.filter(i => { const p = products.find(x => x.id === i.key.split('_')[0]), v = p && p.v.find(x => x.l === i.label); if (!v || !v.p || p.available === false) return false; i.price = v.p; i.name = p.name; return true; });
  store.set('pf_cart', cart);
}
(async function init() {
  buildCats(); render(); renderCart();
  try { applyContent(await PF.load()); buildCats(); render(); renderCart(); } catch { /* offline/static: built-in catalog is used */ }
})();
})();
