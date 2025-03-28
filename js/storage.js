// ストレージ関連の処理を管理するモジュール
const Storage = {
    // 両チームの打線データを保存
    saveBatters: function(homeTeam, awayTeam) {
        localStorage.setItem('savedHomeTeamBatters', JSON.stringify(homeTeam));
        localStorage.setItem('savedAwayTeamBatters', JSON.stringify(awayTeam));
    }
};