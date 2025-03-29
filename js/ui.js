// UI関連の処理を管理するモジュール
const UI = {

    // 成績に基づいてクラスを返す共通関数
    getStatsClass: function (value, threshold1, threshold2) {
        if (value >= threshold1) {
            return "super-highlight";
        } else if (value >= threshold2) {
            return "highlight";
        }

        return "";

    },

    // 打者情報のHTML生成
    createBatterHTML: function (batter) {
        // 打率の強調表示
        const avgValue = parseFloat(batter.avg);
        const avgClass = this.getStatsClass(avgValue, 0.300, 0.275)

        // HRの強調表示
        const hrValue = parseFloat(batter.hr);
        const hrClass = this.getStatsClass(hrValue, 35, 25)

        // 打点の強調表示        
        const rbiValue = parseFloat(batter.rbi);
        const rbiClass = this.getStatsClass(rbiValue, 100, 80)

        return `
            <div class="batter-info">
                <span class="batter-name">${batter.lastname} ${batter.firstname}</span>
                <span class="position">${batter.position}</span>
                <span class="stat-item avg ${avgClass}"> ${batter.avg}</span>
                <span class="stat-item hr  ${hrClass}"> ${batter.hr}</span>本
                <span class="stat-item rbi ${rbiClass}"> ${batter.rbi}</span>点
            </div>
        `;

    },

    // チームの打線リストを表示する共通関数
    renderTeamList: function (containerId, batters, listId) {
        const container = document.getElementById(containerId);
        container.innerHTML = "";

        const battersList = document.createElement("ol");
        battersList.id = listId;

        batters.forEach(batter => {
            const batterItem = document.createElement("li");
            batterItem.className = 'draggable';
            batterItem.innerHTML = this.createBatterHTML(batter);
            battersList.appendChild(batterItem);
        });

        container.appendChild(battersList);
        return battersList;
    },

    // 自チームの打線リストを表示
    renderHomeTeamList: function () {
        return this.renderTeamList("home-team-container", BattersData.homeTeamBatters, "home-team-list");
    },

    // 敵チームの打線リストを表示
    renderAwayTeamList: function () {
        return this.renderTeamList("away-team-container", BattersData.awayTeamBatters, "away-team-list");
    },


    // 保存ボタンを表示
    showSaveButton: function () {
        document.getElementById('save-button').style.display = 'inline-block';
    },

    // 自チームの打順を取得
    getHomeTeamOrder: function () {
        return this.getBattersOrderFromList('home-team-list', BattersData.homeTeamBatters);
    },

    // 敵チームの打順を取得
    getAwayTeamOrder: function () {
        return this.getBattersOrderFromList('away-team-list', BattersData.awayTeamBatters);
    },

    // 指定されたリストから打順を取得
    getBattersOrderFromList: function (listId, originalBatters) {
        const battersList = document.getElementById(listId);
        const newOrder = [];

        if (!battersList) return originalBatters;

        Array.from(battersList.children).forEach((item, index) => {
            const nameDiv = item.querySelector('.batter-name');
            const fullName = nameDiv.textContent.trim();
            const [lastname, firstname] = fullName.split(' ');

            const batter = originalBatters.find(b =>
                b.lastname === lastname && b.firstname === firstname);

            if (batter) {
                newOrder[index] = batter;
            }
        });

        return newOrder;
    },

    // 保存完了メッセージ
    showSaveMessage: function () {
        alert('打線を保存しました！');
    }
};