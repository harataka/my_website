// メインのアプリケーションロジック
const App = {
    // 初期化処理
    init: async function() {
        console.log('App initialization started');
        // BattersDataの初期化を待つ
        await BattersData.init();
        console.log('BattersData initialized successfully');

        // イベントリスナーを設定
        document.getElementById('save-button').addEventListener('click', this.saveBatters);
        console.log('App initialization completed');
    },



    // 両チームの打線を表示
    showBatters: function() {
        console.log('Showing batters for both teams');

        // 保存されているデータがあればロード、なければランダム生成
        const hasData = BattersData.loadSavedBatters();

        if (!hasData || BattersData.homeTeamBatters.length === 0) {
            BattersData.generateRandomHomeBatters();
        }

        if (!hasData || BattersData.awayTeamBatters.length === 0) {
            BattersData.generateRandomAwayBatters();
        }

        // 自チームの表示
        const homeTeamList = UI.renderHomeTeamList();
        // 敵チームの表示
        const awayTeamList = UI.renderAwayTeamList();

        // SortableJSを初期化（各チーム内でのみソート可能）
        this.initSortable(homeTeamList, 'home-team');
        this.initSortable(awayTeamList, 'away-team');

        // ボタン表示
        UI.showSaveButton();
        document.getElementById('clear-button').style.display = 'inline-block';
        document.getElementById('copy-button').style.display = 'inline-block';        
    },
    
    // ドラッグ＆ドロップ機能を初期化
    initSortable: function(list, groupName) {
        new Sortable(list, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            group: groupName  // 各チームはそれぞれのグループに所属
        });
    },
    
    // 両チームの打線を保存
    saveBatters: function() {
        console.log('Saving both teams');
        // 現在の打順でデータを更新
        const homeTeamOrder = UI.getHomeTeamOrder();
        const awayTeamOrder = UI.getAwayTeamOrder();
        
        BattersData.updateHomeBattersOrder(homeTeamOrder);
        BattersData.updateAwayBattersOrder(awayTeamOrder);
        
        // ストレージに保存
        Storage.saveBatters(BattersData.homeTeamBatters, BattersData.awayTeamBatters);
        
        // 保存完了メッセージを表示
        UI.showSaveMessage();
    }
};

// DOMが読み込まれた後に初期化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await App.init();
        console.log('DOM loaded, App initialized');
    } catch (error) {
        console.error('Error during app initialization:', error);
    }
});

// グローバル関数として明示的に定義
window.showBatters = function() {
    console.log('showBatters called');
    App.showBatters();
};

window.saveBatters = function() {
    console.log('saveBatters called');
    App.saveBatters();
};

// 打線をクリア（初期化）する関数
window.clearBatters = function() {
    if (confirm('打線データをクリアしますか？この操作は元に戻せません。')) {
        BattersData.clearBatters();

        // UIを更新
        const homeContainer = document.getElementById('home-team-container');
        const awayContainer = document.getElementById('away-team-container');

        homeContainer.innerHTML = '';
        awayContainer.innerHTML = '';

        // 保存ボタンとクリアボタンを非表示にする
        document.getElementById('save-button').style.display = 'none';
        document.getElementById('clear-button').style.display = 'none';

        alert('打線データをクリアしました。');
    }
};

//打線保存
function copyBattersToClipBoard() {

    // console.log("dbg1")

    // 打線情報をテキスト形式で取得
    let clipboardText="" //空文字列で初期化
    let tmptext;    

    // 自チームの打線を取得

    const homeTeamContainer = document.getElementById('home-team-container');
    const homeBatters = homeTeamContainer.querySelectorAll('.batter-info');

    console.log(homeTeamContainer)
    console.log(homeBatters)

    homeBatters.forEach((batter,index)=>{
        // console.log(index)
        // console.log(batter.textContent)
        // 正規表現        
        // \s - 空白文字（スペース、タブ、改行、全角スペースなど）を表す
        // + - 直前のパターンが1回以上繰り返されることを意味する
        // g - グローバルフラグ（文字列全体で全ての一致を検索）
        // →連続する複数の空白文字を単一のスペースに置き換える

        // 縦棒「|」を削除する
        const batterText = batter.textContent.trim().replace(/\s+/g,' ').replace(/\|/g,'');
        tmptext = `${index + 1}番: ${batterText}`

        console.log(tmptext)

        // 改行
        clipboardText += tmptext+"\n";

    });

    // clipboardText="ABCDE" OKここが動いてない

    // クリップボードにコピー   
    navigator.clipboard.writeText(clipboardText)
        .then(() => {
            alert('打線データをクリップボードにコピーしました。');
        }).catch(err => {
            console.error('クリップボードへのコピーに失敗しました:', err);
        });

}