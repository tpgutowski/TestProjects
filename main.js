const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const landmarkRow = document.getElementById('visible-landmarks');
const landmarkStack = document.getElementById('landmark-stack');
const inventoryGrid = document.getElementById('inventory-grid');
const questList = document.getElementById('quest-list');
const lootFeed = document.getElementById('loot-feed');
const progressPath = document.getElementById('progress-path');
const avatarToken = document.getElementById('avatar-token');
const weeklyDistance = document.getElementById('weekly-distance');
const weeklyLandmarks = document.getElementById('weekly-landmarks');
const lootModal = document.getElementById('loot-modal');
const syncState = document.getElementById('sync-state');
const movement = document.getElementById('movement');
const reward = document.getElementById('reward');

let unit = 'km';

const worldTemplate = {
  seed: 42,
  zones: ['City', 'Coast', 'Hills', 'Mountains', 'Snow', 'Unknown'],
  landmarks: [
    { name: 'Trailhead', type: 'Camp', flavor: 'Departure into the dusk.' },
    { name: 'Broken Bridge', type: 'Bridge', flavor: 'Echoes of other travelers.' },
    { name: 'Glass Shrine', type: 'Shrine', flavor: 'Whispers reward patience.' },
    { name: 'Overlook', type: 'Peak', flavor: 'City lights behind you.' },
    { name: 'Gate of Mist', type: 'Gate', flavor: 'Next zone unlocks.' },
    { name: 'Driftwood Pier', type: 'Camp', flavor: 'Tides hum below.' },
    { name: 'Shell Archive', type: 'Ruin', flavor: 'Stories carved in coral.' },
    { name: 'Gale Bridge', type: 'Bridge', flavor: 'Saltwind sings of progress.' },
    { name: 'Sirens Reach', type: 'Gate', flavor: 'Hills await.' },
  ],
};

const itemCatalog = [
  { id: 'ember-leaf', name: 'Emberleaf Sigil', rarity: 'Common', flavor: 'Warm to the touch.' },
  { id: 'tidestone', name: 'Tidestone Fragment', rarity: 'Rare', flavor: 'Ocean memory held tight.' },
  { id: 'moonquill', name: 'Moonquill Relic', rarity: 'Epic', flavor: 'Glows when you rest.' },
  { id: 'auric-crest', name: 'Auric Crest', rarity: 'Legendary', flavor: 'Carries a forgotten anthem.' },
];

const demoRuns = [
  { distance: 2.4, elevationGain: 12 },
  { distance: 3.1, elevationGain: 30 },
  { distance: 5.2, elevationGain: 80 },
];

let runCursor = 0;
let progress = 0; // 0..1
let reachedLandmarks = 0;
let lootHistory = [];

function formatDistance(value) {
  if (unit === 'mi') return `${(value * 0.621371).toFixed(1)} mi`;
  return `${value.toFixed(1)} km`;
}

function renderTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      panels.forEach((panel) => panel.classList.add('hidden'));
      document.getElementById(tab.dataset.target).classList.remove('hidden');
    });
  });
}

function renderLandmarks() {
  landmarkRow.innerHTML = '';
  landmarkStack.innerHTML = '';

  const visible = worldTemplate.landmarks.slice(reachedLandmarks, reachedLandmarks + 4);
  visible.forEach((landmark, idx) => {
    const chip = document.createElement('div');
    chip.className = 'landmark-chip';
    if (idx === 0) chip.classList.add('reached');
    chip.innerHTML = `<div class="label">${landmark.name}</div><p class="meta">${landmark.type}</p><p class="meta">${landmark.flavor}</p>`;
    landmarkRow.appendChild(chip);
  });

  // place tokens roughly along the path
  const positions = [
    { x: 20, y: 170 },
    { x: 90, y: 140 },
    { x: 140, y: 110 },
    { x: 200, y: 90 },
    { x: 250, y: 80 },
    { x: 300, y: 70 },
    { x: 330, y: 60 },
    { x: 355, y: 60 },
    { x: 380, y: 60 },
  ];

  worldTemplate.landmarks.slice(0, reachedLandmarks + 4).forEach((landmark, index) => {
    const marker = document.createElement('div');
    marker.className = 'landmark-node';
    const pos = positions[index] || positions[positions.length - 1];
    marker.style.left = `${pos.x - 30}px`;
    marker.style.top = `${pos.y - 26}px`;
    marker.style.opacity = index <= reachedLandmarks + 3 ? 1 : 0.2;
    marker.innerHTML = `<span class="dot"></span> ${landmark.name}`;
    landmarkStack.appendChild(marker);
  });
}

function renderInventory() {
  inventoryGrid.innerHTML = '';
  lootHistory.slice().reverse().forEach((item) => {
    const card = document.createElement('div');
    card.className = 'inventory-card';
    card.innerHTML = `
      <div class="rarity ${item.rarity.toLowerCase()}">${item.rarity}</div>
      <h3>${item.name}</h3>
      <p class="meta">Dropped at ${item.landmark}</p>
      <p class="meta">${item.flavor}</p>
    `;
    inventoryGrid.appendChild(card);
  });
}

function renderQuests() {
  const quests = [
    { title: 'Easy: Reach 3 landmarks', difficulty: 'easy', progress: '2 / 3' },
    { title: 'Medium: Travel 12 km', difficulty: 'medium', progress: '8.4 / 12' },
    { title: 'Hard: Cross a Gate', difficulty: 'hard', progress: '0 / 1' },
  ];
  questList.innerHTML = '';
  quests.forEach((quest) => {
    const card = document.createElement('div');
    card.className = 'quest-card';
    card.innerHTML = `
      <div>
        <p class="eyebrow">Weekly card</p>
        <h4 style="margin:4px 0 0">${quest.title}</h4>
        <p class="quest-meta">Progress: ${quest.progress}</p>
      </div>
      <span class="quest-difficulty ${quest.difficulty}">${quest.difficulty}</span>
    `;
    questList.appendChild(card);
  });
}

function renderLootFeed() {
  lootFeed.innerHTML = '';
  lootHistory.slice(-5).reverse().forEach((item) => {
    const row = document.createElement('div');
    row.className = 'loot-row';
    row.innerHTML = `
      <div>
        <div class="label">${item.name}</div>
        <p class="meta">${item.landmark}</p>
      </div>
      <span class="rarity ${item.rarity.toLowerCase()}">${item.rarity}</span>
    `;
    lootFeed.appendChild(row);
  });
}

function updateProgressBar() {
  const pathLength = 520;
  const dash = pathLength * progress;
  progressPath.setAttribute('stroke-dasharray', `${dash} 1000`);

  const start = { x: 20, y: 170 };
  const end = { x: 380, y: 60 };
  avatarToken.setAttribute('cx', start.x + (end.x - start.x) * progress);
  avatarToken.setAttribute('cy', start.y + (end.y - start.y) * progress);
}

function rollReward(landmark) {
  const base = itemCatalog[0];
  const gateBonus = landmark.type === 'Gate';
  const roll = Math.random();
  if (gateBonus && roll > 0.8) return itemCatalog[3];
  if (roll > 0.92) return itemCatalog[3];
  if (roll > 0.8) return itemCatalog[2];
  if (roll > 0.55 || gateBonus) return itemCatalog[1];
  return base;
}

function processRun(run) {
  lootModal.classList.remove('hidden');
  syncState.querySelector('p').textContent = 'Syncing...';
  movement.innerHTML = '';
  reward.innerHTML = '';
  syncState.classList.remove('hidden');

  const distanceKm = run.distance;
  const steps = distanceKm * 100; // config mapping
  const elevationBonus = Math.min(run.elevationGain / 10, 30);
  const totalSteps = steps + elevationBonus;
  const segments = worldTemplate.landmarks.length - 1;
  const perSegment = 100 / segments;
  const deltaProgress = (totalSteps / 1000) * perSegment;

  setTimeout(() => {
    syncState.querySelector('p').textContent = `Processed ${formatDistance(distanceKm)} · +${Math.round(totalSteps)} steps`;
    syncState.classList.add('hidden');

    movement.innerHTML = `
      <p class="eyebrow">Movement</p>
      <p>Avatar advanced along the ${worldTemplate.zones[0]} path.</p>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, deltaProgress + progress * 100)}%"></div></div>
    `;

    progress = Math.min(1, progress + deltaProgress / 100);
    updateProgressBar();

    const before = reachedLandmarks;
    const potential = Math.floor(progress * (worldTemplate.landmarks.length - 1));
    reachedLandmarks = Math.max(reachedLandmarks, potential);
    weeklyDistance.textContent = (parseFloat(weeklyDistance.textContent) + distanceKm).toFixed(1);
    weeklyLandmarks.textContent = reachedLandmarks;

    if (reachedLandmarks > before) {
      for (let i = before + 1; i <= reachedLandmarks; i += 1) {
        const landmark = worldTemplate.landmarks[i];
        const item = rollReward(landmark);
        const rewardCard = document.createElement('div');
        rewardCard.className = 'reward-card';
        rewardCard.innerHTML = `
          <p class="eyebrow">${landmark.type} reached</p>
          <h4 class="reward-title">${landmark.name}</h4>
          <p class="meta">${landmark.flavor}</p>
          <div class="rarity ${item.rarity.toLowerCase()}">${item.rarity}</div>
          <p class="meta">Loot: ${item.name}</p>
        `;
        reward.appendChild(rewardCard);
        lootHistory.push({ ...item, landmark: landmark.name, obtainedAt: new Date() });
      }
    } else {
      reward.innerHTML = '<p class="meta">No landmarks crossed, but progress saved.</p>';
    }

    renderLandmarks();
    renderInventory();
    renderLootFeed();
  }, 600);
}

function wireButtons() {
  document.getElementById('simulate-run').addEventListener('click', () => {
    const run = demoRuns[runCursor % demoRuns.length];
    runCursor += 1;
    processRun(run);
  });

  document.getElementById('reroll-world').addEventListener('click', () => {
    progress = 0;
    reachedLandmarks = 0;
    lootHistory = [];
    weeklyDistance.textContent = '0';
    weeklyLandmarks.textContent = '0';
    updateProgressBar();
    renderLandmarks();
    renderInventory();
    renderLootFeed();
  });

  document.getElementById('close-modal').addEventListener('click', () => lootModal.classList.add('hidden'));
  document.getElementById('skip-animation').addEventListener('click', () => {
    syncState.classList.add('hidden');
  });
  document.getElementById('unit-toggle').addEventListener('change', (e) => {
    unit = e.target.value;
  });
}

renderTabs();
renderLandmarks();
renderInventory();
renderQuests();
renderLootFeed();
updateProgressBar();
wireButtons();
