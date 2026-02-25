const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// 核心修改：获取云端分配的端口，如果没有则默认 3000
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let users = {}; 

// 1. 注册接口
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    if (users[email]) return res.json({ success: false, msg: '该邮箱已被注册' });
    users[email] = { password, gender: '保密', age: '??', bio: '这个人很懒，什么都没留下。' };
    res.json({ success: true });
});

// 2. 登录接口
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users[email];
    if (user && user.password === password) {
        res.json({ 
            success: true, 
            userId: email.split('@')[0], 
            profile: { gender: user.gender, age: user.age, bio: user.bio }
        });
    } else { res.json({ success: false, msg: '邮箱或密码错误' }); }
});

// 3. 保存资料接口
app.post('/api/save-profile', (req, res) => {
    const { email, profile } = req.body;
    if (profile.age < 0 || profile.age > 150 || (profile.bio && profile.bio.length > 50)) {
        return res.json({ success: false, msg: '提交的数据不符合规则' });
    }
    if (users[email]) {
        users[email] = { ...users[email], ...profile };
        res.json({ success: true });
    }
});

// 4. 查询他人资料接口
app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const userEmail = Object.keys(users).find(email => email.split('@')[0] === userId);
    const user = users[userEmail];
    if (user) {
        res.json({ success: true, data: { userId, gender: user.gender, age: user.age, bio: user.bio } });
    } else { res.json({ success: false, msg: '用户未找到' }); }
});

// 核心修改：监听 '0.0.0.0' 以确保外网可以访问
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器已在端口 ${PORT} 启动`);
});
