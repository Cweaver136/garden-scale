/**
 * update-produce-images.mjs
 *
 * Reads all produce items from Firebase, matches each one to an OpenMoji
 * illustrated SVG (flat/digital style, CC BY-SA 4.0), and writes the image
 * URL back into produce_reference/<key>/image in the database.
 *
 * Usage (requires Node 18+):
 *   node scripts/update-produce-images.mjs
 *
 * Run a dry-run first to preview the matches without writing:
 *   node scripts/update-produce-images.mjs --dry-run
 */

const DRY_RUN = process.argv.includes('--dry-run');
const DATABASE_URL = 'https://weaver-farms-default-rtdb.firebaseio.com';

// OpenMoji 15 CDN — illustrated, flat-color SVG icons (not real photos)
// Full catalog: https://openmoji.org/library/
const OM = (code) => `https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/${code}.svg`;

// Keyword → OpenMoji SVG URL. Matched against the lowercase produce name.
// Add entries here for any produce not automatically matched.
const IMAGE_MAP = {
  // ── Vegetables ──────────────────────────────────────────────────────────
  'artichoke':        OM('1F9C5'),  // closest available (onion — update if needed)
  'arugula':          OM('1F96C'),  // leafy greens
  'asparagus':        OM('1F33F'),  // herb/plant
  'basil':            OM('1F33F'),
  'bean':             OM('1FAD8'),  // beans
  'beet':             OM('1F955'),
  'bell pepper':      OM('1FAD1'),
  'broccoli':         OM('1F966'),
  'brussels':         OM('1F966'),
  'cabbage':          OM('1F96C'),
  'carrot':           OM('1F955'),
  'cauliflower':      OM('1F966'),
  'celery':           OM('1F33F'),
  'chard':            OM('1F96C'),
  'chili':            OM('1F336'),
  'cilantro':         OM('1F33F'),
  'collard':          OM('1F96C'),
  'corn':             OM('1F33D'),
  'cucumber':         OM('1F952'),
  'dill':             OM('1F33F'),
  'eggplant':         OM('1F346'),
  'endive':           OM('1F96C'),
  'fennel':           OM('1F33F'),
  'garlic':           OM('1F9C4'),
  'ginger':           OM('1FAD8'),
  'green bean':       OM('1FAD8'),
  'green onion':      OM('1F9C5'),
  'herb':             OM('1F33F'),
  'jalapeño':         OM('1FAD1'),
  'jalapeno':         OM('1FAD1'),
  'kale':             OM('1F96C'),
  'kohlrabi':         OM('1F966'),
  'leek':             OM('1F9C5'),
  'lettuce':          OM('1F96C'),
  'melon':            OM('1F348'),
  'mint':             OM('1F33F'),
  'mushroom':         OM('1F344'),
  'okra':             OM('1F33F'),
  'onion':            OM('1F9C5'),
  'oregano':          OM('1F33F'),
  'parsley':          OM('1F33F'),
  'parsnip':          OM('1F955'),
  'pea':              OM('1F33F'),
  'pepper':           OM('1FAD1'),
  'potato':           OM('1F954'),
  'pumpkin':          OM('1F383'),
  'radish':           OM('1F955'),
  'rosemary':         OM('1F33F'),
  'scallion':         OM('1F9C5'),
  'shallot':          OM('1F9C5'),
  'spinach':          OM('1F96C'),
  'squash':           OM('1F383'),
  'sweet potato':     OM('1F360'),
  'swiss chard':      OM('1F96C'),
  'thyme':            OM('1F33F'),
  'tomato':           OM('1F345'),
  'turnip':           OM('1F955'),
  'zucchini':         OM('1F952'),

  // ── Fruits ──────────────────────────────────────────────────────────────
  'apple':            OM('1F34E'),
  'avocado':          OM('1F951'),
  'banana':           OM('1F34C'),
  'blueberry':        OM('1FAD0'),
  'cantaloupe':       OM('1F348'),
  'cherry':           OM('1F352'),
  'fig':              OM('1F331'),
  'grape':            OM('1F347'),
  'lemon':            OM('1F34B'),
  'lime':             OM('1F34B'),
  'peach':            OM('1F351'),
  'pear':             OM('1F350'),
  'plum':             OM('1F351'),
  'raspberry':        OM('1FAD0'),
  'strawberry':       OM('1F353'),
  'watermelon':       OM('1F349'),
};

// Fallback for produce not matched by any keyword
const FALLBACK = OM('1F331'); // seedling

function findImage(name) {
  const lower = name.toLowerCase();

  // Try longest keyword match first to avoid 'pepper' matching 'bell pepper' wrong way
  const sorted = Object.entries(IMAGE_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [keyword, url] of sorted) {
    if (lower.includes(keyword)) return url;
  }
  return FALLBACK;
}

async function main() {
  console.log(`Weaver Farms — produce image updater${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  const res = await fetch(`${DATABASE_URL}/produce_reference.json`);
  if (!res.ok) throw new Error(`Database read failed: ${res.status} ${res.statusText}`);

  const data = await res.json();
  if (!data) {
    console.log('No produce items found in the database.');
    return;
  }

  const entries = Object.entries(data);
  console.log(`Found ${entries.length} produce item(s):\n`);

  for (const [key, item] of entries) {
    const imageUrl = findImage(item.name);
    const matched = imageUrl !== FALLBACK;
    console.log(`  ${matched ? '✓' : '?'} ${item.name.padEnd(24)} → ${imageUrl}`);

    if (!DRY_RUN) {
      const writeRes = await fetch(
        `${DATABASE_URL}/produce_reference/${key}/image.json`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imageUrl),
        }
      );
      if (!writeRes.ok) {
        console.error(`    ✗ Failed to write: ${writeRes.status} ${writeRes.statusText}`);
      }
    }
  }

  if (DRY_RUN) {
    console.log('\nDry run complete. Run without --dry-run to apply changes.');
  } else {
    console.log('\nDone! All produce images updated in Firebase.');
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
