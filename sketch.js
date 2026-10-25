// 完整天氣資料庫（7種天氣）
const ALL_WEATHER_DATA = [
  { id: 'sunny', name: '晴天', en: 'Sunny', desc: '金黃色的太陽高掛空中，周圍散發著溫暖的光芒，這是晴朗的好天氣。' },
  { id: 'cloudy', name: '多雲', en: 'Cloudy', desc: '天空中飄著蓬鬆的白雲，太陽時隱時現，這是多雲的天氣。' },
  { id: 'rainy', name: '下雨', en: 'Rainy', desc: '天空下著綿綿細雨，水滴不斷落下，這是下雨天。' },
  { id: 'thunderstorm', name: '打雷閃電', en: 'Thunderstorm', desc: '烏雲密布伴隨強烈的閃電與雷聲，這是打雷閃電的惡劣天氣。' },
  { id: 'snowy', name: '下雪', en: 'Snowy', desc: '白色的雪花慢慢飄下來，地上還有可愛的雪人，這是下雪天。' },
  { id: 'windy', name: '颳大風', en: 'Windy', desc: '強風把樹木吹得搖擺不定，落葉在空中飛舞，這是颳大風的天氣。' },
  { id: 'foggy', name: '起霧', en: 'Foggy', desc: '濃厚的霧氣籠罩四周，能見度變得非常低，這是起霧的天氣。' }
];

let questionList = []; // 8個題目的資料陣列
let currentIndex = 0;  // 目前題數 (0 ~ 7)
let correctCount = 0;  // 答對題數

let selectedOption = null; // 使用者選中的選項索引 (0~3)
let isAnswered = false;    // 是否已經作答

function setup() {
  let canvas = createCanvas(900, 720);
  canvas.parent('canvas-container');
  textFont('Helvetica, Arial, sans-serif');

  initGame();
}

function initGame() {
  currentIndex = 0;
  correctCount = 0;
  selectedOption = null;
  isAnswered = false;

  // 【不重複抽題邏輯】
  // 先將 7 種天氣打亂順序，確保前 7 題完全不重複
  let shuffledWeather = shuffle([...ALL_WEATHER_DATA]);
  
  // 第 8 題從資料庫中隨機再挑一個
  let extraQuestion = random(ALL_WEATHER_DATA);
  
  // 組合成 8 題題目清單
  let selectedTargetWeathers = [...shuffledWeather, extraQuestion];

  questionList = [];
  for (let i = 0; i < 8; i++) {
    let correctItem = selectedTargetWeathers[i];
    
    // 挑選 3 個錯誤選項干擾牌
    let wrongPool = ALL_WEATHER_DATA.filter(w => w.id !== correctItem.id);
    let wrongItems = shuffle(wrongPool).slice(0, 3);
    
    // 組合 4 個選項並隨機洗牌
    let options = shuffle([correctItem, ...wrongItems]);

    questionList.push({
      correct: correctItem,
      options: options
    });
  }
}

function draw() {
  background(245, 247, 250);

  if (currentIndex < 8) {
    drawTopHeader();
    drawAnimationBox();
    drawQuestionTitle();
    drawOptionsGrid();
    if (isAnswered) {
      drawFeedbackPanel();
    }
  } else {
    drawScoreScreen();
  }
}

// 1. 繪製頂部進度條與答對題數
function drawTopHeader() {
  fill(50);
  textSize(14);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  text(`第 ${currentIndex + 1} / 8 題`, 50, 20);

  textAlign(RIGHT, TOP);
  fill(100);
  text(`答對 ${correctCount} 題`, 850, 20);

  let barW = (800 / 8);
  for (let i = 0; i < 8; i++) {
    noStroke();
    if (i < currentIndex) {
      fill(42, 157, 143);
    } else if (i === currentIndex) {
      fill(224, 122, 95);
    } else {
      fill(220);
    }
    rect(50 + i * barW + (i > 0 ? 4 : 0), 45, barW - 4, 6, 3);
  }
}

// 2. 繪製中央天氣動畫展示框
function drawAnimationBox() {
  let boxX = 200, boxY = 75, boxW = 500, boxH = 260;

  push();
  noStroke();
  fill(255);
  rect(boxX, boxY, boxW, boxH, 12);
  
  stroke(225);
  strokeWeight(1);
  noFill();
  rect(boxX, boxY, boxW, boxH, 12);

  push();
  translate(boxX, boxY);
  clip(() => { rect(0, 0, boxW, boxH, 12); });
  
  let currentQ = questionList[currentIndex];
  drawWeatherAnimation(currentQ.correct.id, boxW, boxH);
  pop();

  fill(40, 50, 60);
  noStroke();
  rect(boxX + 12, boxY + 12, 64, 28, 6);
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text("看動畫", boxX + 44, boxY + 26);

  pop();
}

// 3. 題目文字
function drawQuestionTitle() {
  fill(40);
  textSize(18);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  text("動畫裡是什麼天氣？", 450, 355);
}

// 4. 四宮格選項 (2 x 2)
function drawOptionsGrid() {
  let currentQ = questionList[currentIndex];
  let startX = 200;
  let startY = 405;
  let optW = 240;
  let optH = 55;
  let gapX = 20;
  let gapY = 15;

  for (let i = 0; i < 4; i++) {
    let col = i % 2;
    let row = Math.floor(i / 2);
    let x = startX + col * (optW + gapX);
    let y = startY + row * (optH + gapY);

    let optData = currentQ.options[i];
    let isCorrectOpt = (optData.id === currentQ.correct.id);

    stroke(200);
    strokeWeight(1.5);
    fill(255);

    if (isAnswered) {
      if (isCorrectOpt) {
        stroke(42, 157, 143);
        fill(235, 247, 245);
      } else if (selectedOption === i) {
        stroke(230, 57, 70);
        fill(253, 238, 240);
      }
    }

    rect(x, y, optW, optH, 28);

    noStroke();
    if (isAnswered && isCorrectOpt) {
      fill(42, 157, 143);
      circle(x + 28, y + optH / 2, 28);
      fill(255);
      textSize(14);
      textAlign(CENTER, CENTER);
      text("✓", x + 28, y + optH / 2);
    } else if (isAnswered && selectedOption === i && !isCorrectOpt) {
      fill(230, 57, 70);
      circle(x + 28, y + optH / 2, 28);
      fill(255);
      textSize(14);
      textAlign(CENTER, CENTER);
      text("✕", x + 28, y + optH / 2);
    } else {
      fill(230);
      circle(x + 28, y + optH / 2, 28);
      fill(80);
      textSize(13);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(i + 1, x + 28, y + optH / 2);
    }

    fill(40);
    textSize(15);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text(optData.name, x + 65, y + optH / 2);
  }
}

// 5. 答題後的底部回饋面板
function drawFeedbackPanel() {
  let currentQ = questionList[currentIndex];
  let isCorrect = (currentQ.options[selectedOption].id === currentQ.correct.id);

  let panelX = 50, panelY = 535, panelW = 800, panelH = 150;

  push();
  noStroke();
  fill(isCorrect ? 230 : 252, isCorrect ? 245 : 238, isCorrect ? 238 : 240);
  rect(panelX, panelY, panelW, panelH, 10);

  fill(isCorrect ? 42 : 230, isCorrect ? 157 : 57, isCorrect ? 143 : 70);
  rect(panelX, panelY, 8, panelH, 10, 0, 0, 10);

  fill(isCorrect ? 30 : 180, isCorrect ? 120 : 30, isCorrect ? 100 : 30);
  textSize(16);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  if (isCorrect) {
    text("答對了！你真棒！", panelX + 25, panelY + 20);
  } else {
    text(`答錯了，正確答案是「${currentQ.correct.name}」`, panelX + 25, panelY + 20);
  }

  fill(80);
  textSize(13);
  textStyle(NORMAL);
  text(currentQ.correct.desc, panelX + 25, panelY + 52, panelW - 200, 70);

  let btnX = panelX + panelW - 170;
  let btnY = panelY + panelH - 55;
  let btnW = 145;
  let btnH = 40;

  fill(224, 122, 95);
  rect(btnX, btnY, btnW, btnH, 8);

  fill(255);
  textSize(15);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(currentIndex === 7 ? "看總成績" : "下一題", btnX + btnW / 2, btnY + btnH / 2);

  pop();
}

// 6. 結算畫面
function drawScoreScreen() {
  background(255);
  let finalScore = Math.round((correctCount / 8) * 100);

  textAlign(CENTER, CENTER);
  fill(40);
  textSize(28);
  textStyle(BOLD);
  text("測驗結束！", 450, 220);

  textSize(20);
  fill(100);
  text(`總共答對 ${correctCount} 題 / 共 8 題`, 450, 280);

  fill(224, 122, 95);
  textSize(48);
  text(`${finalScore} 分`, 450, 350);

  let btnX = 350, btnY = 440, btnW = 200, btnH = 50;
  fill(42, 157, 143);
  noStroke();
  rect(btnX, btnY, btnW, btnH, 10);

  fill(255);
  textSize(18);
  textStyle(BOLD);
  text("再玩一次", btnX + btnW / 2, btnY + btnH / 2);
}

// 滑鼠點擊事件
function mousePressed() {
  if (currentIndex < 8) {
    if (!isAnswered) {
      let startX = 200, startY = 405, optW = 240, optH = 55, gapX = 20, gapY = 15;
      for (let i = 0; i < 4; i++) {
        let col = i % 2;
        let row = Math.floor(i / 2);
        let x = startX + col * (optW + gapX);
        let y = startY + row * (optH + gapY);

        if (mouseX >= x && mouseX <= x + optW && mouseY >= y && mouseY <= y + optH) {
          selectedOption = i;
          isAnswered = true;

          let currentQ = questionList[currentIndex];
          if (currentQ.options[i].id === currentQ.correct.id) {
            correctCount++;
          }
          break;
        }
      }
    } else {
      let panelX = 50, panelY = 535, panelW = 800, panelH = 150;
      let btnX = panelX + panelW - 170;
      let btnY = panelY + panelH - 55;
      let btnW = 145;
      let btnH = 40;

      if (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH) {
        currentIndex++;
        selectedOption = null;
        isAnswered = false;
      }
    }
  } else {
    let btnX = 350, btnY = 440, btnW = 200, btnH = 50;
    if (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH) {
      initGame();
    }
  }
}

// 各種天氣動畫繪製函式
function drawWeatherAnimation(type, w, h) {
  let t = frameCount * 0.05;

  if (type === 'sunny') {
    background(115, 185, 245);
    fill(130, 200, 90);
    rect(0, h - 35, w, 35);

    push();
    translate(w / 2, h / 2 - 15);
    fill(255, 210, 0);
    noStroke();
    circle(0, 0, 90);

    stroke(255, 210, 0);
    strokeWeight(5);
    for (let a = 0; a < TWO_PI; a += PI / 6) {
      let r1 = 55 + sin(t * 3) * 4;
      let r2 = 72 + sin(t * 3) * 4;
      line(cos(a) * r1, sin(a) * r1, cos(a) * r2, sin(a) * r2);
    }
    pop();

  } else if (type === 'cloudy') {
    background(155, 195, 230);
    fill(140, 190, 110);
    rect(0, h - 35, w, 35);

    fill(255, 215, 0);
    noStroke();
    circle(w * 0.7, h * 0.35, 70);

    drawCloud(w * 0.3 + sin(t) * 12, h * 0.48, 1.2, 255);
    drawCloud(w * 0.65 + cos(t * 0.8) * 10, h * 0.4, 1.0, 240);

  } else if (type === 'rainy') {
    background(90, 105, 120);
    fill(80, 85, 90);
    rect(0, h - 30, w, 30);

    drawCloud(w * 0.3, h * 0.32, 1.2, 120);
    drawCloud(w * 0.7, h * 0.35, 1.1, 100);

    stroke(180, 215, 255, 200);
    strokeWeight(2);
    for (let i = 0; i < 35; i++) {
      let rx = (i * 18 + frameCount * 4) % w;
      let ry = (h * 0.4 + (i * 21 + frameCount * 9) % (h * 0.55));
      line(rx, ry, rx - 4, ry + 15);
    }

  } else if (type === 'thunderstorm') {
    background(45, 48, 65);

    drawCloud(w * 0.35, h * 0.3, 1.4, 70);
    drawCloud(w * 0.68, h * 0.35, 1.3, 60);

    if (frameCount % 60 < 8) {
      fill(255, 255, 200, 160);
      rect(0, 0, w, h);

      stroke(255, 230, 50);
      strokeWeight(5);
      fill(255, 230, 50);
      beginShape();
      vertex(w * 0.5, h * 0.3);
      vertex(w * 0.42, h * 0.58);
      vertex(w * 0.49, h * 0.58);
      vertex(w * 0.38, h * 0.88);
      vertex(w * 0.58, h * 0.5);
      vertex(w * 0.5, h * 0.5);
      endShape(CLOSE);
    }

  } else if (type === 'snowy') {
    background(65, 80, 115);

    fill(240, 245, 255);
    noStroke();
    rect(0, h - 40, w, 40);
    circle(w * 0.8, h * 0.62, 45);
    circle(w * 0.8, h * 0.42, 32);

    for (let i = 0; i < 30; i++) {
      let sx = (i * 23 + sin(t + i) * 15) % w;
      let sy = (frameCount * (1 + i % 2) + i * 19) % h;
      fill(255, 255, 255, 220);
      circle(sx, sy, 3 + (i % 3) * 2);
    }

  } else if (type === 'windy') {
    background(155, 195, 225);
    fill(110, 170, 85);
    rect(0, h - 35, w, 35);

    push();
    translate(w * 0.3, h - 35);
    stroke(100, 60, 30);
    strokeWeight(15);
    line(0, 0, sin(t * 2) * 6 - 12, -70);

    noStroke();
    fill(60, 140, 60);
    circle(sin(t * 2) * 6 - 15, -90, 70);
    pop();

    stroke(255, 255, 255, 180);
    strokeWeight(2.5);
    noFill();
    for (let i = 0; i < 4; i++) {
      let wx = (-frameCount * 5 + i * 90) % (w + 120) - 20;
      let wy = 40 + i * 35;
      beginShape();
      curveVertex(wx, wy);
      curveVertex(wx + 35, wy + sin(t + i) * 6);
      curveVertex(wx + 80, wy + cos(t + i) * 10);
      curveVertex(wx + 110, wy);
      endShape();
    }

  } else if (type === 'foggy') {
    background(175, 185, 195);
    fill(120, 135, 120);
    rect(0, h - 35, w, 35);

    noStroke();
    fill(140, 150, 155, 180);
    ellipse(w * 0.3, h - 25, 220, 90);
    ellipse(w * 0.75, h - 25, 260, 110);

    noStroke();
    for (let i = 0; i < 6; i++) {
      let fogY = 40 + i * 30;
      let alphaVal = 130 + sin(t + i) * 35;
      fill(240, 245, 250, alphaVal);
      rect(0, fogY, w, 20, 10);
    }
  }
}

// 雲朵輔助繪製
function drawCloud(x, y, scaleFactor, gray) {
  push();
  translate(x, y);
  scale(scaleFactor);
  noStroke();
  fill(gray);
  circle(0, 0, 50);
  circle(-25, 9, 38);
  circle(25, 9, 38);
  rect(-25, 9, 50, 20);
  pop();
}