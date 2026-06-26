# 04 — Seed Data

Build `apps/api/src/seed.ts` to insert exactly this. Idempotent (clear collections first or upsert by slug). Use the listed images, or Cloudinary uploads of royalty-free product shots, or high-quality Unsplash URLs as a fallback — every product MUST have a real image. Prices in USD.

## Categories (5)
```ts
[
  { name:"Audio",     slug:"audio",     order:1, description:"Headphones, earbuds & speakers" },
  { name:"Wearables", slug:"wearables", order:2, description:"Smartwatches & trackers" },
  { name:"Computing", slug:"computing", order:3, description:"Laptops, keyboards & accessories" },
  { name:"Home Tech", slug:"home-tech", order:4, description:"Smart home & lighting" },
  { name:"Lifestyle", slug:"lifestyle", order:5, description:"Bags, desk & everyday carry" },
]
```

## Users (6)
```ts
// password for all demo accounts: "Lumora@123"  (hash with bcrypt at seed time)
[
  { name:"Hashir Admin", email:"admin@lumora.app",  role:"admin",
    addresses:[{fullName:"Hashir",phone:"+923078479231",line1:"1 Aurora St",city:"Lahore",postalCode:"54000",country:"PK",isDefault:true}] },
  { name:"Ayesha Khan",  email:"ayesha@demo.app",   role:"customer" },
  { name:"Daniel Reyes", email:"daniel@demo.app",   role:"customer" },
  { name:"Mei Lin",      email:"mei@demo.app",       role:"customer" },
  { name:"Omar Farooq",  email:"omar@demo.app",      role:"customer" },
  { name:"Sara Ali",     email:"sara@demo.app",      role:"customer" },
]
```

## Products — 14 fully specified (extend to 40, see generator below)
Each: `{title, brand, category(slug), price, compareAtPrice?, stock, tags, specs[], isFeatured?, isBestseller?, images:[{url,alt}]}`. Write real, plausible specs.

```ts
[
 // AUDIO
 { title:"Halo Pro Wireless Headphones", brand:"Aurex", category:"audio", price:249, compareAtPrice:299, stock:40,
   tags:["headphones","anc","over-ear"], isFeatured:true, isBestseller:true,
   specs:[["Driver","40mm dynamic"],["ANC","Hybrid, -32dB"],["Battery","38h (ANC on)"],["Charging","USB-C, 5min=4h"],["Weight","268g"],["Codecs","LDAC, AAC, SBC"]],
   variants:[{name:"Color",options:[{label:"Midnight",value:"midnight",hex:"#0d0d1a"},{label:"Aurora White",value:"white",hex:"#F5F6FF"}]}] },
 { title:"Pulse Air Earbuds", brand:"Aurex", category:"audio", price:129, stock:75,
   tags:["earbuds","anc","tws"], isBestseller:true,
   specs:[["Driver","11mm"],["ANC","Adaptive"],["Battery","8h + 28h case"],["IP","IPX5"],["Latency","Game mode 60ms"]] },
 { title:"Resonance Desk Speaker", brand:"Nova Acoustics", category:"audio", price:179, stock:30,
   tags:["speaker","bluetooth","desk"],
   specs:[["Power","2x20W"],["Range","Bluetooth 5.3, 15m"],["Inputs","BT, AUX, USB-C"],["Battery","16h"]] },

 // WEARABLES
 { title:"Lumora Watch S2", brand:"Lumora", category:"wearables", price:299, compareAtPrice:349, stock:50,
   tags:["smartwatch","amoled","health"], isFeatured:true, isBestseller:true,
   specs:[["Display","1.9\" AMOLED, 1000 nits"],["Battery","7 days"],["Sensors","HR, SpO2, ECG, GPS"],["Water","5ATM"],["Build","Aluminum"]],
   variants:[{name:"Band",options:[{label:"Violet",value:"violet",hex:"#7C5CFF"},{label:"Cyan",value:"cyan",hex:"#22D3EE"},{label:"Graphite",value:"graphite",hex:"#2a2a33"}]}] },
 { title:"Stride Fit Band", brand:"Lumora", category:"wearables", price:89, stock:90,
   tags:["tracker","fitness"],
   specs:[["Display","1.1\" AMOLED"],["Battery","14 days"],["Sensors","HR, SpO2"],["Water","5ATM"]] },

 // COMPUTING
 { title:"Glide Mechanical Keyboard", brand:"Keyforge", category:"computing", price:159, stock:35,
   tags:["keyboard","mechanical","hotswap"], isFeatured:true,
   specs:[["Layout","75%"],["Switches","Hot-swap, gasket"],["Connectivity","BT/2.4G/USB-C"],["Battery","4000mAh"],["Keycaps","PBT double-shot"]],
   variants:[{name:"Switch",options:[{label:"Linear Red",value:"red"},{label:"Tactile Brown",value:"brown"}]}] },
 { title:"Vector Wireless Mouse", brand:"Keyforge", category:"computing", price:79, stock:60,
   tags:["mouse","wireless","ergonomic"], isBestseller:true,
   specs:[["Sensor","26K DPI"],["Polling","1000Hz"],["Weight","61g"],["Battery","70h"]] },
 { title:"Nimbus 14 Laptop Stand", brand:"Deskline", category:"computing", price:69, stock:80,
   tags:["stand","aluminum","ergonomic"],
   specs:[["Material","Aluminum alloy"],["Adjust","6 angles"],["Fits","11\"–16\""],["Foldable","Yes"]] },
 { title:"Flux 100W GaN Charger", brand:"Volten", category:"computing", price:59, compareAtPrice:79, stock:120,
   tags:["charger","gan","usb-c"], isBestseller:true,
   specs:[["Output","100W total"],["Ports","2x USB-C, 1x USB-A"],["Tech","GaN III"],["Foldable pins","Yes"]] },

 // HOME TECH
 { title:"Aura Smart Lamp", brand:"Nimbus Home", category:"home-tech", price:99, stock:45,
   tags:["lighting","rgb","smart"], isFeatured:true,
   specs:[["Colors","16M RGBWW"],["Control","App + voice"],["Sync","Music/Screen"],["Power","12W"]],
   variants:[{name:"Finish",options:[{label:"Matte Black",value:"black"},{label:"Pearl",value:"pearl"}]}] },
 { title:"Sentinel Smart Plug (2-pack)", brand:"Nimbus Home", category:"home-tech", price:39, stock:100,
   tags:["smart-plug","energy"],
   specs:[["Rating","16A"],["Monitoring","Energy usage"],["WiFi","2.4GHz"],["Schedules","Yes"]] },
 { title:"Mistral Air Purifier", brand:"Cleanair", category:"home-tech", price:189, stock:25,
   tags:["purifier","hepa"],
   specs:[["Filter","True HEPA H13"],["Coverage","40㎡"],["Noise","24dB sleep"],["Sensor","PM2.5 live"]] },

 // LIFESTYLE
 { title:"Carry Pro Tech Backpack", brand:"Wayfare", category:"lifestyle", price:119, compareAtPrice:149, stock:55,
   tags:["backpack","laptop","travel"], isFeatured:true, isBestseller:true,
   specs:[["Laptop","Fits 16\""],["Material","Recycled 900D"],["Water","Resistant"],["USB pass-through","Yes"],["Volume","22L"]],
   variants:[{name:"Color",options:[{label:"Slate",value:"slate",hex:"#2a2a33"},{label:"Sand",value:"sand",hex:"#cbb89d"}]}] },
 { title:"Horizon Desk Mat XL", brand:"Deskline", category:"lifestyle", price:34, stock:140,
   tags:["deskmat","accessory"],
   specs:[["Size","900x400mm"],["Surface","Vegan leather"],["Base","Anti-slip"]] },
]
```

## Generator spec — extend to **40 products total** (deterministic, realistic)
Create 26 more following the exact shape above, distributed so each category has 6–10 products. Rules:
- Use these brand pools per category — Audio: `Aurex, Nova Acoustics, Sonata`; Wearables: `Lumora, Pulsefit`; Computing: `Keyforge, Volten, Deskline, Nimbus`; Home Tech: `Nimbus Home, Cleanair, Glowave`; Lifestyle: `Wayfare, Deskline, Everyday Co`.
- Prices: Audio 49–349, Wearables 69–399, Computing 29–229, Home Tech 29–249, Lifestyle 19–159. ~⅓ get a `compareAtPrice` (10–25% higher).
- Stock 0–150 (include **2 out-of-stock** products and **3 low-stock** ≤5 to demo states). Mark ~8 `isFeatured`, ~8 `isBestseller`.
- Every product: 4–6 real spec rows, 2–4 tags, at least 1 image with descriptive `alt`. Titles must be distinct and plausible (no "Product 17").

## Coupons (3)
```ts
[
  { code:"AURORA10", type:"percent", value:10, minSubtotal:50, isActive:true },
  { code:"WELCOME15", type:"percent", value:15, minSubtotal:100, maxUses:500, isActive:true },
  { code:"FLAT20",    type:"fixed",   value:20, minSubtotal:120, isActive:true },
]
```

## Sample orders + reviews (for a non-empty dashboard)
- Create **6–8 orders** across the demo customers with varied statuses (placed/packed/shipped/delivered) and dates spread over the last 30 days (so analytics charts have a curve).
- Create **15–20 reviews** on popular products (ratings 3–5, a couple of 5★ on featured items), set `isVerifiedPurchase=true` where the customer has a delivered order with that product, and recompute each product's `ratingAvg`/`ratingCount`.
