/* Product catalog. Edit freely: v = variants [label, price]; price 0 = "Ask Price".
   Add a price to enable "Add to Cart". Put photos in /images. h = card hue. */
const WHATSAPP = '919442885254';
const CATEGORIES = [
  ['All', 'All Products'], ['Cup Sambarani', 'Cup Sambarani (கப் சாம்பிராணி)'], ['Agarbathi', 'Agarbathi (ஊதுபத்தி)'],
  ['Dhoop & Cones', 'Dhoop & Cones (தூப்)'], ['Pooja Essentials', 'Pooja Essentials (பூஜை பொருட்கள்)']
];
const P = (id, c, name, ta, frag, badge, h, v, img) => ({ id, c, name, ta, frag, badge, h, v: v.map(([l, p = 0]) => ({ l, p })), img });
const PRODUCTS = [
  P('cs-3','Cup Sambarani','Elite Original Pal Sambrani','எலைட் ஒரிஜினல் பால் சாம்பிராணி','Pure White Pal Sambrani • Divine Fragrance Everywhere','Hero Flagship',225,[['Standard Pack']],'288A7480.jpg'),
  P('cs-1','Cup Sambarani','Girivalam Royal Cup Sambirani','கிரிவலம் ராயல் கப் சாம்பிராணி','Divine Fragrance Every Where • Pure Benzoin Resin','Royal Edition',22,[['Standard Box']],'288A7474.jpg'),
  P('cs-9','Cup Sambarani','GV Jawathu Cup Sambrani (Free Karpooram)','ஜி.வி ஜவ்வாது கப் சாம்பிராணி (இலவச கற்பூரம்)','Instant Incense • Pure Natural • Free Karpooram Inside','Free கற்பூரம்',140,[['Standard Box']],'288A7478.jpg'),
  P('cs-10','Cup Sambarani','GV Dasangam Cup Sambrani (Free Karpooram)','ஜி.வி தசாங்கம் கப் சாம்பிராணி (இலவச கற்பூரம்)','Traditional Dasangam Aroma • Free Karpooram Inside','Free கற்பூரம்',18,[['Standard Box']],'288A7479.jpg'),
  P('cs-8','Cup Sambarani','Sakthi Cup Sambirani','சக்தி கப் சாம்பிராணி','Instant Sambirani Incense • Pure Natural Aroma & Smoke','Instant Cup',10,[['Standard Box']],'288A7482.jpg'),
  P('cs-5','Cup Sambarani','Shirdi Baba Cup Sambirani','ஷீரடி பாபா கப் சாம்பிராணி','Soothing Loban & Sandal Sambrani Cups','Devotional',150,[['Standard Box']],'288A7473.jpg'),
  P('cs-4','Cup Sambarani','Laxmi Original Pal Sambrani','லக்ஷ்மி ஒரிஜினல் பால் சாம்பிராணி','Traditional Temple Gopuram Edition Pal Sambrani','Original Pal',355,[['Standard Box']],'288A7475.jpg'),
  P('cs-2','Cup Sambarani','Palani Murugan Jumbo Cup Sambrani','பழனி முருகன் ஜம்போ கப் சாம்பிராணி','100% Natural Jumbo Sambrani Cup • Temple Aroma','Jumbo Cup',2,[['Jumbo Box']]),
  P('cs-6','Cup Sambarani','Sri Perumal Cup Sambrani','ஸ்ரீ பெருமாள் கப் சாம்பிராணி','Instant Incense • Pure Natural Aroma & Smoke','Pure Natural',235,[['Standard Box']]),
  P('cs-7','Cup Sambarani','Parampariyam Single Cup Sambrani','பாரம்பரியம் சிங்கிள் கப் சாம்பிராணி','Traditional Pongal & Temple Prayer Single Cup Pack','Traditional',15,[['Single Cup Pack']]),
  P('dc-1','Dhoop & Cones','Sri Devi Deluxe Instant Sambrani','ஸ்ரீ தேவி டீலக்ஸ் உடனடி சாம்பிராணி','Natural Resin & Herbs • Traditional Dhoop Ideal for Pooja','Deluxe Dhoop',230,[['Small Box'],['Deluxe Box']],'288A7467.jpg'),
  P('dc-2','Dhoop & Cones','Sri Bhuvaneshwari Sambrani Instant Sticks','ஸ்ரீ புவனேஸ்வரி சாம்பிராணி இன்ஸ்டன்ட் ஸ்டிக்ஸ்','Pure Natural for Aroma & Smoke • Export Quality','Export Quality',12,[['Standard Pack']]),
  P('dc-3','Dhoop & Cones','Ganesh Dhoops (Instant Incense - 30 Sticks)','கணேஷ் தூப்ஸ் (30 குச்சிகள்)','Instant Incense • Pure Natural for Aroma & Smoke','30 Sticks',0,[['30 Sticks Box']]),
  P('dc-4','Dhoop & Cones','Scorpio Sri Ganapathi Dhoop','ஸ்கார்பியோ ஸ்ரீ கணபதி தூப்','Auspicious Temple Ganapathi Dhoop Sticks','Temple Dhoop',20,[['Standard Box']]),
  P('dc-5','Dhoop & Cones','Kottai Mariamman Dasangam Cone','கோட்டை மாரியம்மன் தசாங்கம் கோன்','Authentic South Indian Dasangam Temple Cones','Dasangam Cone',5,[['Standard Box']]),
  P('dc-6','Dhoop & Cones','Santhanam Cones','சந்தனம் கோன்ஸ்','Pure Sandalwood Dhoop Cones for Daily Pooja','Sandal Cones',30,[['Standard Box']]),
  P('dc-7','Dhoop & Cones','Thai Mookambigai Dhoop Powder','தாய் மூகாம்பிகை தூப் பவுடர்','Traditional Herbal Sambrani & Dhoop Powder','Dhoop Powder',45,[['Standard Pack']]),
  P('dc-8','Dhoop & Cones','Darshan & Om Crushed Loban','தர்ஷன் & ஓம் கிரஷ்டு லோபான் (சாம்பிராணி)','Premium Crushed Benzoin Loban Resin Crystals','Crushed Loban',130,[['Darshan Loban Box'],['Green Om Loban Box']]),
  P('ag-1','Agarbathi','Ganesh Premium Incense (110g Long Pack)','கணேஷ் பிரீமியம் ஊதுபத்தி (110g)','Kewda, Sandal, Rose & Pineapple • 110g','MRP ₹65/-',160,[['Kewda (110g)',65],['Sandal (110g)',65],['Rose (110g)',65],['Pineapple (110g)',65]]),
  P('ag-2','Agarbathi','Ganesh Box Agarbathi (Floral & Fruit Series)','கணேஷ் பாக்ஸ் ஊதுபத்தி','Rose, Sandal, Mogra, Pineapple & Champa','5 Fragrances',335,[['Rose Box'],['Sandal Box'],['Mogra Box'],['Pineapple Box'],['Champa Box']]),
  P('ag-3','Agarbathi','Scorpio Divine Fragrance Agarbathi','ஸ்கார்பியோ டிவைன் ஃபிராக்ரன்ஸ் ஊதுபத்தி','Sandal, Rose, Lavender, Kewda, Champa & Fruits','6 Scents',275,[['Sandal'],['Rose'],['Lavender'],['Kewda'],['Champa'],['Fruits']]),
  P('ag-4','Agarbathi','Indian Premium Incense Sticks (Peacock Pack)','இந்தியன் பிரீமியம் ஊதுபத்தி','Traditional Floral & Temple Bouquet • Free Match Box in ₹50','₹5 / ₹10 / ₹50',28,[['₹5 Economy Pack',5],['₹10 Regular Pack',10],['₹50 Family Pack',50]]),
  P('ag-5','Agarbathi','Happy Day Premium Incense Sticks','ஹேப்பி டே பிரீமியம் ஊதுபத்தி','Imported Uniform Sticks • Fresh Bouquet Aroma','Imported Sticks',35,[['Standard Pack']]),
  P('ag-6','Agarbathi','Ganesh Sri Baba Flora Agarbathies','கணேஷ் ஸ்ரீ பாபா ஃப்ளோரா ஊதுபத்தி','Rich Hand-Rolled Flora Masala Incense','Flora Masala',42,[['Standard Box']]),
  P('pe-1','Pooja Essentials','Ganesh & Mangai Original Karpooram (Camphor)','கணேஷ் & மங்கை ஒரிஜினல் கற்பூரம்','Pure Smokeless Camphor Tablets for Deeparadhana','Pure Camphor',40,[['Ganesh Karpooram Box'],['Mangai Original Box']]),
  P('pe-2','Pooja Essentials','Scorpio Brand Javadhu Powder','ஸ்கார்பியோ பிராண்ட் ஜவ்வாது பவுடர்','Authentic South Indian Herbal Javadhu Perfume Powder','Herbal Javadhu',38,[['Standard Box']]),
  P('pe-3','Pooja Essentials','Sri Saravana Javadhu Special Vibuthi','ஸ்ரீ சரவணா ஜவ்வாது வாசனை ஸ்பெஷல் விபூதி','Sacred Javadhu-Scented Vibuthi Sachet Packs','Special Vibuthi',30,[['Sachet Pack']]),
  P('pe-4','Pooja Essentials','Special Pooja Kumkumam','ஸ்பெஷல் குங்குமம்','Traditional Auspicious Temple Kumkumam','Temple Grade',355,[['Standard Pack']]),
  P('pe-5','Pooja Essentials','Girivalam Pure & Natural Rose Water (Panneer)','கிரிவலம் பன்னீர் (Rose Water)','100% Pure & Natural Rose Water for Abhishekam & Pooja','3 Bottle Sizes',335,[['Small Bottle'],['Medium Bottle'],['Large Bottle']]),
  P('pe-6','Pooja Essentials','Arul Jothi Deepam Oil','அருள் ஜோதி தீபம் ஆயில்','Sacred Blend of Pooja Oils • Not for edible use','Pooja Lamp Oil',28,[['Standard Bottle']])
];
