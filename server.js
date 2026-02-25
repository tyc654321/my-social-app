const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let users = {}; 

app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    if (users[email]) return res.json({ success: false, msg: '该邮箱已被注册' });
    users[email] = { password, gender: '保密', age: '??', bio: '这个人很懒，什么都没留下。' };
    res.json({ success: true });
});

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

app.post('/api/save-profile', (req, res) => {
    const { email, profile } = req.body;
    // 后端兜底校验：防止黑客绕过前端输入负数或超长文字
    if (profile.age < 0 || profile.age > 150 || (profile.bio && profile.bio.length > 50)) {
        return res.json({ success: false, msg: '提交的数据不符合规则' });
    }
    if (users[email]) {
        users[email] = { ...users[email], ...profile };
        res.json({ success: true });
    }
});

app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const userEmail = Object.keys(users).find(email => email.split('@')[0] === userId);
    const user = users[userEmail];
    if (user) {
        res.json({ success: true, data: { userId, gender: user.gender, age: user.age, bio: user.bio } });
    } else { res.json({ success: false, msg: '用户未找到' }); }
});

// 修改后：让服务器自动适应云端环境
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器已在端口 ${PORT} 启动`);
});

