// 色系統の定義
const colors = {
    green: [
        '#004d00', '#006600', '#008000', '#009900', '#00b300',
        '#00cc00', '#00e600', '#00ff00', '#33ff33', '#66ff66',
        '#99ff99', '#b3ffb3', '#ccffcc', '#99cc99', '#66cc66',
        '#33cc33', '#00cc33', '#009933', '#007733', '#005533'
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
let colorDistanceHistory = {
    green: [],
    red: [],
    blue: []
};

// 現在表示中の色系統
let currentThemeIndex = 0;
let themesOrder = ['green', 'red', 'blue']; // 色系統の順番
let currentColors = colors[themesOrder[currentThemeIndex]]; // 初期テーマ

// ランダムに4色を取得する関数
function getRandomColors() {
    const shuffledColors = [...currentColors].sort(() => 0.5 - Math.random());
    return shuffledColors.slice(0, 4); // 最初の4色を取得
}

// 色変換と色差計算のためのクラス
class ColorConverter {
    static hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }

    static rgbToLab({ r, g, b }) {
        const [xr, yr, zr] = [r / 255, g / 255, b / 255].map(c =>
            c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92
        );

        const X = xr * 0.4124564 + yr * 0.3575761 + zr * 0.1804375;
        const Y = xr * 0.2126729 + yr * 0.7151522 + zr * 0.0721750;
        const Z = xr * 0.0193339 + yr * 0.1191920 + zr * 0.9503041;

        const xyz = [X / 0.95047, Y, Z / 1.08883].map(t =>
            t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + (16 / 116)
        );

        const L = (116 * xyz[1]) - 16;
        const a = 500 * (xyz[0] - xyz[1]);
        const bValue = 200 * (xyz[1] - xyz[2]);
        return { L, a, b: bValue };
    }

    static calculateCIEDE2000(lab1, lab2) {
        const deltaL = lab2.L - lab1.L;
        const Lmean = (lab1.L + lab2.L) / 2;

        const C1 = Math.sqrt(lab1.a ** 2 + lab1.b ** 2);
        const C2 = Math.sqrt(lab2.a ** 2 + lab2.b ** 2);
        const Cmean = (C1 + C2) / 2;

        const deltaC = C2 - C1;
        const a1Prime = lab1.a + lab1.a / 2 * (1 - Math.sqrt(Cmean ** 7 / (Cmean ** 7 + 25 ** 7)));
        const a2Prime = lab2.a + lab2.a / 2 * (1 - Math.sqrt(Cmean ** 7 / (Cmean ** 7 + 25 ** 7)));

        const C1Prime = Math.sqrt(a1Prime ** 2 + lab1.b ** 2);
        const C2Prime = Math.sqrt(a2Prime ** 2 + lab2.b ** 2);
        const deltaCPrime = C2Prime - C1Prime;

        const h1 = Math.atan2(lab1.b, a1Prime);
        const h2 = Math.atan2(lab2.b, a2Prime);
        const deltah = h2 - h1;
        const deltaHPrime = 2 * Math.sqrt(C1Prime * C2Prime) * Math.sin(deltah / 2);

        const SL = 1 + ((0.015 * (Lmean - 50) ** 2) / Math.sqrt(20 + (Lmean - 50) ** 2));
        const SC = 1 + 0.045 * Cmean;
        const SH = 1 + 0.015 * Cmean * (1 - 0.17 * Math.cos(deltah) + 0.24 * Math.cos(2 * deltah) + 0.32 * Math.cos(3 * deltah + 6) - 0.20 * Math.cos(4 * deltah - 63));

        return Math.sqrt((deltaL / SL) ** 2 + (deltaCPrime / SC) ** 2 + (deltaHPrime / SH) ** 2);
    }
}

// 色ペアを表示する関数
function displayColorPair() {
    const colorContainer = document.getElementById('colorContainer');
    colorContainer.innerHTML = '';

    if (trialCount >= maxTrialsPerColor * 3) {
        displayHistogram();
        return;
    }

    const theme = themesOrder[currentThemeIndex];
    currentColors = colors[theme];

    const selectedColors = getRandomColors();
    const leftColors = selectedColors.slice(0, 2);
    const rightColors = selectedColors.slice(2, 4);

    const leftPair = document.createElement('div');
    leftPair.classList.add('colorBoxPair');
    leftColors.forEach(color => {
        const box = document.createElement('div');
        box.classList.add('colorBox');
        box.style.backgroundColor = color;
        box.addEventListener('click', () => {
            handlePairSelection(leftColors);
        });
        leftPair.appendChild(box);
    });

    const rightPair = document.createElement('div');
    rightPair.classList.add('colorBoxPair');
    rightColors.forEach(color => {
        const box = document.createElement('div');
        box.classList.add('colorBox');
        box.style.backgroundColor = color;
        box.addEventListener('click', () => {
            handlePairSelection(rightColors);
        });
        rightPair.appendChild(box);
    });

    colorContainer.appendChild(leftPair);
    colorContainer.appendChild(rightPair);
}

// ペア選択時の処理
function handlePairSelection(colors) {
    const rgbColors = colors.map(color => ColorConverter.hexToRgb(color));
    const labColors = rgbColors.map(rgb => ColorConverter.rgbToLab(rgb));
    const colorDistance = ColorConverter.calculateCIEDE2000(labColors[0], labColors[1]);

    const theme = themesOrder[currentThemeIndex];
    colorDistanceHistory[theme].push(colorDistance);

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
                        title: {
                            display: true,
                            text: '色差の範囲' // 横軸に色差範囲を表示
                        },
                        ticks: {
                            stepSize: 4, // 横軸の目盛りを10刻みに設定
                            max: 80 // 横軸の最大値を100に固定
                        }
                    },
                    y: {
                        beginAtZero: true, // 縦軸の開始位置を0に設定
                        min: 0, // 縦軸の最小値を0に固定
                        max: 10, // 縦軸の最大値を10に固定
                        title: {
                            display: true,
                            text: '選ばれた回数' // 縦軸のタイトル（選ばれた回数）
                        },
                        ticks: {
                            stepSize: 1, // 縦軸の目盛りを1刻みに設定
                            callback: function(value) {
                                return value.toFixed(0); // 小数点なしで表示
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true // 凡例を表示する
                    },
                    tooltip: {
                        enabled: true, // ツールチップを有効化
                        callbacks: {
                            label: function(tooltipItem) {
                                return `回数: ${tooltipItem.raw}`; // ツールチップに表示するテキスト
                            }
                        }
                    }
                }
            }
        });
    });

    colorContainer.appendChild(canvasContainer);
}


document.addEventListener('DOMContentLoaded', displayColorPair);
