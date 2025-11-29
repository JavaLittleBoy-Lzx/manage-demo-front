<template>
  <div class="img-verify">
    <div class="verify-container">
      <canvas
        ref="verify"
        :width="width"
        :height="height"
        @click="handleDraw"
      ></canvas>
      <div class="refresh-overlay" @click="handleDraw">
        <i class="el-icon-refresh-right"></i>
      </div>
    </div>
  </div>
</template>
 
<script type="text/ecmascript-6">
import { reactive, onMounted, ref, toRefs } from "vue";
export default {
  setup() {
    const verify = ref(null);
    const state = reactive({
      pool: "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", // 字符串
      width: 130,
      height: 44,
      imgCode: "",
    });
    onMounted(() => {
      // 初始化绘制图片验证码
      state.imgCode = draw();
    });

    // 点击图片重新绘制
    const handleDraw = () => {
      state.imgCode = draw();
    };

    // 随机数
    const randomNum = (min, max) => {
      return parseInt(Math.random() * (max - min) + min);
    };
    // 随机颜色
    const randomColor = (min, max) => {
      const r = randomNum(min, max);
      const g = randomNum(min, max);
      const b = randomNum(min, max);
      return `rgb(${r},${g},${b})`;
    };

    // 绘制图片
    const draw = () => {
      const ctx = verify.value.getContext("2d");
      
      // 多种精美的渐变背景方案
      const gradientSchemes = [
        // 紫粉渐变 - 梦幻感
        { colors: ['#fae8ff', '#f3e8ff', '#fce7f3'], angle: 'diagonal' },
        // 蓝紫渐变 - 科技感
        { colors: ['#dbeafe', '#e0e7ff', '#ede9fe'], angle: 'diagonal' },
        // 青绿渐变 - 清新感
        { colors: ['#d1fae5', '#e0f2fe', '#ddd6fe'], angle: 'diagonal' },
        // 暖橙渐变 - 温暖感
        { colors: ['#fed7aa', '#fecaca', '#fde68a'], angle: 'diagonal' },
        // 蓝粉渐变 - 浪漫感
        { colors: ['#dbeafe', '#fce7f3', '#e0e7ff'], angle: 'diagonal' }
      ];
      
      // 随机选择一个配色方案
      const scheme = gradientSchemes[randomNum(0, gradientSchemes.length)];
      
      // 创建渐变背景
      const gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
      gradient.addColorStop(0, scheme.colors[0]);
      gradient.addColorStop(0.5, scheme.colors[1]);
      gradient.addColorStop(1, scheme.colors[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, state.width, state.height);
      
      // 定义paramText
      let imgCode = "";
      
      // 绘制验证码文字
      for (let i = 0; i < 4; i++) {
        // 随机的四个字
        const text = state.pool[randomNum(0, state.pool.length)];
        imgCode += text;
        // 随机的字体大小
        const fontSize = randomNum(22, 28);
        // 字体随机的旋转角度（减小旋转角度使其更容易识别）
        const deg = randomNum(-15, 15);
        
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textBaseline = "middle";
        
        // 创建文字渐变色
        const textGradient = ctx.createLinearGradient(0, 0, 0, state.height);
        const colorSet = [
          ['#4f46e5', '#7c3aed'],
          ['#2563eb', '#3b82f6'],
          ['#0891b2', '#06b6d4'],
          ['#7c3aed', '#a855f7']
        ];
        const randomColorSet = colorSet[randomNum(0, colorSet.length)];
        textGradient.addColorStop(0, randomColorSet[0]);
        textGradient.addColorStop(1, randomColorSet[1]);
        ctx.fillStyle = textGradient;
        
        ctx.save();
        ctx.translate(30 * i + 18, state.height / 2);
        ctx.rotate((deg * Math.PI) / 180);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
      
      // 绘制优雅的干扰线（减少数量，使用更淡的颜色）
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(randomNum(0, state.width), randomNum(0, state.height));
        ctx.quadraticCurveTo(
          randomNum(0, state.width),
          randomNum(0, state.height),
          randomNum(0, state.width),
          randomNum(0, state.height)
        );
        ctx.strokeStyle = `rgba(${randomNum(100, 200)}, ${randomNum(100, 200)}, ${randomNum(200, 255)}, 0.3)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      
      // 绘制装饰性小点（减少数量）
      for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        ctx.arc(
          randomNum(0, state.width),
          randomNum(0, state.height),
          randomNum(1, 2),
          0,
          2 * Math.PI
        );
        ctx.fillStyle = `rgba(${randomNum(100, 200)}, ${randomNum(100, 200)}, ${randomNum(200, 255)}, 0.4)`;
        ctx.fill();
      }
      
      return imgCode;
    };

    return {
      ...toRefs(state),
      verify,
      handleDraw,
    };
  },
};
</script>
<style scoped>
.img-verify {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.verify-container {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
  transition: all 0.3s ease;
  border: 2px solid #e8f0ff;
}

.verify-container:hover {
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
  border-color: #c7d7fe;
  transform: translateY(-1px);
}

.verify-container canvas {
  display: block;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-overlay {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.95), rgba(124, 58, 237, 0.95));
  border-radius: 0 8px 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.verify-container:hover .refresh-overlay {
  opacity: 1;
}

.refresh-overlay i {
  color: white;
  font-size: 14px;
  transition: transform 0.3s ease;
}

.refresh-overlay:hover i {
  transform: rotate(180deg);
}

.verify-tip {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
  letter-spacing: 0.3px;
  animation: tipFadeIn 0.5s ease;
}

@keyframes tipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>