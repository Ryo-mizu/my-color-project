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
    colorContainer.innerHTML = '<h2>色差ヒストグラム（緑、赤、青系統）</h2>';

    const canvasContainer = document.createElement('div');
    canvasContainer.style.display = 'flex';
    canvasContainer.style.flexWrap = 'wrap';
    canvasContainer.style.justifyContent = 'center';
    canvasContainer.style.gap = '50px'; // 各グラフ間に余白を追加

    // 各色系統についてヒストグラムを表示
    ['green', 'red', 'blue'].forEach(theme => {
        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.width = '600px'; // 各グラフの幅を調整
        canvasWrapper.style.height = '300px'; // 各グラフの高さを調整
        canvasWrapper.style.display = 'flex';
        canvasWrapper.style.justifyContent = 'center';
        canvasWrapper.style.alignItems = 'center';
        canvasWrapper.style.border = '1px solid #ccc'; // グラフ周りに枠線を追加
        canvasWrapper.style.borderRadius = '10px'; // グラフの枠を丸みを帯びたデザインに
        canvasWrapper.style.backgroundColor = '#f9f9f9'; // 背景色を白っぽく設定

        const canvas = document.createElement('canvas');
        canvasWrapper.appendChild(canvas);
        canvasContainer.appendChild(canvasWrapper);

        const binSize = 4; // 色差の範囲（ビン幅を4に設定）
        const maxBin = 80; // 横軸の最大値を80に固定
        const bins = Array(maxBin / binSize).fill(0); // 最大値80を基準にビンを作成

        colorDistanceHistory[theme].forEach(distance => {
            const index = Math.min(Math.floor(distance / binSize), bins.length - 1);
            bins[index]++;
        });

        const labels = bins.map((_, i) => `${i * binSize}〜${(i + 1) * binSize}`);
        const counts = bins;

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: `${theme}系統の色差`,
                    data: counts,
                    backgroundColor: theme === 'green' ? 'rgba(0, 128, 0, 0.7)' : theme === 'red' ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 255, 0.7)',
                    borderColor: theme === 'green' ? 'rgba(0, 128, 0, 1)' : theme === 'red' ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 0, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10, // 縦軸の最大値を10に固定
                        title: { display: true, text: '選ばれた回数' },
                        ticks: {
                            stepSize: 1, // 縦軸を1単位で表示
                        }
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

    colorContainer.appendChild(canvasContainer);

    // Excelダウンロードを実行
    downloadExcel();
}


// Excelファイルをダウンロード
function downloadExcel() {
    const workbook = XLSX.utils.book_new(); // 新しいワークブックを作成

    // すべての試行データを1つのシートにまとめる
    const allData = [];
    let trialNumber = 1; // 試行番号を管理

    ['green', 'red', 'blue'].forEach(theme => {
        colorDistanceHistory[theme].forEach(distance => {
            allData.push({
                ユーザーID: userId, // ユーザーIDを追加
                試行番号: trialNumber++, // 試行番号
                色相: theme, // 色相
                色差: distance.toFixed(2) // 色差を小数点2桁で表示
            });
        });
    });

    // ワークシートを作成
    const worksheet = XLSX.utils.json_to_sheet(allData);
    XLSX.utils.book_append_sheet(workbook, worksheet, '試行結果');

    // Excelファイルをエクスポート
    XLSX.writeFile(workbook, 'color_trial_results.xlsx');
}


