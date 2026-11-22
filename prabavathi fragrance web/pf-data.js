/* Loads public site content from Supabase (read-only, anon key). Same shape the site and dashboard already use. */
window.PF = {
  async load() {
    const c = window.PF_CONFIG; if (!c || !c.url) throw new Error('Supabase is not configured');
    const h = { apikey: c.key, Authorization: 'Bearer ' + c.key };
    const [s, p] = await Promise.all([
      fetch(c.url + '/rest/v1/site_settings?id=eq.1&select=*', { headers: h, cache: 'no-store' }),
      fetch(c.url + '/rest/v1/products?select=*&order=sort.asc,created_at.asc', { headers: h, cache: 'no-store' })]);
    if (!s.ok || !p.ok) throw new Error('Could not load content');
    const [r] = await s.json(); if (!r) throw new Error('Site settings row is missing (run supabase/seed.sql)');
    return PF.map(r, await p.json());
  },
  map: (r, rows) => ({
    settings: { freeShip: r.free_ship, shipFee: r.ship_fee }, favourites: { enabled: r.favourites_enabled }, company: r.company, hero: r.hero, flash: r.flash,
    products: rows.map(x => ({ id: x.id, c: x.category, name: x.name, ta: x.tamil_name, frag: x.description, badge: x.badge, h: x.hue, img: x.image_url, v: x.variants, available: x.available, featured: x.featured, favourite: x.favourite }))
  })
};
