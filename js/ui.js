// UI関連の処理を管理するモジュール
const UI = {
    // 自チームの打線リストを表示
    renderHomeTeamList: function() {
        const container = document.getElementById("home-team-container");
        container.innerHTML = "";

        const battersList = document.createElement("ol");
        battersList.id = "home-team-list";
        
        BattersData.homeTeamBatters.forEach(batter => {
            const batterItem = document.createElement("li");
            batterItem.className = 'draggable';
            
            batterItem.innerHTML = `
                <div class="batter-info">
                    <div class="batter-name">${batter.lastname} ${batter.firstname}</div>
                    <div class="batter-stats">
                        <span class="position">${batter.position}</span> | 
                        <span class="avg">打率: ${batter.avg}</span> | 
                        <span class="hr">本塁打: ${batter.hr}</span> | 
                        <span class="rbi">打点: ${batter.rbi}</span>
                    </div>
                </div>
            `;
            
            battersList.appendChild(batterItem);
        });

        container.appendChild(battersList);
        return battersList;
    },
    
    // 敵チームの打線リストを表示
    renderAwayTeamList: function() {
        const container = document.getElementById("away-team-container");
        container.innerHTML = "";

        const battersList = document.createElement("ol");
        battersList.id = "away-team-list";
        
        BattersData.awayTeamBatters.forEach(batter => {
            const batterItem = document.createElement("li");
            batterItem.className = 'draggable';
            
            batterItem.innerHTML = `
                <div class="batter-info">
                    <div class="batter-name">${batter.lastname} ${batter.firstname}</div>
                    <div class="batter-stats">
                        <span class="position">${batter.position}</span> | 
                        <span class="avg">打率: ${batter.avg}</span> | 
                        <span class="hr">本塁打: ${batter.hr}</span> | 
                        <span class="rbi">打点: ${batter.rbi}</span>
                    </div>
                </div>
            `;
            
            battersList.appendChild(batterItem);
        });

        container.appendChild(battersList);
        return battersList;
    },
    
    // 保存ボタンを表示
    showSaveButton: function() {
        document.getElementById('save-button').style.display = 'inline-block';
    },
    
    // 自チームの打順を取得
    getHomeTeamOrder: function() {
        return this.getBattersOrderFromList('home-team-list', BattersData.homeTeamBatters);
    },
    
    // 敵チームの打順を取得
    getAwayTeamOrder: function() {
        return this.getBattersOrderFromList('away-team-list', BattersData.awayTeamBatters);
    },
    
    // 指定されたリストから打順を取得
    getBattersOrderFromList: function(listId, originalBatters) {
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
    showSaveMessage: function() {
        alert('打線を保存しました！');
    }
};