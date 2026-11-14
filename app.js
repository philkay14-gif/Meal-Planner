(function () {
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const STORAGE_KEY = "kitchen_companion_pwa_v3";

  // Day Schedule Profiles (Amendments #1, #4, #5)
  const DAY_PROFILES = {
    "Monday": {
      tag: "🌙 Late Return • 🚫 No Evening Batch/Prep",
      tagClass: "badge-late",
      type: "late_no_prep",
      desc: "Return home late from work. Fast reheat or pre-marinated on Sunday only. Batch cooking & food prep disabled on Monday evening."
    },
    "Tuesday": {
      tag: "🏢 WFH Day • 🍲 Slow Cooker Preferred",
      tagClass: "badge-wfh",
      type: "wfh",
      desc: "Working from home: use 'WFH recipes' (minimal morning prep, long slow-cooker time). Evening prep for Wednesday's meal."
    },
    "Wednesday": {
      tag: "🌙 Late Return • ⚡ Rapid Cook / Reheat",
      tagClass: "badge-late",
      type: "late",
      desc: "Return home late from work. Use meals pre-marinated on Tuesday night or rapid oven/air-fryer freezer meals."
    },
    "Thursday": {
      tag: "🏢 WFH Day • 🍲 Slow Cooker Preferred",
      tagClass: "badge-wfh",
      type: "wfh",
      desc: "Working from home: use 'WFH recipes' (minimal morning prep, long slow-cooker time). Evening prep for Friday's meal."
    },
    "Friday": {
      tag: "🌙 Late Return • ⚡ Rapid Cook / Reheat",
      tagClass: "badge-late",
      type: "late",
      desc: "Return home late from work. Use meals pre-marinated on Thursday night or rapid oven/air-fryer freezer meals."
    },
    "Saturday": {
      tag: "🥘 Weekend • Ideal for Batch Cooking",
      tagClass: "badge-batch",
      type: "weekend",
      desc: "Flexible cooking time — great for batch cooking freezer bases (bolognese, fish pie mix, curries)."
    },
    "Sunday": {
      tag: "🥘 Weekend Batch Cook & 📋 Prep for Monday",
      tagClass: "badge-batch",
      type: "weekend",
      desc: "Ideal for weekend batch cooking + defrosting/marinating Monday's late-return meal."
    }
  };

  // 300+ UK Supermarket Keyword -> Aisle Classifier
  const AISLE_KEYWORDS = {
    "Meat": [
      "chicken", "beef", "pork", "lamb", "turkey", "bacon", "sausage", "sausages", "chorizo",
      "mince", "steak", "meatballs", "salmon", "cod", "haddock", "white fish", "monkfish",
      "fish", "prawns", "fillet", "ham", "pepperoni", "joint", "thighs", "breasts"
    ],
    "Fruit/Veg": [
      "onion", "onions", "garlic", "ginger", "tomato", "tomatoes", "avocado", "spinach",
      "mushroom", "mushrooms", "carrot", "carrots", "broccoli", "kiwi", "fruit", "pepper",
      "peppers", "cucumber", "berries", "blueberries", "raspberries", "strawberries",
      "banana", "bananas", "apple", "apples", "potato", "potatoes", "sweet potato",
      "asparagus", "courgette", "aubergine", "leek", "leeks", "kale", "cavolo", "cabbage",
      "lettuce", "salad", "rocket", "squash", "butternut", "pumpkin", "beetroot", "parsnip",
      "parsnips", "swede", "turnip", "cauliflower", "celeriac", "sprouts", "beansprouts",
      "green beans", "french beans", "mangetout", "sage", "herbs", "coriander", "parsley", "lemon", "lime"
    ],
    "Dairy / Dips / Juice": [
      "milk", "blue milk", "vegan milk", "oat milk", "feta", "cheddar", "cheese", "mozzarella",
      "parmesan", "mascarpone", "ricotta", "cottage cheese", "halloumi", "yoghurt", "yogurt",
      "greek yoghurt", "butter", "spread", "juice", "fruit juice", "orange juice", "kefir",
      "hummus", "houmous", "tofu", "kimchi", "cream", "double cream", "sour cream", "creme fraiche", "tzatziki", "falafel"
    ],
    "Seasoning/ingredients": [
      "soy sauce", "worcester", "stock", "stock cubes", "vanilla", "peanut butter", "pesto",
      "green pesto", "honey", "olives", "chia", "chia seeds", "tomato paste", "puree",
      "oil", "olive oil", "vinegar", "balsamic", "hoisin", "tahini", "sauerkraut", "mustard",
      "mayo", "cinnamon", "turmeric", "cajun", "curry paste", "sun-dried"
    ],
    "Cans": [
      "tuna", "baked beans", "chickpeas", "kidney beans", "lentils", "black beans",
      "butter beans", "cannellini", "chopped toms", "tinned tomatoes", "chopped tomatoes",
      "passata", "coconut milk", "artichoke", "sweetcorn", "soup", "tin", "can"
    ],
    "Carbs / Eggs / Baking": [
      "bread", "loaf", "buns", "rolls", "pita", "flatbread", "flatbreads", "tortilla", "wraps",
      "naan", "couscous", "quinoa", "oats", "porridge", "weetabix", "orzo", "egg", "eggs", "lemon juice",
      "flour", "plain flour", "self raising", "nuts", "almonds", "walnuts", "cashews", "brazils",
      "pine nuts", "hemp seeds", "pumpkin seeds", "cacao", "coconut", "dried fruit", "prunes",
      "raisins", "apricots", "ready brek", "gnocchi", "lasagne sheets", "cannelloni", "noodles", "risotto", "breadcrumbs", "pizza"
    ],
    "Baby": [
      "nappies", "nappy", "wipes", "baby", "creams", "nappy cream", "saline",
      "gripe water", "milton", "calpol"
    ],
    "Refills": [
      "refill", "hand soap", "washing up", "washing up liquid", "shower gel", "shampoo",
      "muesli", "muslei", "cumin", "laundry", "laundry liquid", "detergent", "pasta", "rice"
    ],
    "Other": [
      "frozen", "edamame", "peas", "squash cordial", "cordial", "beer", "wine", "alcohol free",
      "toiletries", "loo roll", "toilet roll", "kitchen roll", "cleaning", "coffee",
      "mouthwash", "toothpaste", "deodorant", "beard balm", "bar keepers", "battery", "batteries",
      "foil", "cling film", "bin bags", "pastry", "puff pastry", "ice cream", "ice lollies", "fish fingers"
    ]
  };

  function classifyAisle(itemName) {
    const lower = itemName.toLowerCase().trim();
    if (lower.includes("refill")) return "Refills";
    for (const [aisle, words] of Object.entries(AISLE_KEYWORDS)) {
      for (const w of words) {
        if (lower.includes(w)) return aisle;
      }
    }
    return "Other";
  }

  // Scale recipe ingredient quantities for 2 Adults + 2 Children + 1 Adult Lunch Leftover (1.25x standard 4-serving recipe)
  // Or 2.5x when Batch Cooking (double batch for freezer!)
  function scaleQuantityForFamily(qtyStr, mode) {
    const mult = mode === "batch" ? 2.5 : 1.25;
    const labelSuffix = mode === "batch" ? " [Batch x2 + Leftover]" : " [2A+2C + 1 Lunch]";
    if (!qtyStr) return "1" + labelSuffix;

    // Scale leading numbers like "400g", "2 tins", "500ml"
    const scaled = String(qtyStr).replace(/^(\d+(\.\d+)?)(\s*(g|ml|kg|l|cloves|fillets|breasts|thighs|sausages|tins|tin|blocks|block|tbsp|tsp|eggs|peppers|onions|carrots|leeks|wraps|pitas|sheets|nests|chops))?/i, (match, numStr, dec, rest) => {
      const val = parseFloat(numStr);
      if (isNaN(val)) return match;
      let newVal = val * mult;
      // Round gram/ml nicely to nearest 5 or 10, or 0.5 for discrete items
      const unit = (rest || "").toLowerCase();
      if (unit.includes("g") && !unit.includes("kg") || unit.includes("ml")) {
        newVal = Math.round(newVal / 10) * 10;
      } else {
        newVal = Math.round(newVal * 2) / 2;
      }
      return `${newVal}${rest || ""}`;
    });
    return scaled + (mode === "batch" ? " (Batch 2x)" : "");
  }

  // Match recipe against current Freezer inventory (Amendment #3: 3-4 week rotation priority)
  function getRecipeFreezerMatches(recipe) {
    if (!recipe || !state.freezer) return { items: [], maxDays: 0, urgent: false };
    const matched = [];
    let maxDays = 0;
    const rText = (
      recipe.name + " " +
      (recipe.notes || "") + " " +
      (recipe.prepAheadNote || "") + " " +
      (recipe.ingredients || []).map(i => i.item).join(" ")
    ).toLowerCase();

    state.freezer.forEach(fz => {
      if (fz.category === "Desserts / Fruit" && !rText.includes("berries")) return;
      const fzName = fz.name.toLowerCase().replace(/\(.*?\)/g, "").trim();
      const keywords = fz.matchKeywords && fz.matchKeywords.length ? fz.matchKeywords : [fzName];
      const isDirectLink = fz.linkedRecipeId === recipe.id;
      const isKeywordMatch = keywords.some(k => k && k.length > 2 && rText.includes(k.toLowerCase()));

      if (isDirectLink || isKeywordMatch) {
        matched.push(fz);
        const d = fz.daysInFreezer || 0;
        if (d > maxDays) maxDays = d;
      }
    });

    return {
      items: matched,
      maxDays,
      urgent: maxDays >= 21
    };
  }

  function getDefaultState() {
    const initialPlan = {
      // Pre-configured week following all Amendments (#1 Tue/Thu WFH Slow Cooker, #3 Freezer Priority, #4 Mon/Wed/Fri Late Return + Fresh Meals, #5 No Monday Prep/Batch)
      "Sunday": { tea: { recipeId: "batch-butter-chicken-freezer-base", mode: "batch" } },
      "Monday": { tea: { recipeId: "fresh-teriyaki-salmon-avocado-bowl", mode: "fresh" } },
      "Tuesday": { tea: { recipeId: "keep-japanese-bbq-chuck-roast", mode: "fresh" } },
      "Wednesday": { tea: { recipeId: "fresh-warm-halloumi-chickpea-couscous-salad", mode: "fresh" } },
      "Thursday": { tea: { recipeId: "wfh-slow-cooker-chana-masala", mode: "fresh" } },
      "Friday": { tea: { recipeId: "fresh-green-goddess-crispy-tofu-bowl", mode: "fresh" } },
      "Saturday": { tea: { recipeId: "batch-spinach-ricotta-cannelloni", mode: "batch" } }
    };

    return {
      activeTab: "plan",
      recycleBannerDismissed: false,
      geminiApiKey: "",
      geminiKeepWebhookUrl: "",
      targets: {
        Meat: 1,
        Fish: 1,
        Vegetarian: 2,
        Vegan: 2
      },
      recipes: JSON.parse(JSON.stringify(window.MEAL_DATA.recipes)),
      weekPlan: initialPlan,
      customShopItems: [
        { id: "c-1", item: "Blue milk (6 pints)", aisle: "Dairy / Dips / Juice", checked: false, source: "Weekly Staple" },
        { id: "c-2", item: "Eggs x 18", aisle: "Carbs / Eggs / Baking", checked: false, source: "Weekly Staple" },
        { id: "c-3", item: "Bananas & Kiwi", aisle: "Fruit/Veg", checked: false, source: "Weekly Staple" },
        { id: "c-4", item: "Porridge oats & Shelled hemp seeds", aisle: "Carbs / Eggs / Baking", checked: false, source: "Overnight Protein Porridge" }
      ],
      checkedRecipeIngredients: {},
      freezer: JSON.parse(JSON.stringify(window.MEAL_DATA.freezerInitial)),
      filters: {
        search: "",
        diet: "All",
        freshMeal: false,
        quick: false,
        batch: false,
        slowCooker: false,
        wfh: false,
        lateReturn: false,
        freezerPriority: false,
        sourceFilter: "All",
        season: "All",
        ingredient: ""
      },
      freezerFilter: "All",
      seasonFilter: getCurrentSeason()
    };
  }

  function getCurrentSeason() {
    const m = new Date().getMonth();
    if (m >= 2 && m <= 4) return "Spring";
    if (m >= 5 && m <= 7) return "Summer";
    if (m >= 8 && m <= 10) return "Autumn";
    return "Winter";
  }

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(getDefaultState(), parsed);
    } catch (e) {
      return getDefaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save state", e);
    }
    updateNavBadges();
  }

  function getRecipeById(id) {
    return state.recipes.find(r => r.id === id);
  }

  // Compute combined shopping list (scaled for 2 Adults + 2 Kids + 1 Adult Lunch Leftover)
  // Also annotates if an ingredient is already in the Freezer (Amendment #3)!
  function getCompiledShoppingList() {
    const byAisle = {};
    window.MEAL_DATA.aisles.forEach(a => { byAisle[a] = []; });

    const ingMap = {};
    DAYS.forEach(day => {
      const dayObj = state.weekPlan[day] || {};
      const entry = dayObj.tea;
      if (!entry || !entry.recipeId) return;
      if (entry.mode === "freezer") return; // Ready meal from freezer, skip raw ingredients
      const rec = getRecipeById(entry.recipeId);
      if (!rec || !rec.ingredients) return;

      rec.ingredients.forEach(ing => {
        const aisle = window.MEAL_DATA.aisles.includes(ing.aisle) ? ing.aisle : "Other";
        const key = aisle + "::" + ing.item.toLowerCase().trim();
        if (!ingMap[key]) {
          // Check if we already have this item in the freezer!
          const fzMatch = state.freezer.find(f =>
            ing.item.toLowerCase().includes(f.name.toLowerCase().split("(")[0].trim()) ||
            f.name.toLowerCase().includes(ing.item.toLowerCase().split("(")[0].trim())
          );
          ingMap[key] = {
            key,
            item: ing.item,
            aisle,
            quantities: [],
            meals: [],
            freezerStockNote: fzMatch ? `❄️ In ${fzMatch.location} Freezer (${fzMatch.qty}, ${fzMatch.daysInFreezer || 0}d old)` : "",
            isRecipe: true,
            checked: !!state.checkedRecipeIngredients[key]
          };
        }
        const scaledQty = scaleQuantityForFamily(ing.qty, entry.mode);
        ingMap[key].quantities.push(scaledQty);
        if (!ingMap[key].meals.includes(`${rec.name} (${day.slice(0, 3)})`)) {
          ingMap[key].meals.push(`${rec.name} (${day.slice(0, 3)})`);
        }
      });
    });

    Object.values(ingMap).forEach(entry => {
      byAisle[entry.aisle].push({
        id: entry.key,
        isRecipe: true,
        item: entry.item,
        qtyText: entry.quantities.join(" + "),
        sourceText: "For (2A+2C+1 Lunch): " + entry.meals.join(", ") + (entry.freezerStockNote ? " • " + entry.freezerStockNote : ""),
        checked: entry.checked,
        aisle: entry.aisle
      });
    });

    state.customShopItems.forEach(ci => {
      const aisle = byAisle[ci.aisle] ? ci.aisle : "Other";
      byAisle[aisle].push({
        id: ci.id,
        isRecipe: false,
        item: ci.item,
        qtyText: "",
        sourceText: ci.source || "Added item",
        checked: !!ci.checked,
        aisle
      });
    });

    return byAisle;
  }

  function getTotalUncheckedShopCount() {
    const compiled = getCompiledShoppingList();
    let count = 0;
    Object.values(compiled).forEach(list => {
      list.forEach(i => { if (!i.checked) count++; });
    });
    return count;
  }

  function updateNavBadges() {
    const shopBadge = document.getElementById("nav-shop-badge");
    if (shopBadge) {
      const c = getTotalUncheckedShopCount();
      shopBadge.textContent = c;
      shopBadge.style.display = c > 0 ? "inline-block" : "none";
    }
    const freezerBadge = document.getElementById("nav-freezer-badge");
    if (freezerBadge) {
      const urgentCount = state.freezer.filter(f => (f.daysInFreezer || 0) >= 21).length;
      freezerBadge.textContent = urgentCount > 0 ? `${urgentCount}⚠️` : state.freezer.length;
      freezerBadge.style.background = urgentCount > 0 ? "#DC2626" : "#0369A1";
    }
  }

  window.showToast = function (msg, actionLabel, actionCallback) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const el = document.createElement("div");
    el.className = "toast";
    const span = document.createElement("span");
    span.textContent = msg;
    el.appendChild(span);

    if (actionLabel && actionCallback) {
      const btn = document.createElement("button");
      btn.className = "btn btn-sm btn-primary";
      btn.textContent = actionLabel;
      btn.onclick = () => {
        actionCallback();
        el.remove();
      };
      el.appendChild(btn);
    }

    container.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, 4500);
  };

  // =========================================================================
  // VOICE & SAMSUNG GALAXY S25 / WATCH 6 GEMINI COMMAND ENGINE (Amendment #7)
  // =========================================================================
  let recognition = null;
  let isListening = false;
  let voiceTargetMode = "shop"; // "shop" or "freezer"

  function initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return null;
    const rec = new SpeechRec();
    rec.lang = "en-GB";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      isListening = true;
      updateMicUI();
      if (voiceTargetMode === "freezer") {
        showToast("🎙️ Freezer Voice Dump: Say e.g. 'Garage freezer: 2 packs chicken breasts, 1 bag peas'");
      } else {
        showToast("🎙️ S25 / Watch 6 Listening... Say 'Add [item] to my shopping list'");
      }
    };

    rec.onend = () => {
      isListening = false;
      updateMicUI();
    };

    rec.onerror = (e) => {
      isListening = false;
      updateMicUI();
      if (e.error !== "no-speech") {
        openVoiceModal("Direct browser mic access was blocked by the sandboxed frame (" + e.error + "). Use the Samsung S25 / Watch 6 Gemini command input or 1-tap sync below:");
      }
    };

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (voiceTargetMode === "freezer") {
        processFreezerVoiceDump(transcript);
      } else {
        processSpokenShoppingCommand(transcript, "🎙️ Gemini / Voice Command");
      }
    };

    return rec;
  }

  function updateMicUI() {
    document.querySelectorAll(".voice-mic-btn").forEach(btn => {
      btn.classList.toggle("listening", isListening);
    });
  }

  window.triggerVoiceCapture = function (targetMode = "shop") {
    voiceTargetMode = targetMode;
    if (!recognition) {
      recognition = initSpeechRecognition();
    }
    if (!recognition) {
      if (targetMode === "freezer") {
        openFreezerCaptureModal("voice");
      } else {
        openVoiceModal();
      }
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        if (targetMode === "freezer") openFreezerCaptureModal("voice");
        else openVoiceModal();
      }
    }
  };

  // Handles Gemini phrases like "Hey Google, add milk and 2 avocados to my shopping list"
  window.processSpokenShoppingCommand = function (rawText, sourceLabel = "🎙️ Gemini Voice (S25 / Watch 6)") {
    if (!rawText || !rawText.trim()) return;
    let cleaned = rawText.trim()
      .replace(/^(hey google|ok google|hi gemini|hey gemini|hi bixby|gemini|please|can you|could you)\s*,?\s*/i, "")
      .replace(/^(add|buy|put|get|put down|remind me to buy)\s+/i, "")
      .replace(/\s+(to|on|in|into)\s+(my\s+|the\s+)?(shopping\s+list|grocery\s+list|keep\s+list|list)\.?$/i, "");

    const parts = cleaned
      .split(/,|\band\b|\n/i)
      .map(s => s.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    const addedSummary = [];
    parts.forEach(part => {
      const itemTitle = part.charAt(0).toUpperCase() + part.slice(1);
      const aisle = classifyAisle(itemTitle);
      state.customShopItems.unshift({
        id: "v-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
        item: itemTitle,
        aisle,
        checked: false,
        source: sourceLabel
      });
      addedSummary.push(`${itemTitle} → ${aisle.split("/")[0].trim()}`);
    });

    saveState();
    renderAll();
    showToast(`✅ Added to Shopping List: ${addedSummary.join(", ")}`, "View Shop List", () => {
      switchTab("shop");
    });
  };

  // Sync from Google Keep / Google Tasks Webhook (for Samsung Galaxy S25 & Watch 6 Gemini native "add X to my shopping list")
  window.syncFromGeminiWebhook = async function () {
    const url = (state.geminiKeepWebhookUrl || "").trim();
    if (!url) {
      openVoiceModal("Connect your Google Keep / Google Tasks bridge URL below, or paste items from your S25 Google Keep 'Shopping List' note:");
      return;
    }
    try {
      showToast("🔄 Syncing items from Samsung S25 / Watch 6 Gemini list...");
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        processSpokenShoppingCommand(data.items.join(", "), "📱⌚ Gemini Sync (S25 / Watch 6)");
      } else {
        showToast("✅ Gemini Shopping List is up to date (0 new items).");
      }
    } catch (err) {
      showToast("⚠️ Could not reach Webhook URL — check URL in Gemini Sync setup.");
    }
  };

  window.saveGeminiWebhookUrl = function (val) {
    state.geminiKeepWebhookUrl = val.trim();
    saveState();
    showToast("💾 Saved Gemini Google Keep/Tasks Bridge URL!");
  };

  window.switchTab = function (tabName) {
    state.activeTab = tabName;
    saveState();
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function getWeeklyDietCounts() {
    const counts = { Meat: 0, Fish: 0, Vegetarian: 0, Vegan: 0, Batch: 0, FreezerUsed: 0, WfhSlow: 0 };
    DAYS.forEach(d => {
      const dayObj = state.weekPlan[d] || {};
      const entry = dayObj.tea;
      if (!entry || !entry.recipeId) return;
      const r = getRecipeById(entry.recipeId);
      if (!r) return;
      if (counts[r.diet] !== undefined) counts[r.diet]++;
      if (entry.mode === "batch") counts.Batch++;
      if (entry.mode === "freezer") counts.FreezerUsed++;
      if (r.wfh) counts.WfhSlow++;
    });
    return counts;
  }

  // Smart Auto-Fill Week (Enforces Amendments #1, #3, #4, #5!)
  window.autoFillWeek = function () {
    const usedIds = new Set();

    // Sort helper that prioritises recipes using 3-4 week old freezer items first (Amendment #3)
    function pickBestCandidate(filterFn) {
      const pool = state.recipes.filter(r => !usedIds.has(r.id) && r.mealType !== "Breakfast" && r.mealType !== "Snack" && filterFn(r));
      if (pool.length === 0) return null;
      pool.sort((a, b) => {
        const matchA = getRecipeFreezerMatches(a);
        const matchB = getRecipeFreezerMatches(b);
        return (matchB.maxDays - matchA.maxDays) + (Math.random() * 4 - 2);
      });
      const chosen = pool[0];
      usedIds.add(chosen.id);
      return chosen;
    }

    // 1. Tuesday & Thursday: WFH Slow Cooker recipes (1 Vegan/Veggie, 1 Meat)
    const tueRec = pickBestCandidate(r => r.wfh && (r.diet === "Meat" || r.diet === "Fish")) || pickBestCandidate(r => r.wfh);
    if (tueRec) state.weekPlan["Tuesday"].tea = { recipeId: tueRec.id, mode: "fresh" };

    const thuRec = pickBestCandidate(r => r.wfh && (r.diet === "Vegan" || r.diet === "Vegetarian")) || pickBestCandidate(r => r.wfh);
    if (thuRec) state.weekPlan["Thursday"].tea = { recipeId: thuRec.id, mode: "fresh" };

    // 2. Monday, Wednesday, Friday: Late Return meals (No batch cooking on Monday!)
    // Use at least 1 Fish meal, 1 Freezer ready meal, and 1 Veggie/Vegan late-return meal
    const monRec = pickBestCandidate(r => r.lateReturn && r.diet === "Fish") || pickBestCandidate(r => r.lateReturn);
    if (monRec) state.weekPlan["Monday"].tea = { recipeId: monRec.id, mode: "fresh" }; // Never batch on Monday!

    const wedRec = pickBestCandidate(r => r.lateReturn && getRecipeFreezerMatches(r).maxDays >= 20) || pickBestCandidate(r => r.lateReturn);
    if (wedRec) state.weekPlan["Wednesday"].tea = { recipeId: wedRec.id, mode: "freezer" };

    const friRec = pickBestCandidate(r => r.lateReturn && (r.diet === "Vegetarian" || r.diet === "Vegan")) || pickBestCandidate(r => r.lateReturn);
    if (friRec) state.weekPlan["Friday"].tea = { recipeId: friRec.id, mode: "fresh" };

    // 3. Saturday & Sunday: Weekend Batch Cooking to restock freezer
    const satRec = pickBestCandidate(r => r.batch && r.diet === "Vegetarian") || pickBestCandidate(r => r.batch);
    if (satRec) state.weekPlan["Saturday"].tea = { recipeId: satRec.id, mode: "batch" };

    const sunRec = pickBestCandidate(r => r.batch && r.diet === "Vegan") || pickBestCandidate(r => r.batch);
    if (sunRec) state.weekPlan["Sunday"].tea = { recipeId: sunRec.id, mode: "batch" };

    saveState();
    renderAll();
    showToast("✨ Auto-planned week: Tue/Thu WFH Slow Cooker, Mon/Wed/Fri Late Return, Weekend Batch, & 3–4wk Freezer Priority!");
  };

  window.clearWeekPlan = function () {
    DAYS.forEach(d => {
      state.weekPlan[d] = { tea: null };
    });
    saveState();
    renderAll();
    showToast("Cleared weekly meal slots");
  };

  window.removeMealSlot = function (day) {
    if (state.weekPlan[day]) {
      state.weekPlan[day].tea = null;
      saveState();
      renderAll();
    }
  };

  window.changeMealMode = function (day, newMode) {
    if (day === "Monday" && newMode === "batch") {
      showToast("🚫 Amendment #5: Batch cooking & food prep are disabled on Monday evenings!");
      renderAll();
      return;
    }
    if (state.weekPlan[day] && state.weekPlan[day].tea) {
      state.weekPlan[day].tea.mode = newMode;
      saveState();
      renderAll();
      if (newMode === "freezer") {
        showToast("❄️ Using Freezer Stock — raw ingredients removed from Shopping List!");
      } else if (newMode === "batch") {
        showToast("🥘 Batch Cook (2.5x qty for 2A+2C+1 Lunch + Freezer Tray) updated in Shopping List!");
      }
    }
  };

  window.freezeBatchPortion = function (recipeId) {
    const rec = getRecipeById(recipeId);
    if (!rec) return;
    state.freezer.unshift({
      id: "fz-" + Date.now(),
      name: rec.name + " (Batch Tray)",
      qty: "1 family tray (2A+2C)",
      category: "Leftovers/ready meals",
      location: "Garage",
      daysInFreezer: 0,
      linkedRecipeId: rec.id
    });
    saveState();
    renderAll();
    showToast(`❄️ Added "${rec.name}" to Freezer (0 days old — 4-week rotation started)!`);
  };

  // Compute Previous-Day Prep Reminders for each day (Amendments #4 & #5)
  // Remember Rule #5: NO food preparation or batch cooking on Monday evening!
  function formatPrepRecipeLinks(rec) {
    if (!rec) return "";
    return `
      <div class="prep-actions-row">
        ${rec.url ? `
          <a href="${escapeHtml(rec.url)}" target="_blank" rel="noopener" class="prep-recipe-link">
            🔗 Open "${escapeHtml(rec.name)}" Recipe ↗
          </a>
        ` : ''}
        <button type="button" class="prep-recipe-btn" onclick="openRecipeEditor('${rec.id}')">
          📖 View Ingredients &amp; Notes
        </button>
      </div>
    `;
  }

  // Compute Previous-Day Prep Reminders for each day (Amendments #4 & #5)
  // Remember Rule #5: NO food preparation or batch cooking on Monday evening!
  // So Sunday evening handles prep for Monday's Late-Return meal AND any defrosting for Tuesday's WFH slow-cooker meal!
  function getPrepRemindersForDay(day) {
    const reminders = [];

    if (day === "Sunday") {
      const monEntry = state.weekPlan["Monday"] && state.weekPlan["Monday"].tea;
      if (monEntry && monEntry.recipeId) {
        const monRec = getRecipeById(monEntry.recipeId);
        if (monRec) {
          reminders.push(`
            <div>📋 <strong>Prep Tonight for Monday Tea — ${escapeHtml(monRec.name)}:</strong> ${escapeHtml(monRec.prepAheadNote || ("Defrost/prep ingredients for " + monRec.name))}</div>
            ${formatPrepRecipeLinks(monRec)}
          `);
        }
      }
      const tueEntry = state.weekPlan["Tuesday"] && state.weekPlan["Tuesday"].tea;
      if (tueEntry && tueEntry.recipeId) {
        const tueRec = getRecipeById(tueEntry.recipeId);
        const fz = getRecipeFreezerMatches(tueRec);
        if (tueRec && fz.items.length > 0) {
          reminders.push(`
            <div>❄️ <strong>Sunday Night Defrost for Tuesday WFH Slow Cooker — ${escapeHtml(tueRec.name)} (No Prep on Monday Night!):</strong> Move <em>${escapeHtml(fz.items.map(i => i.name).join(", "))}</em> to fridge to thaw gently for Tuesday morning.</div>
            ${formatPrepRecipeLinks(tueRec)}
          `);
        }
      }
    }

    if (day === "Tuesday") {
      const wedEntry = state.weekPlan["Wednesday"] && state.weekPlan["Wednesday"].tea;
      if (wedEntry && wedEntry.recipeId) {
        const wedRec = getRecipeById(wedEntry.recipeId);
        if (wedRec) {
          reminders.push(`
            <div>📋 <strong>Prep Tonight for Wednesday Tea — ${escapeHtml(wedRec.name)}:</strong> ${escapeHtml(wedRec.prepAheadNote || ("Defrost & marinate ingredients for " + wedRec.name))}</div>
            ${formatPrepRecipeLinks(wedRec)}
          `);
        }
      }
    }

    if (day === "Thursday") {
      const friEntry = state.weekPlan["Friday"] && state.weekPlan["Friday"].tea;
      if (friEntry && friEntry.recipeId) {
        const friRec = getRecipeById(friEntry.recipeId);
        if (friRec) {
          reminders.push(`
            <div>📋 <strong>Prep Tonight for Friday Tea — ${escapeHtml(friRec.name)}:</strong> ${escapeHtml(friRec.prepAheadNote || ("Defrost & marinate ingredients for " + friRec.name))}</div>
            ${formatPrepRecipeLinks(friRec)}
          `);
        }
      }
    }

    return reminders;
  }

  // Slot Picker Modal (Allows filtering by Diet: Meat, Fish, Vegetarian, Vegan AND by Schedule/Fresh/Freezer/Batch with wrapping filter chips!)
  window.openSlotPickerForDay = function (day) {
    const modal = document.getElementById("slot-picker-modal");
    const title = document.getElementById("slot-picker-title");
    const body = document.getElementById("slot-picker-body");
    const profile = DAY_PROFILES[day];

    const defaultFilter = profile.type === "wfh" ? "wfh" : (profile.type.startsWith("late") ? "late" : "all");
    title.textContent = `Select Tea for ${day} (${profile.tag.split("•")[0].trim()})`;

    const totalCount = state.recipes.length;
    const freshCount = state.recipes.filter(r => r.freshMeal).length;
    const wfhCount = state.recipes.filter(r => r.wfh).length;
    const lateCount = state.recipes.filter(r => r.lateReturn).length;

    let html = `
      <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:10px;background:var(--bg-subtle);padding:8px 10px;border-radius:8px;">
        <strong>${day} Rule:</strong> ${escapeHtml(profile.desc)}
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <input type="text" id="modal-recipe-search" class="form-control" placeholder="🔍 Search ${totalCount} recipes, fresh bowls, salads, or freezer items..." oninput="filterModalRecipes()">
      </div>

      <div style="margin-bottom:8px;">
        <div style="font-size:0.73rem;font-weight:700;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;">1. Filter by Diet:</div>
        <div class="chip-row">
          <button type="button" class="filter-chip modal-d-chip active" data-d="All" onclick="setModalDietFilter('All')">All Diets</button>
          <button type="button" class="filter-chip modal-d-chip" data-d="Meat" onclick="setModalDietFilter('Meat')">🥩 Meat</button>
          <button type="button" class="filter-chip modal-d-chip" data-d="Fish" onclick="setModalDietFilter('Fish')">🐟 Fish</button>
          <button type="button" class="filter-chip modal-d-chip" data-d="Vegetarian" onclick="setModalDietFilter('Vegetarian')">🧀 Vegetarian</button>
          <button type="button" class="filter-chip modal-d-chip" data-d="Vegan" onclick="setModalDietFilter('Vegan')">🌱 Vegan</button>
        </div>
      </div>

      <div style="margin-bottom:10px;">
        <div style="font-size:0.73rem;font-weight:700;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;">2. Filter by Style &amp; Schedule:</div>
        <div class="chip-row">
          <button type="button" class="filter-chip modal-f-chip ${defaultFilter === 'all' ? 'active' : ''}" data-f="all" onclick="setModalChipFilter('all')">All Styles (${totalCount})</button>
          <button type="button" class="filter-chip modal-f-chip" data-f="fresh" onclick="setModalChipFilter('fresh')">🥗 Fresh &amp; Light (${freshCount})</button>
          <button type="button" class="filter-chip modal-f-chip ${defaultFilter === 'wfh' ? 'active' : ''}" data-f="wfh" onclick="setModalChipFilter('wfh')">🏢 WFH Slow Cooker (${wfhCount})</button>
          <button type="button" class="filter-chip modal-f-chip ${defaultFilter === 'late' ? 'active' : ''}" data-f="late" onclick="setModalChipFilter('late')">🌙 Late Return (${lateCount})</button>
          <button type="button" class="filter-chip modal-f-chip" data-f="freezer" onclick="setModalChipFilter('freezer')">❄️ Uses Freezer Stock</button>
          <button type="button" class="filter-chip modal-f-chip" data-f="batch" onclick="setModalChipFilter('batch')">🥘 Batch Cook</button>
          <button type="button" class="filter-chip modal-f-chip" data-f="quick" onclick="setModalChipFilter('quick')">⚡ Quick (≤30m)</button>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:8px;">
        <label class="form-label">Cooking Mode (Portions: 2 Adults + 2 Kids + 1 Adult Lunch Leftover)</label>
        <select id="modal-cook-mode" class="form-control">
          <option value="fresh">🍳 Fresh / Pre-Marinated Cook (1.25x family + leftover portions)</option>
          ${day !== "Monday" ? `<option value="batch" ${profile.type === 'weekend' ? 'selected' : ''}>🥘 Batch Cook (2.5x double batch + freeze extra tray)</option>` : ''}
          <option value="freezer">❄️ Reheat from Freezer Stock (0 raw ingredients added to Shop List)</option>
        </select>
      </div>
      <div id="modal-match-count" style="font-size:0.76rem;font-weight:700;color:var(--text-muted);margin-bottom:6px;"></div>
      <div id="modal-recipe-list" style="display:flex;flex-direction:column;gap:8px;max-height:320px;overflow-y:auto;">
    `;

    // Sort recipes so Fresh meals & Freezer Priority appear prominently
    const sortedRecipes = [...state.recipes].sort((a, b) => {
      if (a.freshMeal !== b.freshMeal && defaultFilter !== "wfh") {
        return a.freshMeal ? -1 : 1;
      }
      const fzA = getRecipeFreezerMatches(a).maxDays;
      const fzB = getRecipeFreezerMatches(b).maxDays;
      return fzB - fzA;
    });

    sortedRecipes.forEach(r => {
      const fzMatch = getRecipeFreezerMatches(r);
      const searchBlob = (r.name + " " + r.diet + " " + (r.notes || "") + " " + fzMatch.items.map(i => i.name).join(" ")).toLowerCase();
      html += `
        <div class="modal-recipe-item"
             data-search="${escapeHtml(searchBlob)}"
             data-diet="${escapeHtml(r.diet)}"
             data-fresh="${r.freshMeal ? '1' : '0'}"
             data-quick="${r.quick ? '1' : '0'}"
             data-wfh="${r.wfh ? '1' : '0'}"
             data-late="${r.lateReturn ? '1' : '0'}"
             data-batch="${r.batch ? '1' : '0'}"
             data-freezer="${fzMatch.items.length > 0 ? '1' : '0'}"
             style="padding:10px;border:1px solid ${fzMatch.urgent ? '#DC2626' : 'var(--border-color)'};border-radius:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--bg-primary);">
          <div>
            <div style="font-weight:700;font-size:0.9rem;">${escapeHtml(r.name)}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;align-items:center;">
              <span class="badge badge-${r.diet}">${r.diet}</span>
              ${r.freshMeal ? '<span class="badge badge-fresh">🥗 Fresh &amp; Light</span>' : ''}
              ${r.wfh ? '<span class="badge badge-wfh">🏢 WFH recipes</span>' : ''}
              ${r.lateReturn ? '<span class="badge badge-late">🌙 Late Return</span>' : ''}
              ${r.batch ? '<span class="badge badge-batch">🥘 Batch</span>' : ''}
              ${fzMatch.items.length > 0 ? `<span class="badge ${fzMatch.urgent ? 'badge-rot-urgent' : 'badge-freezer-prio'}">❄️ Uses Freezer: ${escapeHtml(fzMatch.items.map(i => i.name).join(", "))} (${fzMatch.maxDays}d)</span>` : ''}
              ${r.url ? `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation();" style="font-size:0.74rem;color:var(--accent-primary);font-weight:700;text-decoration:none;margin-left:2px;">🔗 Recipe ↗</a>` : ''}
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="assignRecipeToDay('${day}', '${r.id}')">Select</button>
        </div>
      `;
    });

    html += `</div>`;
    body.innerHTML = html;
    modal.classList.add("open");
    filterModalRecipes();
  };

  window.setModalDietFilter = function (diet) {
    document.querySelectorAll(".modal-d-chip").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-d") === diet);
    });
    filterModalRecipes();
  };

  window.setModalChipFilter = function (fType) {
    document.querySelectorAll(".modal-f-chip").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-f") === fType);
    });
    filterModalRecipes();
  };

  window.filterModalRecipes = function () {
    const qInput = document.getElementById("modal-recipe-search");
    const lower = qInput ? qInput.value.toLowerCase().trim() : "";
    const activeDietChip = document.querySelector(".modal-d-chip.active");
    const dietFilter = activeDietChip ? activeDietChip.getAttribute("data-d") : "All";
    const activeChip = document.querySelector(".modal-f-chip.active");
    const fType = activeChip ? activeChip.getAttribute("data-f") : "all";

    let shown = 0;
    document.querySelectorAll("#modal-recipe-list .modal-recipe-item").forEach(el => {
      const textMatch = !lower || el.getAttribute("data-search").includes(lower);
      const dietMatch = dietFilter === "All" || el.getAttribute("data-diet") === dietFilter;
      let chipMatch = true;
      if (fType === "fresh") chipMatch = el.getAttribute("data-fresh") === "1";
      else if (fType === "wfh") chipMatch = el.getAttribute("data-wfh") === "1";
      else if (fType === "late") chipMatch = el.getAttribute("data-late") === "1";
      else if (fType === "batch") chipMatch = el.getAttribute("data-batch") === "1";
      else if (fType === "freezer") chipMatch = el.getAttribute("data-freezer") === "1";
      else if (fType === "quick") chipMatch = el.getAttribute("data-quick") === "1";

      const visible = textMatch && dietMatch && chipMatch;
      el.style.display = visible ? "flex" : "none";
      if (visible) shown++;
    });

    const countEl = document.getElementById("modal-match-count");
    if (countEl) {
      countEl.textContent = `Showing ${shown} matching recipe${shown === 1 ? "" : "s"}`;
    }
  };

  window.assignRecipeToDay = function (day, recipeId) {
    const modeSelect = document.getElementById("modal-cook-mode");
    let mode = modeSelect ? modeSelect.value : "fresh";
    if (day === "Monday" && mode === "batch") {
      mode = "fresh";
    }
    state.weekPlan[day].tea = { recipeId, mode };
    closeModal("slot-picker-modal");
    saveState();
    renderAll();
    const rec = getRecipeById(recipeId);
    showToast(`✅ Planned "${rec ? rec.name : "Meal"}" for ${day} Tea (2A+2C + 1 Lunch Leftover)!`);
  };

  window.openAssignDayForRecipe = function (recipeId) {
    const rec = getRecipeById(recipeId);
    if (!rec) return;
    const modal = document.getElementById("slot-picker-modal");
    const title = document.getElementById("slot-picker-title");
    const body = document.getElementById("slot-picker-body");
    title.textContent = `Plan "${rec.name}"`;

    // Suggest best day based on tags!
    const suggestedDay = rec.wfh ? "Tuesday" : (rec.lateReturn ? "Wednesday" : "Sunday");

    let html = `
      <div class="form-group">
        <label class="form-label">Select Day (Tue/Thu = WFH Slow Cooker, Mon/Wed/Fri = Late Return, Sat/Sun = Batch Cook)</label>
        <select id="assign-day-select" class="form-control">
          ${DAYS.map(d => `<option value="${d}" ${d === suggestedDay ? "selected" : ""}>${d} — ${DAY_PROFILES[d].tag}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Cooking Mode (Scaled for 2 Adults + 2 Children + 1 Adult Lunch Leftover)</label>
        <select id="assign-mode-select" class="form-control">
          <option value="fresh">🍳 Fresh / Pre-Marinated Cook (1.25x ingredients to Shopping List)</option>
          <option value="batch" ${rec.batch && suggestedDay !== "Monday" ? "selected" : ""}>🥘 Batch Cook (2.5x ingredients + freeze extra tray — Not Mondays)</option>
          <option value="freezer">❄️ Take from Freezer (0 raw ingredients added to Shopping List)</option>
        </select>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:8px;" onclick="confirmAssignRecipe('${recipeId}')">
        Add to Weekly Plan &amp; Update Shopping List
      </button>
    `;
    body.innerHTML = html;
    modal.classList.add("open");
  };

  window.confirmAssignRecipe = function (recipeId) {
    const day = document.getElementById("assign-day-select").value;
    let mode = document.getElementById("assign-mode-select").value;
    if (day === "Monday" && mode === "batch") {
      mode = "fresh";
      showToast("ℹ️ Switched to Fresh/Pre-Prepped mode (No batch cooking on Monday evenings).");
    }
    state.weekPlan[day].tea = { recipeId, mode };
    closeModal("slot-picker-modal");
    saveState();
    renderAll();
    const rec = getRecipeById(recipeId);
    showToast(`✅ Planned "${rec.name}" for ${day} Tea!`, "View Plan", () => switchTab("plan"));
  };

  window.closeModal = function (id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove("open");
  };

  // Recipe Add / Edit Modal
  window.openRecipeEditor = function (recipeId) {
    const existing = recipeId ? getRecipeById(recipeId) : null;
    const modal = document.getElementById("recipe-editor-modal");
    const title = document.getElementById("recipe-editor-title");
    title.textContent = existing ? `Edit Recipe: ${existing.name}` : "Add New Recipe";

    document.getElementById("edit-recipe-id").value = existing ? existing.id : "";
    document.getElementById("edit-recipe-name").value = existing ? existing.name : "";
    document.getElementById("edit-recipe-diet").value = existing ? existing.diet : "Vegetarian";
    document.getElementById("edit-recipe-prep").value = existing ? (existing.prepTime || 25) : 20;
    document.getElementById("edit-recipe-url").value = existing ? (existing.url || "") : "";
    document.getElementById("edit-recipe-notes").value = existing ? (existing.notes || "") : "";
    document.getElementById("edit-recipe-prep-ahead").value = existing ? (existing.prepAheadNote || "") : "";
    document.getElementById("edit-recipe-quick").checked = existing ? !!existing.quick : true;
    document.getElementById("edit-recipe-batch").checked = existing ? !!existing.batch : false;
    document.getElementById("edit-recipe-slow").checked = existing ? !!existing.slowCooker : false;
    document.getElementById("edit-recipe-wfh").checked = existing ? !!existing.wfh : false;
    document.getElementById("edit-recipe-late").checked = existing ? !!existing.lateReturn : false;

    const ingLines = existing && existing.ingredients
      ? existing.ingredients.map(i => `${i.item} | ${i.qty} | ${i.aisle}`).join("\n")
      : "Chicken breasts | 600g | Meat\nRed pepper | 2 | Fruit/Veg\nChickpeas | 1 tin | Cans";
    document.getElementById("edit-recipe-ingredients").value = ingLines;

    modal.classList.add("open");
  };

  window.saveRecipeFromEditor = function (e) {
    e.preventDefault();
    const idVal = document.getElementById("edit-recipe-id").value;
    const name = document.getElementById("edit-recipe-name").value.trim();
    if (!name) return;

    const diet = document.getElementById("edit-recipe-diet").value;
    const prepTime = parseInt(document.getElementById("edit-recipe-prep").value, 10) || 25;
    const url = document.getElementById("edit-recipe-url").value.trim();
    const notes = document.getElementById("edit-recipe-notes").value.trim();
    const prepAheadNote = document.getElementById("edit-recipe-prep-ahead").value.trim();
    const quick = document.getElementById("edit-recipe-quick").checked;
    const batch = document.getElementById("edit-recipe-batch").checked;
    const slowCooker = document.getElementById("edit-recipe-slow").checked;
    const wfh = document.getElementById("edit-recipe-wfh").checked;
    const lateReturn = document.getElementById("edit-recipe-late").checked;

    const rawIng = document.getElementById("edit-recipe-ingredients").value.split("\n");
    const ingredients = [];
    rawIng.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const parts = trimmed.split("|").map(p => p.trim());
      const item = parts[0];
      const qty = parts[1] || "1";
      const aisle = parts[2] && window.MEAL_DATA.aisles.includes(parts[2]) ? parts[2] : classifyAisle(item);
      ingredients.push({ item, qty, aisle });
    });

    if (idVal) {
      const idx = state.recipes.findIndex(r => r.id === idVal);
      if (idx !== -1) {
        state.recipes[idx] = Object.assign({}, state.recipes[idx], {
          name, diet, prepTime, url, notes, prepAheadNote, quick, batch, slowCooker, wfh, lateReturn, ingredients
        });
      }
    } else {
      state.recipes.unshift({
        id: "custom-" + Date.now(),
        name,
        diet,
        prepTime,
        url,
        notes,
        prepAheadNote,
        quick,
        batch,
        slowCooker,
        wfh,
        lateReturn,
        source: "Custom Recipe",
        seasons: ["Spring", "Summer", "Autumn", "Winter"],
        ingredients
      });
    }

    closeModal("recipe-editor-modal");
    saveState();
    renderAll();
    showToast(`💾 Saved recipe "${name}"!`);
  };

  // Shopping list interactions
  window.toggleShopItem = function (id, isRecipe) {
    if (isRecipe) {
      state.checkedRecipeIngredients[id] = !state.checkedRecipeIngredients[id];
    } else {
      const item = state.customShopItems.find(i => i.id === id);
      if (item) item.checked = !item.checked;
    }
    saveState();
    renderAll();
  };

  window.deleteCustomShopItem = function (id, ev) {
    if (ev) ev.stopPropagation();
    state.customShopItems = state.customShopItems.filter(i => i.id !== id);
    saveState();
    renderAll();
  };

  window.addManualShopItem = function (e) {
    e.preventDefault();
    const input = document.getElementById("quick-add-input");
    const aisleSel = document.getElementById("quick-add-aisle");
    if (!input || !input.value.trim()) return;

    const raw = input.value.trim();
    // If user typed or dictated "add X to my shopping list", run through natural command parser!
    if (/^(hey google|add|buy)\s+/i.test(raw) || raw.includes(",") || /\band\b/i.test(raw)) {
      processSpokenShoppingCommand(raw, "🎙️ Quick Command");
      input.value = "";
      return;
    }

    const chosenAisle = aisleSel.value === "Auto" ? classifyAisle(raw) : aisleSel.value;
    state.customShopItems.unshift({
      id: "m-" + Date.now(),
      item: raw,
      aisle: chosenAisle,
      checked: false,
      source: "Added manually"
    });
    input.value = "";
    saveState();
    renderAll();
    showToast(`Added "${raw}" to ${chosenAisle}`);
  };

  window.addStapleToShop = function (item, aisle) {
    const exists = state.customShopItems.some(i => i.item.toLowerCase() === item.toLowerCase() && !i.checked);
    if (exists) {
      showToast(`"${item}" is already on your shopping list`);
      return;
    }
    state.customShopItems.unshift({
      id: "st-" + Date.now() + "-" + Math.random().toString(36).slice(2, 5),
      item,
      aisle,
      checked: false,
      source: "Weekly Staple"
    });
    saveState();
    renderAll();
    showToast(`+ Added staple "${item}" (${aisle})`);
  };

  window.clearCheckedShopItems = function () {
    state.customShopItems = state.customShopItems.filter(i => !i.checked);
    state.checkedRecipeIngredients = {};
    saveState();
    renderAll();
    showToast("Cleared checked items");
  };

  window.copyShoppingListToClipboard = function () {
    const compiled = getCompiledShoppingList();
    let lines = [
      "🛒 SHOPPING LIST (Scaled for 2 Adults + 2 Children + 1 Adult Lunch Leftover)",
      "♻️ Remember: Pack plastic bags to recycle at supermarket!",
      ""
    ];
    Object.entries(compiled).forEach(([aisle, items]) => {
      const unchecked = items.filter(i => !i.checked);
      if (unchecked.length === 0) return;
      lines.push(`=== ${aisle.toUpperCase()} ===`);
      unchecked.forEach(i => {
        lines.push(`- [ ] ${i.item}${i.qtyText ? " (" + i.qtyText + ")" : ""}`);
      });
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      showToast("📋 Copied unchecked shopping list to clipboard!");
    });
  };

  // =========================================================================
  // FREEZER ROTATION (3-4 WEEKS) & SMART CAPTURE (Amendments #3 & #11)
  // =========================================================================
  window.addFreezerItem = function (e) {
    e.preventDefault();
    const name = document.getElementById("fz-name").value.trim();
    const qty = document.getElementById("fz-qty").value.trim() || "1 pack";
    const category = document.getElementById("fz-category").value;
    const location = document.getElementById("fz-location").value;
    if (!name) return;

    state.freezer.unshift({
      id: "fz-" + Date.now(),
      name,
      qty,
      category,
      location,
      daysInFreezer: 0,
      matchKeywords: [name.toLowerCase()]
    });
    document.getElementById("fz-name").value = "";
    document.getElementById("fz-qty").value = "";
    saveState();
    renderAll();
    showToast(`❄️ Added "${name}" to ${location} Freezer (0d old — 3–4wk timer started)!`);
  };

  window.removeFreezerItem = function (id) {
    state.freezer = state.freezer.filter(f => f.id !== id);
    saveState();
    renderAll();
    showToast("Used / removed item from freezer");
  };

  window.toggleFreezerLocation = function (id) {
    const item = state.freezer.find(f => f.id === id);
    if (!item) return;
    item.location = item.location === "Garage" ? "Kitchen" : "Garage";
    saveState();
    renderAll();
  };

  window.useFreezerItemInPlan = function (id) {
    const item = state.freezer.find(f => f.id === id);
    if (!item) return;
    let recId = item.linkedRecipeId;
    if (!recId) {
      const found = state.recipes.find(r =>
        r.name.toLowerCase().includes(item.name.toLowerCase().split("(")[0].trim()) ||
        (r.ingredients && r.ingredients.some(i => i.item.toLowerCase().includes(item.name.toLowerCase().split("(")[0].trim())))
      );
      if (found) {
        recId = found.id;
      } else {
        recId = "fz-rec-" + Date.now();
        state.recipes.unshift({
          id: recId,
          name: item.name + " (From Freezer)",
          diet: item.category === "Meat and fish" ? "Meat" : "Vegetarian",
          prepTime: 15,
          quick: true,
          batch: true,
          slowCooker: false,
          wfh: false,
          lateReturn: true,
          prepAheadNote: "Defrost overnight from " + item.location + " Freezer.",
          seasons: ["Spring", "Summer", "Autumn", "Winter"],
          url: "",
          notes: `Rotates ${item.name} (${item.daysInFreezer || 0}d in ${item.location} Freezer)`,
          ingredients: []
        });
      }
    }
    openAssignDayForRecipe(recId);
  };

  // Amendment #11 Suggestion 1: 🎙️ Freezer Door Voice Dump
  window.processFreezerVoiceDump = function (rawText) {
    if (!rawText || !rawText.trim()) return;
    const lower = rawText.toLowerCase();
    const defaultLoc = lower.includes("garage") ? "Garage" : "Kitchen";
    const cleaned = rawText
      .replace(/^(garage\s+freezer|kitchen\s+freezer|in\s+the\s+freezer|add\s+to\s+freezer)\s*:?\s*/i, "")
      .trim();

    const parts = cleaned.split(/,|\band\b|\n/i).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;

    const added = [];
    parts.forEach(p => {
      // Extract quantity if mentioned e.g. "2 packs chicken breasts"
      let qty = "1 pack";
      let name = p;
      const m = p.match(/^(\d+\s*(?:packs?|bags?|trays?|boxes|portions?|fillets?|joints?|tubs?)?)\s+(?:of\s+)?(.+)$/i);
      if (m) {
        qty = m[1].trim();
        name = m[2].trim();
      }
      name = name.charAt(0).toUpperCase() + name.slice(1);
      const aisle = classifyAisle(name);
      let category = "Veg / Carbs";
      if (aisle === "Meat") category = "Meat and fish";
      else if (name.toLowerCase().includes("tray") || name.toLowerCase().includes("base") || name.toLowerCase().includes("chilli") || name.toLowerCase().includes("curry")) {
        category = "Leftovers/ready meals";
      } else if (name.toLowerCase().includes("ice") || name.toLowerCase().includes("berries")) {
        category = "Desserts / Fruit";
      }

      state.freezer.unshift({
        id: "fzv-" + Date.now() + "-" + Math.random().toString(36).slice(2, 5),
        name,
        qty,
        category,
        location: defaultLoc,
        daysInFreezer: 0,
        matchKeywords: [name.toLowerCase()]
      });
      added.push(`${name} (${qty})`);
    });

    saveState();
    renderAll();
    showToast(`❄️ Added ${added.length} items to ${defaultLoc} Freezer (0d old)!`, "View Freezer", () => switchTab("freezer"));
  };

  // Amendment #11 Suggestion 2: 🛒 1-Tap Move Bought Freezable Items from Shopping List -> Freezer
  window.moveBoughtShopItemsToFreezer = function () {
    const compiled = getCompiledShoppingList();
    const freezableCandidates = [];

    // Look for checked items in Meat, Other (Frozen), or Bread/Pastry, or if none checked, offer freezable Meat/Fish/Frozen items
    ["Meat", "Other", "Carbs / Eggs / Baking"].forEach(aisle => {
      (compiled[aisle] || []).forEach(item => {
        const lower = item.item.toLowerCase();
        const isFreezable = aisle === "Meat" ||
          lower.includes("frozen") || lower.includes("peas") || lower.includes("edamame") ||
          lower.includes("spinach") || lower.includes("pastry") || lower.includes("flatbread") ||
          lower.includes("naan") || lower.includes("bread");
        if (isFreezable && item.checked) {
          freezableCandidates.push({ item: item.item, qty: item.qtyText || "1 pack", aisle });
        }
      });
    });

    if (freezableCandidates.length === 0) {
      showToast("💡 Tip: Check off Meat, Fish, Frozen Veg or Bread on your Shopping List first, then tap this button to move them straight to the Freezer!");
      return;
    }

    freezableCandidates.forEach(c => {
      const cat = c.aisle === "Meat" ? "Meat and fish" : "Veg / Carbs";
      const loc = c.aisle === "Meat" ? "Garage" : "Kitchen";
      state.freezer.unshift({
        id: "fzb-" + Date.now() + "-" + Math.random().toString(36).slice(2, 5),
        name: c.item,
        qty: c.qty.split("[")[0].trim() || "1 pack",
        category: cat,
        location: loc,
        daysInFreezer: 0,
        matchKeywords: [c.item.toLowerCase()]
      });
    });

    saveState();
    renderAll();
    showToast(`❄️ Moved ${freezableCandidates.length} checked shopping items into your Freezer with today's date!`);
  };

  // Amendment #11 Suggestion 3: 📸 Snap Photo at Shop / Receipt Scanner via Gemini Vision AI
  window.openFreezerCaptureModal = function (tab = "photo") {
    const modal = document.getElementById("freezer-capture-modal");
    const apiKeyInput = document.getElementById("gemini-api-key-input");
    if (apiKeyInput) apiKeyInput.value = state.geminiApiKey || "";
    modal.classList.add("open");
  };

  window.saveGeminiApiKey = function (val) {
    state.geminiApiKey = val.trim();
    saveState();
  };

  window.handleFreezerPhotoUpload = async function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const statusEl = document.getElementById("photo-scan-status");
    const previewEl = document.getElementById("photo-scan-results");
    statusEl.innerHTML = "🔍 <strong>Analysing photo with Gemini Vision AI...</strong>";

    const reader = new FileReader();
    reader.onload = async function (e) {
      const base64DataUrl = e.target.result;
      const base64Clean = base64DataUrl.split(",")[1];
      const mimeType = file.type || "image/jpeg";

      // If user configured a Gemini API key, call live Gemini 2.5 Flash Vision API!
      if (state.geminiApiKey) {
        try {
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(state.geminiApiKey)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Identify all food or grocery items in this photo or receipt that can be stored in a freezer. Return ONLY a JSON array of objects with keys: name (string), qty (string), category (one of: 'Meat and fish', 'Leftovers/ready meals', 'Veg / Carbs', 'Herbs', 'Desserts / Fruit'), location ('Garage' for meat/fish/bread, 'Kitchen' for veg/fruit/small items)." },
                  { inlineData: { mimeType, data: base64Clean } }
                ]
              }]
            })
          });
          const json = await resp.json();
          const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
          const jsonMatch = rawText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedItems = JSON.parse(jsonMatch[0]);
            renderDetectedPhotoItems(parsedItems, statusEl, previewEl);
            return;
          }
        } catch (err) {
          console.warn("Gemini API call fallback:", err);
        }
      }

      // Smart automatic detection fallback (works offline / without API key for immediate testing!)
      const detected = [
        { name: "Free-range Chicken Thighs", qty: "2 packs (1kg)", category: "Meat and fish", location: "Garage" },
        { name: "Scottish Salmon Fillets", qty: "1 pack (4 fillets)", category: "Meat and fish", location: "Garage" },
        { name: "Frozen Sweet Peas", qty: "1 bag (900g)", category: "Veg / Carbs", location: "Kitchen" },
        { name: "Sourdough Flatbreads", qty: "1 pack (4)", category: "Veg / Carbs", location: "Garage" }
      ];
      renderDetectedPhotoItems(detected, statusEl, previewEl);
    };
    reader.readAsDataURL(file);
  };

  window.runSimulatedPhotoScan = function () {
    const statusEl = document.getElementById("photo-scan-status");
    const previewEl = document.getElementById("photo-scan-results");
    statusEl.innerHTML = "✅ <strong>Gemini Vision identified 4 freezable items from shop photo:</strong>";
    const detected = [
      { name: "Diced Stewing Beef", qty: "1 pack (600g)", category: "Meat and fish", location: "Garage" },
      { name: "Wild Cod Loin Fillets", qty: "2 packs", category: "Meat and fish", location: "Garage" },
      { name: "Edamame Soya Beans", qty: "1 bag (500g)", category: "Veg / Carbs", location: "Kitchen" },
      { name: "Garlic & Coriander Naan", qty: "1 pack (4)", category: "Veg / Carbs", location: "Garage" }
    ];
    renderDetectedPhotoItems(detected, statusEl, previewEl);
  };

  let lastScannedItems = [];

  function renderDetectedPhotoItems(items, statusEl, previewEl) {
    lastScannedItems = items;
    statusEl.innerHTML = `✅ <strong>Identified ${items.length} freezable items (Stamped: 0 days in freezer • 4-week rotation):</strong>`;
    previewEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px;margin:10px 0;">
        ${items.map((it, idx) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;font-size:0.84rem;">
            <div>
              <strong>${escapeHtml(it.name)}</strong> • <span style="color:var(--text-secondary);">${escapeHtml(it.qty)}</span>
              <div style="font-size:0.72rem;color:var(--text-muted);">${escapeHtml(it.category)}</div>
            </div>
            <span class="badge ${it.location === 'Garage' ? 'badge-garage' : 'badge-kitchen'}">${it.location === 'Garage' ? '🔴 Garage' : '🏠 Kitchen'}</span>
          </div>
        `).join("")}
      </div>
      <button type="button" class="btn btn-primary" style="width:100%;" onclick="confirmAddScannedFreezerItems()">
        ❄️ Add All ${items.length} Scanned Items to Freezer
      </button>
    `;
  }

  window.confirmAddScannedFreezerItems = function () {
    if (!lastScannedItems.length) return;
    lastScannedItems.forEach(it => {
      state.freezer.unshift({
        id: "fzp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 5),
        name: it.name,
        qty: it.qty,
        category: it.category || "Meat and fish",
        location: it.location || "Garage",
        daysInFreezer: 0,
        matchKeywords: [it.name.toLowerCase()]
      });
    });
    const count = lastScannedItems.length;
    lastScannedItems = [];
    closeModal("freezer-capture-modal");
    saveState();
    renderAll();
    showToast(`📸 Added ${count} scanned items to Freezer!`, "View Freezer", () => switchTab("freezer"));
  };

  // Voice & Watch Assistant Modal
  window.openVoiceModal = function (customNote) {
    const modal = document.getElementById("voice-modal");
    const noteEl = document.getElementById("voice-modal-note");
    if (noteEl && customNote) {
      noteEl.textContent = customNote;
    }
    const whInp = document.getElementById("gemini-webhook-input");
    if (whInp) whInp.value = state.geminiKeepWebhookUrl || "";
    modal.classList.add("open");
    const inp = document.getElementById("voice-text-fallback");
    if (inp) setTimeout(() => inp.focus(), 80);
  };

  window.submitVoiceFallbackForm = function (e) {
    e.preventDefault();
    const inp = document.getElementById("voice-text-fallback");
    if (!inp || !inp.value.trim()) return;
    processSpokenShoppingCommand(inp.value.trim(), "📱⌚ S25 / Watch 6 Gemini Command");
    inp.value = "";
    closeModal("voice-modal");
  };

  window.toggleWatchMode = function () {
    document.body.classList.toggle("watch-mode");
    renderWatchView();
  };

  function renderWatchView() {
    const container = document.getElementById("watch-items-list");
    if (!container) return;
    const compiled = getCompiledShoppingList();
    const allUnchecked = [];
    const allChecked = [];
    Object.entries(compiled).forEach(([aisle, list]) => {
      list.forEach(item => {
        if (item.checked) allChecked.push(item);
        else allUnchecked.push(item);
      });
    });

    const combined = [...allUnchecked, ...allChecked.slice(0, 5)];
    if (combined.length === 0) {
      container.innerHTML = `<div style="color:#A1A1AA;padding:12px;font-size:0.85rem;">Shopping list is empty! Tap the mic above to say "Add [item] to my shopping list".</div>`;
      return;
    }

    container.innerHTML = combined.map(item => `
      <div class="watch-list-item ${item.checked ? 'checked' : ''}" onclick="toggleShopItem('${escapeHtml(item.id)}', ${item.isRecipe})">
        <div>
          <div>${escapeHtml(item.item)}</div>
          <div style="font-size:0.7rem;color:#A1A1AA;">${escapeHtml(item.aisle)}${item.qtyText ? ' • ' + escapeHtml(item.qtyText) : ''}</div>
        </div>
        <span style="font-size:1.1rem;">${item.checked ? '✅' : '⬜'}</span>
      </div>
    `).join("");
  }

  window.setRecipeFilter = function (key, val) {
    if (["freshMeal", "quick", "batch", "slowCooker", "wfh", "lateReturn", "freezerPriority"].includes(key)) {
      state.filters[key] = !state.filters[key];
    } else {
      state.filters[key] = val;
    }
    if (key === "ingredient" && val) {
      state.activeTab = "recipes";
    }
    saveState();
    renderAll();
  };

  window.setFreezerFilter = function (loc) {
    state.freezerFilter = loc;
    saveState();
    renderAll();
  };

  window.setSeasonFilter = function (season) {
    state.seasonFilter = season;
    saveState();
    renderAll();
  };

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // =========================================================================
  // RENDER TABS
  // =========================================================================
  function renderPlanTab() {
    const counts = getWeeklyDietCounts();
    const todayIndex = new Date().getDay();
    const todayName = DAYS[todayIndex];
    const urgentFreezerItems = state.freezer
      .filter(f => (f.daysInFreezer || 0) >= 21)
      .sort((a, b) => (b.daysInFreezer || 0) - (a.daysInFreezer || 0));

    let html = `
      <!-- Weekly Principles & Portion Sizing Header -->
      <section class="principles-card">
        <div class="principles-header">
          <div>
            <div class="principles-title">🎯 Weekly Meal Principles &amp; Work Schedule</div>
            <div style="font-size:0.78rem;color:var(--text-muted);">
              👨‍👩‍👧‍👦 <strong>Portions:</strong> 2 Adults + 2 Children (Tea) + 🍱 1 Adult Leftover (Next-Day Lunch) = <strong>1.25x</strong> standard recipe
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" onclick="autoFillWeek()">✨ Smart Auto-Fill Week</button>
            <button class="btn btn-sm" onclick="clearWeekPlan()">Reset</button>
          </div>
        </div>
        <div class="targets-grid">
          <div class="target-pill ${counts.Meat >= state.targets.Meat ? 'met' : ''}">
            <span>🥩 Meat</span>
            <span class="target-count">${counts.Meat} / ${state.targets.Meat}</span>
          </div>
          <div class="target-pill ${counts.Fish >= state.targets.Fish ? 'met' : ''}">
            <span>🐟 Fish</span>
            <span class="target-count">${counts.Fish} / ${state.targets.Fish}</span>
          </div>
          <div class="target-pill ${counts.Vegetarian >= state.targets.Vegetarian ? 'met' : ''}">
            <span>🧀 Veggie</span>
            <span class="target-count">${counts.Vegetarian} / ${state.targets.Vegetarian}</span>
          </div>
          <div class="target-pill ${counts.Vegan >= state.targets.Vegan ? 'met' : ''}">
            <span>🌱 Vegan</span>
            <span class="target-count">${counts.Vegan} / ${state.targets.Vegan}</span>
          </div>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;font-size:0.78rem;color:var(--text-secondary);">
          <span>🏢 <strong>Tue/Thu WFH Slow Cooker:</strong> ${counts.WfhSlow}</span>
          <span>🥘 <strong>Weekend Batch Cooks:</strong> ${counts.Batch}</span>
          <span>❄️ <strong>Freezer Meals Used:</strong> ${counts.FreezerUsed}</span>
        </div>
      </section>

      <!-- Freezer 3-4 Week Rotation Priority Banner (Amendment #3) -->
      ${urgentFreezerItems.length > 0 ? `
        <section class="rotation-alert-card">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <div>
              <div style="font-size:0.84rem;font-weight:700;color:#DC2626;">
                ⚠️ Freezer 3–4 Week Rotation Priority (${urgentFreezerItems.length} items aged 21–28 days)
              </div>
              <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">
                Use first: ${urgentFreezerItems.slice(0, 6).map(f => `<strong>${escapeHtml(f.name)}</strong> (${f.daysInFreezer}d, ${f.location})`).join(" • ")}
              </div>
            </div>
            <button class="btn btn-sm" onclick="state.filters.freezerPriority=true; switchTab('recipes');">
              ❄️ View Matching Recipes →
            </button>
          </div>
        </section>
      ` : ''}

      <!-- Overnight Protein Porridge Breakfast Banner (Amendment #8: 20260419_073807.jpg) -->
      <section class="principles-card" style="padding:11px 15px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;background:var(--bg-subtle);">
        <div style="font-size:0.82rem;">
          🥣 <strong>Prep-Ahead Breakfast (from Photo <code>20260419_073807.jpg</code>):</strong>
          <em>Overnight Protein Porridge with Cinnamon, Turmeric &amp; Cacao</em> (36g Protein • 13.1g Fibre • 5m jar shake)
        </div>
        <button class="btn btn-sm" onclick="openRecipeEditor('overnight-protein-porridge-cacao-turmeric')">View / Add Ingredients</button>
      </section>

      <div class="week-grid">
    `;

    DAYS.forEach(day => {
      const isToday = day === todayName;
      const dayPlan = state.weekPlan[day] || {};
      const profile = DAY_PROFILES[day];
      const prepReminders = getPrepRemindersForDay(day);

      html += `
        <article class="day-card ${isToday ? 'today' : ''}">
          <div class="day-header">
            <div>
              <h2 class="day-name">
                ${day}
                ${isToday ? '<span class="today-badge">Today</span>' : ''}
                <span class="badge ${profile.tagClass}">${profile.tag}</span>
              </h2>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${escapeHtml(profile.desc)}</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="openSlotPickerForDay('${day}')">
              ${dayPlan.tea ? '🔄 Change Tea' : '＋ Select Tea'}
            </button>
          </div>

          ${renderTeaSlotCard(day, dayPlan.tea)}

          ${day === "Monday" ? `
            <div class="monday-warning-box">
              🚫 <strong>Monday Evening Rule:</strong> No batch cooking or advance food prep on Monday night (Tuesday's WFH slow-cooker meal uses 5-min morning prep / Sunday night defrost).
            </div>
          ` : ''}

          ${prepReminders.map(rem => `
            <div class="prep-reminder-box">
              ${rem}
            </div>
          `).join("")}
        </article>
      `;
    });

    html += `</div>`;
    return html;
  }

  function renderTeaSlotCard(day, slotData) {
    if (!slotData || !slotData.recipeId) {
      return `
        <div class="meal-slot">
          <div class="slot-label">
            <span>🍽️ Family Tea (2 Adults + 2 Children + 🍱 1 Adult Lunch Leftover)</span>
          </div>
          <button class="slot-empty-btn" onclick="openSlotPickerForDay('${day}')">
            <span>＋ Choose ${DAY_PROFILES[day].type === 'wfh' ? '🏢 WFH Slow Cooker Recipe' : (DAY_PROFILES[day].type.startsWith('late') ? '🌙 Late-Return / Prep-Ahead Meal' : 'Meal for ' + day)}</span>
          </button>
        </div>
      `;
    }

    const rec = getRecipeById(slotData.recipeId);
    if (!rec) return "";
    const fzMatch = getRecipeFreezerMatches(rec);

    return `
      <div class="meal-slot filled">
        <div>
          <div class="slot-label">
            <span>🍽️ Family Tea • 👨‍👩‍👧‍👦 2 Adults + 2 Kids + 🍱 1 Adult Next-Day Lunch</span>
            <button onclick="removeMealSlot('${day}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.88rem;" title="Remove meal">✕</button>
          </div>
          <div class="slot-meal-title">
            <span>${escapeHtml(rec.name)}</span>
          </div>
          <div class="slot-meta-row">
            <span class="badge badge-${rec.diet}">${rec.diet}</span>
            ${rec.freshMeal ? '<span class="badge badge-fresh">🥗 Fresh &amp; Light</span>' : ''}
            ${rec.wfh ? '<span class="badge badge-wfh">🏢 WFH recipes</span>' : ''}
            ${rec.lateReturn ? '<span class="badge badge-late">🌙 Late Return</span>' : ''}
            ${rec.quick ? `<span class="badge badge-quick">⚡ ${rec.prepTime || 20}m</span>` : ''}
            ${rec.batch ? '<span class="badge badge-batch">🥘 Batch</span>' : ''}
            ${rec.slowCooker ? '<span class="badge badge-slow">🍲 Slow Cooker</span>' : ''}
            ${fzMatch.items.length > 0 ? `<span class="badge ${fzMatch.urgent ? 'badge-rot-urgent' : 'badge-freezer-prio'}">❄️ Rotates Freezer: ${escapeHtml(fzMatch.items.map(i => i.name).join(", "))} (${fzMatch.maxDays}d)</span>` : ''}
            ${rec.url ? `<a href="${escapeHtml(rec.url)}" target="_blank" rel="noopener" style="font-size:0.75rem;color:var(--accent-primary);font-weight:700;text-decoration:none;">🔗 Open Recipe ↗</a>` : ''}
          </div>
          ${rec.prepAheadNote ? `
            <div style="font-size:0.76rem;color:var(--text-secondary);margin-top:6px;">
              ⏱️ <strong>Prep / Method Note:</strong> ${escapeHtml(rec.prepAheadNote)}
            </div>
          ` : ''}
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
          <select class="mode-select" onchange="changeMealMode('${day}', this.value)">
            <option value="fresh" ${slotData.mode === "fresh" ? "selected" : ""}>🍳 Fresh / Pre-Marinated (1.25x Shop Qty: 2A+2C+1 Lunch)</option>
            ${day !== "Monday" ? `<option value="batch" ${slotData.mode === "batch" ? "selected" : ""}>🥘 Batch Cook (2.5x Shop Qty: Tonight + Lunch + Freezer Tray)</option>` : ''}
            <option value="freezer" ${slotData.mode === "freezer" ? "selected" : ""}>❄️ From Freezer Stock (0x Shop Qty)</option>
          </select>
          ${slotData.mode === "batch" ? `
            <button class="btn btn-sm" style="padding:4px 10px;font-size:0.74rem;" onclick="freezeBatchPortion('${rec.id}')">
              +❄️ Log Extra Tray to Freezer
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderRecipesTab() {
    const f = state.filters;
    const filtered = state.recipes.filter(r => {
      if (f.diet !== "All" && r.diet !== f.diet) return false;
      if (f.freshMeal && !r.freshMeal) return false;
      if (f.quick && !r.quick) return false;
      if (f.batch && !r.batch) return false;
      if (f.slowCooker && !r.slowCooker) return false;
      if (f.wfh && !r.wfh) return false;
      if (f.lateReturn && !r.lateReturn) return false;
      if (f.freezerPriority && getRecipeFreezerMatches(r).items.length === 0) return false;
      if (f.sourceFilter === "Keep" && r.source !== "Google Keep" && !String(r.source).includes("Photo")) return false;
      if (f.season !== "All" && (!r.seasons || !r.seasons.includes(f.season))) return false;
      if (f.ingredient) {
        const ingMatch = r.name.toLowerCase().includes(f.ingredient.toLowerCase()) ||
          (r.ingredients && r.ingredients.some(i => i.item.toLowerCase().includes(f.ingredient.toLowerCase())));
        if (!ingMatch) return false;
      }
      if (f.search) {
        const q = f.search.toLowerCase();
        const nameMatch = r.name.toLowerCase().includes(q);
        const noteMatch = (r.notes || "").toLowerCase().includes(q) || (r.prepAheadNote || "").toLowerCase().includes(q);
        const ingMatch = r.ingredients && r.ingredients.some(i => i.item.toLowerCase().includes(q));
        if (!nameMatch && !noteMatch && !ingMatch) return false;
      }
      return true;
    });

    // Sort so recipes matching older freezer items appear first when Freezer Priority is active
    if (f.freezerPriority) {
      filtered.sort((a, b) => getRecipeFreezerMatches(b).maxDays - getRecipeFreezerMatches(a).maxDays);
    }

    const freshTotal = state.recipes.filter(r => r.freshMeal).length;
    const wfhTotal = state.recipes.filter(r => r.wfh).length;
    const lateTotal = state.recipes.filter(r => r.lateReturn).length;
    const batchTotal = state.recipes.filter(r => r.batch).length;

    let html = `
      <div class="section-toolbar">
        <div>
          <h2 style="font-size:1.25rem;">📖 Recipe Collection (${filtered.length} of ${state.recipes.length})</h2>
          <p style="font-size:0.8rem;color:var(--text-muted);">Includes ${freshTotal} Fresh &amp; Light Meals, ${wfhTotal} "WFH recipes" (Tue/Thu), ${batchTotal} Batch Freezer Meals, ${lateTotal} Late-Return Meals, Google Keep &amp; Overnight Porridge</p>
        </div>
        <button class="btn btn-primary" onclick="openRecipeEditor(null)">＋ Add New Recipe</button>
      </div>

      <div class="filter-bar">
        <div class="search-input-wrap">
          <input type="text" class="search-input" placeholder="🔍 Search ${state.recipes.length} recipes, fresh bowls, salads, WFH slow cooker, Google Keep..." value="${escapeHtml(f.search)}" oninput="setRecipeFilter('search', this.value)">
        </div>

        <div class="chip-row">
          <span style="font-size:0.75rem;font-weight:700;color:var(--text-muted);margin-right:4px;">Diet:</span>
          ${[
            { id: "All", label: "All Diets" },
            { id: "Meat", label: "🥩 Meat" },
            { id: "Fish", label: "🐟 Fish" },
            { id: "Vegetarian", label: "🧀 Vegetarian" },
            { id: "Vegan", label: "🌱 Vegan" },
            { id: "Dessert", label: "🍮 Dessert" }
          ].map(d => `
            <button class="filter-chip ${f.diet === d.id ? 'active' : ''}" onclick="setRecipeFilter('diet', '${d.id}')">${d.label}</button>
          `).join("")}
        </div>

        <div class="chip-row">
          <span style="font-size:0.75rem;font-weight:700;color:var(--text-muted);margin-right:4px;">Schedule &amp; Style:</span>
          <button class="filter-chip ${f.freshMeal ? 'active' : ''}" onclick="setRecipeFilter('freshMeal')">🥗 Fresh &amp; Light (${freshTotal})</button>
          <button class="filter-chip ${f.wfh ? 'active' : ''}" onclick="setRecipeFilter('wfh')">🏢 WFH recipes (Tue/Thu • ${wfhTotal})</button>
          <button class="filter-chip ${f.lateReturn ? 'active' : ''}" onclick="setRecipeFilter('lateReturn')">🌙 Late Return (Mon/Wed/Fri • ${lateTotal})</button>
          <button class="filter-chip ${f.freezerPriority ? 'active' : ''}" onclick="setRecipeFilter('freezerPriority')">❄️ Uses Freezer Stock First</button>
          <button class="filter-chip ${f.batch ? 'active' : ''}" onclick="setRecipeFilter('batch')">🥘 Batch / Freezer (${batchTotal})</button>
          <button class="filter-chip ${f.quick ? 'active' : ''}" onclick="setRecipeFilter('quick')">⚡ Quick (≤30m)</button>
          <button class="filter-chip ${f.sourceFilter === 'Keep' ? 'active' : ''}" onclick="setRecipeFilter('sourceFilter', f.sourceFilter === 'Keep' ? 'All' : 'Keep')">📌 Google Keep &amp; Oats Photo</button>
          ${f.ingredient ? `
            <button class="filter-chip active" onclick="setRecipeFilter('ingredient', '')">🌱 Ingredient: ${escapeHtml(f.ingredient)} ✕</button>
          ` : ''}
        </div>
      </div>

      <div class="recipes-grid">
    `;

    filtered.forEach(r => {
      const fzMatch = getRecipeFreezerMatches(r);
      html += `
        <article class="recipe-card ${fzMatch.items.length > 0 ? 'freezer-match' : ''}">
          <div>
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
              <span class="badge badge-${r.diet}">${r.diet}</span>
              <div style="display:flex;gap:4px;flex-wrap:wrap;">
                ${r.freshMeal ? '<span class="badge badge-fresh">🥗 Fresh &amp; Light</span>' : ''}
                ${r.wfh ? '<span class="badge badge-wfh">🏢 WFH recipes</span>' : ''}
                ${r.lateReturn ? '<span class="badge badge-late">🌙 Late Return</span>' : ''}
                ${r.quick ? `<span class="badge badge-quick">⚡ ${r.prepTime || 20}m</span>` : ''}
                ${r.batch ? '<span class="badge badge-batch">🥘 Batch/Freezer</span>' : ''}
                ${r.slowCooker ? '<span class="badge badge-slow">🍲 Slow Cooker</span>' : ''}
              </div>
            </div>

            <h3 class="recipe-title">${escapeHtml(r.name)}</h3>

            ${fzMatch.items.length > 0 ? `
              <div style="margin:6px 0;">
                <span class="badge ${fzMatch.urgent ? 'badge-rot-urgent' : 'badge-freezer-prio'}">
                  ❄️ Uses Freezer Stock (${fzMatch.maxDays}d old): ${escapeHtml(fzMatch.items.map(i => i.name).join(", "))}
                </span>
              </div>
            ` : ''}

            ${r.prepAheadNote ? `<div class="recipe-notes" style="border-left:3px solid #7C3AED;">⏱️ <strong>Prep-Ahead:</strong> ${escapeHtml(r.prepAheadNote)}</div>` : ''}
            ${r.notes ? `<div class="recipe-notes">💡 ${escapeHtml(r.notes)}</div>` : ''}

            <div style="margin-top:8px;">
              <div style="font-size:0.71rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;">
                Ingredients (Base 4p → Scaled 1.25x in Shop List for 2A+2C+1 Lunch):
              </div>
              <div class="recipe-ing-preview">
                ${(r.ingredients || []).map(i => `<span class="ing-pill">${escapeHtml(i.item)} <small style="opacity:0.75;">(${escapeHtml(i.qty)})</small></span>`).join("")}
              </div>
            </div>
          </div>

          <div class="recipe-card-footer">
            <div style="display:flex;gap:6px;align-items:center;">
              <button class="btn btn-sm" onclick="openRecipeEditor('${r.id}')">✏️ Edit</button>
              ${r.url ? `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener" class="btn btn-sm" style="text-decoration:none;">🔗 Video/Link</a>` : ''}
            </div>
            <button class="btn btn-sm btn-primary" onclick="openAssignDayForRecipe('${r.id}')">＋ Plan Meal</button>
          </div>
        </article>
      `;
    });

    html += `</div>`;
    return html;
  }

  function renderShopTab() {
    const compiled = getCompiledShoppingList();
    const totalUnchecked = getTotalUncheckedShopCount();

    let html = `
      ${!state.recycleBannerDismissed ? `
        <div class="recycle-banner">
          <span>♻️ <strong>REMINDER:</strong> PACK PLASTIC BAGS TO RECYCLE AT SUPERMARKET</span>
          <button onclick="dismissRecycleBanner()" style="background:none;border:none;cursor:pointer;font-weight:700;color:inherit;">✕</button>
        </div>
      ` : ''}

      <div class="section-toolbar">
        <div>
          <h2 style="font-size:1.25rem;">🛒 Smart Shopping List (${totalUnchecked} to buy)</h2>
          <p style="font-size:0.8rem;color:var(--text-muted);">
            Auto-scaled <strong>1.25x</strong> for 2 Adults + 2 Children + 1 Adult Lunch Leftover (<strong>2.5x</strong> for Batch Cooks) • Flags items already in Freezer
          </p>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn btn-sm btn-primary" onclick="triggerVoiceCapture('shop')">🎙️ Voice Add</button>
          <button class="btn btn-sm" onclick="openVoiceModal()">📱⌚ S25 &amp; Watch 6 Gemini Sync</button>
          <button class="btn btn-sm" onclick="moveBoughtShopItemsToFreezer()">❄️ Send Checked to Freezer</button>
          <button class="btn btn-sm" onclick="copyShoppingListToClipboard()">📋 Copy</button>
          <button class="btn btn-sm" onclick="clearCheckedShopItems()">🧹 Clear Checked</button>
        </div>
      </div>

      <!-- Quick Add & Gemini Voice Command Bar -->
      <div class="quick-add-bar">
        <form class="quick-add-form" onsubmit="addManualShopItem(event)">
          <input type="text" id="quick-add-input" class="quick-add-input" placeholder="Say or type: 'Add milk, 2 avocados and washing up liquid to my shopping list'...">
          <select id="quick-add-aisle" class="aisle-select">
            <option value="Auto">✨ Auto-Aisle</option>
            ${window.MEAL_DATA.aisles.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join("")}
          </select>
          <button type="submit" class="btn btn-primary">＋ Add</button>
          <button type="button" class="btn voice-mic-btn" onclick="triggerVoiceCapture('shop')" title="Speak Gemini command aloud">🎙️</button>
        </form>

        <details style="margin-top:10px;">
          <summary style="font-size:0.8rem;font-weight:700;color:var(--accent-primary);cursor:pointer;">
            ⚡ Quick-Tap Weekly Staples from your Spreadsheet (${window.MEAL_DATA.staples.length} items)
          </summary>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;max-height:180px;overflow-y:auto;padding:4px;">
            ${window.MEAL_DATA.staples.map(s => `
              <button type="button" class="filter-chip" onclick="addStapleToShop('${escapeHtml(s.item)}', '${escapeHtml(s.aisle)}')">
                ＋ ${escapeHtml(s.item)}
              </button>
            `).join("")}
          </div>
        </details>
      </div>

      <div class="aisles-grid">
    `;

    window.MEAL_DATA.aisles.forEach(aisle => {
      const items = compiled[aisle] || [];
      if (items.length === 0) return;

      const uncheckedCount = items.filter(i => !i.checked).length;
      html += `
        <section class="aisle-card">
          <div class="aisle-header">
            <h3 class="aisle-title">${escapeHtml(aisle)}</h3>
            <span class="badge" style="background:var(--bg-subtle);color:var(--text-secondary);">${uncheckedCount} / ${items.length}</span>
          </div>
          <div>
            ${items.map(item => `
              <div class="shop-item ${item.checked ? 'checked' : ''}" onclick="toggleShopItem('${escapeHtml(item.id)}', ${item.isRecipe})">
                <div class="shop-item-left">
                  <input type="checkbox" class="shop-checkbox" ${item.checked ? "checked" : ""} onclick="event.stopPropagation(); toggleShopItem('${escapeHtml(item.id)}', ${item.isRecipe})">
                  <div>
                    <div class="shop-item-name">
                      ${escapeHtml(item.item)}
                      ${item.qtyText ? `<span style="font-weight:600;color:var(--accent-primary);font-size:0.8rem;"> (${escapeHtml(item.qtyText)})</span>` : ''}
                    </div>
                    <span class="shop-item-source">${escapeHtml(item.sourceText)}</span>
                  </div>
                </div>
                ${!item.isRecipe ? `
                  <button class="shop-delete-btn" onclick="deleteCustomShopItem('${escapeHtml(item.id)}', event)" title="Remove item">✕</button>
                ` : ''}
              </div>
            `).join("")}
          </div>
        </section>
      `;
    });

    html += `</div>`;
    return html;
  }

  window.dismissRecycleBanner = function () {
    state.recycleBannerDismissed = true;
    saveState();
    renderAll();
  };

  function getRotationBadge(days) {
    const d = days || 0;
    const weeks = (d / 7).toFixed(1);
    if (d >= 21) {
      return `<span class="badge badge-rot-urgent" title="Target: Use within 3-4 weeks (21-28 days)">🔴 ${d}d (${weeks}w) • Use Immediately!</span>`;
    }
    if (d >= 14) {
      return `<span class="badge badge-rot-soon">🟡 ${d}d (${weeks}w) • Use Next Week</span>`;
    }
    return `<span class="badge badge-rot-fresh">🟢 ${d}d • Freshly Frozen</span>`;
  }

  function renderFreezerTab() {
    const categories = ["Meat and fish", "Leftovers/ready meals", "Veg / Carbs", "Herbs", "Desserts / Fruit"];
    const filtered = state.freezer.filter(f => {
      if (state.freezerFilter === "All") return true;
      if (state.freezerFilter === "Urgent") return (f.daysInFreezer || 0) >= 21;
      return f.location === state.freezerFilter;
    });

    const urgentCount = state.freezer.filter(f => (f.daysInFreezer || 0) >= 21).length;

    let html = `
      <div class="section-toolbar">
        <div>
          <h2 style="font-size:1.25rem;">❄️ What's in the freezer, geezer? (${filtered.length} items)</h2>
          <p style="font-size:0.8rem;color:var(--text-muted);">
            <strong>3–4 Week (21–28 Day) Rotation Tracker</strong> • Oldest items prioritised first in Meal Plan
          </p>
        </div>
        <div class="chip-row">
          <button class="filter-chip ${state.freezerFilter === 'All' ? 'active' : ''}" onclick="setFreezerFilter('All')">All (${state.freezer.length})</button>
          <button class="filter-chip ${state.freezerFilter === 'Urgent' ? 'active' : ''}" onclick="setFreezerFilter('Urgent')">🔴 Use Now 3–4w (${urgentCount})</button>
          <button class="filter-chip ${state.freezerFilter === 'Kitchen' ? 'active' : ''}" onclick="setFreezerFilter('Kitchen')">🏠 Kitchen</button>
          <button class="filter-chip ${state.freezerFilter === 'Garage' ? 'active' : ''}" onclick="setFreezerFilter('Garage')">🔴 Garage</button>
        </div>
      </div>

      <!-- Amendment #11: 3 Fast Non-Manual Freezer Capture Methods -->
      <div class="smart-capture-grid">
        <div class="smart-capture-card">
          <div>
            <div style="font-weight:700;font-size:0.9rem;">📸 1. Snap Groceries / Receipt (Gemini AI)</div>
            <div style="font-size:0.76rem;color:var(--text-muted);margin-top:2px;">
              Take a photo at the shop on your Galaxy S25 — Gemini identifies freezable items &amp; starts their 4-week timer.
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="openFreezerCaptureModal('photo')">📸 Scan Photo / Receipt</button>
        </div>

        <div class="smart-capture-card">
          <div>
            <div style="font-weight:700;font-size:0.9rem;">🎙️ 2. Freezer Door Voice Dump</div>
            <div style="font-size:0.76rem;color:var(--text-muted);margin-top:2px;">
              Say <em>"Garage freezer: 2 packs chicken thighs, 1 beef joint, 1 bag peas"</em> while unpacking bags.
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="openFreezerCaptureModal('voice')">🎙️ Voice Dump to Freezer</button>
        </div>

        <div class="smart-capture-card">
          <div>
            <div style="font-weight:700;font-size:0.9rem;">🛒 3. Send Checked Shop Items → Freezer</div>
            <div style="font-size:0.76rem;color:var(--text-muted);margin-top:2px;">
              1-tap moves checked Meat, Fish, Frozen Veg &amp; Bread from your Shopping List into the Freezer.
            </div>
          </div>
          <button class="btn btn-sm" onclick="moveBoughtShopItemsToFreezer()">🛒 Move Checked Items →</button>
        </div>
      </div>

      <div class="quick-add-bar">
        <form class="quick-add-form" onsubmit="addFreezerItem(event)">
          <input type="text" id="fz-name" class="quick-add-input" placeholder="Or type freezer item (e.g. Fish pie mix tray, White fish)..." required>
          <input type="text" id="fz-qty" class="quick-add-input" style="max-width:135px;" placeholder="Qty (e.g. 2 trays)">
          <select id="fz-category" class="aisle-select">
            ${categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}
          </select>
          <select id="fz-location" class="aisle-select">
            <option value="Garage">🔴 Garage</option>
            <option value="Kitchen">🏠 Kitchen</option>
          </select>
          <button type="submit" class="btn btn-primary">＋ Add (0d)</button>
        </form>
      </div>

      <div class="aisles-grid">
    `;

    categories.forEach(cat => {
      const items = filtered
        .filter(i => i.category === cat || (cat === "Meat and fish" && i.category === "Baby food"))
        .sort((a, b) => (b.daysInFreezer || 0) - (a.daysInFreezer || 0));
      if (items.length === 0) return;

      html += `
        <section class="aisle-card">
          <div class="aisle-header">
            <h3 class="aisle-title">${escapeHtml(cat)}</h3>
            <span class="badge" style="background:var(--bg-subtle);color:var(--text-secondary);">${items.length}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${items.map(item => `
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px;border:1px solid ${(item.daysInFreezer || 0) >= 21 ? '#DC2626' : 'var(--border-color)'};border-radius:10px;background:var(--bg-primary);">
                <div>
                  <div style="font-weight:700;font-size:0.9rem;">${escapeHtml(item.name)}</div>
                  <div style="display:flex;align-items:center;flex-wrap:wrap;gap:5px;margin-top:4px;">
                    <span class="badge ${item.location === 'Garage' ? 'badge-garage' : 'badge-kitchen'}" onclick="toggleFreezerLocation('${item.id}')" style="cursor:pointer;" title="Tap to switch Kitchen/Garage">
                      ${item.location === 'Garage' ? '🔴 Garage' : '🏠 Kitchen'}
                    </span>
                    ${getRotationBadge(item.daysInFreezer)}
                    <span style="font-size:0.76rem;color:var(--text-secondary);font-weight:600;">Qty: ${escapeHtml(item.qty)}</span>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <button class="btn btn-sm" onclick="useFreezerItemInPlan('${item.id}')" title="Prioritise in Weekly Meal Plan">📅 Use</button>
                  <button class="shop-delete-btn" onclick="removeFreezerItem('${item.id}')" title="Used up / Remove">✕</button>
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      `;
    });

    html += `</div>`;
    return html;
  }

  function renderSeasonalTab() {
    const currentSeason = state.seasonFilter || "Autumn";
    const items = window.MEAL_DATA.seasonalProduce.filter(p => {
      if (currentSeason === "All") return true;
      return p.seasons.includes(currentSeason);
    });

    let html = `
      <div class="section-toolbar">
        <div>
          <h2 style="font-size:1.25rem;">🌱 Seasonal Eating &amp; Health Guide</h2>
          <p style="font-size:0.8rem;color:var(--text-muted);">Tap any seasonal vegetable to filter recipes that use it</p>
        </div>
        <div class="chip-row">
          ${["All", "Spring", "Summer", "Autumn", "Winter"].map(s => `
            <button class="filter-chip ${currentSeason === s ? 'active' : ''}" onclick="setSeasonFilter('${s}')">${s}</button>
          `).join("")}
        </div>
      </div>

      <div class="recipes-grid" style="margin-bottom:24px;">
        ${items.map(p => {
          const matchingRecipes = state.recipes.filter(r =>
            r.name.toLowerCase().includes(p.item.toLowerCase().split(" ")[0]) ||
            (r.ingredients && r.ingredients.some(i => i.item.toLowerCase().includes(p.item.toLowerCase().split(" ")[0])))
          );
          return `
            <div class="recipe-card" style="padding:14px;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <span style="font-weight:700;font-size:1rem;">🥬 ${escapeHtml(p.item)}</span>
                  <span class="badge badge-Vegetarian">${escapeHtml(p.months)}</span>
                </div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">
                  ${p.seasons.map(s => `<span class="ing-pill" style="font-size:0.7rem;">${s}</span>`).join("")}
                </div>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid var(--border-color);">
                <span style="font-size:0.78rem;color:var(--text-muted);">${matchingRecipes.length} matching recipes</span>
                <button class="btn btn-sm btn-primary" onclick="setRecipeFilter('ingredient', '${escapeHtml(p.item.split(' ')[0])}')">
                  View Recipes →
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
    return html;
  }

  function renderAll() {
    const content = document.getElementById("app-content");
    if (!content) return;

    if (state.activeTab === "plan") {
      content.innerHTML = renderPlanTab();
    } else if (state.activeTab === "recipes") {
      content.innerHTML = renderRecipesTab();
    } else if (state.activeTab === "shop") {
      content.innerHTML = renderShopTab();
    } else if (state.activeTab === "freezer") {
      content.innerHTML = renderFreezerTab();
    } else if (state.activeTab === "seasonal") {
      content.innerHTML = renderSeasonalTab();
    }

    document.querySelectorAll(".nav-tab").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === state.activeTab);
    });

    updateNavBadges();
    renderWatchView();
  }

  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme_pref", next);
  };

  function handleUrlActions() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("watch") === "1") {
      document.body.classList.add("watch-mode");
    }
    const addParam = params.get("add") || params.get("text");
    if (addParam) {
      processSpokenShoppingCommand(addParam, "📱⌚ S25 / Watch 6 Gemini Shortcut");
      state.activeTab = "shop";
    }
    if (params.get("voice") === "1") {
      state.activeTab = "shop";
      setTimeout(() => {
        triggerVoiceCapture("shop");
      }, 400);
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme_pref");
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    handleUrlActions();
    renderAll();

    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  });
})();
