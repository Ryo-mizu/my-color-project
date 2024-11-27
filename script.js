// 色系統の定義（各色相に20色を設定）
const colors = {
        red: [
        '#ff0000', '#e60000', '#cc0000', '#b30000', '#990000',
        '#800000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc',
        '#cc3333', '#b32424', '#800000', '#a10000', '#ff5555',
        '#ff4444', '#ff8888', '#cc4444', '#990033', '#990000'
    ],
    redOrange: [
        '#ff4500', '#ff5722', '#e64a19', '#d84315', '#bf360c',
        '#ff7043', '#ff8a65', '#ff9e80', '#d2691e', '#cd5c5c',
        '#ff6347', '#e57373', '#ff7f50', '#ff6f61', '#ff8b75',
        '#ff9770', '#d45a00', '#bf4a00', '#a64000', '#ff5e13'
    ],
    orange: [
        '#ffa500', '#ffb84d', '#ffcc66', '#ffe080', '#ffe699',
        '#ff9900', '#ffab40', '#ffbf80', '#ffcc99', '#ffd699',
        '#ff8844', '#e57300', '#e65100', '#c46000', '#bf6910',
        '#b36200', '#a64d00', '#9c3c00', '#cf601f', '#e88832'
    ],
    yellowOrange: [
        '#ffd700', '#ffcc00', '#ffb400', '#ffbb33', '#ffd966',
        '#ffe680', '#ffcc33', '#ffdb4d', '#ffeb66', '#ffeb99',
        '#ffc400', '#ffbf00', '#ffa500', '#ffaa00', '#e6ac00',
        '#d9a300', '#bf9b30', '#a68922', '#cca000', '#e3b000'
    ],
    yellow: [
        '#ffff00', '#fff700', '#ffee00', '#ffe500', '#ffdc00',
        '#ffd300', '#fdd835', '#ffee58', '#ffff72', '#ffff8d',
        '#ffcc00', '#ffca28', '#ffab00', '#f57f17', '#ffecb3',
        '#fff9c4', '#f0f8b5', '#e0eb00', '#ffe000', '#ffff77'
    ],
    yellowGreen: [
        '#9acd32', '#8bc34a', '#7cb342', '#689f38', '#558b2f',
        '#8ed81d', '#ace41b', '#b7d84c', '#d7ea48', '#c9e764',
        '#aee554', '#9ada39', '#8ad010', '#6a9b23', '#6dc66d',
        '#81d870', '#addb86', '#c1ec86', '#bbe381', '#cde869'
    ],
    green: [
        '#008000', '#006400', '#228b22', '#2e8b57', '#00ff00',
        '#32cd32', '#3cb371', '#66cdaa', '#8fbc8f', '#7cfc00',
        '#76b041', '#5ca43a', '#3c8039', '#3a9c54', '#7ecb7e',
        '#9bf59b', '#6de66d', '#63c263', '#7ee87e', '#63db63'
    ],
    blueGreen: [
        '#0ff', '#40e0d0', '#48d1cc', '#20b2aa', '#00ced1',
        '#00b7eb', '#00e5ee', '#97ffff', '#76eec6', '#afeeee',
        '#34deeb', '#20b6c9', '#62cce0', '#81e1db', '#63f3f3',
        '#80dbdb', '#60dfdf', '#64dcdc', '#69e8e8', '#40cccc'
    ],
    blue: [
        '#0000ff', '#1e90ff', '#6495ed', '#4169e1', '#0000cd',
        '#4682b4', '#5f9ea0', '#7b68ee', '#00bfff', '#87cefa',
        '#4688d4', '#5c87e8', '#4869e3', '#6f9ce3', '#4c7ce9',
        '#5aa3ed', '#3e7fe0', '#637fcb', '#5c95e8', '#4f83e6'
    ],
    blueViolet: [
        '#8a2be2', '#9370db', '#7b68ee', '#6a5acd', '#663399',
        '#9400d3', '#9932cc', '#ba55d3', '#dda0dd', '#ee82ee',
        '#8850cc', '#7745b2', '#7f49d6', '#8551cf', '#7050c0',
        '#6f42d5', '#7656dc', '#804fd6', '#8052db', '#9d5be6'
    ],
    violet: [
        '#800080', '#9932cc', '#dda0dd', '#ee82ee', '#d8bfd8',
        '#e6add9', '#d6acd9', '#c39fbe', '#bf94c3', '#bdb0c5',
        '#c399d1', '#dbb6da', '#e4aedc', '#ca86c8', '#cd8ed1',
        '#b76bce', '#9a69bc', '#836fb3', '#aa7db8', '#b594c3'
    ],
    redViolet: [
        '#ff1493', '#ff69b4', '#db7093', '#c71585', '#d02090',
        '#e75480', '#ff5d8e', '#ff80ab', '#f8a1d2', '#f07ebf',
        '#df647f', '#d64677', '#d8466d', '#d93871', '#d13962',
        '#c63367', '#ce3475', '#d14468', '#e14482', '#db507c'
    ]
};

// 試行回数と履歴
let trialCount = 0;
const maxTrialsPerColor = 40; // 各色系統の最大試行回数
let colorDistanceHistory = {red: [], redOrange: [], orange: [], yellowOrange: [], yellow: [],
    yellowGreen: [], green: [], blueGreen: [], blue: [], blueViolet: [],
    violet: [], redViolet: []};

// 現在表示中の色系統
let currentThemeIndex = 0;
let themesOrder = ['red', 'redOrange', 'orange', 'yellowOrange', 'yellow',
    'yellowGreen', 'green', 'blueGreen', 'blue', 'blueViolet', 'violet', 'redViolet']; // 色系統の順番

// ランダムに4色を取得する関数
function getRandomColors() {
    const shuffledColors = [...colors[themesOrder[currentThemeIndex]]].sort(() => 0.5 - Math.random());
    return shuffledColors.slice(0, 4); // 最初の4色を取得
}

// 色ペアを表示する関数
function displayColorPair() {
    const colorContainer = document.getElementById('colorContainer');
    colorContainer.innerHTML = ''; // コンテナをクリア

    // 全試行が終了した場合
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


let userId = ""; // ユーザーIDを保持

// 試行を開始する関数
function startTrial() {
    const input = document.getElementById('userId');
    userId = input.value.trim();

    if (!userId) {
        alert("IDを入力してください。");
        return;
    }
    // ID入力フォームを非表示にし、試行画面を表示
    document.getElementById('idInputContainer').style.display = 'none';
    document.getElementById('trialContainer').style.display = 'block';

    // 試行を開始
    displayColorPair();
}


// ペア選択時の処理
function handlePairSelection(selectedPair) {
    const rgbColors = selectedPair.map(color => ColorConverter.hexToRgb(color));
    const labColors = rgbColors.map(rgb => ColorConverter.rgbToLab(rgb));
    const colorDistance = ColorConverter.calculateCIEDE2000(labColors[0], labColors[1]);

    const theme = themesOrder[currentThemeIndex];
    colorDistanceHistory[theme].push(colorDistance);

    // 試行回数を更新
    trialCount++;

    // 次の色系統に移動する条件
    if (trialCount % maxTrialsPerColor === 0) {
        currentThemeIndex++;
        if (currentThemeIndex >= themesOrder.length) {
            displayHistogram(); // すべての色系統が終了した場合
            return;
        }
    }

    // 次のペアを表示
    displayColorPair();
}


// ページロード時に初期化
document.addEventListener('DOMContentLoaded', displayColorPair);


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

// ヒストグラムを表示
function displayHistogram() {
    const colorContainer = document.getElementById('colorContainer');
    colorContainer.innerHTML = '<h2>色差ヒストグラム（12色相）</h2>';

    const canvasContainer = document.createElement('div');
    canvasContainer.style.display = 'flex';
    canvasContainer.style.flexDirection = 'column';
    canvasContainer.style.alignItems = 'center';
    canvasContainer.style.gap = '50px'; // ヒストグラム間の余白

    themesOrder.forEach(theme => {
        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.width = '1000px';
        canvasWrapper.style.height = '700px';
        canvasWrapper.style.border = '1px solid #ccc';
        canvasWrapper.style.borderRadius = '10px';
        canvasWrapper.style.backgroundColor = '#fff';
        canvasWrapper.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        canvasWrapper.style.padding = '10px'; // 内側の余白を追加

        const canvas = document.createElement('canvas');
        canvasWrapper.appendChild(canvas);
        canvasContainer.appendChild(canvasWrapper);


        const binSize = 2;
        const maxBin = 80;
        const bins = Array(maxBin / binSize).fill(0);

        if (colorDistanceHistory[theme]) {
            colorDistanceHistory[theme].forEach(distance => {
                const index = Math.min(Math.floor(distance / binSize), bins.length - 1);
                bins[index]++;
            });
        }

        const labels = bins.map((_, i) => `${i * binSize}〜${(i + 1) * binSize}`);
        const counts = bins;

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: `${theme}系統の色差`,
                    data: counts,
                    backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.7)`,
                    borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(...counts, 20),
                        title: { display: true, text: '選ばれた回数' }
                    },
                    x: {
                        title: { display: true, text: '色差の範囲' }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top' },
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
    downloadExcel(); // ヒストグラム表示後にExcelをダウンロード

    colorContainer.appendChild(canvasContainer);
}


function downloadExcel() {
    const workbook = XLSX.utils.book_new(); // 新しいワークブックを作成

    // すべての試行データを1つのシートにまとめる
    const allData = [];
    let trialNumber = 1; // 試行番号を管理

    // 全色相についてデータを収集
    themesOrder.forEach(theme => {
        if (colorDistanceHistory[theme] && colorDistanceHistory[theme].length > 0) {
            colorDistanceHistory[theme].forEach(distance => {
                allData.push({
                    ユーザーID: userId, // ユーザーIDを追加
                    試行番号: trialNumber++, // 試行番号
                    色相: theme, // 色相
                    色差: distance.toFixed(2) // 色差を小数点2桁で表示
                });
            });
        }
    });

    if (allData.length === 0) {
        alert('ダウンロードするデータがありません。');
        return;
    }

    // ワークシートを作成
    const worksheet = XLSX.utils.json_to_sheet(allData);
    XLSX.utils.book_append_sheet(workbook, worksheet, '試行結果');

    // Excelファイルをエクスポート
    XLSX.writeFile(workbook, `color_trial_results_${userId}.xlsx`);
}



