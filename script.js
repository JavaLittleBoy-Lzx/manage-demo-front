let currentPage = 1;
const totalPages = 7;
let musicPlaying = false;
let clickCount = 0;
let shakeCount = 0;
let heartsCollected = 0;
let loveMessages = [
    "你真的很可爱 💕",
    "我想你了 🥰",
    "你是我的小天使 👼",
    "抱抱你 🤗",
    "么么哒 😘",
    "你笑起来真好看 😊",
    "我的小宝贝 💖",
    "想和你一起看星星 ⭐"
];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initMusic();
    initInteractiveFeatures();
    
    // 延迟显示爱情进度条
    setTimeout(() => {
        if (currentPage === 6) {
            showLoveProgress();
        }
    }, 1000);
});

// 初始化互动功能
function initInteractiveFeatures() {
    // 点击屏幕产生爱心
    document.addEventListener('click', createClickHeart);
    
    // 摇一摇功能（移动端）
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleShake);
    }
    
    // 鼠标移动产生星星轨迹
    document.addEventListener('mousemove', createMouseTrail);
    
    // 双击屏幕的惊喜
    document.addEventListener('dblclick', showSurpriseMessage);
    
    // 长按功能
    let pressTimer;
    document.addEventListener('mousedown', startPress);
    document.addEventListener('mouseup', endPress);
    document.addEventListener('touchstart', startPress);
    document.addEventListener('touchend', endPress);
}

// 点击产生爱心特效
function createClickHeart(e) {
    const heart = document.createElement('div');
    heart.innerHTML = '💕';
    heart.style.position = 'fixed';
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    heart.style.fontSize = '20px';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.animation = 'floatUp 2s ease-out forwards';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
        }
    }, 2000);
    
    clickCount++;
    if (clickCount % 10 === 0) {
        showRandomMessage();
    }
}

// 摇一摇功能
function handleShake(event) {
    const acceleration = event.accelerationIncludingGravity;
    const threshold = 15;
    
    if (Math.abs(acceleration.x) > threshold || 
        Math.abs(acceleration.y) > threshold || 
        Math.abs(acceleration.z) > threshold) {
        
        shakeCount++;
        if (shakeCount % 3 === 0) {
            createShakeEffect();
        }
    }
}

// 摇一摇特效
function createShakeEffect() {
    document.body.style.animation = 'shake 0.5s ease-in-out';
    
    // 产生大量爱心
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = ['💕', '💖', '💗', '💝'][Math.floor(Math.random() * 4)];
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.top = Math.random() * window.innerHeight + 'px';
            heart.style.fontSize = (15 + Math.random() * 10) + 'px';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '9999';
            heart.style.animation = 'floatUp 3s ease-out forwards';
            
            document.body.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 3000);
        }, i * 100);
    }
    
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);
}

// 初始化游戏
function initGame() {
    const gameArea = document.getElementById('gameArea');
    const hearts = gameArea.querySelectorAll('.game-heart');
    
    // 随机分布爱心位置
    hearts.forEach(heart => {
        const x = Math.random() * 80 + 10; // 10% - 90%
        const y = Math.random() * 60 + 20; // 20% - 80%
        heart.style.left = x + '%';
        heart.style.top = y + '%';
        heart.style.animation = 'heartFloat 2s ease-in-out infinite';
    });
    
    heartsCollected = 0;
    updateHeartCount();
}

// 收集爱心
function collectHeart(heartElement) {
    heartElement.style.animation = 'heartCollect 0.5s ease-out forwards';
    heartsCollected++;
    updateHeartCount();
    
    // 创建收集特效
    const rect = heartElement.getBoundingClientRect();
    createCollectEffect(rect.left + rect.width/2, rect.top + rect.height/2);
    
    setTimeout(() => {
        heartElement.style.display = 'none';
    }, 500);
    
    if (heartsCollected === 5) {
        setTimeout(() => {
            showGameComplete();
        }, 1000);
    }
}

// 更新爱心计数
function updateHeartCount() {
    document.getElementById('heartCount').textContent = heartsCollected;
}

// 收集特效
function createCollectEffect(x, y) {
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = '✨';
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = '12px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        const angle = (i / 5) * 2 * Math.PI;
        const distance = 30 + Math.random() * 20;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;
        
        particle.style.animation = `collectSparkle 1s ease-out forwards`;
        particle.style.setProperty('--target-x', targetX + 'px');
        particle.style.setProperty('--target-y', targetY + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
}

// 游戏完成
function showGameComplete() {
    const gameNextBtn = document.getElementById('gameNextBtn');
    gameNextBtn.style.display = 'block';
    gameNextBtn.style.animation = 'popIn 1s ease-out';
    
    // 显示完成消息
    const completeMsg = document.createElement('div');
    completeMsg.innerHTML = '🎉 太棒了！你找到了我所有的爱心！';
    completeMsg.style.position = 'absolute';
    completeMsg.style.top = '50%';
    completeMsg.style.left = '50%';
    completeMsg.style.transform = 'translate(-50%, -50%)';
    completeMsg.style.background = 'linear-gradient(45deg, #ff6b9d, #ff8a80)';
    completeMsg.style.color = 'white';
    completeMsg.style.padding = '15px 25px';
    completeMsg.style.borderRadius = '25px';
    completeMsg.style.fontSize = '16px';
    completeMsg.style.fontWeight = '600';
    completeMsg.style.zIndex = '10000';
    completeMsg.style.animation = 'popIn 2s ease-out forwards';
    
    document.body.appendChild(completeMsg);
    
    setTimeout(() => {
        if (completeMsg.parentNode) {
            completeMsg.parentNode.removeChild(completeMsg);
        }
    }, 3000);
}

// 鼠标轨迹星星
function createMouseTrail(e) {
    if (Math.random() > 0.9) { // 10% 概率产生星星
        const star = document.createElement('div');
        star.innerHTML = '✨';
        star.style.position = 'fixed';
        star.style.left = e.clientX + 'px';
        star.style.top = e.clientY + 'px';
        star.style.fontSize = '12px';
        star.style.pointerEvents = 'none';
        star.style.zIndex = '9998';
        star.style.animation = 'sparkle 1s ease-out forwards';
        
        document.body.appendChild(star);
        
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, 1000);
    }
}

// 双击惊喜消息
function showSurpriseMessage(e) {
    const message = document.createElement('div');
    message.innerHTML = loveMessages[Math.floor(Math.random() * loveMessages.length)];
    message.style.position = 'fixed';
    message.style.left = e.clientX + 'px';
    message.style.top = e.clientY + 'px';
    message.style.background = 'rgba(255, 107, 157, 0.9)';
    message.style.color = 'white';
    message.style.padding = '10px 15px';
    message.style.borderRadius = '20px';
    message.style.fontSize = '14px';
    message.style.pointerEvents = 'none';
    message.style.zIndex = '9999';
    message.style.animation = 'popIn 2s ease-out forwards';
    message.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 2000);
}

// 长按开始
function startPress(e) {
    pressTimer = setTimeout(() => {
        showLongPressEffect(e);
    }, 1000);
}

// 长按结束
function endPress() {
    clearTimeout(pressTimer);
}

// 长按特效
function showLongPressEffect(e) {
    const x = e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2;
    const y = e.clientY || (e.touches && e.touches[0].clientY) || window.innerHeight / 2;
    
    // 创建爱心环绕效果
    for (let i = 0; i < 8; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '💖';
        heart.style.position = 'fixed';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        heart.style.fontSize = '16px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';
        
        const angle = (i / 8) * 2 * Math.PI;
        const radius = 50;
        const targetX = x + Math.cos(angle) * radius;
        const targetY = y + Math.sin(angle) * radius;
        
        heart.style.animation = `orbit 2s ease-out forwards`;
        heart.style.setProperty('--target-x', targetX + 'px');
        heart.style.setProperty('--target-y', targetY + 'px');
        
        document.body.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 2000);
    }
}

// 随机显示爱意消息
function showRandomMessage() {
    const messageBox = document.createElement('div');
    messageBox.innerHTML = loveMessages[Math.floor(Math.random() * loveMessages.length)];
    messageBox.style.position = 'fixed';
    messageBox.style.top = '20px';
    messageBox.style.left = '50%';
    messageBox.style.transform = 'translateX(-50%)';
    messageBox.style.background = 'linear-gradient(45deg, #ff6b9d, #ff8a80)';
    messageBox.style.color = 'white';
    messageBox.style.padding = '15px 25px';
    messageBox.style.borderRadius = '25px';
    messageBox.style.fontSize = '16px';
    messageBox.style.fontWeight = '600';
    messageBox.style.zIndex = '10000';
    messageBox.style.animation = 'slideDown 3s ease-out forwards';
    messageBox.style.boxShadow = '0 4px 20px rgba(255, 107, 157, 0.3)';
    
    document.body.appendChild(messageBox);
    
    setTimeout(() => {
        if (messageBox.parentNode) {
            messageBox.parentNode.removeChild(messageBox);
        }
    }, 3000);
}

// 创建粒子效果
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    
    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particle.style.opacity = Math.random();
        
        // 随机形状
        if (Math.random() > 0.7) {
            particle.innerHTML = '💕';
            particle.style.fontSize = '12px';
            particle.style.background = 'none';
        } else if (Math.random() > 0.8) {
            particle.innerHTML = '✨';
            particle.style.fontSize = '10px';
            particle.style.background = 'none';
        }
        
        particlesContainer.appendChild(particle);
        
        // 清理粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 6000);
    }, 300);
}

// 音乐控制
function initMusic() {
    const musicBtn = document.getElementById('musicBtn');
    const bgMusic = document.getElementById('bgMusic');
    
    musicBtn.addEventListener('click', () => {
        if (musicPlaying) {
            bgMusic.pause();
            musicBtn.innerHTML = '🎵';
            musicPlaying = false;
        } else {
            bgMusic.play().catch(e => {
                console.log('音乐播放失败:', e);
            });
            musicBtn.innerHTML = '🔇';
            musicPlaying = true;
        }
    });
}

// 下一页
function nextPage() {
    if (currentPage < totalPages) {
        const currentPageEl = document.getElementById(`page${currentPage}`);
        const nextPageEl = document.getElementById(`page${currentPage + 1}`);
        
        currentPageEl.classList.remove('active');
        currentPageEl.classList.add('prev');
        
        setTimeout(() => {
            nextPageEl.classList.add('active');
            currentPage++;
            
            // 特殊页面的特效
            if (currentPage === 6) {
                setTimeout(() => {
                    initGame();
                }, 500);
            } else if (currentPage === 7) {
                setTimeout(() => {
                    showLoveProgress();
                }, 500);
            }
        }, 100);
    }
}

// 显示爱情进度条
function showLoveProgress() {
    const progress = document.getElementById('loveProgress');
    setTimeout(() => {
        progress.style.width = '100%';
    }, 500);
}

// 显示原谅特效
function showForgiveness() {
    const overlay = document.getElementById('forgivenessOverlay');
    overlay.classList.add('show');
    
    // 创建爱心爆炸效果
    createHeartsExplosion();
    
    // 3秒后隐藏
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 3000);
}

// 爱心爆炸特效
function createHeartsExplosion() {
    const container = document.querySelector('.hearts-explosion');
    
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '💕';
        heart.style.position = 'absolute';
        heart.style.fontSize = '20px';
        heart.style.left = '0px';
        heart.style.top = '0px';
        heart.style.pointerEvents = 'none';
        
        const angle = (i / 20) * 2 * Math.PI;
        const distance = 100 + Math.random() * 100;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        heart.style.animation = `explode 2s ease-out forwards`;
        heart.style.setProperty('--x', x + 'px');
        heart.style.setProperty('--y', y + 'px');
        
        container.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 2000);
    }
}

// 重新开始
function restart() {
    // 重置所有页面
    for (let i = 1; i <= totalPages; i++) {
        const page = document.getElementById(`page${i}`);
        page.classList.remove('active', 'prev');
    }
    
    // 显示第一页
    document.getElementById('page1').classList.add('active');
    currentPage = 1;
    
    // 重置进度条
    const progress = document.getElementById('loveProgress');
    progress.style.width = '0%';
}

// 添加所有动画的CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes explode {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(var(--x), var(--y)) scale(0.5);
            opacity: 0;
        }
    }
    
    @keyframes floatUp {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
        }
    }
    
    @keyframes sparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes popIn {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        20% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
    }
    
    @keyframes orbit {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        50% {
            transform: translate(calc(var(--target-x) - 50%), calc(var(--target-y) - 50%)) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translate(calc(var(--target-x) - 50%), calc(var(--target-y) - 50%)) scale(0);
            opacity: 0;
        }
    }
    
    @keyframes slideDown {
        0% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
        20% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        80% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// 触摸支持
let startX = 0;
let startY = 0;

document.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    if (!startX || !startY) {
        return;
    }
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const diffX = startX - endX;
    const diffY = startY - endY;
    
    // 左滑切换到下一页
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0 && currentPage < totalPages) {
            nextPage();
        }
    }
    
    startX = 0;
    startY = 0;
});

// 键盘支持
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        if (currentPage < totalPages) {
            nextPage();
        }
    } else if (e.key === 'ArrowLeft') {
        // 可以添加返回上一页的功能
    }
});