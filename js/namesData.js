// 選手名データを管理するモジュール
const NamesData = {
    // デフォルト値の定義（最初に統一して定義）
    DEFAULT_FIRSTNAMES: ["翔太", "健太", "大輔", "拓也", "直樹", "健", "誠", "裕太", "和也", "達也", "真一", "浩二", "剛", "洋平", "亮", "雄太", "智也", "康平", "大樹", "隆"],
    DEFAULT_LASTNAMES: ["山田", "鈴木", "田中", "佐藤", "高橋", "伊藤", "渡辺", "中村", "小林", "加藤", "吉田", "松本", "井上", "木村", "林", "斎藤", "清水", "山本", "池田", "前田"],
    
    // 名前データ
    firstnames: [],
    // 苗字データとその出現率
    lastnames: [],
    lastnameWeights: [],
    // 苗字の累積確率
    lastnameCumulativeWeights: [],

    init: async function() {
        // 両方のデータ読み込みを並行して実行
        await Promise.all([
            this.loadFirstNames(),
            this.loadLastNames()
        ]);
        console.log("Names initialization completed");
        return this;
    },

    loadFirstNames: async function() {
        try {
            const response = await fetch('source/first_names.txt');
            const data = await response.text();
            this.firstnames = data.split('\n').filter(name => name.trim() !== '');
            console.log("First names loaded:", this.firstnames.length);
        } catch (error) {
            console.error('Error loading first_names.txt:', error);
            // 統一したデフォルト値を使用
            this.firstnames = [...this.DEFAULT_FIRSTNAMES];
            console.log("Using default first names");
        }
    },

    loadLastNames: async function() {
        try {
            const response = await fetch('source/last_name.txt');
            const data = await response.text();
            const lines = data.split('\n').filter(line => line.trim() !== '');
            
            this.lastnames = [];
            this.lastnameWeights = [];
            
            // 各行を処理: "名前 確率%" の形式を想定
            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 2) {
                    const name = parts[0];
                    // 数値部分を取得（%を除去して浮動小数点に変換）
                    const weight = parseFloat(parts[1].replace('%', ''));
                    
                    this.lastnames.push(name);
                    this.lastnameWeights.push(weight);
                }
            });
            
            // 累積確率を計算
            this.calculateCumulativeWeights();
            
            console.log("Last names loaded:", this.lastnames.length);
        } catch (error) {
            console.error('Error loading last_name.txt:', error);
            // 統一したデフォルト値を使用
            this.lastnames = [...this.DEFAULT_LASTNAMES];
            this.lastnameWeights = new Array(this.lastnames.length).fill(5); // 均等な確率
            this.calculateCumulativeWeights();
            console.log("Using default last names");
        }
    },

    // 累積確率を計算する
    calculateCumulativeWeights: function() {
        this.lastnameCumulativeWeights = [];
        let sum = 0;
        
        for (let i = 0; i < this.lastnameWeights.length; i++) {
            sum += this.lastnameWeights[i];
            this.lastnameCumulativeWeights.push(sum);
        }
    },

    getRandomLastname: function() {
        // 苗字データが読み込まれていない場合のフォールバック
        if (this.lastnames.length === 0) {
            console.warn("Warning: Lastnames array is empty");
            // 統一したデフォルト値を使用
            return this.DEFAULT_LASTNAMES[Math.floor(Math.random() * this.DEFAULT_LASTNAMES.length)];
        }
        
        // 確率に基づいて苗字を選択
        const randomValue = Math.random() * this.lastnameCumulativeWeights[this.lastnameCumulativeWeights.length - 1];
        
        // 二分探索で該当する名前のインデックスを見つける
        let low = 0;
        let high = this.lastnameCumulativeWeights.length - 1;
        
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            
            if (this.lastnameCumulativeWeights[mid] < randomValue) {
                low = mid + 1;
            } else if (mid > 0 && this.lastnameCumulativeWeights[mid - 1] >= randomValue) {
                high = mid - 1;
            } else {
                return this.lastnames[mid];
            }
        }
        
        // 最も可能性が低くてもフォールバックとして最初の名前を返す
        return this.lastnames[0];
    },

    getRandomFirstname: function() {
        // 名前が読み込まれていない場合のフォールバック
        if (this.firstnames.length === 0) {
            console.warn("Warning: Firstnames array is empty");
            // 統一したデフォルト値を使用
            return this.DEFAULT_FIRSTNAMES[Math.floor(Math.random() * this.DEFAULT_FIRSTNAMES.length)];
        }
        return this.firstnames[Math.floor(Math.random() * this.firstnames.length)];
    }
};