/* TravelAI — curated destination data.
   All photos are real photographs sourced from Wikimedia Commons (openly licensed).
   Attraction names, landmarks and general facts are real; addresses are approximated
   to the neighborhood/city level (no paid geocoding API is wired into this prototype),
   and "Open in Maps" links do a live place-name search rather than a fixed pin. */

const INTERESTS = [
  { id: "nature", label: "Nature", emoji: "🌲" },
  { id: "mountains", label: "Mountains", emoji: "🏔" },
  { id: "photography", label: "Photography", emoji: "📸" },
  { id: "food", label: "Food", emoji: "🍜" },
  { id: "culture", label: "Culture & History", emoji: "🏛" },
  { id: "beaches", label: "Beaches", emoji: "🏖" },
  { id: "shopping", label: "Shopping", emoji: "🛍" },
  { id: "nightlife", label: "Nightlife", emoji: "🌃" },
  { id: "adventure", label: "Adventure", emoji: "🚴" },
  { id: "luxury", label: "Luxury", emoji: "💎" },
  { id: "relaxation", label: "Relaxation", emoji: "🧘" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧" },
];

const CATEGORY_META = {
  landmark: { label: "Landmark", icon: "🏛" },
  history: { label: "History", icon: "🏰" },
  culture: { label: "Culture", icon: "🎭" },
  nature: { label: "Nature", icon: "🌲" },
  adventure: { label: "Adventure", icon: "🚴" },
  beach: { label: "Beach", icon: "🏖" },
  food: { label: "Food", icon: "🍜" },
  experience: { label: "Experience", icon: "✨" },
};

const BACKGROUND_SCENES = [
  { id: "forest", label: "Forest", image: "https://upload.wikimedia.org/wikipedia/commons/3/35/BIG_LEAF_MAPLES_HOH.jpg" },
  { id: "mountain", label: "Mountains", image: "https://upload.wikimedia.org/wikipedia/commons/6/60/Matterhorn_from_Domh%C3%BCtte_-_2.jpg" },
  { id: "waterfall", label: "Waterfall", image: "https://upload.wikimedia.org/wikipedia/commons/8/8c/2008-05-24_35_Sk%C3%B3gafoss.jpg" },
  { id: "beach", label: "Tropical Beach", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Bora_Bora_%2816542797633%29.jpg/1920px-Bora_Bora_%2816542797633%29.jpg" },
  { id: "sunset", label: "Sunset", image: "https://upload.wikimedia.org/wikipedia/commons/a/a8/ULURU.jpg" },
  { id: "night", label: "Night Sky", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/ESO-VLT-Laser-phot-33a-07.jpg/3840px-ESO-VLT-Laser-phot-33a-07.jpg" },
  { id: "campfire", label: "Campfire", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Closeup_of_raging_flames_in_a_large_bonfire._-_Flickr_-_shixart1985.jpg/1920px-Closeup_of_raging_flames_in_a_large_bonfire._-_Flickr_-_shixart1985.jpg" },
];

/* costMultiplier: relative cost-of-living/travel index vs. a global-average baseline of 1.0 */
const DESTINATIONS = [
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    tagline: "Neon skylines, ancient shrines, and the best food scene on Earth",
    theme: "city",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/8/88/Shibuya_Crossing%2C_Aerial.jpg",
    costMultiplier: 1.3,
    currency: "JPY",
    bestMonths: "March–May, Oct–Nov",
    safetyTips: [
      "One of the safest major cities in the world — petty crime is rare, but stay alert on crowded trains.",
      "Carry cash; many smaller restaurants and shrines don't take cards.",
      "Emergency number: 110 (police), 119 (fire/ambulance).",
      "Tipping isn't customary and can even cause confusion.",
    ],
    attractions: [
      { name: "Sensō-ji Temple", area: "Asakusa", category: "culture", tags: ["culture", "photography"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/4/43/Sensoji_2023.jpg", blurb: "Tokyo's oldest temple, with the iconic Kaminarimon gate and Nakamise shopping street leading up to it." },
      { name: "Shibuya Crossing", area: "Shibuya", category: "landmark", tags: ["culture", "nightlife", "photography"], indoor: false, hiddenGem: false, slot: "afternoon", image: "https://upload.wikimedia.org/wikipedia/commons/8/88/Shibuya_Crossing%2C_Aerial.jpg", blurb: "The world's busiest pedestrian crossing — pure organized chaos, best seen from the Shibuya Sky deck." },
      { name: "Tokyo Tower", area: "Minato", category: "landmark", tags: ["photography", "luxury"], indoor: true, hiddenGem: false, slot: "evening", image: "https://upload.wikimedia.org/wikipedia/commons/5/58/Tokyo_Tower_2023.jpg", blurb: "A 333m Eiffel-inspired icon that turns the whole city into a glittering grid after dark." },
      { name: "Meiji Shrine", area: "Shibuya", category: "nature", tags: ["nature", "culture", "relaxation"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Meiji_Jingu_2023-3.jpg/3840px-Meiji_Jingu_2023-3.jpg", blurb: "A forested shrine complex right next to Harajuku — 100,000 trees donated from across Japan." },
      { name: "Shinjuku Gyoen", area: "Shinjuku", category: "nature", tags: ["nature", "relaxation", "photography"], indoor: false, hiddenGem: true, slot: "afternoon", image: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Shinjuku_Gyoen_National_Garden_-_sakura_3.JPG", blurb: "A quieter escape from the crowds — French, English and Japanese gardens in one park." },
    ],
    experiences: [
      { name: "teamLab digital art museum", area: "Azabudai / Toyosu", category: "experience", tags: ["culture", "photography", "family"], indoor: true, hiddenGem: false, slot: "afternoon", blurb: "An immersive light-and-projection art space — one of Tokyo's most Instagrammed experiences." },
      { name: "Tsukiji Outer Market food crawl", area: "Tsukiji", category: "food", tags: ["food"], indoor: false, hiddenGem: false, slot: "morning", blurb: "Fresh sushi, tamagoyaki and street snacks from the stalls that used to feed the old fish market." },
      { name: "Omoide Yokochō ramen alley", area: "Shinjuku", category: "food", tags: ["food", "nightlife"], indoor: true, hiddenGem: true, slot: "evening", blurb: "A narrow lantern-lit alley of tiny yakitori and ramen counters, unchanged since the post-war years." },
    ],
    food: ["Tsukiji Outer Market (sushi & street food)", "Omoide Yokochō (yakitori & ramen alley)"],
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    tagline: "Three thousand years of history stacked on top of itself",
    theme: "history",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/3840px-Colosseo_2020.jpg",
    costMultiplier: 1.1,
    currency: "EUR",
    bestMonths: "Apr–Jun, Sep–Oct",
    safetyTips: [
      "Watch for pickpockets around the Colosseum, Termini station and crowded buses.",
      "Book Colosseum/Vatican tickets online in advance to skip multi-hour lines.",
      "Emergency number: 112 (EU-wide).",
      "Tap water from Rome's public fountains (nasoni) is safe and free to drink.",
    ],
    attractions: [
      { name: "Colosseum", area: "Municipio I", category: "history", tags: ["history", "culture", "photography"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/3840px-Colosseo_2020.jpg", blurb: "The largest amphitheater ever built — 2,000 years old and still the symbol of the city." },
      { name: "Roman Forum", area: "Municipio I", category: "history", tags: ["history", "culture"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Foro_Romano_Musei_Capitolini_Roma.jpg/3840px-Foro_Romano_Musei_Capitolini_Roma.jpg", blurb: "The political heart of ancient Rome — walk the same stones as senators and emperors." },
      { name: "Pantheon", area: "Municipio I", category: "history", tags: ["history", "culture", "photography"], indoor: true, hiddenGem: false, slot: "afternoon", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Pantheon_%28Rome%29_-_Right_side_and_front.jpg/3840px-Pantheon_%28Rome%29_-_Right_side_and_front.jpg", blurb: "The best-preserved Roman building in existence, with the largest unreinforced concrete dome ever built." },
      { name: "Trevi Fountain", area: "Municipio I", category: "landmark", tags: ["culture", "photography"], indoor: false, hiddenGem: false, slot: "evening", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Trevi_Fountain_-_Roma.jpg/3840px-Trevi_Fountain_-_Roma.jpg", blurb: "Toss a coin over your shoulder — legend says it guarantees a return trip to Rome." },
      { name: "Piazza Navona", area: "Municipio I", category: "culture", tags: ["culture", "nightlife", "shopping"], indoor: false, hiddenGem: true, slot: "evening", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Piazza_Navona_%28Rome%29_at_night.jpg/3840px-Piazza_Navona_%28Rome%29_at_night.jpg", blurb: "A Baroque square built over an ancient stadium, ringed by street artists and cafés." },
    ],
    experiences: [
      { name: "Vatican Museums & Sistine Chapel", area: "Vatican City", category: "experience", tags: ["culture", "history"], indoor: true, hiddenGem: false, slot: "morning", blurb: "Michelangelo's ceiling and miles of Renaissance art — arrive early or book a skip-the-line slot." },
      { name: "Trastevere evening food crawl", area: "Trastevere", category: "food", tags: ["food", "nightlife"], indoor: true, hiddenGem: true, slot: "evening", blurb: "Cobblestone lanes packed with family-run trattorias — the most authentic Roman dinner scene." },
      { name: "Campo de' Fiori morning market", area: "Campo de' Fiori", category: "food", tags: ["food", "shopping"], indoor: false, hiddenGem: false, slot: "morning", blurb: "Rome's oldest open-air market — produce, flowers and espresso stops." },
    ],
    food: ["Trastevere trattorias (classic Roman cuisine)", "Campo de' Fiori market (produce & espresso)"],
  },
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    tagline: "Whitewashed cliffs, blue domes, and the best sunset on the planet",
    theme: "beach",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oia_sunset_-_panoramio_%282%29.jpg/3840px-Oia_sunset_-_panoramio_%282%29.jpg",
    costMultiplier: 1.2,
    currency: "EUR",
    bestMonths: "May–Jun, Sep–Oct",
    safetyTips: [
      "Roads are narrow and cliff-side — rent an ATV/car only if comfortable driving mountain switchbacks.",
      "Book Oia sunset viewpoints or a dinner reservation early; it gets crowded.",
      "Emergency number: 112 (EU-wide).",
      "Ferries can be cancelled in high wind — build a buffer day if island-hopping.",
    ],
    attractions: [
      { name: "Oia village & caldera view", area: "Oia", category: "landmark", tags: ["beaches", "photography", "luxury", "relaxation"], indoor: false, hiddenGem: false, slot: "evening", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oia_sunset_-_panoramio_%282%29.jpg/3840px-Oia_sunset_-_panoramio_%282%29.jpg", blurb: "Blue-domed churches stacked on cliffs above the caldera — the single most photographed sunset in Greece." },
      { name: "Fira town", area: "Fira", category: "culture", tags: ["shopping", "nightlife", "culture"], indoor: false, hiddenGem: false, slot: "afternoon", image: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Santorini_Fira3_tango7174.jpg", blurb: "The island's capital — cliffside boutiques, cocktail bars and the cable car down to the old port." },
      { name: "Akrotiri archaeological site", area: "Akrotiri", category: "history", tags: ["history", "culture"], indoor: true, hiddenGem: true, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ancient_Akrotiri.jpeg/3840px-Ancient_Akrotiri.jpeg", blurb: "A Bronze Age town buried by the same eruption that shaped the island — the 'Greek Pompeii'." },
    ],
    experiences: [
      { name: "Caldera sunset catamaran cruise", area: "Ammoudi Bay", category: "experience", tags: ["adventure", "relaxation", "beaches"], indoor: false, hiddenGem: false, slot: "afternoon", blurb: "Sail past the volcano and hot springs, swim, then watch the sunset from the water." },
      { name: "Red Beach", area: "Akrotiri", category: "beach", tags: ["beaches", "photography", "nature"], indoor: false, hiddenGem: true, slot: "morning", blurb: "Dramatic red-and-black volcanic cliffs above a small swimming cove." },
    ],
    food: ["Ammoudi Bay seafood tavernas", "Vinsanto wine tasting at a local winery"],
  },
  {
    id: "norway",
    name: "Norwegian Fjords",
    country: "Norway",
    tagline: "Sheer cliffs, glacial water, and the best road trip in Europe",
    theme: "nature",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Geirangerfjord_.jpg/3840px-Geirangerfjord_.jpg",
    costMultiplier: 1.6,
    currency: "NOK",
    bestMonths: "Jun–Aug",
    safetyTips: [
      "Weather changes fast on hikes like Trolltunga and Preikestolen — check forecasts and start early.",
      "Norway is expensive — groceries and self-catering save significantly over restaurants.",
      "Emergency number: 112 (police), 113 (medical).",
      "Mountain huts (DNT) are a great budget lodging option on multi-day hikes.",
    ],
    attractions: [
      { name: "Geirangerfjord", area: "Geiranger", category: "nature", tags: ["nature", "mountains", "photography"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Geirangerfjord_.jpg/3840px-Geirangerfjord_.jpg", blurb: "A UNESCO-listed fjord ringed by waterfalls, including the famous Seven Sisters." },
      { name: "Preikestolen (Pulpit Rock)", area: "Ryfylke", category: "adventure", tags: ["adventure", "mountains", "photography"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Lyse_Fjord_et_Preikestolen.jpg/3840px-Lyse_Fjord_et_Preikestolen.jpg", blurb: "A flat cliff plateau 604m straight above Lysefjorden — a ~4hr round-trip hike with no railing." },
      { name: "Trolltunga", area: "Odda", category: "adventure", tags: ["adventure", "mountains", "photography"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Trolltunga_2017.jpg/3840px-Trolltunga_2017.jpg", blurb: "A rock slab jutting horizontally over Lake Ringedalsvatnet — a demanding full-day hike (~10-12hrs)." },
      { name: "Bergen", area: "Bergen", category: "culture", tags: ["culture", "shopping", "nightlife"], indoor: false, hiddenGem: false, slot: "evening", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bergen_panorama_at_night_-_panoramio_%281%29.jpg/3840px-Bergen_panorama_at_night_-_panoramio_%281%29.jpg", blurb: "Colorful wooden Hanseatic wharf houses (Bryggen), a UNESCO World Heritage site." },
      { name: "Flåm Railway", area: "Flåm", category: "nature", tags: ["nature", "photography", "relaxation"], indoor: false, hiddenGem: false, slot: "afternoon", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Fl%C3%A5msbana.jpg/3840px-Fl%C3%A5msbana.jpg", blurb: "One of the steepest standard-gauge railways on Earth, dropping through waterfalls to the fjord." },
    ],
    experiences: [
      { name: "Nærøyfjord sightseeing cruise", area: "Flåm / Gudvangen", category: "experience", tags: ["nature", "relaxation", "photography"], indoor: false, hiddenGem: true, slot: "afternoon", blurb: "A quieter, narrower UNESCO fjord than Geiranger — silent electric boats glide beneath the cliffs." },
      { name: "Bergen Fish Market", area: "Bergen", category: "food", tags: ["food"], indoor: false, hiddenGem: false, slot: "afternoon", blurb: "Fresh king crab, salmon and reindeer stew right on the harborfront." },
    ],
    food: ["Bergen Fish Market (seafood)", "Local grocery self-catering (Norway is pricey to eat out)"],
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    tagline: "Rice terraces, sea temples, and jungle waterfalls",
    theme: "nature",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Rice_terraces%2C_Bali.jpg/1920px-Rice_terraces%2C_Bali.jpg",
    costMultiplier: 0.55,
    currency: "IDR",
    bestMonths: "Apr–Oct (dry season)",
    safetyTips: [
      "Wear a sarong and sash when entering temples; shoulders and knees should be covered.",
      "Traffic is chaotic — an experienced driver is safer than self-riding a scooter if you're inexperienced.",
      "Emergency number: 112.",
      "Stick to bottled/filtered water.",
    ],
    attractions: [
      { name: "Tegallalang Rice Terraces", area: "Tegallalang", category: "nature", tags: ["nature", "photography", "relaxation"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Rice_terraces%2C_Bali.jpg/1920px-Rice_terraces%2C_Bali.jpg", blurb: "Emerald rice paddies carved into the hillside using the centuries-old subak irrigation system." },
      { name: "Uluwatu Temple", area: "Uluwatu", category: "culture", tags: ["culture", "photography", "history"], indoor: false, hiddenGem: false, slot: "evening", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Pura_Luhur_Uluwatu_2017-08-17_%2834%29.jpg/3840px-Pura_Luhur_Uluwatu_2017-08-17_%2834%29.jpg", blurb: "A sea temple perched on a 70m cliff — come for sunset and the traditional Kecak fire dance." },
      { name: "Tanah Lot", area: "Tabanan", category: "culture", tags: ["culture", "photography"], indoor: false, hiddenGem: false, slot: "evening", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/TanahLot_2014.JPG/3840px-TanahLot_2014.JPG", blurb: "A Hindu shrine on an offshore rock, surrounded by the tide — one of Bali's most sacred sites." },
      { name: "Ubud", area: "Ubud", category: "culture", tags: ["culture", "shopping", "relaxation"], indoor: false, hiddenGem: false, slot: "afternoon", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Ubud_%2849818456887%29.jpg/3840px-Ubud_%2849818456887%29.jpg", blurb: "Bali's cultural heart — art markets, yoga studios and the Sacred Monkey Forest Sanctuary." },
    ],
    experiences: [
      { name: "Campuhan Ridge Walk", area: "Ubud", category: "experience", tags: ["nature", "relaxation"], indoor: false, hiddenGem: true, slot: "morning", blurb: "A gentle ridgeline trail through savanna grass just outside Ubud — sunrise with almost no crowds." },
      { name: "Balinese cooking class", area: "Ubud", category: "food", tags: ["food"], indoor: true, hiddenGem: false, slot: "afternoon", blurb: "Market visit followed by hands-on lessons in classic dishes like babi guling and sambal." },
      { name: "Surf lesson in Canggu", area: "Canggu", category: "experience", tags: ["adventure", "beaches"], indoor: false, hiddenGem: false, slot: "morning", blurb: "Bali's laid-back surf-and-café town, with beginner-friendly beach breaks." },
    ],
    food: ["Ubud night market (local warungs)", "Jimbaran Bay beachfront seafood grills"],
  },
  {
    id: "banff",
    name: "Banff",
    country: "Canada",
    tagline: "Turquoise glacial lakes ringed by the Canadian Rockies",
    theme: "nature",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Moraine_Lake_17092005.jpg",
    costMultiplier: 1.15,
    currency: "CAD",
    bestMonths: "Jun–Sep",
    safetyTips: [
      "This is bear country — carry bear spray on trails and know how to store food.",
      "Lake Louise and Moraine Lake parking fills before sunrise in summer; use the shuttle.",
      "Emergency number: 911.",
      "Mountain weather shifts quickly — layer up even in July.",
    ],
    attractions: [
      { name: "Lake Louise", area: "Lake Louise", category: "nature", tags: ["nature", "mountains", "photography", "relaxation"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/1_lake_louise_pano_2019.jpg/3840px-1_lake_louise_pano_2019.jpg", blurb: "Glacier-fed turquoise water beneath the Victoria Glacier — Banff's most iconic view." },
      { name: "Moraine Lake", area: "Moraine Lake", category: "nature", tags: ["nature", "mountains", "photography", "adventure"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Moraine_Lake_17092005.jpg", blurb: "The view on the old Canadian $20 bill — ringed by the Valley of the Ten Peaks." },
      { name: "Johnston Canyon", area: "Bow Valley Parkway", category: "adventure", tags: ["adventure", "nature"], indoor: false, hiddenGem: true, slot: "afternoon", image: "https://upload.wikimedia.org/wikipedia/commons/3/3c/JohnstonCanyonUpperFalls.jpg", blurb: "Catwalk trails bolted into canyon walls leading to the Lower and Upper Falls." },
      { name: "Peyto Lake", area: "Icefields Parkway", category: "nature", tags: ["nature", "mountains", "photography"], indoor: false, hiddenGem: true, slot: "afternoon", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Panorama_of_Peyto_Lake%2C_Banff_National_Park%2C_Alberta%2C_Canada.jpg/3840px-Panorama_of_Peyto_Lake%2C_Banff_National_Park%2C_Alberta%2C_Canada.jpg", blurb: "A wolf-head-shaped lake seen from a short walk off the Icefields Parkway." },
    ],
    experiences: [
      { name: "Banff Gondola sunset ride", area: "Sulphur Mountain", category: "experience", tags: ["adventure", "photography"], indoor: false, hiddenGem: false, slot: "evening", blurb: "A cable car to a 2,281m summit boardwalk with 360° views of six mountain ranges." },
      { name: "Bow Valley Parkway wildlife drive", area: "Bow Valley Parkway", category: "experience", tags: ["nature", "family"], indoor: false, hiddenGem: true, slot: "morning", blurb: "A slower, scenic alternative to the highway — elk, bighorn sheep and the occasional bear." },
    ],
    food: ["Banff Avenue Alberta-beef restaurants", "Bake shops around Bear Street"],
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    tagline: "The Eiffel Tower, world-class museums, and café culture",
    theme: "city",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg",
    costMultiplier: 1.3,
    currency: "EUR",
    bestMonths: "Apr–Jun, Sep–Oct",
    safetyTips: [
      "Pickpocketing is common near the Eiffel Tower, on the metro, and at Montmartre.",
      "Book Louvre and Eiffel Tower tickets online in advance to skip the lines.",
      "Emergency number: 112.",
      "Many museums are free on the first Sunday of the month (Oct–Mar).",
    ],
    attractions: [
      { name: "Eiffel Tower", area: "7th arrondissement", category: "landmark", tags: ["photography", "luxury", "culture"], indoor: false, hiddenGem: false, slot: "evening", image: "https://upload.wikimedia.org/wikipedia/commons/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg", blurb: "It sparkles for 5 minutes every hour after dark — try to catch it from the Trocadéro." },
      { name: "The Louvre", area: "1st arrondissement", category: "culture", tags: ["culture", "history"], indoor: true, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/3840px-Louvre_Museum_Wikimedia_Commons.jpg", blurb: "The world's most visited museum — home to the Mona Lisa and 35,000 other works." },
      { name: "Notre-Dame de Paris", area: "Île de la Cité", category: "history", tags: ["history", "culture", "photography"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Notre-Dame_de_Paris%2C_4_October_2017.jpg/3840px-Notre-Dame_de_Paris%2C_4_October_2017.jpg", blurb: "The Gothic cathedral reopened in December 2024 after the 2019 fire restoration." },
      { name: "Montmartre & Sacré-Cœur", area: "18th arrondissement", category: "culture", tags: ["culture", "photography", "shopping"], indoor: false, hiddenGem: false, slot: "afternoon", image: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Le_sacre_coeur.jpg", blurb: "Cobblestone artist lanes climbing to a hilltop basilica with the best skyline view in Paris." },
      { name: "Arc de Triomphe", area: "8th arrondissement", category: "landmark", tags: ["culture", "photography"], indoor: false, hiddenGem: false, slot: "afternoon", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Arc_de_Triomphe%2C_Paris_21_October_2010.jpg/3840px-Arc_de_Triomphe%2C_Paris_21_October_2010.jpg", blurb: "Climb to the rooftop for a view straight down the Champs-Élysées." },
    ],
    experiences: [
      { name: "Seine River evening cruise", area: "Central Paris", category: "experience", tags: ["romance", "photography", "relaxation"], indoor: false, hiddenGem: false, slot: "evening", blurb: "An hour on the water past nearly every major monument, lit up after dark." },
      { name: "Le Marais bistro crawl", area: "Le Marais", category: "food", tags: ["food", "nightlife"], indoor: true, hiddenGem: true, slot: "evening", blurb: "A historic Jewish and LGBTQ+ quarter packed with wine bars, falafel and pastry shops." },
    ],
    food: ["Le Marais bistros & wine bars", "Montmartre cafés"],
  },
  {
    id: "maldives",
    name: "Maldives",
    country: "Maldives",
    tagline: "Overwater villas above the clearest lagoons on Earth",
    theme: "beach",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Anantara_Kihavah_-_Aerial_Hero_Shot_2024.jpg/1920px-Anantara_Kihavah_-_Aerial_Hero_Shot_2024.jpg",
    costMultiplier: 1.8,
    currency: "MVR / USD",
    bestMonths: "Nov–Apr (dry season)",
    safetyTips: [
      "Most resorts are single-island, so transfers (speedboat/seaplane) should be booked before arrival.",
      "Reef shoes are worth packing — house reefs are often shallow and rocky at the edges.",
      "Emergency number: 102 (ambulance), 119 (police).",
      "Alcohol is generally only served on resort islands, not in local island communities.",
    ],
    attractions: [
      { name: "Overwater villa lagoon", area: "Baa Atoll", category: "beach", tags: ["beaches", "luxury", "relaxation"], indoor: false, hiddenGem: false, slot: "morning", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Anantara_Kihavah_-_Aerial_Hero_Shot_2024.jpg/1920px-Anantara_Kihavah_-_Aerial_Hero_Shot_2024.jpg", blurb: "Glass-floor and overwater villas above a UNESCO Biosphere Reserve lagoon." },
      { name: "Farukolhufushi beach", area: "North Malé Atoll", category: "beach", tags: ["beaches", "relaxation", "family"], indoor: false, hiddenGem: false, slot: "afternoon", image: "https://upload.wikimedia.org/wikipedia/commons/4/40/Farukolhufushi01.jpg", blurb: "Powder-white sand and a shallow, calm house reef good for first-time snorkelers." },
    ],
    experiences: [
      { name: "House reef snorkeling excursion", area: "Resort house reef", category: "experience", tags: ["adventure", "beaches"], indoor: false, hiddenGem: false, slot: "morning", blurb: "Turtles, reef sharks and coral gardens often just steps from your villa." },
      { name: "Sunset dolphin cruise", area: "Local atoll waters", category: "experience", tags: ["relaxation", "family", "luxury"], indoor: false, hiddenGem: true, slot: "evening", blurb: "Spinner dolphin pods are common in Maldivian waters at dusk." },
      { name: "Local island cultural visit", area: "Nearby local island", category: "experience", tags: ["culture"], indoor: false, hiddenGem: true, slot: "afternoon", blurb: "A day trip off the resort to see real Maldivian village life, markets and mosques." },
    ],
    food: ["Maldivian fish curry (mas riha) at a local island café", "Resort teppanyaki / overwater dining"],
  },
];

/* perDay figures are EUR, per person (accommodation is per room — see calcBudget).
   Food and transport are deliberately capped in calcBudget at €50/day and €20/day per person,
   regardless of tier or destination — they only move within that ceiling based on
   destination cost-of-living and experience type (budget/standard/luxury). */
const BUDGET_TIERS = {
  budget: { label: "Budget", perDay: { accommodation: 35, food: 18, attractions: 12, transport: 8 } },
  standard: { label: "Standard", perDay: { accommodation: 90, food: 32, attractions: 30, transport: 14 } },
  luxury: { label: "Luxury", perDay: { accommodation: 260, food: 48, attractions: 70, transport: 20 } },
};

const INTENSITY = {
  relaxed: { label: "Relaxed", perDay: 3, desc: "2–3 stops/day, plenty of free time" },
  balanced: { label: "Balanced", perDay: 5, desc: "4–6 stops/day, a good mix" },
  packed: { label: "Packed", perDay: 7, desc: "Maximum sightseeing, tight routing" },
};

const WEATHER_OPTIONS = [
  { id: "sunny", label: "Sunny", emoji: "☀️" },
  { id: "rainy", label: "Rainy", emoji: "🌧" },
  { id: "snow", label: "Snow", emoji: "❄️" },
];
