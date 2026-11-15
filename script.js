/**
 * Shop Configuration — Seller WhatsApp number synced to +91 8848936732
 */
const SHOP_CONFIG = {
    shopName: "CakeStudio",
    whatsappNumber: "918848936732",
    currency: "₹"
};

/**
 * 6 Featured Cake Product Models
 */
const FEATURED_CAKES = [
    {
        id: "black-forest",
        name: "Black Forest Cake",
        tag: "Classic Bestseller",
        description: "Layers of rich dark chocolate sponge, fresh whipped cream, tart cherries, and dark chocolate shavings.",
        image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=80",
        prices: { "0.5 Kg": 350, "1.0 Kg": 650, "2.0 Kg": 1250 }
    },
    {
        id: "white-forest",
        name: "White Forest Cake",
        tag: "Creamy & Light",
        description: "Soft vanilla sponge soaked in cherry syrup, layered with whipped cream and delicate white chocolate curls.",
        image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=900&q=80",
        prices: { "0.5 Kg": 380, "1.0 Kg": 700, "2.0 Kg": 1350 }
    },
    {
        id: "chocolate-truffle",
        name: "Chocolate Truffle Cake",
        tag: "Rich Ganache",
        description: "Decadent moist chocolate sponge frosted and layered with silky dark Belgian-style chocolate ganache.",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
        prices: { "0.5 Kg": 420, "1.0 Kg": 800, "2.0 Kg": 1550 }
    },
    {
        id: "red-velvet",
        name: "Red Velvet Cake",
        tag: "Signature Velvet",
        description: "Velvety crimson cocoa sponge paired with smooth, lightly tangy cream cheese frosting and red velvet crumbs.",
        image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=900&q=80",
        prices: { "0.5 Kg": 450, "1.0 Kg": 850, "2.0 Kg": 1650 }
    },
    {
        id: "butterscotch-crunch",
        name: "Butterscotch Crunch Cake",
        tag: "Caramel & Praline",
        description: "Fluffy caramel-infused sponge layered with butterscotch cream, golden caramel drizzle, and crunchy cashew praline.",
        image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=900&q=80",
        prices: { "0.5 Kg": 350, "1.0 Kg": 650, "2.0 Kg": 1250 }
    },
    {
        id: "fresh-pineapple",
        name: "Fresh Pineapple Cake",
        tag: "Fruity & Refreshing",
        description: "Light vanilla sponge layered with fresh whipped cream and juicy caramelized pineapple chunks.",
        image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=900&q=80",
        prices: { "0.5 Kg": 320, "1.0 Kg": 600, "2.0 Kg": 1150 }
    }
];

/**
 * Quick-Add Bakery Extras
 */
const BAKERY_EXTRAS = [
    { id: "addon-eggless", name: "100% Eggless Preparation", price: 50 },
    { id: "addon-chocochips", name: "Extra Choco Chips & Nuts", price: 80 },
    { id: "addon-photoprint", name: "Edible Photo Print Topper", price: 200 },
    { id: "addon-candles", name: "Birthday Topper & Sparkle Candles", price: 60 }
];

// Track card selection state
const cardSelections = {};
FEATURED_CAKES.forEach(cake => {
    cardSelections[cake.id] = { weight: "1.0 Kg", qty: 1 };
});

// Track Customer Requirement Design Model State (No fixed price — owner quotes on WhatsApp)
const customDesignState = {
    weight: "1.0 Kg",
    qty: 1,
    notes: "",
    imageName: "",
    imageDataUrl: ""
};

// Order Bag & GPS State
let orderBag = [];
let attachedGpsLink = "";
let toastTimer = null;

/**
 * Initialize Hero Video with automatic fallback for mobile & desktop
 */
function initHeroVideo() {
    const video = document.getElementById("hero-video");
    if (!video) return;

    const fallbackSources = [
        "video_1.mp4",
        "gemini_generated_video_0cda6c51.mp4"
    ];
    let currentSourceIndex = 0;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const tryPlay = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                const resumeOnInteraction = () => {
                    video.muted = true;
                    video.play().catch(() => {});
                    document.removeEventListener("touchstart", resumeOnInteraction);
                    document.removeEventListener("click", resumeOnInteraction);
                };
                document.addEventListener("touchstart", resumeOnInteraction, { once: true });
                document.addEventListener("click", resumeOnInteraction, { once: true });
            });
        }
    };

    const switchToNextSource = () => {
        currentSourceIndex += 1;
        if (currentSourceIndex < fallbackSources.length) {
            video.src = fallbackSources[currentSourceIndex];
            video.load();
            tryPlay();
        }
    };

    video.addEventListener("error", switchToNextSource);
    const sources = video.querySelectorAll("source");
    if (sources.length > 0) {
        sources[sources.length - 1].addEventListener("error", switchToNextSource);
    }

    tryPlay();
}

/**
 * Render 6 Featured Cake Product Cards + 1 Customer Requirement Design Model Card
 */
function renderFeaturedCakes() {
    const grid = document.getElementById("featured-cakes-grid");
    if (!grid) return;

    const standardCardsHtml = FEATURED_CAKES.map(cake => {
        const sel = cardSelections[cake.id];
        const currentPrice = cake.prices[sel.weight];

        const weightButtons = Object.keys(cake.prices).map(weight => {
            const isSelected = sel.weight === weight;
            return `
                <button
                    type="button"
                    onclick="selectCardWeight('${cake.id}', '${weight}')"
                    class="flex-1 py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                            ? "bg-white text-zinc-950 border-white shadow-sm"
                            : "bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-600"
                    }"
                >
                    ${weight}
                </button>
            `;
        }).join("");

        return `
            <article class="glass-card rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 group">
                <div>
                    <!-- Cake Image -->
                    <div class="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                        <img
                            src="${cake.image}"
                            alt="${cake.name}"
                            loading="lazy"
                            onerror="this.onerror=null;this.src='https://placehold.co/800x600/18181b/e4e4e7?text=${encodeURIComponent(cake.name)}';"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        >
                        <div class="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-zinc-950/80 border border-white/15 backdrop-blur-md text-[11px] font-semibold text-zinc-200">
                            ${cake.tag}
                        </div>
                        <div class="absolute bottom-3.5 right-3.5 px-3.5 py-1.5 rounded-full bg-zinc-950/90 border border-white/20 backdrop-blur-md font-display text-sm font-bold text-white">
                            ₹<span id="price-display-${cake.id}">${currentPrice}</span>
                        </div>
                    </div>

                    <!-- Cake Info -->
                    <div class="p-6 pb-4">
                        <h3 class="font-display text-xl font-bold text-white">${cake.name}</h3>
                        <p class="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed line-clamp-2">
                            ${cake.description}
                        </p>

                        <!-- Weight Selector -->
                        <div class="mt-5">
                            <span class="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">Select Weight</span>
                            <div class="flex items-center gap-2">
                                ${weightButtons}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quantity Stepper + Add to Bag Button -->
                <div class="p-6 pt-2 space-y-3">
                    <div class="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-2xl px-3.5 py-2">
                        <span class="text-xs font-medium text-zinc-400">Quantity</span>
                        <div class="flex items-center gap-3">
                            <button
                                type="button"
                                onclick="updateCardQty('${cake.id}', -1)"
                                class="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center transition-colors"
                                aria-label="Decrease quantity"
                            >&minus;</button>
                            <span id="qty-display-${cake.id}" class="font-display font-bold text-sm text-white w-5 text-center">${sel.qty}</span>
                            <button
                                type="button"
                                onclick="updateCardQty('${cake.id}', 1)"
                                class="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center transition-colors"
                                aria-label="Increase quantity"
                            >+</button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onclick="addFeaturedCakeToBag('${cake.id}')"
                        class="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs sm:text-sm font-bold transition-colors active:scale-95"
                    >
                        Add to Bag
                    </button>
                </div>
            </article>
        `;
    }).join("");

    // Customer Requirement Design Model Card (No price shown; image upload + custom requirement notes)
    const customWeights = ["0.5 Kg", "1.0 Kg", "2.0 Kg", "3.0 Kg+"];
    const customWeightButtons = customWeights.map(w => {
        const isSelected = customDesignState.weight === w;
        return `
            <button
                type="button"
                onclick="selectCustomWeight('${w}')"
                class="flex-1 py-2 px-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                    isSelected
                        ? "bg-white text-zinc-950 border-white shadow-sm"
                        : "bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-600"
                }"
            >
                ${w}
            </button>
        `;
    }).join("");

    const customCardHtml = `
        <article class="glass-card rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 border-amber-400/30">
            <div>
                <!-- Custom Reference Image Preview / Upload Banner -->
                <div class="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900 border-b border-zinc-800/80">
                    <img
                        id="custom-cake-preview"
                        src="${customDesignState.imageDataUrl || ""}"
                        alt="Custom Cake Reference"
                        class="${customDesignState.imageDataUrl ? "" : "hidden"} w-full h-full object-cover"
                    >
                    <label
                        for="custom-cake-image-input"
                        id="custom-cake-upload-placeholder"
                        class="${customDesignState.imageDataUrl ? "hidden" : "flex"} flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-zinc-800/60 transition-colors p-6 text-center"
                    >
                        <div class="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-3">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span class="text-xs font-bold text-white">Tap to Upload Design Image</span>
                        <span class="text-[11px] text-zinc-400 mt-1">Upload a sample photo for the owner</span>
                    </label>

                    <input
                        id="custom-cake-image-input"
                        type="file"
                        accept="image/*"
                        onchange="handleCustomImageUpload(event)"
                        class="hidden"
                    >

                    <div class="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 backdrop-blur-md text-[11px] font-semibold text-amber-200">
                        Custom Design
                    </div>

                    <div class="absolute bottom-3.5 right-3.5 px-3.5 py-1.5 rounded-full bg-zinc-950/90 border border-amber-400/30 backdrop-blur-md font-display text-xs font-bold text-amber-300">
                        Price: Owner Quote
                    </div>

                    ${customDesignState.imageDataUrl ? `
                        <button
                            type="button"
                            onclick="clearCustomImage()"
                            class="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-zinc-950/85 border border-white/20 text-[11px] font-semibold text-rose-300 hover:text-white"
                        >
                            Remove Photo
                        </button>
                    ` : ""}
                </div>

                <!-- Custom Requirement Details -->
                <div class="p-6 pb-4">
                    <div class="flex items-center justify-between gap-2">
                        <h3 class="font-display text-xl font-bold text-white">Customer Requirement Design</h3>
                    </div>
                    <p class="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        Share your theme, flavor, and reference image. No price is charged upfront — the owner will review and confirm the rate on WhatsApp.
                    </p>

                    <!-- Requirement Textbox -->
                    <div class="mt-4">
                        <label for="custom-design-notes" class="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1.5">
                            Design &amp; Flavor Requirements <span class="text-rose-400">*</span>
                        </label>
                        <textarea
                            id="custom-design-notes"
                            rows="2"
                            oninput="customDesignState.notes = this.value"
                            placeholder="e.g., 2-tier chocolate truffle theme cake, pastel blue cream..."
                            class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400/60 transition-colors resize-none"
                        >${customDesignState.notes}</textarea>
                    </div>

                    <!-- Change Image Button (when image is already selected) -->
                    <div class="mt-2.5 flex items-center justify-between">
                        <label for="custom-cake-image-input" class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-amber-200 cursor-pointer">
                            <span>+ ${customDesignState.imageName ? "Change Reference Photo" : "Add Reference Photo"}</span>
                        </label>
                        <span class="text-[11px] text-zinc-400 truncate max-w-[140px]">${customDesignState.imageName || "No photo selected"}</span>
                    </div>

                    <!-- Weight Selector -->
                    <div class="mt-4">
                        <span class="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">Preferred Weight</span>
                        <div class="flex items-center gap-1.5">
                            ${customWeightButtons}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quantity Stepper + Add Custom Model to Bag -->
            <div class="p-6 pt-2 space-y-3">
                <div class="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-2xl px-3.5 py-2">
                    <span class="text-xs font-medium text-zinc-400">Quantity</span>
                    <div class="flex items-center gap-3">
                        <button
                            type="button"
                            onclick="updateCustomQty(-1)"
                            class="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center transition-colors"
                            aria-label="Decrease quantity"
                        >&minus;</button>
                        <span id="custom-qty-display" class="font-display font-bold text-sm text-white w-5 text-center">${customDesignState.qty}</span>
                        <button
                            type="button"
                            onclick="updateCustomQty(1)"
                            class="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center transition-colors"
                            aria-label="Increase quantity"
                        >+</button>
                    </div>
                </div>

                <button
                    type="button"
                    onclick="addCustomDesignToBag()"
                    class="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-bold transition-colors active:scale-95"
                >
                    Add Custom Model to Bag
                </button>
            </div>
        </article>
    `;

    grid.innerHTML = standardCardsHtml + customCardHtml;
}

function selectCardWeight(cakeId, weight) {
    cardSelections[cakeId].weight = weight;
    renderFeaturedCakes();
}

function updateCardQty(cakeId, delta) {
    const next = Math.max(1, Math.min(20, cardSelections[cakeId].qty + delta));
    cardSelections[cakeId].qty = next;
    const qtyEl = document.getElementById(`qty-display-${cakeId}`);
    if (qtyEl) qtyEl.textContent = next;
}

function addFeaturedCakeToBag(cakeId) {
    const cake = FEATURED_CAKES.find(c => c.id === cakeId);
    if (!cake) return;
    const { weight, qty } = cardSelections[cakeId];
    const unitPrice = cake.prices[weight];

    addItemToBag({
        key: `${cake.id}-${weight}`,
        name: cake.name,
        variant: weight,
        unitPrice: unitPrice,
        qty: qty,
        isCustomQuote: false
    });

    showToast(`Added ${qty} × ${cake.name} (${weight})`);
}

/**
 * Custom Design Model Handlers
 */
function selectCustomWeight(weight) {
    customDesignState.weight = weight;
    renderFeaturedCakes();
}

function updateCustomQty(delta) {
    const next = Math.max(1, Math.min(20, customDesignState.qty + delta));
    customDesignState.qty = next;
    const qtyEl = document.getElementById("custom-qty-display");
    if (qtyEl) qtyEl.textContent = next;
}

function handleCustomImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    customDesignState.imageName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
        customDesignState.imageDataUrl = e.target.result;
        renderFeaturedCakes();
        showToast("Design reference image attached");
    };
    reader.readAsDataURL(file);
}

function clearCustomImage() {
    customDesignState.imageName = "";
    customDesignState.imageDataUrl = "";
    renderFeaturedCakes();
}

function addCustomDesignToBag() {
    const notesEl = document.getElementById("custom-design-notes");
    const notesText = notesEl ? notesEl.value.trim() : customDesignState.notes.trim();

    if (!notesText && !customDesignState.imageDataUrl) {
        showToast("Please describe your design or upload a reference photo.");
        if (notesEl) notesEl.focus();
        return;
    }

    const uniqueKey = `custom-design-${Date.now()}`;
    addItemToBag({
        key: uniqueKey,
        name: "Custom Design Cake",
        variant: customDesignState.weight,
        unitPrice: null, // No price displayed — owner quotes on WhatsApp
        qty: customDesignState.qty,
        isCustomQuote: true,
        customNotes: notesText || "Refer to attached design image",
        customImageName: customDesignState.imageName,
        customImageDataUrl: customDesignState.imageDataUrl
    });

    // Reset custom form fields after adding
    customDesignState.notes = "";
    customDesignState.imageName = "";
    customDesignState.imageDataUrl = "";
    customDesignState.qty = 1;
    renderFeaturedCakes();

    showToast("Custom design added to bag (Price: Owner Quote)");
}

/**
 * Render Quick-Add Bakery Extras
 */
function renderAddons() {
    const grid = document.getElementById("addons-grid");
    if (!grid) return;

    grid.innerHTML = BAKERY_EXTRAS.map(extra => `
        <button
            type="button"
            onclick="quickAddExtra('${extra.id}')"
            class="flex items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-left transition-all active:scale-95"
        >
            <span class="text-xs sm:text-sm font-medium text-zinc-200">${extra.name}</span>
            <span class="shrink-0 px-2.5 py-1 rounded-lg bg-white/10 text-white font-display font-bold text-xs">+₹${extra.price}</span>
        </button>
    `).join("");
}

function quickAddExtra(extraId) {
    const extra = BAKERY_EXTRAS.find(e => e.id === extraId);
    if (!extra) return;

    addItemToBag({
        key: extra.id,
        name: extra.name,
        variant: "Add-on",
        unitPrice: extra.price,
        qty: 1,
        isCustomQuote: false
    });
    showToast(`Added ${extra.name}`);
}

/**
 * Bag / Order Summary Management
 */
function addItemToBag(newItem) {
    if (!newItem.isCustomQuote) {
        const existing = orderBag.find(item => item.key === newItem.key);
        if (existing) {
            existing.qty += newItem.qty;
            updateBagUI();
            return;
        }
    }
    orderBag.push({ ...newItem });
    updateBagUI();
}

function changeBagItemQty(key, delta) {
    const idx = orderBag.findIndex(item => item.key === key);
    if (idx === -1) return;

    orderBag[idx].qty += delta;
    if (orderBag[idx].qty <= 0) {
        orderBag.splice(idx, 1);
    }
    updateBagUI();
}

function removeBagItem(key) {
    const idx = orderBag.findIndex(item => item.key === key);
    if (idx !== -1) {
        orderBag.splice(idx, 1);
        updateBagUI();
    }
}

function updateBagUI() {
    const totalQty = orderBag.reduce((sum, item) => sum + item.qty, 0);
    const knownTotalPrice = orderBag.reduce((sum, item) => {
        return item.isCustomQuote ? sum : sum + (item.unitPrice * item.qty);
    }, 0);
    const hasCustomItem = orderBag.some(item => item.isCustomQuote);

    const navCount = document.getElementById("nav-bag-count");
    const orderTotalDisplay = document.getElementById("order-total-display");
    const customQuoteNote = document.getElementById("custom-quote-note");
    const stickyBar = document.getElementById("mobile-sticky-bar");
    const stickyCount = document.getElementById("sticky-bar-count");
    const stickyTotal = document.getElementById("sticky-bar-total");

    if (navCount) navCount.textContent = totalQty;
    if (stickyCount) stickyCount.textContent = totalQty;

    // Format total price display depending on whether custom quote items exist
    let totalLabel = `₹${knownTotalPrice}`;
    if (hasCustomItem && knownTotalPrice > 0) {
        totalLabel = `₹${knownTotalPrice} + Quote`;
    } else if (hasCustomItem && knownTotalPrice === 0) {
        totalLabel = `Owner Quote`;
    }

    if (orderTotalDisplay) orderTotalDisplay.textContent = totalLabel;
    if (stickyTotal) stickyTotal.innerHTML = `${totalLabel} &rarr;`;

    if (customQuoteNote) {
        if (hasCustomItem) {
            customQuoteNote.classList.remove("hidden");
        } else {
            customQuoteNote.classList.add("hidden");
        }
    }

    if (stickyBar) {
        if (totalQty > 0) {
            stickyBar.classList.remove("hidden");
        } else {
            stickyBar.classList.add("hidden");
        }
    }

    const listContainer = document.getElementById("order-items-list");
    if (!listContainer) return;

    if (orderBag.length === 0) {
        listContainer.innerHTML = `
            <div class="py-10 text-left">
                <p class="text-base font-semibold text-zinc-200">No cakes added yet.</p>
                <p class="text-sm text-zinc-400 mt-1">
                    Tap <span class="text-zinc-200 font-medium">Add to Bag</span> on any cake model or customize your own design above.
                </p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = orderBag.map(item => {
        if (item.isCustomQuote) {
            return `
                <div class="py-5 flex items-start justify-between gap-4">
                    <div class="flex items-start gap-3.5">
                        ${item.customImageDataUrl ? `
                            <img src="${item.customImageDataUrl}" alt="Custom Design" class="w-16 h-16 rounded-xl object-cover border border-amber-400/30 shrink-0">
                        ` : ""}
                        <div class="space-y-1.5">
                            <div class="flex items-center gap-2 flex-wrap">
                                <h3 class="font-display text-base sm:text-lg font-bold text-white">
                                    ${item.name} <span class="text-xs font-normal text-zinc-400">(${item.variant})</span>
                                </h3>
                                <span class="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[10px] font-semibold text-amber-300">
                                    Custom Requirement
                                </span>
                            </div>
                            <p class="text-xs text-zinc-300 leading-relaxed">
                                <span class="text-zinc-400">Design Note:</span> ${item.customNotes}
                            </p>
                            ${item.customImageName ? `
                                <p class="text-[11px] text-amber-300">
                                    📎 Photo attached: ${item.customImageName}
                                </p>
                            ` : ""}
                            <div class="pt-1 flex items-center gap-2">
                                <button
                                    type="button"
                                    onclick="changeBagItemQty('${item.key}', -1)"
                                    class="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors"
                                    aria-label="Decrease quantity"
                                >&minus;</button>
                                <span class="font-display text-xs font-bold text-white w-5 text-center">${item.qty}</span>
                                <button
                                    type="button"
                                    onclick="changeBagItemQty('${item.key}', 1)"
                                    class="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors"
                                    aria-label="Increase quantity"
                                >+</button>
                                <button
                                    type="button"
                                    onclick="removeBagItem('${item.key}')"
                                    class="ml-2 text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="font-display text-xs sm:text-sm font-bold text-amber-300 shrink-0 text-right">
                        Price on<br>WhatsApp
                    </div>
                </div>
            `;
        }

        return `
            <div class="py-5 flex items-start justify-between gap-4">
                <div class="space-y-1.5">
                    <h3 class="font-display text-base sm:text-lg font-bold text-white">
                        ${item.name} <span class="text-xs font-normal text-zinc-400">(${item.variant})</span>
                    </h3>
                    <p class="text-xs sm:text-sm text-zinc-400">
                        ${item.qty} &times; ₹${item.unitPrice}
                    </p>
                    <div class="pt-1 flex items-center gap-2">
                        <button
                            type="button"
                            onclick="changeBagItemQty('${item.key}', -1)"
                            class="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors"
                            aria-label="Decrease quantity"
                        >&minus;</button>
                        <span class="font-display text-xs font-bold text-white w-5 text-center">${item.qty}</span>
                        <button
                            type="button"
                            onclick="changeBagItemQty('${item.key}', 1)"
                            class="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors"
                            aria-label="Increase quantity"
                        >+</button>
                        <button
                            type="button"
                            onclick="removeBagItem('${item.key}')"
                            class="ml-2 text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                </div>

                <div class="font-display text-base sm:text-lg font-bold text-white shrink-0">
                    ₹${item.unitPrice * item.qty}
                </div>
            </div>
        `;
    }).join("");
}

/**
 * Live GPS Location Detection
 */
function detectCustomerLocation() {
    const locationInput = document.getElementById("customer-location");
    const btnLabel = document.getElementById("gps-btn-label");
    const pinBadge = document.getElementById("gps-pin-badge");
    const pinText = document.getElementById("gps-pin-text");
    if (!locationInput) return;

    if (!navigator.geolocation) {
        showToast("GPS location is not supported on this browser.");
        locationInput.focus();
        return;
    }

    if (btnLabel) btnLabel.textContent = "Fetching GPS...";

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            attachedGpsLink = `https://maps.google.com/?q=${lat},${lng}`;

            if (pinBadge && pinText) {
                pinText.textContent = `GPS Pin Attached (${lat}, ${lng})`;
                pinBadge.classList.remove("hidden");
            }

            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.display_name && !locationInput.value.trim()) {
                        locationInput.value = data.display_name;
                    }
                }
            } catch (_) {}

            if (!locationInput.value.trim()) {
                locationInput.value = `Live GPS Location (${lat}, ${lng})`;
            }

            if (btnLabel) btnLabel.textContent = "Location Added ✓";
            showToast("Live GPS location attached to your bill");
            setTimeout(() => {
                if (btnLabel) btnLabel.textContent = "+ Add Current Location";
            }, 3000);
        },
        () => {
            if (btnLabel) btnLabel.textContent = "+ Add Current Location";
            showToast("Allow location access or type your address below.");
            locationInput.focus();
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function clearAttachedGpsPin() {
    attachedGpsLink = "";
    const pinBadge = document.getElementById("gps-pin-badge");
    if (pinBadge) pinBadge.classList.add("hidden");
    showToast("GPS map pin removed");
}

function toggleMobileMenu(forceState) {
    const panel = document.getElementById("mobile-nav-panel");
    const iconOpen = document.getElementById("menu-icon-open");
    const iconClose = document.getElementById("menu-icon-close");
    if (!panel) return;

    const shouldOpen = typeof forceState === "boolean" ? forceState : panel.classList.contains("hidden");
    if (shouldOpen) {
        panel.classList.remove("hidden");
        if (iconOpen) iconOpen.classList.add("hidden");
        if (iconClose) iconClose.classList.remove("hidden");
    } else {
        panel.classList.add("hidden");
        if (iconOpen) iconOpen.classList.remove("hidden");
        if (iconClose) iconClose.classList.add("hidden");
    }
}

function showToast(message) {
    const toast = document.getElementById("toast-banner");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.add("hidden");
    }, 2400);
}

/**
 * Generate Structured Owner Invoice / Custom Quote Request & Open WhatsApp
 */
function sendOrderToWhatsApp() {
    const errorBox = document.getElementById("checkout-error");
    const nameInput = document.getElementById("customer-name");
    const phoneInput = document.getElementById("customer-phone");
    const locationInput = document.getElementById("customer-location");
    const orderTypeInput = document.getElementById("order-type");
    const messageInput = document.getElementById("cake-message");

    const customerName = nameInput ? nameInput.value.trim() : "";
    const customerPhone = phoneInput ? phoneInput.value.trim() : "";
    const customerLocation = locationInput ? locationInput.value.trim() : "";
    const orderType = orderTypeInput ? orderTypeInput.value : "Home Delivery";
    const cakeMessage = messageInput ? messageInput.value.trim() : "";

    if (orderBag.length === 0) {
        errorBox.textContent = "Please add at least one cake or custom design to your bag before sending.";
        errorBox.classList.remove("hidden");
        return;
    }
    if (!customerName) {
        errorBox.textContent = "Please enter your name so we can prepare your order.";
        errorBox.classList.remove("hidden");
        nameInput.focus();
        return;
    }
    if (!customerLocation && !attachedGpsLink) {
        errorBox.textContent = "Please enter your delivery location or tap '+ Add Current Location'.";
        errorBox.classList.remove("hidden");
        locationInput.focus();
        return;
    }

    errorBox.classList.add("hidden");

    const now = new Date();
    const orderId = "CS-" + String(now.getTime()).slice(-5);
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    const totalQty = orderBag.reduce((sum, item) => sum + item.qty, 0);
    const knownTotal = orderBag.reduce((sum, item) => item.isCustomQuote ? sum : sum + item.unitPrice * item.qty, 0);
    const hasCustomItem = orderBag.some(item => item.isCustomQuote);
    const hasAttachedImage = orderBag.some(item => item.isCustomQuote && item.customImageName);

    const itemBillLines = orderBag.map((item, idx) => {
        if (item.isCustomQuote) {
            const photoText = item.customImageName ? `\n    📎 *Design Photo:* ${item.customImageName} (Attaching in chat)` : "";
            return `${idx + 1}. *${item.name}* [${item.variant}] (Qty: ${item.qty})\n    • *Requirement:* ${item.customNotes}${photoText}\n    • *Price:* _Owner to review & quote_`;
        }
        const lineTotal = item.unitPrice * item.qty;
        return `${idx + 1}. *${item.name}* [${item.variant}]\n    Qty: ${item.qty} × ₹${item.unitPrice} = *₹${lineTotal}*`;
    }).join("\n");

    let grandTotalLine = `*GRAND TOTAL:* *₹${knownTotal}*`;
    if (hasCustomItem && knownTotal > 0) {
        grandTotalLine = `*SUBTOTAL (Standard Items):* *₹${knownTotal}*\n*CUSTOM DESIGN:* _Pending Owner Quote_`;
    } else if (hasCustomItem && knownTotal === 0) {
        grandTotalLine = `*PRICE:* _Pending Owner Review & Quote_`;
    }

    const billLines = [
        `🧾 *${SHOP_CONFIG.shopName.toUpperCase()} — ORDER REQUEST*`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `*Order ID:* #${orderId}`,
        `*Date & Time:* ${dateStr}, ${timeStr}`,
        `*Order Mode:* ${orderType}`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `*ORDER DETAILS:*`,
        itemBillLines,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `*Total Items:* ${totalQty}`,
        grandTotalLine,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `*CUSTOMER & DELIVERY DETAILS:*`,
        `• *Name:* ${customerName}`
    ];

    if (customerPhone) {
        billLines.push(`• *Phone:* ${customerPhone}`);
    }
    if (customerLocation) {
        billLines.push(`• *Address:* ${customerLocation}`);
    }
    if (attachedGpsLink) {
        billLines.push(`• *Google Maps Pin:* ${attachedGpsLink}`);
    }
    if (cakeMessage) {
        billLines.push(`• *Cake Note / Time:* ${cakeMessage}`);
    }

    billLines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
    if (hasAttachedImage) {
        billLines.push(`_Note: Customer uploaded a design reference photo — please attach/send the image right below this message._`);
    } else {
        billLines.push(`_Please confirm availability, custom quote (if any) & delivery time._`);
    }

    const encodedText = encodeURIComponent(billLines.join("\n"));
    const whatsappUrl = `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
    initHeroVideo();
    renderFeaturedCakes();
    renderAddons();
    updateBagUI();
});
