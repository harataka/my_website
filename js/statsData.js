// 選手成績データを管理するモジュール
const StatsData = {

    // 非対称正規分布に従う値を生成するヘルパー関数
    generateAsymmetricNormalDistValue: function(paramType, mean, stdDevPos, stdDevNeg, min, max) {
        // Box-Muller変換で正規分布の乱数を生成
        let u1 = Math.random();
        let u2 = Math.random();
        let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        // 平均と非対称の標準偏差を適用
        let value;
        if (z >= 0) {
            // 正の場合
            value = mean + stdDevPos * z;
        } else {
            // 負の場合
            value = mean + stdDevNeg * z;
        }

        // 指定された範囲に収める
        value = Math.max(min, Math.min(max, value));

        // paramTypeに応じた後処理
        if (paramType == 'avg') {
            return "." + Math.floor(value * 1000).toString().padStart(3, '0');
        } else {
            return Math.round(value);
        }
    },

    // 打率
    // https://purecalculators.com/ja/empirical-rule-calculatorで調整
    getRandomAvg: function() {
        let mean = 0.245;      // 平均
        let stdDevPos = 0.035; // 標準偏差(プラス方向)
        let stdDevNeg = 0.015; // 標準偏差(マイナス方向)
        let min = 0.180;       // 下限
        let max = 0.350;       // 上限

        return this.generateAsymmetricNormalDistValue("avg", mean, stdDevPos, stdDevNeg, min, max);
    },

    // ホームラン
    getRandomHr: function() {
        let mean = 12;      // 平均
        let stdDevPos = 12.5; // 標準偏差(プラス方向)
        let stdDevNeg = 10; // 標準偏差(マイナス方向)
        let min = 0;        // 下限
        let max = 60;       // 上限

        return this.generateAsymmetricNormalDistValue("hr", mean, stdDevPos, stdDevNeg, min, max);
    },

    // 盗塁
    getRandomStealBases: function() {
        let mean = 10;      // 平均
        let stdDevPos = 10; // 標準偏差(プラス方向)
        let stdDevNeg = 6;  // 標準偏差(マイナス方向)
        let min = 0;        // 下限
        let max = 70;       // 上限

        return this.generateAsymmetricNormalDistValue("sb", mean, stdDevPos, stdDevNeg, min, max);
    },

    // 打点
    getRandomRbi: function(hr, avg) {
        // HRとAVGを数値に変換
        const hrNum = parseInt(hr);
        const avgNum = parseFloat(avg);

        // 最低でもHR * 2.0の打点を確保
        const baseRbi = Math.ceil(hrNum * 2.0);

        // 打率による追加ポイント（.300打者は +30 くらいの感覚）
        const avgBonus = Math.max(0, (avgNum - 0.2) * 200);  // .250 → +10、.300 → +20

        // 少しランダム性も加味（例: チャンスに強い選手のイメージ）
        const clutchFactor = Math.random() * 15;  // 0〜15点

        // 合計して打点に（最大149で制限）
        const totalRbi = Math.min(Math.round(baseRbi + avgBonus + clutchFactor), 149);

        // 現実的な上限を設定
        return totalRbi.toString();
    }
};