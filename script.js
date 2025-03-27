let dragSrcElement = null;

function handleDragStart(e) {
    dragSrcElement = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (dragSrcElement !== this) {
        const srcHTML = dragSrcElement.outerHTML;
        const destHTML = this.outerHTML;
        dragSrcElement.outerHTML = destHTML;
        this.outerHTML = srcHTML;
    }

    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    const items = document.querySelectorAll('.draggable');
    items.forEach(item => {
        item.classList.remove('over');
    });
}

function showBatters() {
    const batters = [
        { name: "山田 太郎", average: ".321" },
        { name: "鈴木 一郎", average: ".305" },
        { name: "田中 誠", average: ".289" },
        { name: "佐藤 健", average: ".275" },
        { name: "高橋 優", average: ".301" },
        { name: "伊藤 大輔", average: ".265" },
        { name: "渡辺 剛", average: ".278" },
        { name: "中村 翔", average: ".255" },
        { name: "小林 勇", average: ".245" }
    ];

    const container = document.getElementById("batters-container");
    container.innerHTML = "";

    const battersList = document.createElement("ol");
    batters.forEach(batter => {
        const batterItem = document.createElement("li");
        batterItem.className = 'draggable';
        batterItem.draggable = true;
        batterItem.textContent = `${batter.name} (打率: ${batter.average})`;

        batterItem.addEventListener('dragstart', handleDragStart);
        batterItem.addEventListener('dragover', handleDragOver);
        batterItem.addEventListener('dragenter', handleDragEnter);
        batterItem.addEventListener('dragleave', handleDragLeave);
        batterItem.addEventListener('drop', handleDrop);
        batterItem.addEventListener('dragend', handleDragEnd);

        battersList.appendChild(batterItem);
    });

    container.appendChild(battersList);
}