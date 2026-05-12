const CONFIG = {
    ADMIN_PIN: "2512", 
    TELEGRAM_BOT_TOKEN: "8723282690:AAH5Nnro3YuLktkZoiOpCWpG7HqpwI8z0As",
    TELEGRAM_ADMIN_ID: 6203678798,
    TELEGRAM_CHAT_ID: 6203678798
};


let totalKeysGenerated = 0;
let activeUsers = [];
let currentUserId = 0;
let isAdminVerified = false;
let isManageAccess = false;


particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#00d4ff' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#00d4ff',
            opacity: 0.4,
            width: 1
        },
        move: { enable: true, speed: 2, direction: 'none', random: false }
    },
    interactivity: {
        detect_on: 'canvas',
        events: { 
            onhover: { enable: true, mode: 'grab' }, 
            onclick: { enable: true, mode: 'push' } 
        },
        modes: { 
            grab: { distance: 200, line_linked: { opacity: 0.7 } }, 
            push: { particles_nb: 4 } 
        }
    },
    retina_detect: true
});


const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page-content');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        pages.forEach(page => page.classList.add('hidden'));
        document.getElementById(link.dataset.page).classList.remove('hidden');
        
        if (link.dataset.page === 'users') updateUsersTable();
        if (link.dataset.page === 'manage') checkManageAccess();
        if (link.dataset.page === 'settings') updateSettings();
    });
});


function verifyAdmin() {
    const pin = document.getElementById('adminPin').value;
    
    if (pin === CONFIG.ADMIN_PIN) {
        isAdminVerified = true;
        document.getElementById('keygenForm').classList.remove('hidden');
        document.querySelector('#keygen .admin-warning').innerHTML = '✅ Admin Verified! You can now generate keys.';
        document.querySelector('#keygen .admin-warning').style.background = 'rgba(0, 255, 136, 0.2)';
        document.querySelector('#keygen .admin-warning').style.borderColor = 'rgba(0, 255, 136, 0.5)';
        document.querySelector('#keygen .admin-warning').style.color = '#00ff88';
        document.getElementById('adminPin').style.borderColor = '#00ff88';
    } else {
        alert('❌ Invalid Admin PIN!');
        document.getElementById('adminPin').style.borderColor = '#ff4444';
        document.getElementById('adminPin').value = '';
    }
}


function verifyManageAccess() {
    const pin = document.getElementById('managePin').value;
    
    if (pin === CONFIG.ADMIN_PIN) {
        isManageAccess = true;
        document.getElementById('manageContent').classList.remove('hidden');
        document.querySelector('#manage .admin-warning').innerHTML = '✅ Admin Access Granted! Full key management available.';
        document.querySelector('#manage .admin-warning').style.background = 'rgba(0, 255, 136, 0.2)';
        document.querySelector('#manage .admin-warning').style.borderColor = 'rgba(0, 255, 136, 0.5)';
        document.querySelector('#manage .admin-warning').style.color = '#00ff88';
        updateManageTable();
    } else {
        alert('❌ Invalid Admin PIN!');
        document.getElementById('managePin').style.borderColor = '#ff4444';
        document.getElementById('managePin').value = '';
    }
}

function checkManageAccess() {
    if (!isManageAccess) {
        document.getElementById('manageContent').classList.add('hidden');
    } else {
        updateManageTable();
    }
}


async function generateKey() {
    if (!isAdminVerified) {
        alert('❌ Please verify admin first!');
        return;
    }

    const duration = document.getElementById('keyDuration').value;
    currentUserId++;
    
    const key = 'JULES-' + 
                String(currentUserId).padStart(4, '0') + '-' + 
                Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + 
                Math.random().toString(36).substr(2, 4).toUpperCase() + '-' +
                Math.random().toString(36).substr(2, 4).toUpperCase();
    
    const today = new Date();
    const expires = new Date(today.getTime() + (duration * 24 * 60 * 60 * 1000));
    const expireDate = expires.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    const user = {
        id: currentUserId,
        key: key,
        user: 'USER-' + currentUserId.toString().padStart(4, '0'),
        duration: duration + ' days',
        expires: expireDate,
        status: 'Active',
        generated: today.toLocaleDateString()
    };
    
    activeUsers.push(user);
    totalKeysGenerated++;
    

    const keyDiv = document.getElementById('generatedKey');
    keyDiv.innerHTML = `
        <div style="color: #00ff88; font-size: 1.3rem; margin-bottom: 1rem;">
            ✅ <strong>Key Generated Successfully!</strong>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <strong>${key}</strong>
        </div>
        <div style="font-size: 0.9rem; color: #ccc; margin-bottom: 1rem;">
            👤 User: ${user.user} | ⏱️ ${user.duration} | 📅 ${user.expires}
        </div>
        <button onclick="copyToClipboard('${key}')" class="copy-btn">
            📋 Copy Key to Clipboard
        </button>
    `;
    keyDiv.classList.remove('hidden');
    

    await sendTelegramNotification(key, user);
    

    keyDiv.scrollIntoView({ behavior: 'smooth' });
    updateCounters();
}


async function sendTelegramNotification(key, user) {
    const message = `
🎉 *NEW KEY GENERATED*
━━━━━━━━━━━━━━━━━━━━
🔑 *Key:* \`${key}\`
👤 *User:* ${user.user}
⏱️ *Duration:* ${user.duration}
📅 *Expires:* ${user.expires}
🔢 *ID:* #${user.id}
⏰ *Generated:* ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
*JULES License System*
    `;
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CONFIG.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        if (response.ok) {
            console.log('✅ Telegram notification sent!');
        }
    } catch (error) {
        console.error('❌ Telegram notification failed:', error);
    }
}


function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const original = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        btn.style.background = '#00ff88';
        setTimeout(() => {
            btn.innerHTML = original;
            btn.style.background = '#00ff88';
        }, 2000);
    });
}


function updateUsersTable() {
    const usersList = document.getElementById('usersList');
    
    if (activeUsers.length === 0) {
        usersList.innerHTML = `
            <div class="user-row" style="grid-column: 1 / -1; justify-content: center; color: #888; padding: 3rem;">
                <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <div>No active users yet. Generate some keys!</div>
            </div>
        `;
        return;
    }
    
    usersList.innerHTML = activeUsers.map(user => `
        <div class="user-row">
            <div>${user.user}</div>
            <div>${user.duration}</div>
            <div>${user.expires}</div>
            <div class="${user.status === 'Active' ? 'status-active' : 'status-expired'}">${user.status}</div>
        </div>
    `).join('');
}


function updateManageTable() {
    const manageList = document.getElementById('manageList');
    
    if (activeUsers.length === 0) {
        manageList.innerHTML = `
            <div class="user-row full" style="grid-column: 1 / -1; justify-content: center; color: #888; padding: 3rem;">
                <i class="fas fa-key" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <div>No keys to manage</div>
            </div>
        `;
        return;
    }
    
    manageList.innerHTML = activeUsers.map((user, index) => `
        <div class="user-row full">
            <div><code>${user.key}</code></div>
            <div>${user.user}</div>
            <div>${user.duration}</div>
            <div>${user.expires}</div>
            <div class="${user.status === 'Active' ? 'status-active' : 'status-expired'}">${user.status}</div>
            <div>
                <button onclick="copyToClipboard('${user.key}')" class="copy-btn" style="padding: 0.5rem 1rem; font-size: 0.8rem; margin-right: 0.5rem;">
                    📋
                </button>
                <button onclick="deleteUser(${index})" class="delete-btn">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}


function deleteUser(index) {
    if (confirm('Are you sure you want to delete this key/user?')) {
        activeUsers.splice(index, 1);
        updateCounters();
        if (!document.querySelector('#manage').classList.contains('hidden')) {
            updateManageTable();
        }
        alert('✅ User/Key deleted successfully!');
    }
}


function updateSettings() {
    document.getElementById('totalKeys').textContent = totalKeysGenerated;
    document.getElementById('activeUsers').textContent = activeUsers.length;
    document.getElementById('adminId').textContent = CONFIG.TELEGRAM_ADMIN_ID;
}


function updateCounters() {
    updateSettings();
    if (!document.getElementById('users').classList.contains('hidden')) {
        updateUsersTable();
    }
}


setInterval(() => {
    const today = new Date();
    activeUsers = activeUsers.filter(user => {
        try {
            const [month, day, year] = user.expires.split(' ');
            const expireDate = new Date(`${year}-${getMonthNumber(month)}-${day}`);
            return today < expireDate;
        } catch {
            return true;
        }
    });
    updateCounters();
}, 30000);

function getMonthNumber(monthName) {
    const monthNames = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    return monthNames[monthName] || '01';
}


document.addEventListener('DOMContentLoaded', () => {
    updateCounters();


    document.getElementById('adminPin').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyAdmin();
    });
    
    document.getElementById('managePin').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyManageAccess();
    });
});


window.addEventListener('scroll', () => {
    window.scrollTo(0, 0);
});