// Initialize GunDB Decentralized Real-Time Sync Engine
const syncRoomId = "DAY2DAY-PTA-8590";
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const appData = gun.get(syncRoomId);

// Core Application State
let currentView = 'home';
let currentAdminTab = 'orders';
let isKitchenOpen = true;
let isSoundAlertOn = true;
let menuSearchQuery = '';
let currentCategory = 'all';

// Mock Data for Initial Setup (If DB is empty)
const defaultMenuItems = [
    { id: 'm1', name: 'Kozhi Pidi', price: '₹150', category: 'main', desc: 'Traditional roasted rice dumplings immersed in rich, spicy Kerala chicken gravy.', available: true },
    { id: 'm2', name: 'Flaky Porotta', price: '₹15', category: 'main', desc: 'Multi-layered, crispy, and soft flatbread perfected on the hot tawa.', available: true },
    { id: 'm3', name: 'Banana Fritters (Pazham Pori)', price: '₹12', category: 'appetizer', desc: 'Ripe Kerala plantains dipped in batter and deep-fried to golden perfection.', available: true },
    { id: 'm4', name: 'Kulikki Sarbath', price: '₹30', category: 'drink', desc: 'Famous shaken Kerala lemonade with sweet basil seeds and a hint of green chili.', available: true }
];

// --- VIEW NAVIGATION MANAGEMENT ---
function showView(viewId) {
    currentView = viewId;
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${viewId}-view`).classList.remove('hidden');

    // Update active navigation tab styling
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('bg-green-50');
    });
    if (viewId === 'home' || viewId === 'menu') {
        document.getElementById(`nav-${viewId}`).classList.add('bg-green-50');
    }
}

function showAdminTab(tabId) {
    currentAdminTab = tabId;
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.add('hidden');
    });
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');

    // Dynamic border highlights on dashboard tabs
    const buttons = ['orders', 'menu-edit', 'history', 'qr-generator', 'settings'];
    buttons.forEach(b => {
        const btn = document.getElementById(`tab-${b}-btn`);
        if (btn) {
            btn.classList.remove('border-b-4', 'border-green-600', 'text-green-700');
            btn.classList.add('text-gray-500');
        }
    });
    
    const activeBtn = document.getElementById(`tab-${tabId}-btn`);
    if (activeBtn) {
        activeBtn.classList.add('border-b-4', 'border-green-600', 'text-green-700');
        activeBtn.classList.remove('text-gray-500');
    }
}

// --- MODAL & AUTHENTICATION ---
function openLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('login-password').focus();
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('login-password').value = '';
}

function verifyAdminPassword() {
    const passwordInput = document.getElementById('login-password');
    const errorDiv = document.getElementById('login-error');
    
    // Quick demonstration check (Can be customized or linked to encrypted DB check)
    if (passwordInput.value === "8590") {
        closeLoginModal();
        showView('admin');
        showAdminTab('orders');
        showToast("✓ Welcome back, Owner!", "success");
    } else {
        passwordInput.classList.add('input-error');
        errorDiv.classList.remove('hidden');
        setTimeout(() => passwordInput.classList.remove('input-error'), 400);
    }
}

// --- MENU RENDERING & FILTERING ---
function renderCustomerMenu() {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filteredItems = defaultMenuItems.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) || 
                              item.desc.toLowerCase().includes(menuSearchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredItems.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center text-gray-400 py-12 font-medium">No dishes match your parameters.</div>`;
        return;
    }

    filteredItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = `p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between transition ${!item.available || !isKitchenOpen ? 'opacity-60' : 'hover:shadow-md'}`;
        
        itemCard.innerHTML = `
            <div>
                <div class="flex justify-between items-start gap-2 mb-2">
                    <h4 class="text-xl font-bold text-gray-800">${item.name}</h4>
                    <span class="text-green-700 font-extrabold text-lg whitespace-nowrap">${item.price}</span>
                </div>
                <p class="text-gray-500 text-xs leading-relaxed mb-4">${item.desc}</p>
            </div>
            <button ${!item.available || !isKitchenOpen ? 'disabled' : ''} onclick="placeQuickOrder('${item.name}', '${item.price}')" class="w-full py-2.5 rounded-xl font-bold text-xs transition ${!item.available || !isKitchenOpen ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'}">
                ${!isKitchenOpen ? 'Kitchen Closed' : !item.available ? 'Out of Stock' : 'Quick Order'}
            </button>
        `;
        grid.appendChild(itemCard);
    });
}

function filterMenu(category) {
    currentCategory = category;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('bg-green-700', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700');
    });
    
    const activeBtn = document.getElementById(`cat-${category}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-100', 'text-gray-700');
        activeBtn.classList.add('bg-green-700', 'text-white');
    }
    renderCustomerMenu();
}

function handleMenuSearch() {
    menuSearchQuery = document.getElementById('menu-search').value;
    renderCustomerMenu();
}

// --- QUICK ORDER PROCESSING ---
function placeQuickOrder(dishName, price) {
    showToast(`⏳ Processing order for ${dishName}...`);
    
    // Simulate push notification and entry sound alert triggers
    setTimeout(() => {
        showToast(`✓ Order for ${dishName} sent directly to kitchen!`);
        triggerOrderChime();
    }, 800);
}

// --- UTILITY COMPONENT HANDLERS ---
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
    
    setTimeout(() => {
        toast.classList.add('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
    }, 3000);
}

function triggerOrderChime() {
    if (!isSoundAlertOn) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 Note
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5 Note

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
        console.log("Audio chime couldn't play: context interaction restriction active.", e);
    }
}

// --- OWNER SETTINGS FUNCTIONS ---
function toggleKitchenStatus() {
    isKitchenOpen = !isKitchenOpen;
    const banner = document.getElementById('kitchen-closed-banner');
    const btn = document.getElementById('kitchen-status-btn');
    
    if (isKitchenOpen) {
        banner.classList.add('hidden');
        btn.textContent = "KITCHEN OPEN";
        btn.className = "px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition shadow-sm text-xs md:text-sm whitespace-nowrap";
        showToast("Kitchen is now open for online orders!");
    } else {
        banner.classList.remove('hidden');
        btn.textContent = "KITCHEN CLOSED";
        btn.className = "px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition shadow-sm text-xs md:text-sm whitespace-nowrap";
        showToast("Kitchen closed. Incoming orders locked.");
    }
    renderCustomerMenu();
}

function toggleAlertSound() {
    isSoundAlertOn = !isSoundAlertOn;
    const btn = document.getElementById('sound-status-btn');
    if (isSoundAlertOn) {
        btn.textContent = "SOUND ALERT ON";
        btn.className = "px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition shadow-sm text-xs md:text-sm whitespace-nowrap";
        showToast("Audio chimes enabled.");
    } else {
        btn.textContent = "SOUND ALERT OFF";
        btn.className = "px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-full transition shadow-sm text-xs md:text-sm whitespace-nowrap";
        showToast("Audio notifications muted.");
    }
}

function generateCustomQRCode() {
    const identifier = document.getElementById('qr-table-label').value.trim();
    if (!identifier) {
        showToast("Please enter a valid table or configuration identifier.");
        return;
    }
    
    const qrBox = document.getElementById('qr-result-box');
    const qrImg = document.getElementById('generated-qr-img');
    const qrLink = document.getElementById('qr-link-text');
    
    const generatedUrl = `${window.location.origin}${window.location.pathname}?table=${encodeURIComponent(identifier)}`;
    
    // Utilizing free global dynamic QR API tool matching current standards
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedUrl)}`;
    qrLink.textContent = generatedUrl;
    
    qrBox.classList.remove('hidden');
    showToast(`QR Code generated successfully for ${identifier}!`);
}

function copyQRLinkToClipboard() {
    const linkText = document.getElementById('qr-link-text').textContent;
    navigator.clipboard.writeText(linkText).then(() => {
        showToast("URL Link copied to clipboard!");
    });
}

// Update DB Connection Status Light
setTimeout(() => {
    const statusDot = document.getElementById('db-status');
    if (statusDot) {
        statusDot.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 transition-all duration-300";
        statusDot.innerHTML = `<span class="w-2 h-2 rounded-full bg-green-500"></span> Synced Online`;
    }
}, 1500);

// App Boot Launcher Initialization
window.onload = () => {
    renderCustomerMenu();
};
