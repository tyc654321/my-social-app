let authMode = 'login';
let currentRoom = "";

function switchAuth(mode) {
    authMode = mode;
    document.getElementById('authTitle').innerText = mode === 'reg' ? '创建新账号' : '欢迎回来';
    document.getElementById('userPwdConfirm').classList.toggle('hidden', mode === 'login');
    document.querySelectorAll('.tab-menu span').forEach((s, i) => s.classList.toggle('active', (mode === 'reg' && i === 1) || (mode === 'login' && i === 0)));
}

async function handleAuth() {
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPwd').value;
    if (!email || !password) return alert("请填写完整");

    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
        if (authMode === 'reg') { alert("注册成功，请登录"); switchAuth('login'); }
        else {
            localStorage.setItem('currentUserEmail', email);
            localStorage.setItem('currentUserId', data.userId);
            enterApp(data.userId, data.profile);
        }
    } else { document.getElementById('authMsg').innerText = data.msg; }
}

function enterApp(userId, profile) {
    document.getElementById('loginOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
    updateProfileDisplay(userId, profile);
}

function toggleProfileEdit(show) { document.getElementById('profileEditOverlay').classList.toggle('hidden', !show); }

// --- 核心修改：带校验的保存函数 ---
async function saveProfile() {
    const email = localStorage.getItem('currentUserEmail');
    const ageValue = document.getElementById('editAge').value;
    const bioValue = document.getElementById('editBio').value;

    // 校验1：年龄
    if (ageValue < 0 || ageValue > 150) {
        alert("🚨 年龄必须在 0 到 150 岁之间！");
        return;
    }
    // 校验2：字数
    if (bioValue.length > 50) {
        alert("🚨 个人介绍不能超过 50 个字！");
        return;
    }

    const profile = {
        gender: document.getElementById('editGender').value,
        age: ageValue,
        bio: bioValue
    };

    const res = await fetch('/api/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, profile })
    });
    const data = await res.json();
    if (data.success) {
        updateProfileDisplay(localStorage.getItem('currentUserId'), profile);
        toggleProfileEdit(false);
        alert("✅ 资料更新成功！");
    }
}

function updateProfileDisplay(userId, profile = {}) {
    document.getElementById('displayUserName').innerText = userId;
    document.getElementById('displayUserName').onclick = () => toggleProfileEdit(true);
    document.getElementById('userAvatar').innerText = userId.charAt(0).toUpperCase();
}

async function viewOtherProfile(userId) {
    const res = await fetch(`/api/user/${userId}`);
    const result = await res.json();
    if (result.success) {
        const d = result.data;
        document.getElementById('viewAvatar').innerText = d.userId.charAt(0).toUpperCase();
        document.getElementById('viewUserName').innerText = d.userId;
        document.getElementById('viewGender').innerText = d.gender;
        document.getElementById('viewAge').innerText = d.age;
        document.getElementById('viewBio').innerText = d.bio;
        document.getElementById('viewProfileOverlay').classList.remove('hidden');
    }
}

function closeViewProfile() { document.getElementById('viewProfileOverlay').classList.add('hidden'); }

function enterRoom(name) {
    currentRoom = name;
    document.getElementById('chatTitle').innerText = name;
    document.getElementById('lobbyView').classList.add('hidden');
    document.getElementById('chatView').classList.remove('hidden');
    document.getElementById('backBtn').classList.remove('hidden');
    document.getElementById('chatHistory').innerHTML = "";
}

function exitRoom() {
    document.getElementById('lobbyView').classList.remove('hidden');
    document.getElementById('chatView').classList.add('hidden');
    document.getElementById('backBtn').classList.add('hidden');
}

function sendChat() {
    const msgInput = document.getElementById('chatMsg');
    const text = msgInput.value.trim();
    if (!text) return;
    const userId = localStorage.getItem('currentUserId');
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('chatHistory').innerHTML += `
        <div class="chat-bubble right">
            <div class="sender-id" onclick="viewOtherProfile('${userId}')">${userId}</div>
            <div>${text}</div>
            <span class="time-stamp">${time}</span>
        </div>`;
    msgInput.value = "";
    document.getElementById('chatHistory').scrollTop = document.getElementById('chatHistory').scrollHeight;
}

function addPost() {
    const text = document.getElementById('postText').value.trim();
    if (!text) return;
    const userId = localStorage.getItem('currentUserId');
    document.getElementById('postList').innerHTML = `
        <div style="background:#f8fafc; padding:15px; border-radius:12px; margin-bottom:10px; border-left:4px solid #1a73e8;">
            <strong style="color:#1a73e8; cursor:pointer;" onclick="viewOtherProfile('${userId}')">${userId}:</strong>
            <p style="margin-top:5px;">${text}</p>
        </div>` + document.getElementById('postList').innerHTML;
    document.getElementById('postText').value = "";
}

function handleLogout() { localStorage.clear(); location.reload(); }

window.onload = () => {
    if (localStorage.getItem('currentUserId')) enterApp(localStorage.getItem('currentUserId'), {});
};