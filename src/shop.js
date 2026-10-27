// All cosmetics are earned through play and saved only on this device.
export const DEFAULTS = { effect: 'bloom', trail: 'none', location: 'meadow', wolf: 'wolf', sheep: 'sheep', moon: 'full', sky: 'night' };
export const CATEGORIES = { effect: 'Crit effects', trail: 'Sheep trails', location: 'Locations', wolf: 'Dream guardians', sheep: 'Sheep skins', moon: 'Moons', sky: 'Skies' };
const item = (category, id, name, price, description, color) => ({ category, id, name, price, description, color });
export const CATALOG = [
  item('effect','bloom','Soft Bloom',0,'A mint outline breathes in, then opens into a soft puff.','#b3f7ce'),
  item('effect','ripple','Ripple',35,'A drawn blue frame releases three ripples.','#9cdfff'),
  item('effect','stardust','Stardust',60,'Gold light traces the frame and scatters into tiny stars.','#f3d78e'),
  item('effect','petal','Petal Drift',80,'A rose outline blossoms into drifting petals.','#f4b4d1'),
  item('effect','halo','Moon Halo',100,'A lavender frame dissolves into a luminous orbit.','#cdb8ff'),
  ...[['none','No trail',0,'The original clean flight.','#bbc9cd'],['rainbow','Rainbow',45,'A ribbon of six soft colors.','#c4a4ff'],['fire','Fire',55,'Warm embers, without the heat.','#ffad68'],['aurora','Aurora',70,'Mint and violet northern lights.','#8ce4c8'],['comet','Comet',90,'A tail of tiny golden stars.','#f3da9a']].map(a=>item('trail',...a)),
  ...[['meadow','Moonlit meadow',0,'The original wildflower fields.','#8b9cc8'],['jungle','Jungle',120,'Layered ferns and tall canopy silhouettes.','#5bba8e'],['island','Island',120,'Quiet waves, pale sand and swaying palms.','#7acfd3'],['desert','Desert',120,'Rolling dunes and patient cacti.','#ddb489'],['alpine','Alpine',150,'Snowy peaks and an evergreen forest.','#accced']].map(a=>item('location',...a)),
  ...[['wolf','Wolf',0,'Your original sleepy companion.','#718a9b'],['hyena','Hyena',90,'Rounded ears, sandy fur and dark spots.','#c9ae7b'],['lion','Lion',120,'A warm golden coat and a full amber mane.','#e0b56e'],['fox','Arctic fox',150,'Pale winter fur and a generous fluffy tail.','#dfedf2']].map(a=>item('wolf',...a)),
  ...[['sheep','Sheep',0,'The original fluffy flock.','#f2efdf'],['ram','Ram',75,'Curled amber horns on every sheep.','#d6b38a'],['goat','Goat',75,'Swept horns, a little beard and sleek fleece.','#c7cec0'],['cloud','Cloud lamb',110,'Blue fleece and a silver lining.','#c4eaff']].map(a=>item('sheep',...a)),
  ...[['full','Full Moon',0,'The original cratered silver Moon.','#d5dedb'],['rose','Rose Moon',65,'A soft blush over the lunar surface.','#f3adc7'],['blue','Blue Moon',65,'An icy blue lunar glow.','#93d7ff'],['harvest','Harvest Moon',65,'A honey-colored moonrise.','#f3cf86'],['crescent','Crescent',85,'A slender silver crescent.','#dbe9f7']].map(a=>item('moon',...a)),
  ...[['night','Midnight',0,'The original deep blue night.','#172640'],['dawn','Dawn',100,'Peach light along a lavender horizon.','#dcacc6'],['sunset','Sunset',100,'Warm apricot fading into plum.','#e7a384'],['day','Daydream',100,'A clear blue sky and a quiet distant Moon.','#9bd6ef'],['aurora','Aurora night',130,'Slow ribbons of jade and violet.','#8cd8bb']].map(a=>item('sky',...a)),
];
const key = 'baad-shop-v1';
const valid = value => Number.isSafeInteger(value) && value >= 0;
export function readShop(storage) {
  let data; try { data = JSON.parse(storage?.getItem(key)); } catch {}
  const savedOwned = Array.isArray(data?.owned) ? data.owned : [];
  const owned = CATALOG.filter(i => i.price === 0 || savedOwned.includes(`${i.category}:${i.id}`)).map(i=>`${i.category}:${i.id}`);
  const equipped = { ...DEFAULTS };
  for (const category of Object.keys(DEFAULTS)) if (owned.includes(`${category}:${data?.equipped?.[category]}`)) equipped[category] = data.equipped[category];
  return { balance: valid(data?.balance) ? data.balance : 0, earned: valid(data?.earned) ? data.earned : 0, owned, equipped };
}
export function saveShop(state, storage) { try { storage?.setItem(key, JSON.stringify(state)); return Boolean(storage); } catch { return false; } }
export function earnCrit(state, bonus, storage) {
  const amount = Math.max(1, Math.ceil(bonus / 50));
  state.balance += amount; state.earned += amount; saveShop(state, storage); return amount;
}
export function selectItem(state, category, id, storage) {
  const entry = CATALOG.find(i=>i.category===category && i.id===id);
  if (!entry) return false;
  const token = `${category}:${id}`;
  if (!state.owned.includes(token)) {
    if (state.balance < entry.price) return false;
    state.balance -= entry.price; state.owned.push(token);
  }
  state.equipped[category] = id; saveShop(state, storage); return true;
}
export const guardianPalettes = {
  wolf: {},
  hyena: { '#344b60':'#a58a60', '#3a4e62':'#a58a60','#465d70':'#b69c71','#283c50':'#685640','#526b7d':'#8b7357','#607b8a':'#ae936b','#7f99a2':'#c2a880','#b7c8c5':'#dac9a4' },
  lion: { '#344b60':'#c59a55', '#3a4e62':'#c59a55','#465d70':'#d7ae69','#283c50':'#a6773d','#526b7d':'#a2773f','#607b8a':'#d4a664','#7f99a2':'#dcb97e','#b7c8c5':'#efdab0' },
  fox: { '#344b60':'#b8ccd6', '#3a4e62':'#b8ccd6','#465d70':'#d4e2e7','#283c50':'#a5becb','#526b7d':'#b4cad5','#607b8a':'#d0dfe5','#7f99a2':'#e0eaf0','#b7c8c5':'#f0f1e9' },
};
