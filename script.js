// 色系統の定義（各色相に20色を設定）
const colors = {
    green: [
        '#004d00', '#005500', '#006600', '#007700', '#008800',
        '#009900', '#00aa00', '#00bb00', '#00cc00', '#00dd00',
        '#00ee00', '#00ff00', '#33ff33', '#66ff66', '#99ff99',
        '#b3ffb3', '#ccffcc', '#99cc99', '#66cc66', '#33cc33'
    ],
    red: [
        '#4d0000', '#660000', '#800000', '#990000', '#b30000',
        '#cc0000', '#e60000', '#ff0000', '#ff3333', '#ff6666',
        '#ff9999', '#ffb3b3', '#ffcccc', '#cc9999', '#cc6666',
        '#cc3333', '#cc0033', '#990033', '#770033', '#550033'
    ],
    blue: [
        '#00004d', '#000066', '#000080', '#000099', '#0000b3',
        '#0000cc', '#0000e6', '#0000ff', '#3333ff', '#6666ff',
        '#9999ff', '#b3b3ff', '#ccccff', '#9999cc', '#6666cc',
        '#3333cc', '#0033cc', '#003399', '#003377', '#003355'
    ]
};

// 試行回数と履歴
let trialCount = 0;
const maxTrialsPerColor = 10; // 各色系統の最大試行回数
let colorDistanceHistory = { green: [], red: [], blue: [] };

// 現在表示中の色系統
let currentThemeIndex = 0;
let themesOrder = ['green', 'red', 'blue']; // 色系統の順番

// ランダムに4色を取得する関数
function getRandomColors() {
    const shuffledColors = [...colors[themesOrder[currentThemeIndex]]].sort(() => 0.5 - Math.random());
    return shuffledColors.slice(0, 4); // 最初の4色を取得
}

// 色ペアを表示する関数
function displayColorPair() {
    const colorContainer = document.getElementById('colorContainer');
    colorContainer.innerHTML = ''; // コンテナをクリア

    if (trialCount >= maxTrialsPerColor * themesOrder.length) {
        displayHistogram();
        return;
    }

    const selectedColors = getRandomColors();
    const leftColors = selectedColors.slice(0, 2);
    const rightColors = selectedColors.slice(2, 4);

    // 左ペアを作成
    const leftPair = createColorPair(leftColors);
    leftPair.addEventListener('click', () => handlePairSelection(leftColors));

    // 右ペアを作成
    const rightPair = createColorPair(rightColors);
    rightPair.addEventListener('click', () => handlePairSelection(rightColors));

    colorContainer.appendChild(leftPair);
    colorContainer.appendChild(rightPair);
}

// 色ペア要素を生成する関数
function createColorPair(colors) {
    const pair = document.createElement('div');
    pair.classList.add('colorBoxPair');
    colors.forEach(color => {
        const box = document.createElement('div');
        box.classList.add('colorBox');
        box.style.backgroundColor = color;
        pair.appendChild(box);
    });
    return pair;
}

// ペア選択時の処理
function handlePairSelection(selectedPair) {
    const rgbColors = selectedPair.map(color => ColorConverter.hexToRgb(color));
    const labColors = rgbColors.map(rgb => ColorConverter.rgbToLab(rgb));
    const colorDistance = ColorConverter.calculateCIEDE2000(labColors[0], labColors[1]);

    const theme = themesOrder[currentThemeIndex];
    colorDistanceHistory[theme].push(colorDistance);

    // データ送信
    sendDataToServer("uniqueUserID", trialCount, theme, colorDistance);

    trialCount++;
    if (trialCount % maxTrialsPerColor === 0) {
        currentThemeIndex++;
    }

    displayColorPair();
}

// ヒストグラムを表示
function displayHistogram() {
    const colorContainer = document.getElementById('colorContainer');
    colorContainer.innerHTML = '<h2>色差ヒストグラム（緑、赤、青系統）</h2>';

    const canvasContainer = document.createElement('div');
    canvasContainer.style.display = 'flex';
    canvasContainer.style.flexWrap = 'wrap';
    canvasContainer.style.justifyContent = 'center';
    canvasContainer.style.gap = '30px'; // 各グラフ間に余白を追加

    // 各色系統についてヒストグラムを表示
    ['green', 'red', 'blue'].forEach(theme => {
        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.width = '800px'; // 各グラフの幅を広げる
        canvasWrapper.style.height = '400px'; // 各グラフの高さを広げる
        canvasWrapper.style.display = 'flex';
        canvasWrapper.style.justifyContent = 'center';
        canvasWrapper.style.alignItems = 'center';
        canvasWrapper.style.border = '1px solid #ccc'; // グラフ周りに枠線を追加
        canvasWrapper.style.borderRadius = '10px'; // グラフの枠を丸みを帯びたデザインに
        canvasWrapper.style.backgroundColor = '#f9f9f9'; // 背景色を白っぽく設定

        const canvas = document.createElement('canvas');
        canvasWrapper.appendChild(canvas);
        canvasContainer.appendChild(canvasWrapper);

        const binSize = 4; // 色差の範囲（ビン幅を10に設定）
        const maxBin = 80; // 横軸の最大値を100に固定
        const bins = Array(maxBin / binSize).fill(0); // 最大値100を基準にビンを作成

        colorDistanceHistory[theme].forEach(distance => {
            const index = Math.min(Math.floor(distance / binSize), bins.length - 1);
            bins[index]++;
        });

        const labels = bins.map((_, i) => `${i * binSize}〜${(i + 1) * binSize}`);
        const counts = bins.map(count => count); // 選ばれた回数をそのまま表示

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels, // 色差の範囲をラベルとして使用
                datasets: [{
                    label: `${theme}系統の色差`,
                    data: counts,
                    backgroundColor: theme === 'green' ? 'rgba(0, 128, 0, 0.7)' : theme === 'red' ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 255, 0.7)', // 色系統ごとに色を設定
                    borderColor: theme === 'green' ? 'rgba(0, 128, 0, 1)' : theme === 'red' ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 0, 255, 1)', // 枠線の色
                    borderWidth: 1 // 枠線の太さを1に設定
                }]
            },
            options: {
                responsive: true, // レスポンシブ対応（画面サイズに応じてグラフのサイズが調整される）
                maintainAspectRatio: false, // アスペクト比を固定せずに自由に調整可能にする
                scales: {
                    x: {
                        title: { display: true, text: '色差の範囲' },
                        ticks: { stepSize: 4, max: 80 }
                    },
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 10,
                        title: { display: true, text: '選ばれた回数' }
                    }
                },
                plugins: {
                    legend: { display: true },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: tooltipItem => `回数: ${tooltipItem.raw}`
                        }
                    }
                }
            }
        });
    });

    colorContainer.appendChild(canvasContainer);
}

// 色差計算用クラス
class ColorConverter {
    static hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    }

    static rgbToLab({ r, g, b }) {
        const [x, y, z] = [r / 255, g / 255, b / 255].map(c =>
            c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92
        );
        return { L: y * 100, a: x * 500, b: z * 200 };
    }

    static calculateCIEDE2000(lab1, lab2) {
        return Math.sqrt((lab2.L - lab1.L) ** 2 + (lab2.a - lab1.a) ** 2 + (lab2.b - lab1.b) ** 2);
    }
}

// ユーザIDの作成
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('userId', userId);
}


// Google Apps Script のウェブアプリURLをここに設定
const SERVER_URL = 'https://script.google.com/macros/s/AKfycbxT8dZzQiadEounUHM_E1ZdHECDCQxlS7AdrRUwNuUuEEAobDyREWhfDqhzVyR_zHh1/exec';

function sendDataToServer(userId, trialNumber, hue, colorDifference) {
  const payload = {
    userId: userId,
    trialNumber: trialNumber,
    hue: hue,
    colorDifference: colorDifference,
  };

  fetch(SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log('データ送信成功:', data);
      } else {
        console.error('データ送信失敗:', data.error);
      }
    })
    .catch((error) => {
      console.error('通信エラー:', error);
    });
}

function sendHistogramData() {
    const payload = {
        userId: localStorage.getItem('userId'),
        histogramData: colorDistanceHistory,
    };

    fetch(SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => response.json())
    .then(data => {
        console.log('ヒストグラム送信成功:', data);
    })
    .catch(error => {
        console.error('ヒストグラム送信失敗:', error);
    });
}

// ヒストグラムを表示する直前に呼び出す
function displayHistogram() {
    sendHistogramData(); // 送信
    // ヒストグラム表示処理
}


// ページロード時に色ペアを表示
document.addEventListener('DOMContentLoaded', displayColorPair);
