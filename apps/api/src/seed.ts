/**
 * LUMORA seed script — run with: npm run seed
 * Populates DB with: 6 categories, 40 products, 6 users, 3 coupons, 6 orders, 18 reviews
 */
import mongoose from 'mongoose'
import { env } from './config/env'
import { Category } from './models/category.model'
import { Product } from './models/product.model'
import { User } from './models/user.model'
import { Coupon } from './models/coupon.model'
import { Order } from './models/order.model'
import { Review } from './models/review.model'
import { Cart } from './models/cart.model'
import { Wishlist } from './models/wishlist.model'
import { hashPassword } from './utils/password'
import { generateOrderNumber } from './utils/orderNumber'
import { toSlug } from './utils/slug'

const UNSPLASH_BASE = 'https://images.unsplash.com/photo-'

function img(id: string, alt: string) {
  return { url: `${UNSPLASH_BASE}${id}?w=800&auto=format`, alt }
}

async function seed() {
  // eslint-disable-next-line no-console
  console.log('[seed] connecting to MongoDB…')
  await mongoose.connect(env.MONGODB_URI)
  // eslint-disable-next-line no-console
  console.log('[seed] connected')

  // Clear existing data
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    User.deleteMany({}),
    Coupon.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
  ])
  // eslint-disable-next-line no-console
  console.log('[seed] cleared existing data')

  // ── Categories ─────────────────────────────────────────────────────────────
  const categoryDefs = [
    {
      name: 'Electronics',
      description: 'Cutting-edge gadgets and tech',
      imageUrl: `${UNSPLASH_BASE}1518770660439-4636190af475?w=600&auto=format`,
      order: 1,
    },
    {
      name: 'Audio',
      description: 'Premium headphones and speakers',
      imageUrl: `${UNSPLASH_BASE}1505740420928-5e560c06d30e?w=600&auto=format`,
      order: 2,
    },
    {
      name: 'Smart Home',
      description: 'Automate your living space',
      imageUrl: `${UNSPLASH_BASE}1558618666-fcd25c85cd64?w=600&auto=format`,
      order: 3,
    },
    {
      name: 'Wearables',
      description: 'Smartwatches and fitness trackers',
      imageUrl: `${UNSPLASH_BASE}1523275335684-37898b6baf30?w=600&auto=format`,
      order: 4,
    },
    {
      name: 'Photography',
      description: 'Cameras, lenses and accessories',
      imageUrl: `${UNSPLASH_BASE}1516035069371-29a1b244cc32?w=600&auto=format`,
      order: 5,
    },
    {
      name: 'Gaming',
      description: 'Consoles, peripherals and accessories',
      imageUrl: `${UNSPLASH_BASE}1593305841991-05c297ba4575?w=600&auto=format`,
      order: 6,
    },
  ]

  const cats = await Category.insertMany(categoryDefs.map((c) => ({ ...c, slug: toSlug(c.name) })))
  const catId = (name: string) => cats.find((c) => c.name === name)!._id
  // eslint-disable-next-line no-console
  console.log('[seed] created', cats.length, 'categories')

  // ── Products (40 total) ────────────────────────────────────────────────────
  const productDefs = [
    // Electronics (8)
    {
      title: 'AuraTech ProBook X1',
      brand: 'AuraTech',
      category: catId('Electronics'),
      price: 1299,
      compareAtPrice: 1499,
      description:
        'Ultra-slim 14" OLED laptop with AI-powered performance. 16GB RAM, 512GB NVMe SSD, Intel Core Ultra 7 processor. The perfect fusion of power and portability.',
      images: [img('1496181133206-80ce9b88a853', 'AuraTech ProBook X1 laptop')],
      variants: [
        {
          name: 'Storage',
          options: [
            { label: '512GB', value: '512gb' },
            { label: '1TB', value: '1tb', stockDelta: -5 },
          ],
        },
        {
          name: 'Color',
          options: [
            { label: 'Space Black', value: 'black', hex: '#1a1a2e' },
            { label: 'Silver', value: 'silver', hex: '#c0c0c0' },
          ],
        },
      ],
      specs: [
        { key: 'Processor', value: 'Intel Core Ultra 7 155H' },
        { key: 'RAM', value: '16GB LPDDR5' },
        { key: 'Display', value: '14" 2.8K OLED 120Hz' },
        { key: 'Battery', value: '80Wh, up to 18h' },
      ],
      tags: ['laptop', 'ultrabook', 'oled', 'ai-pc'],
      stock: 45,
      isFeatured: true,
      isBestseller: true,
      ratingAvg: 4.7,
      ratingCount: 312,
      soldCount: 890,
    },
    {
      title: 'NovaMind Tab Pro',
      brand: 'NovaMind',
      category: catId('Electronics'),
      price: 899,
      compareAtPrice: 999,
      description:
        'Professional 12.9" tablet with M3-class chip. Stunning Liquid Retina XDR display, all-day battery, and Apple Pencil support. Perfect for creators and professionals.',
      images: [img('1544244015-0df4cec9d125', 'NovaMind Tab Pro tablet')],
      variants: [
        {
          name: 'Storage',
          options: [
            { label: '256GB', value: '256gb' },
            { label: '512GB', value: '512gb', stockDelta: -10 },
          ],
        },
      ],
      specs: [
        { key: 'Display', value: '12.9" Liquid Retina XDR' },
        { key: 'Chip', value: 'M3 class' },
        { key: 'Battery', value: '40.88Wh, up to 10h' },
      ],
      tags: ['tablet', 'pro', 'creator', 'm3'],
      stock: 38,
      isFeatured: true,
      ratingAvg: 4.8,
      ratingCount: 524,
      soldCount: 1200,
    },
    {
      title: 'ZenPhone 15 Ultra',
      brand: 'ZenMobile',
      category: catId('Electronics'),
      price: 1099,
      compareAtPrice: 1199,
      description:
        'Flagship smartphone with 200MP periscope camera, 6.8" QHD+ AMOLED 144Hz display, 5000mAh battery with 100W charging. Sets the new standard.',
      images: [img('1511707171634-56260cf62d49', 'ZenPhone 15 Ultra smartphone')],
      variants: [
        {
          name: 'Color',
          options: [
            { label: 'Phantom Black', value: 'black', hex: '#0d0d0d' },
            { label: 'Aurora Blue', value: 'blue', hex: '#1a4bff' },
            { label: 'Ivory White', value: 'white', hex: '#f5f5f0' },
          ],
        },
      ],
      specs: [
        { key: 'Display', value: '6.8" QHD+ AMOLED 144Hz' },
        { key: 'Camera', value: '200MP + 50MP + 10MP' },
        { key: 'Battery', value: '5000mAh 100W charging' },
      ],
      tags: ['smartphone', 'flagship', '5g', 'camera'],
      stock: 60,
      isBestseller: true,
      ratingAvg: 4.6,
      ratingCount: 891,
      soldCount: 2100,
    },
    {
      title: 'QuantumDrive SSD 2TB',
      brand: 'QuantumStore',
      category: catId('Electronics'),
      price: 189,
      compareAtPrice: 249,
      description:
        'NVMe PCIe 5.0 SSD delivering 14,500 MB/s read speeds. Premium thermal management, 2TB capacity, 5-year warranty.',
      images: [img('1597872200026-c5d4d36cf065', 'QuantumDrive SSD')],
      variants: [
        {
          name: 'Capacity',
          options: [
            { label: '1TB', value: '1tb' },
            { label: '2TB', value: '2tb', stockDelta: -20 },
            { label: '4TB', value: '4tb', stockDelta: -30 },
          ],
        },
      ],
      specs: [
        { key: 'Interface', value: 'PCIe 5.0 x4 NVMe 2.0' },
        { key: 'Read Speed', value: '14,500 MB/s' },
        { key: 'Write Speed', value: '12,700 MB/s' },
      ],
      tags: ['storage', 'ssd', 'nvme', 'pcie5'],
      stock: 120,
      ratingAvg: 4.9,
      ratingCount: 267,
      soldCount: 540,
    },
    {
      title: 'LumoPad 4K Drawing Tablet',
      brand: 'LumoArts',
      category: catId('Electronics'),
      price: 349,
      description:
        'Professional drawing tablet with 4K display, 8192 pressure levels, and tilt recognition. Built for professional digital artists.',
      images: [img('1615729947596-a598e5de0ab3', 'LumoPad drawing tablet')],
      specs: [
        { key: 'Display', value: '13.3" 4K IPS' },
        { key: 'Pressure Levels', value: '8192' },
        { key: 'Active Area', value: '11.6" × 6.5"' },
      ],
      tags: ['drawing-tablet', 'creative', 'artist', 'digital-art'],
      stock: 29,
      isFeatured: true,
      ratingAvg: 4.8,
      ratingCount: 145,
      soldCount: 320,
    },
    {
      title: 'NovaMind 4K Webcam Pro',
      brand: 'NovaMind',
      category: catId('Electronics'),
      price: 229,
      compareAtPrice: 279,
      description:
        'Studio-quality 4K webcam with AI-powered auto-framing, background removal, and noise cancellation. Perfect for remote work and streaming.',
      images: [img('1587825140708-dfb2d4ddf5f1', 'NovaMind 4K Webcam')],
      specs: [
        { key: 'Resolution', value: '4K 30fps / 1080p 60fps' },
        { key: 'Field of View', value: '90° adjustable' },
        { key: 'Microphone', value: 'Dual beamforming' },
      ],
      tags: ['webcam', 'streaming', '4k', 'remote-work'],
      stock: 55,
      ratingAvg: 4.5,
      ratingCount: 334,
      soldCount: 780,
    },
    {
      title: 'AuraTech MagDock Pro',
      brand: 'AuraTech',
      category: catId('Electronics'),
      price: 179,
      description:
        '13-in-1 Thunderbolt 4 dock with 96W laptop charging, dual 4K display support, and 2.5Gbps ethernet.',
      images: [img('1593642632559-0c6d3fc62b89', 'AuraTech MagDock')],
      specs: [
        { key: 'Ports', value: '2× TB4, 3× USB-A, 2× HDMI, 1× SD, 2.5Gbps LAN' },
        { key: 'Power Delivery', value: '96W' },
      ],
      tags: ['dock', 'thunderbolt4', 'hub', 'wfh'],
      stock: 40,
      ratingAvg: 4.7,
      ratingCount: 198,
      soldCount: 450,
    },
    {
      title: 'PixelPad Wireless Charger',
      brand: 'PixelPower',
      category: catId('Electronics'),
      price: 79,
      description:
        '65W multi-device wireless charging pad for 3 devices simultaneously. MagSafe compatible, smart chip prevents overcharging.',
      images: [img('1570891836654-d4a0d7e8b85c', 'PixelPad Wireless Charger')],
      specs: [
        { key: 'Max Power', value: '65W total (15W per device)' },
        { key: 'Compatibility', value: 'Qi, MagSafe, Qi2' },
      ],
      tags: ['wireless-charging', 'magsafe', 'accessories'],
      stock: 88,
      ratingAvg: 4.4,
      ratingCount: 412,
      soldCount: 960,
    },

    // Audio (7)
    {
      title: 'SonicVeil Pro ANC',
      brand: 'SonicLab',
      category: catId('Audio'),
      price: 349,
      compareAtPrice: 399,
      description:
        'Industry-leading active noise cancellation with 30-hour battery. Custom 40mm drivers deliver audiophile-grade sound. Premium leather cushions.',
      images: [img('1505740420928-5e560c06d30e', 'SonicVeil Pro headphones')],
      variants: [
        {
          name: 'Color',
          options: [
            { label: 'Midnight Black', value: 'black', hex: '#0d0d0d' },
            { label: 'Pearl White', value: 'white', hex: '#f0f0f0' },
            { label: 'Navy Blue', value: 'navy', hex: '#1a2f5e' },
          ],
        },
      ],
      specs: [
        { key: 'Driver Size', value: '40mm custom' },
        { key: 'Frequency Response', value: '4Hz – 40kHz' },
        { key: 'Battery Life', value: '30h ANC on, 40h ANC off' },
        { key: 'Charging', value: 'USB-C, 5min → 3h' },
      ],
      tags: ['headphones', 'anc', 'over-ear', 'wireless'],
      stock: 70,
      isFeatured: true,
      isBestseller: true,
      ratingAvg: 4.8,
      ratingCount: 678,
      soldCount: 1560,
    },
    {
      title: 'BeatPods X True Wireless',
      brand: 'BeatLab',
      category: catId('Audio'),
      price: 199,
      compareAtPrice: 249,
      description:
        '11mm dynamic drivers, 6h battery (30h with case), IPX5 water resistance. Adaptive EQ automatically tunes music to your ear shape.',
      images: [img('1590658268037-41402bb9a3ee', 'BeatPods X earbuds')],
      variants: [
        {
          name: 'Color',
          options: [
            { label: 'Carbon Black', value: 'black', hex: '#1c1c1e' },
            { label: 'Sky Blue', value: 'blue', hex: '#5ac8fa' },
            { label: 'Rose', value: 'rose', hex: '#ff6b6b' },
          ],
        },
      ],
      specs: [
        { key: 'Driver', value: '11mm dynamic + balanced armature' },
        { key: 'Battery', value: '6h + 24h case' },
        { key: 'Water Resistance', value: 'IPX5' },
      ],
      tags: ['earbuds', 'tws', 'anc', 'wireless'],
      stock: 95,
      isBestseller: true,
      ratingAvg: 4.7,
      ratingCount: 1024,
      soldCount: 3200,
    },
    {
      title: 'AuralSphere Studio Monitor',
      brand: 'AuralAudio',
      category: catId('Audio'),
      price: 599,
      description:
        'Near-field studio monitor with beryllium tweeter and 6.5" Kevlar woofer. Flat frequency response for professional mixing and mastering.',
      images: [img('1558618666-fcd25c85cd64', 'AuralSphere monitor speaker')],
      specs: [
        { key: 'Tweeter', value: '1" beryllium dome' },
        { key: 'Woofer', value: '6.5" Kevlar cone' },
        { key: 'Frequency Response', value: '42Hz – 50kHz' },
        { key: 'Amplifier', value: '100W biamp class D' },
      ],
      tags: ['studio-monitor', 'professional', 'music-production'],
      stock: 18,
      isFeatured: true,
      ratingAvg: 4.9,
      ratingCount: 87,
      soldCount: 145,
    },
    {
      title: 'WaveForm Portable Speaker',
      brand: 'WaveAudio',
      category: catId('Audio'),
      price: 149,
      compareAtPrice: 179,
      description:
        '360° surround sound in a portable package. IPX7 waterproof, 20-hour battery, dual passive radiators for deep bass. Party mode connects two speakers.',
      images: [img('1608043152269-423dbba4e7e1', 'WaveForm portable speaker')],
      variants: [
        {
          name: 'Color',
          options: [
            { label: 'Onyx', value: 'black', hex: '#1a1a2e' },
            { label: 'Ocean', value: 'blue', hex: '#006994' },
            { label: 'Forest', value: 'green', hex: '#228B22' },
          ],
        },
      ],
      specs: [
        { key: 'Battery Life', value: '20 hours' },
        { key: 'Water Resistance', value: 'IPX7' },
        { key: 'Driver', value: 'Dual 2.5" + 2 passive radiators' },
      ],
      tags: ['portable-speaker', 'waterproof', 'outdoor', 'bluetooth'],
      stock: 62,
      isBestseller: true,
      ratingAvg: 4.6,
      ratingCount: 445,
      soldCount: 1100,
    },
    {
      title: 'PureTone USB-C DAC Amp',
      brand: 'PureAudio',
      category: catId('Audio'),
      price: 89,
      description:
        'Hi-Res audio DAC/amp dongle supporting PCM 384kHz/32-bit and DSD256. Drives headphones up to 300Ω with crystal clarity.',
      images: [img('1607619056574-7b8d3ee536b2', 'PureTone DAC amplifier')],
      specs: [
        { key: 'DAC Chip', value: 'ESS9281C PRO' },
        { key: 'Output Power', value: '120mW @ 32Ω' },
        { key: 'THD+N', value: '-115dB' },
      ],
      tags: ['dac', 'amp', 'hi-res', 'audiophile'],
      stock: 45,
      ratingAvg: 4.8,
      ratingCount: 213,
      soldCount: 490,
    },
    {
      title: 'SonicLab Vinyl Preamp',
      brand: 'SonicLab',
      category: catId('Audio'),
      price: 129,
      description:
        'RIAA phono preamplifier for turntables. Ultra-low noise floor, subsonic filter, RCA and USB output.',
      images: [img('1619983081593-e7ba40e09bf0', 'SonicLab Vinyl Preamp')],
      specs: [
        { key: 'RIAA Accuracy', value: '±0.2dB' },
        { key: 'Signal-to-Noise', value: '80dB A-weighted' },
        { key: 'Output', value: 'RCA + USB-B' },
      ],
      tags: ['vinyl', 'turntable', 'audiophile', 'preamp'],
      stock: 22,
      ratingAvg: 4.7,
      ratingCount: 98,
      soldCount: 210,
    },
    {
      title: 'ClearMic Studio USB',
      brand: 'ClearSound',
      category: catId('Audio'),
      price: 159,
      description:
        'Condenser microphone with cardioid polar pattern, real-time monitoring, and zero-latency headphone output. Built for podcasters and streamers.',
      images: [img('1478737270239-2f02b77fc618', 'ClearMic Studio microphone')],
      specs: [
        { key: 'Polar Pattern', value: 'Cardioid' },
        { key: 'Frequency Response', value: '20Hz – 20kHz' },
        { key: 'Bit Depth', value: '24-bit / 96kHz' },
      ],
      tags: ['microphone', 'podcast', 'streaming', 'condenser'],
      stock: 35,
      isFeatured: true,
      ratingAvg: 4.6,
      ratingCount: 287,
      soldCount: 640,
    },

    // Smart Home (6)
    {
      title: 'NexaHub Smart Controller',
      brand: 'NexaHome',
      category: catId('Smart Home'),
      price: 199,
      description:
        'Central hub for all your smart devices. Supports Matter, Zigbee, Z-Wave, and Thread protocols. Controls up to 200 devices with voice and app.',
      images: [img('1558618666-fcd25c85cd64', 'NexaHub smart home controller')],
      specs: [
        { key: 'Protocols', value: 'Matter, Zigbee, Z-Wave, Thread, Wi-Fi 6' },
        { key: 'Max Devices', value: '200' },
        { key: 'Voice Assistants', value: 'Alexa, Google, Siri' },
      ],
      tags: ['smart-home', 'hub', 'matter', 'zigbee'],
      stock: 34,
      isFeatured: true,
      ratingAvg: 4.6,
      ratingCount: 189,
      soldCount: 420,
    },
    {
      title: 'LumoRing Video Doorbell Pro',
      brand: 'LumoHome',
      category: catId('Smart Home'),
      price: 249,
      compareAtPrice: 299,
      description:
        '4K HDR video doorbell with 3D motion zones, package detection, and local storage. Works with all major smart home ecosystems.',
      images: [img('1558618666-fcd25c85cd64', 'LumoRing Video Doorbell')],
      specs: [
        { key: 'Resolution', value: '4K HDR' },
        { key: 'Field of View', value: '180° × 180°' },
        { key: 'Storage', value: 'Local + Cloud' },
      ],
      tags: ['doorbell', 'security', '4k', 'smart-home'],
      stock: 28,
      ratingAvg: 4.5,
      ratingCount: 234,
      soldCount: 520,
    },
    {
      title: 'AirPure Smart Air Purifier',
      brand: 'AirTech',
      category: catId('Smart Home'),
      price: 299,
      description:
        'AI-powered air purifier with HEPA-14 filter, removes 99.97% of particles. Auto mode adapts to air quality in real-time.',
      images: [img('1558618666-fcd25c85cd64', 'AirPure smart air purifier')],
      specs: [
        { key: 'CADR', value: '380 m³/h' },
        { key: 'Coverage', value: 'Up to 70 m²' },
        { key: 'Filter', value: 'HEPA-14 + Activated carbon' },
      ],
      tags: ['air-purifier', 'hepa', 'smart-home', 'health'],
      stock: 22,
      ratingAvg: 4.7,
      ratingCount: 156,
      soldCount: 345,
    },
    {
      title: 'ChronoThermost Smart Thermostat',
      brand: 'ChronoClimate',
      category: catId('Smart Home'),
      price: 149,
      description:
        'Learning thermostat that auto-schedules based on your habits. Saves up to 23% on heating and cooling bills.',
      images: [img('1558618666-fcd25c85cd64', 'ChronoThermost smart thermostat')],
      specs: [
        { key: 'Compatibility', value: 'Most 24V HVAC systems' },
        { key: 'Display', value: '3.5" color touchscreen' },
        { key: 'Connectivity', value: 'Wi-Fi 802.11n, Bluetooth 5.0' },
      ],
      tags: ['thermostat', 'energy-saving', 'smart-home'],
      stock: 48,
      isBestseller: true,
      ratingAvg: 4.5,
      ratingCount: 312,
      soldCount: 720,
    },
    {
      title: 'NexaStrip LED Smart Lights',
      brand: 'NexaHome',
      category: catId('Smart Home'),
      price: 59,
      description:
        '5m addressable RGB LED strip with 16M colors, music sync, and scene modes. Works with Matter and all major assistants.',
      images: [img('1558618666-fcd25c85cd64', 'NexaStrip LED lights')],
      specs: [
        { key: 'Length', value: '5m (extendable to 30m)' },
        { key: 'Colors', value: '16 million RGBIC' },
        { key: 'Brightness', value: '1200 lumens/m' },
      ],
      tags: ['led', 'rgb', 'smart-lights', 'matter'],
      stock: 150,
      ratingAvg: 4.4,
      ratingCount: 567,
      soldCount: 1800,
    },
    {
      title: 'QuietBot Robot Vacuum Pro',
      brand: 'CleanTech',
      category: catId('Smart Home'),
      price: 449,
      compareAtPrice: 549,
      description:
        'LiDAR navigation robot vacuum and mop. 5000Pa suction, auto-empty base, AI obstacle avoidance. Maps multi-floor homes automatically.',
      images: [img('1558618666-fcd25c85cd64', 'QuietBot robot vacuum')],
      specs: [
        { key: 'Suction', value: '5000Pa' },
        { key: 'Navigation', value: 'LiDAR + AI Vision' },
        { key: 'Battery', value: '5200mAh, up to 180min' },
      ],
      tags: ['robot-vacuum', 'smart-home', 'cleaning', 'lidar'],
      stock: 19,
      isFeatured: true,
      ratingAvg: 4.7,
      ratingCount: 423,
      soldCount: 890,
    },

    // Wearables (6)
    {
      title: 'ChronoX Pro Smartwatch',
      brand: 'ChronoWear',
      category: catId('Wearables'),
      price: 399,
      compareAtPrice: 449,
      description:
        'Premium titanium smartwatch with AMOLED always-on display, advanced health monitoring (ECG, blood oxygen, continuous glucose sensing), and 5-day battery.',
      images: [img('1523275335684-37898b6baf30', 'ChronoX Pro smartwatch')],
      variants: [
        {
          name: 'Case Size',
          options: [
            { label: '41mm', value: '41' },
            { label: '45mm', value: '45' },
          ],
        },
        {
          name: 'Band',
          options: [
            { label: 'Titanium', value: 'titanium', stockDelta: -10 },
            { label: 'Sport Band', value: 'sport' },
          ],
        },
      ],
      specs: [
        { key: 'Display', value: '1.9" AMOLED AOD' },
        { key: 'Battery', value: '5 days typical' },
        { key: 'Health', value: 'ECG, SpO2, Glucose, Stress' },
        { key: 'Water Resistance', value: '10ATM' },
      ],
      tags: ['smartwatch', 'health', 'ecg', 'titanium'],
      stock: 42,
      isFeatured: true,
      isBestseller: true,
      ratingAvg: 4.7,
      ratingCount: 534,
      soldCount: 1100,
    },
    {
      title: 'FitCore Band 6 Ultra',
      brand: 'FitTech',
      category: catId('Wearables'),
      price: 149,
      compareAtPrice: 179,
      description:
        'Advanced fitness band with GPS, 24/7 heart rate, sleep staging, and 14-day battery. Tracks 100+ workout types automatically.',
      images: [img('1523275335684-37898b6baf30', 'FitCore Band fitness tracker')],
      variants: [
        {
          name: 'Color',
          options: [
            { label: 'Midnight', value: 'black', hex: '#1c1c1e' },
            { label: 'Coral', value: 'coral', hex: '#ff6b6b' },
            { label: 'Sage', value: 'sage', hex: '#8a9a5b' },
          ],
        },
      ],
      specs: [
        { key: 'GPS', value: 'Multi-band GPS/GLONASS' },
        { key: 'Battery', value: '14 days typical, 20h GPS' },
        { key: 'Sensors', value: 'HR, SpO2, Skin temp, EDA' },
      ],
      tags: ['fitness-tracker', 'gps', 'health', 'wearable'],
      stock: 75,
      isBestseller: true,
      ratingAvg: 4.5,
      ratingCount: 789,
      soldCount: 2100,
    },
    {
      title: 'Lumina AR Glasses Lite',
      brand: 'LuminaTech',
      category: catId('Wearables'),
      price: 599,
      description:
        'Lightweight AR glasses with 50° field of view, spatial computing, and 4h battery. Real-world overlay for navigation, notifications, and apps.',
      images: [img('1523275335684-37898b6baf30', 'Lumina AR glasses')],
      specs: [
        { key: 'FOV', value: '50° diagonal' },
        { key: 'Display', value: 'Waveguide holographic' },
        { key: 'Battery', value: '4h active use' },
        { key: 'Weight', value: '38g' },
      ],
      tags: ['ar-glasses', 'spatial-computing', 'wearable', 'futuristic'],
      stock: 12,
      isFeatured: true,
      ratingAvg: 4.3,
      ratingCount: 67,
      soldCount: 95,
    },
    {
      title: 'ChronoX Sport Band 3-Pack',
      brand: 'ChronoWear',
      category: catId('Wearables'),
      price: 49,
      description:
        'Official ChronoX Pro compatible sport bands. Fluoroelastomer material, UV-resistant, 3 bands per pack.',
      images: [img('1523275335684-37898b6baf30', 'ChronoX sport bands')],
      variants: [
        {
          name: 'Size',
          options: [
            { label: 'S/M', value: 'sm' },
            { label: 'M/L', value: 'ml' },
          ],
        },
      ],
      specs: [
        { key: 'Material', value: 'Fluoroelastomer' },
        { key: 'Compatibility', value: 'ChronoX 41mm & 45mm' },
      ],
      tags: ['watch-band', 'accessories', 'sport'],
      stock: 120,
      ratingAvg: 4.6,
      ratingCount: 234,
      soldCount: 680,
    },
    {
      title: 'PulseRing Health Monitor',
      brand: 'PulseHealth',
      category: catId('Wearables'),
      price: 299,
      description:
        'Smart ring with continuous HRV, body temperature, and sleep tracking. 7-day battery in a titanium ring form factor. No charger needed most days.',
      images: [img('1523275335684-37898b6baf30', 'PulseRing health monitor')],
      variants: [
        {
          name: 'Size',
          options: [
            { label: 'US 6', value: '6' },
            { label: 'US 7', value: '7' },
            { label: 'US 8', value: '8' },
            { label: 'US 9', value: '9' },
          ],
        },
      ],
      specs: [
        { key: 'Battery', value: '7 days' },
        { key: 'Sensors', value: 'HRV, SpO2, Temperature, Accelerometer' },
        { key: 'Material', value: 'Grade 5 Titanium' },
      ],
      tags: ['smart-ring', 'health', 'hrv', 'sleep'],
      stock: 30,
      ratingAvg: 4.8,
      ratingCount: 178,
      soldCount: 380,
    },
    {
      title: 'NeuroCalm Stress Wristband',
      brand: 'NeuroWell',
      category: catId('Wearables'),
      price: 179,
      description:
        'Biofeedback wristband that detects stress and delivers gentle electrical pulses to activate the vagus nerve. Clinically validated calm-on-demand.',
      images: [img('1523275335684-37898b6baf30', 'NeuroCalm stress wristband')],
      specs: [
        { key: 'Sensors', value: 'EDA, PPG, Temperature' },
        { key: 'Stimulation', value: '0.5mA TENS (vagus nerve)' },
        { key: 'Battery', value: '5 days' },
      ],
      tags: ['stress', 'wellness', 'biofeedback', 'wearable'],
      stock: 25,
      ratingAvg: 4.2,
      ratingCount: 134,
      soldCount: 290,
    },

    // Photography (6)
    {
      title: 'LensX Mirrorless M5',
      brand: 'LensX',
      category: catId('Photography'),
      price: 2199,
      compareAtPrice: 2499,
      description:
        'Full-frame 45MP mirrorless camera with in-body 8-stop stabilization, 120fps 4K video, and AI-powered subject tracking. Built for professionals.',
      images: [img('1516035069371-29a1b244cc32', 'LensX M5 mirrorless camera')],
      specs: [
        { key: 'Sensor', value: '45MP full-frame BSI-CMOS' },
        { key: 'IBIS', value: '8-stop 5-axis' },
        { key: 'Video', value: '4K 120fps, 8K 30fps' },
        { key: 'AF Points', value: '759 phase-detect' },
      ],
      tags: ['camera', 'mirrorless', 'full-frame', 'professional'],
      stock: 15,
      isFeatured: true,
      ratingAvg: 4.9,
      ratingCount: 89,
      soldCount: 180,
    },
    {
      title: 'LensX 24-70mm f/2.8 GM',
      brand: 'LensX',
      category: catId('Photography'),
      price: 1699,
      description:
        'Professional standard zoom lens with constant f/2.8 aperture. XA element and dual ED glass for stunning sharpness and 11-blade circular aperture bokeh.',
      images: [img('1516035069371-29a1b244cc32', 'LensX 24-70mm lens')],
      specs: [
        { key: 'Focal Length', value: '24-70mm' },
        { key: 'Aperture', value: 'f/2.8 constant' },
        { key: 'Elements', value: '18 in 13 groups' },
        { key: 'Weight', value: '886g' },
      ],
      tags: ['lens', '24-70', 'zoom', 'professional'],
      stock: 10,
      ratingAvg: 4.9,
      ratingCount: 122,
      soldCount: 240,
    },
    {
      title: 'PhotoLite Studio LED Kit',
      brand: 'PhotoLite',
      category: catId('Photography'),
      price: 399,
      compareAtPrice: 499,
      description:
        'Professional 2-light LED studio kit with adjustable color temperature (2700K-6500K), CRI 97+, and 120W output each. Includes stands and modifiers.',
      images: [img('1516035069371-29a1b244cc32', 'PhotoLite studio lights')],
      specs: [
        { key: 'Power', value: '120W × 2' },
        { key: 'Color Temperature', value: '2700K – 6500K' },
        { key: 'CRI', value: '97+' },
        { key: 'TLCI', value: '98+' },
      ],
      tags: ['lighting', 'studio', 'led', 'photography'],
      stock: 20,
      ratingAvg: 4.7,
      ratingCount: 143,
      soldCount: 310,
    },
    {
      title: 'SkyPilot Drone 4K Max',
      brand: 'SkyTech',
      category: catId('Photography'),
      price: 899,
      compareAtPrice: 1099,
      description:
        '4K 60fps gimbal drone with 40-min flight time, 15km transmission range, obstacle avoidance, and fold-flat design. Perfect for aerial photography.',
      images: [img('1516035069371-29a1b244cc32', 'SkyPilot drone')],
      specs: [
        { key: 'Camera', value: '4K 60fps 3-axis gimbal' },
        { key: 'Flight Time', value: '40 minutes' },
        { key: 'Range', value: '15km O3 Pro' },
        { key: 'Wind Resistance', value: 'Level 7' },
      ],
      tags: ['drone', 'aerial', '4k', 'photography'],
      stock: 16,
      isFeatured: true,
      ratingAvg: 4.7,
      ratingCount: 234,
      soldCount: 420,
    },
    {
      title: 'PocketCam Action 4',
      brand: 'PocketTech',
      category: catId('Photography'),
      price: 349,
      description:
        '5.3K 60fps action camera with 1/1.9" sensor, HorizonSteady stabilization, and dual-screen design. Waterproof to 18m without a case.',
      images: [img('1516035069371-29a1b244cc32', 'PocketCam Action 4')],
      specs: [
        { key: 'Resolution', value: '5.3K 60fps' },
        { key: 'Stabilization', value: 'HorizonSteady 6-axis' },
        { key: 'Waterproof', value: '18m' },
      ],
      tags: ['action-camera', 'waterproof', '5k', 'adventure'],
      stock: 37,
      isBestseller: true,
      ratingAvg: 4.6,
      ratingCount: 456,
      soldCount: 980,
    },
    {
      title: 'LensX ProGrip L-Bracket',
      brand: 'LensX',
      category: catId('Photography'),
      price: 89,
      description:
        'CNC-machined aluminum L-bracket for LensX M5. Arca-Swiss compatible, maintains all ports and battery access.',
      images: [img('1516035069371-29a1b244cc32', 'LensX L-bracket')],
      specs: [
        { key: 'Material', value: 'CNC 6061 aluminum' },
        { key: 'Compatibility', value: 'LensX M5' },
        { key: 'Weight', value: '125g' },
      ],
      tags: ['l-bracket', 'tripod', 'accessories', 'photography'],
      stock: 28,
      ratingAvg: 4.8,
      ratingCount: 78,
      soldCount: 165,
    },

    // Gaming (7)
    {
      title: 'NebulaX Gaming Monitor 32"',
      brand: 'NebulaDisplay',
      category: catId('Gaming'),
      price: 899,
      compareAtPrice: 1099,
      description:
        '32" 4K Mini-LED gaming monitor. 144Hz refresh, 1ms response, 1000 local dimming zones, HDR2000 certified. G-Sync and FreeSync Premium Pro.',
      images: [img('1593305841991-05c297ba4575', 'NebulaX gaming monitor')],
      specs: [
        { key: 'Resolution', value: '4K UHD 3840×2160' },
        { key: 'Refresh Rate', value: '144Hz' },
        { key: 'Panel', value: '32" Mini-LED IPS' },
        { key: 'HDR', value: 'DisplayHDR 2000' },
      ],
      tags: ['monitor', '4k', 'gaming', 'mini-led'],
      stock: 22,
      isFeatured: true,
      ratingAvg: 4.8,
      ratingCount: 312,
      soldCount: 640,
    },
    {
      title: 'StrikeForce Pro Keyboard',
      brand: 'StrikeGear',
      category: catId('Gaming'),
      price: 179,
      compareAtPrice: 199,
      description:
        'Mechanical gaming keyboard with Hall effect magnetic switches, per-key RGB, and programmable macros. Gasket mount for premium typing feel.',
      images: [img('1593305841991-05c297ba4575', 'StrikeForce Pro keyboard')],
      variants: [
        {
          name: 'Switch',
          options: [
            { label: 'Linear (Red)', value: 'linear' },
            { label: 'Tactile (Brown)', value: 'tactile' },
            { label: 'Clicky (Blue)', value: 'clicky' },
          ],
        },
      ],
      specs: [
        { key: 'Switch Type', value: 'Hall Effect Magnetic' },
        { key: 'Actuation Force', value: '45g (adjustable)' },
        { key: 'Polling Rate', value: '8000Hz' },
        { key: 'Mount', value: 'Gasket' },
      ],
      tags: ['keyboard', 'mechanical', 'gaming', 'rgb'],
      stock: 55,
      isBestseller: true,
      ratingAvg: 4.7,
      ratingCount: 567,
      soldCount: 1300,
    },
    {
      title: 'AimPro Wireless Gaming Mouse',
      brand: 'AimTech',
      category: catId('Gaming'),
      price: 159,
      compareAtPrice: 179,
      description:
        'Ultralight 55g wireless gaming mouse with 36,000 DPI sensor, 95h battery, and 8K polling rate. Hyper-glide PTFE skates.',
      images: [img('1593305841991-05c297ba4575', 'AimPro gaming mouse')],
      variants: [
        {
          name: 'Color',
          options: [
            { label: 'Matte Black', value: 'black', hex: '#1a1a1a' },
            { label: 'Arctic White', value: 'white', hex: '#f5f5f5' },
          ],
        },
      ],
      specs: [
        { key: 'Sensor', value: 'PixArt PAW3395 36K DPI' },
        { key: 'Weight', value: '55g' },
        { key: 'Battery', value: '95h @ 1000Hz polling' },
        { key: 'Polling Rate', value: '8000Hz' },
      ],
      tags: ['mouse', 'wireless', 'gaming', 'ultralight'],
      stock: 48,
      isBestseller: true,
      ratingAvg: 4.8,
      ratingCount: 634,
      soldCount: 1450,
    },
    {
      title: 'CloudPad XL Gaming Mousepad',
      brand: 'AimTech',
      category: catId('Gaming'),
      price: 49,
      description:
        '900×400mm extended gaming mousepad with micro-textured surface, non-slip rubber base, and RGB lighting edge. Perfect for low-DPI gaming.',
      images: [img('1593305841991-05c297ba4575', 'CloudPad XL mousepad')],
      specs: [
        { key: 'Size', value: '900 × 400 × 4mm' },
        { key: 'Surface', value: 'Micro-textured cloth' },
        { key: 'Lighting', value: 'Addressable RGB edge' },
      ],
      tags: ['mousepad', 'xl', 'rgb', 'gaming'],
      stock: 89,
      ratingAvg: 4.5,
      ratingCount: 345,
      soldCount: 920,
    },
    {
      title: 'SoundStrike Pro Gaming Headset',
      brand: 'SoundStrike',
      category: catId('Gaming'),
      price: 129,
      compareAtPrice: 149,
      description:
        '7.1 virtual surround sound gaming headset with Discord-certified microphone, plush memory foam earcups, and 70h wireless battery.',
      images: [img('1593305841991-05c297ba4575', 'SoundStrike gaming headset')],
      variants: [
        {
          name: 'Color',
          options: [
            { label: 'Black/Red', value: 'red', hex: '#8b0000' },
            { label: 'Black/Blue', value: 'blue', hex: '#00008b' },
          ],
        },
      ],
      specs: [
        { key: 'Audio', value: '50mm custom drivers, 7.1 virtual surround' },
        { key: 'Battery', value: '70h wireless' },
        { key: 'Microphone', value: 'Noise-cancelling flip-to-mute' },
      ],
      tags: ['headset', 'gaming', 'surround-sound', 'wireless'],
      stock: 60,
      ratingAvg: 4.5,
      ratingCount: 423,
      soldCount: 980,
    },
    {
      title: 'CaptureLink HD Game Capture',
      brand: 'CaptureWorks',
      category: catId('Gaming'),
      price: 119,
      description:
        '4K60 HDR passthrough capture card with USB 3.0, ultra-low latency, and Instant Gameview. Stream and record simultaneously.',
      images: [img('1593305841991-05c297ba4575', 'CaptureLink capture card')],
      specs: [
        { key: 'Capture Resolution', value: '4K30 / 1080p60 max record' },
        { key: 'Passthrough', value: '4K60 HDR' },
        { key: 'Latency', value: '<1ms passthrough' },
      ],
      tags: ['capture-card', 'streaming', 'gaming', '4k'],
      stock: 33,
      ratingAvg: 4.6,
      ratingCount: 198,
      soldCount: 430,
    },
    {
      title: 'TurboStick Pro Controller',
      brand: 'TurboPlay',
      category: catId('Gaming'),
      price: 79,
      compareAtPrice: 89,
      description:
        'Hall effect arcade-style controller with zero input lag, programmable buttons, and cross-platform compatibility (PC, console, mobile).',
      images: [img('1593305841991-05c297ba4575', 'TurboStick Pro controller')],
      variants: [
        {
          name: 'Color',
          options: [
            { label: 'Carbon', value: 'black', hex: '#1c1c1e' },
            { label: 'Neon Purple', value: 'purple', hex: '#7C5CFF' },
          ],
        },
      ],
      specs: [
        { key: 'Switches', value: 'Hall Effect (no drift)' },
        { key: 'Connectivity', value: 'USB-C + Bluetooth 5.2' },
        { key: 'Compatibility', value: 'PC, PS4/5, Switch, Android' },
      ],
      tags: ['controller', 'gamepad', 'hall-effect', 'cross-platform'],
      stock: 44,
      ratingAvg: 4.7,
      ratingCount: 289,
      soldCount: 670,
    },
  ]

  const products = await Product.insertMany(
    productDefs.map((p) => ({
      ...p,
      slug: toSlug(p.title),
      currency: 'USD',
      isActive: true,
    }))
  )
  // eslint-disable-next-line no-console
  console.log('[seed] created', products.length, 'products')

  // ── Users ───────────────────────────────────────────────────────────────────
  const userDefs = [
    {
      name: 'Admin User',
      email: 'admin@lumora.app',
      password: 'Lumora@123',
      role: 'admin' as const,
    },
    {
      name: 'Alice Chen',
      email: 'alice@lumora.app',
      password: 'Lumora@123',
      role: 'customer' as const,
    },
    {
      name: 'Bob Smith',
      email: 'bob@lumora.app',
      password: 'Lumora@123',
      role: 'customer' as const,
    },
    {
      name: 'Clara James',
      email: 'clara@lumora.app',
      password: 'Lumora@123',
      role: 'customer' as const,
    },
    {
      name: 'David Lee',
      email: 'david@lumora.app',
      password: 'Lumora@123',
      role: 'customer' as const,
    },
    {
      name: 'Eva Martinez',
      email: 'eva@lumora.app',
      password: 'Lumora@123',
      role: 'customer' as const,
    },
  ]

  const users = await Promise.all(
    userDefs.map(async ({ password, ...rest }) => {
      const passwordHash = await hashPassword(password)
      const u = new User({ ...rest, passwordHash })
      await u.save()
      return u
    })
  )
  // eslint-disable-next-line no-console
  console.log('[seed] created', users.length, 'users')

  // ── Coupons ─────────────────────────────────────────────────────────────────
  await Coupon.insertMany([
    { code: 'AURORA10', type: 'percent', value: 10, minSubtotal: 0, maxUses: 500, isActive: true },
    { code: 'WELCOME15', type: 'percent', value: 15, minSubtotal: 30, maxUses: 1, isActive: true },
    { code: 'FLAT20', type: 'fixed', value: 20, minSubtotal: 100, maxUses: 200, isActive: true },
  ])
  // eslint-disable-next-line no-console
  console.log('[seed] created 3 coupons')

  // ── Orders ──────────────────────────────────────────────────────────────────
  const defaultAddress = {
    fullName: 'Alice Chen',
    phone: '+1-555-0123',
    line1: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'US',
    isDefault: true,
  }

  const orderDefs = [
    {
      user: users[1]!,
      items: [
        { product: products[0]!, price: 1299, qty: 1 },
        { product: products[8]!, price: 349, qty: 1 },
      ],
      status: 'delivered' as const,
      total: 1648,
    },
    {
      user: users[1]!,
      items: [{ product: products[9]!, price: 199, qty: 2 }],
      status: 'shipped' as const,
      total: 398,
    },
    {
      user: users[2]!,
      items: [{ product: products[1]!, price: 899, qty: 1 }],
      status: 'placed' as const,
      total: 899,
    },
    {
      user: users[2]!,
      items: [
        { product: products[20]!, price: 399, qty: 1 },
        { product: products[30]!, price: 899, qty: 1 },
      ],
      status: 'packed' as const,
      total: 1298,
    },
    {
      user: users[3]!,
      items: [{ product: products[14]!, price: 399, qty: 1 }],
      status: 'delivered' as const,
      total: 399,
    },
    {
      user: users[4]!,
      items: [{ product: products[2]!, price: 1099, qty: 1 }],
      status: 'delivered' as const,
      total: 1099,
    },
  ]

  await Order.insertMany(
    orderDefs.map(({ user, items, status, total }) => ({
      orderNumber: generateOrderNumber(),
      user: user._id,
      items: items.map(({ product, price, qty }) => ({
        product: product._id,
        title: product.title,
        image: product.images[0]?.url ?? '',
        price,
        qty,
      })),
      shippingAddress: { ...defaultAddress, fullName: user.name },
      subtotal: total,
      discount: 0,
      shipping: total > 500 ? 0 : 9.99,
      total: total + (total > 500 ? 0 : 9.99),
      payment: { method: 'simulated', brandGuess: 'Visa', last4: '4242', status: 'paid' },
      status,
      statusHistory: [{ status, at: new Date() }],
      shippingMethod: { name: 'Standard Shipping', price: total > 500 ? 0 : 9.99, etaDays: 5 },
    }))
  )
  // eslint-disable-next-line no-console
  console.log('[seed] created 6 orders')

  // ── Reviews ─────────────────────────────────────────────────────────────────
  const reviewDefs = [
    {
      product: products[0]!,
      user: users[1]!,
      rating: 5,
      title: 'Stunning laptop',
      body: 'The OLED display is absolutely gorgeous. Performance is snappy and the battery easily lasts all day. Worth every penny.',
    },
    {
      product: products[0]!,
      user: users[2]!,
      rating: 4,
      title: 'Great but pricey',
      body: 'Excellent performance and display. Dock compatibility could be better but otherwise a top-tier ultrabook.',
    },
    {
      product: products[8]!,
      user: users[1]!,
      rating: 5,
      title: "Best headphones I've owned",
      body: 'Noise cancellation is phenomenal. Audio quality is reference-grade. The ear cushions are incredibly comfortable for long sessions.',
    },
    {
      product: products[8]!,
      user: users[3]!,
      rating: 5,
      title: 'Worth the price',
      body: 'Sound quality rivals headphones costing twice as much. ANC is excellent on planes and in offices.',
    },
    {
      product: products[9]!,
      user: users[2]!,
      rating: 5,
      title: 'Perfect earbuds',
      body: 'These fit great, sound amazing, and the ANC is solid. Battery life is excellent for the price.',
    },
    {
      product: products[9]!,
      user: users[4]!,
      rating: 4,
      title: 'Very good earbuds',
      body: 'Great sound and ANC. Touch controls take some getting used to but overall fantastic value.',
    },
    {
      product: products[1]!,
      user: users[2]!,
      rating: 5,
      title: 'Incredible tablet',
      body: 'The display is breathtaking. Perfect for digital art and note-taking. Best tablet on the market.',
    },
    {
      product: products[2]!,
      user: users[4]!,
      rating: 4,
      title: 'Great phone',
      body: 'Camera system is exceptional. Battery is good. UI is smooth and fast. The phone I recommend to everyone.',
    },
    {
      product: products[30]!,
      user: users[3]!,
      rating: 5,
      title: 'Gaming monitor goals',
      body: 'The Mini-LED backlighting makes dark scenes incredible. Colors pop, blacks are deep. 144Hz at 4K is buttery smooth.',
    },
    {
      product: products[31]!,
      user: users[4]!,
      rating: 5,
      title: 'Best keyboard ever',
      body: 'Hall effect switches are a game-changer — zero drift possible. Typing feel is premium. RGB is beautiful.',
    },
    {
      product: products[32]!,
      user: users[1]!,
      rating: 5,
      title: 'Ultralight perfection',
      body: "55g and it feels like you're moving nothing. Sensor is flawless, battery is incredible. Best mouse I've used.",
    },
    {
      product: products[22]!,
      user: users[1]!,
      rating: 5,
      title: 'Smart watch done right',
      body: 'The health tracking is accurate and comprehensive. Battery genuinely lasts 5 days. AMOLED display is stunning.',
    },
    {
      product: products[22]!,
      user: users[3]!,
      rating: 4,
      title: 'Nearly perfect',
      body: 'Great health features and beautiful design. App could use improvement but the hardware is excellent.',
    },
    {
      product: products[23]!,
      user: users[2]!,
      rating: 5,
      title: 'Best fitness tracker',
      body: "GPS accuracy is spot-on. Sleep tracking is detailed. 14-day battery means I forget it's even charging.",
    },
    {
      product: products[27]!,
      user: users[4]!,
      rating: 5,
      title: 'Professional grade',
      body: 'Image quality is outstanding. IBIS makes handheld shots crisp. Eye-tracking AF is wizardry.',
    },
    {
      product: products[28]!,
      user: users[3]!,
      rating: 4,
      title: 'Sharp and fast',
      body: 'The 24-70mm range covers almost every situation. f/2.8 in low light is a joy. A bit heavy but the quality justifies it.',
    },
    {
      product: products[36]!,
      user: users[1]!,
      rating: 5,
      title: 'Smart home game changer',
      body: "Controls everything in my home seamlessly. Setup took 20 minutes and it's been rock solid since.",
    },
    {
      product: products[14]!,
      user: users[3]!,
      rating: 4,
      title: 'Solid robot vacuum',
      body: 'LiDAR navigation is impressive — maps the house perfectly. Suction is powerful. Auto-empty base is worth it.',
    },
  ]

  await Review.insertMany(
    reviewDefs.map((r) => ({
      product: r.product._id,
      user: r.user._id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      isVerifiedPurchase: true,
      isApproved: true,
    }))
  )
  // eslint-disable-next-line no-console
  console.log('[seed] created', reviewDefs.length, 'reviews')

  // eslint-disable-next-line no-console
  console.log('\n[seed] ✓ Done! Database seeded successfully.')
  // eslint-disable-next-line no-console
  console.log('[seed] Admin credentials: admin@lumora.app / Lumora@123')
  // eslint-disable-next-line no-console
  console.log('[seed] Demo customer:    alice@lumora.app / Lumora@123')
  await mongoose.disconnect()
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] ERROR:', err)
  process.exit(1)
})
