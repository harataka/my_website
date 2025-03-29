// バッターデータを管理するモジュール
const BattersData = {
    // 両チームの打線データ
    homeTeamBatters: [],
    awayTeamBatters: [],

    // 初期化処理
    init: async function() {
        await NamesData.init();
        return this;
    },

    // 保存されたデータを読み込む
    loadSavedBatters: function() {
        const savedHomeTeam = localStorage.getItem('savedHomeTeamBatters');
        const savedAwayTeam = localStorage.getItem('savedAwayTeamBatters');
        
        let loaded = false;
        
        if (savedHomeTeam) {
            this.homeTeamBatters = JSON.parse(savedHomeTeam);
            loaded = true;
        }
        
        if (savedAwayTeam) {
            this.awayTeamBatters = JSON.parse(savedAwayTeam);
            loaded = true;
        }
        
        return loaded;
    },

    // 打線データをクリア（初期化）する
    clearBatters: function() {
        this.homeTeamBatters = [];
        this.awayTeamBatters = [];
        // ローカルストレージからも削除
        localStorage.removeItem('savedHomeTeamBatters');
        localStorage.removeItem('savedAwayTeamBatters');
        return true;
    },

    // 自チーム用のランダム打者生成
    generateRandomHomeBatters: function() {
        this.homeTeamBatters = this.generateRandomTeam();
        this.homeTeamBatters = this.autoSortBattingOrder(this.homeTeamBatters);
    },
    
    // 敵チーム用のランダム打者生成
    generateRandomAwayBatters: function() {
        this.awayTeamBatters = this.generateRandomTeam();
        this.awayTeamBatters = this.autoSortBattingOrder(this.awayTeamBatters)        
    },
    
    // ランダムチーム生成のヘルパーメソッド
    generateRandomTeam: function() {
        this.resetPositions();
        const team = [];
        for (let i = 0; i < 9; i++) {
            const avg = StatsData.getRandomAvg();
            const hr = StatsData.getRandomHr();
            team.push({
                lastname: NamesData.getRandomLastname(),
                firstname: NamesData.getRandomFirstname(),
                position: this.getRandomPosition(),
                avg: avg,
                hr: hr,
                rbi: StatsData.getRandomRbi(hr, avg)
            });
        }
        return team;
    },


    /**
     * チームの平均スタッツを計算する関数
     * @param {Array} team - 打者データの配列
     * @return {Object} 平均値を含むオブジェクト
     */
    calculateTeamAverages: function(team) {
        let totalAvg = 0;
        let totalHr = 0;
        let totalRbi = 0;
        
        team.forEach(batter => {
            totalAvg += parseFloat(batter.avg);
            totalHr += parseInt(batter.hr);
            totalRbi += parseInt(batter.rbi);
        });
        
        return {
            avgAvg: totalAvg / team.length,
            avgHr: totalHr / team.length,
            avgRbi: totalRbi / team.length
        };
    },

    /**
     * スタッツの係数を動的に計算する関数
     * @param {Object} averages - チームの平均スタッツ
     * @return {Object} 係数を含むオブジェクト
     */
    calculateCoefficients: function(averages) {
        // 平均打率を基準値として、他の指標の係数を計算
        const baseValue = averages.avgAvg * 1000; // 例：0.280 → 280
        
        // 各指標が同程度の影響力になるよう係数を計算
        return {
            hrCoef: averages.avgHr > 0 ? baseValue / averages.avgHr : 15, // ゼロ除算防止
            rbiCoef: averages.avgRbi > 0 ? baseValue / averages.avgRbi : 5  // ゼロ除算防止
        };
    },

    /**
     * 打順ごとに選手を評価するスコアを計算する関数
     * @param {Object} batter - 打者データ
     * @param {number} order - 打順（1〜9）
     * @return {number} 評価スコア
     */
    rateBatterForBattingOrder: function(batter, order) {

        // 静的フラグを初期化（初回実行の判定用）
        if (this.rateBatterForBattingOrder.hasDisplayedTeamInfo === undefined) {
            this.rateBatterForBattingOrder.hasDisplayedTeamInfo = false;
        }

        // チームの平均スタッツを取得（実装の都合上、親オブジェクト外からはアクセスできない）
        const team = this.homeTeamBatters.length ? this.homeTeamBatters : this.awayTeamBatters;
        const averages = this.calculateTeamAverages(team);
        const coefficients = this.calculateCoefficients(averages);
        
        const avg = parseFloat(batter.avg)*1000;  // 打率(整数化)
        const hr = parseInt(batter.hr) * coefficients.hrCoef;  // ホームラン数（動的係数調整）
        const rbi = parseInt(batter.rbi) * coefficients.rbiCoef;  // 打点（動的係数調整）

        // デバッグ用（テスト後に削除可能）
        // チーム情報は初回のみ表示
        if (!this.rateBatterForBattingOrder.hasDisplayedTeamInfo) {
            console.log(`チーム平均: 打率=${averages.avgAvg.toFixed(3)}, HR=${averages.avgHr.toFixed(1)}, 打点=${averages.avgRbi.toFixed(1)}`);
            console.log(`計算された係数: HR=${coefficients.hrCoef.toFixed(2)}, 打点=${coefficients.rbiCoef.toFixed(2)}`);
            this.rateBatterForBattingOrder.hasDisplayedTeamInfo = true;
        }        
        console.log(`打順=${order} :選手評価: ${batter.lastname} ${batter.firstname} 打率=${avg}, 調整HR=${hr.toFixed(1)}, 調整打点=${rbi.toFixed(1)}`);

        switch (order) {
            case 1: return avg * 5  + hr * 0.6 + rbi * 0.6;  // 1番: 打率重視、HR少なめが理想
            case 2: return avg * 3  + hr * 0.4 + rbi * 0.4;  // 2番: 打率重視、HR少なめ
            case 3: return avg * 5  + hr * 2   + rbi * 1;  // 3番: 打率とパワーのバランス
            case 4: return avg * 2  + hr * 5   + rbi * 4;  // 4番: HRと打点重視の長打者
            case 5: return avg * 2  + hr * 4   + rbi * 4;  // 5番: 4番に次ぐパワー重視
            case 6: return avg * 3  + hr * 2   + rbi * 2;  // 6番: 打率とある程度のパワー
            case 7: return avg * 2  + hr * 2   + rbi * 1;  // 7番: 打率中心、少しパワー
            case 8: return avg * 2  + hr * 1   + rbi * 1;  // 8番: 打率のみ重視
            case 9: return avg * 1  + hr * 1   + rbi * 1;  // 9番: 打率のみ（最も低い評価）
        }
    },

    /**
     * チームの打順を自動的に最適化する関数
     * @param {Array} team - 打者データの配列
     * @return {Array} 最適化された打順の打者配列
     */
    autoSortBattingOrder: function(team) {
        const sortedTeam = new Array(9).fill(null);  // 9人分の空の配列を作成
        const used = new Set(); // 既に配置済みの選手のインデックスを管理

        // 打順を決める順番を定義（4番から順に決定）
        const orderPriority = [4, 3, 1, 5, 2, 6, 7, 8, 9];

        // 優先順位に基づいて打順を決定
        for (const order of orderPriority) {
            let bestScore = -Infinity;
            let bestIndex = -1;

            // 各打者について、現在の打順での評価スコアを計算
            team.forEach((batter, index) => {
                // 既に使用済みの選手はスキップ
                if (used.has(index)) return;

                // 打順に応じた評価スコアを計算
                const score = this.rateBatterForBattingOrder(batter, order);
                // より高いスコアの選手が見つかれば更新
                if (score > bestScore) {
                    bestScore = score;
                    bestIndex = index;
                }
            });

            // 最適な選手が見つかれば、その選手を配置
            if (bestIndex !== -1) {
                sortedTeam[order - 1] = team[bestIndex]; // 打順は1始まり、配列は0始まりなので調整
                used.add(bestIndex);
            }
        }

        return sortedTeam;
    },
    



    

    // 使用可能なポジションを追跡する配列
    availablePositions: ["捕手", "一塁", "二塁", "三塁", "遊撃", "左翼", "中堅", "右翼", "投手"],

    // ポジションをリセットする
    resetPositions: function() {
        this.availablePositions = ["捕手", "一塁", "二塁", "三塁", "遊撃", "左翼", "中堅", "右翼", "投手"];
    },

    // 重複しないランダムなポジションを取得
    getRandomPosition: function() {
        if (this.availablePositions.length === 0) {
            this.resetPositions(); // すべてのポジションが使用された場合はリセット
        }

        const randomIndex = Math.floor(Math.random() * this.availablePositions.length);
        const position = this.availablePositions[randomIndex];

        // 選択されたポジションを配列から削除
        this.availablePositions.splice(randomIndex, 1);

        return position;
    },

    // 打順の更新
    updateHomeBattersOrder: function(newOrder) {
        this.homeTeamBatters = newOrder;
    },
    
    updateAwayBattersOrder: function(newOrder) {
        this.awayTeamBatters = newOrder;
    }
};