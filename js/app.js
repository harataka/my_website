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

        // 保存ボタンとクリアボタンを表示
        UI.showSaveButton();
        document.getElementById('clear-button').style.display = 'inline-block';
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