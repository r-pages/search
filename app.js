const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsArea = document.getElementById('resultsArea');
const floatingPlayer = document.getElementById('floatingPlayer');
const playerHeader = document.getElementById('playerHeader');
const closePlayerBtn = document.getElementById('closePlayer');
const youtubeIframe = document.getElementById('youtubeIframe');
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// 時間を秒数に変換する機能
function timeToSeconds(timeStr) {
  const parts = timeStr.split(':');
  let seconds = 0;
  if (parts.length === 3) {
    seconds = (parseInt(parts[0]) * 3600) + (parseInt(parts[1]) * 60) + parseInt(parts[2]);
  } else if (parts.length === 2) {
    seconds = (parseInt(parts[0]) * 60) + parseInt(parts[1]);
  }
  return seconds;
}

// 検索を実行（AND検索対応 ＆ マーカー機能付き）
function performSearch() {
  const keywordString = searchInput.value.trim().toLowerCase();
  resultsArea.innerHTML = '';

  if (keywordString === '') {
    resultsArea.innerHTML = '<p style="text-align:center; color:#888;">キーワードを入力してください。</p>';
    return;
  }

  // キーワードをスペースで区切って配列にする
  const keywords = keywordString.replace(/　/g, ' ').split(' ').filter(kw => kw !== '');

  // データの中から探す
  const filteredData = qaData.filter(item => {
    const combinedText = (item.title + " " + item.question + " " + item.answer).toLowerCase();
    return keywords.every(kw => combinedText.includes(kw));
  });

  if (filteredData.length === 0) {
    resultsArea.innerHTML = '<p style="text-align:center; color:#888;">該当する結果がありませんでした。</p>';
    return;
  }

  // ★追加：キーワードを文字数が多い順に並び替える（「消費税」と「税」の重複エラーを防ぐため）
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

  // 検索結果を画面に作る
  filteredData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'qa-card';

    // 表示用のテキストを準備
    let displayTitle = item.title;
    let displayQuestion = item.question;
    let displayAnswer = item.answer;

    // ★追加：見つかったキーワードにマーカー（<mark>）を引く
    sortedKeywords.forEach(kw => {
      // プログラムのエラーを防ぐための安全処理
      const safeKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // 大文字・小文字を区別せず、該当する文字すべてを対象にする
      const regex = new RegExp(`(${safeKw})`, 'gi');
      
      // 文字を <mark> タグで挟み込む
      displayTitle = displayTitle.replace(regex, '<mark>$1</mark>');
      displayQuestion = displayQuestion.replace(regex, '<mark>$1</mark>');
      displayAnswer = displayAnswer.replace(regex, '<mark>$1</mark>');
    });

    card.innerHTML = `
      <div class="qa-header">${displayTitle}</div>
      <div class="qa-question">質問：${displayQuestion}</div>
      <div class="qa-answer">回答：${displayAnswer}</div>
    `;

    // クリックされたら浮かぶプレイヤーを表示する
    card.addEventListener('click', () => {
      const seconds = timeToSeconds(item.time);
      let videoId = "";
      
      if (item.videoBaseUrl.includes("youtu.be/")) {
        videoId = item.videoBaseUrl.split("youtu.be/")[1];
      } else if (item.videoBaseUrl.includes("v=")) {
        videoId = item.videoBaseUrl.split("v=")[1].split("&")[0];
      }

      const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1`;
      youtubeIframe.src = embedUrl;
      floatingPlayer.style.display = 'block';
    });

    resultsArea.appendChild(card);
  });
}

// 検索イベントの設定
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performSearch();
});

// プレイヤーを閉じる機能
closePlayerBtn.addEventListener('click', () => {
  floatingPlayer.style.display = 'none';
  youtubeIframe.src = '';
});

// ==========================================
// プレイヤーをドラッグで移動する機能
// ==========================================
let isDragging = false;
let startX, startY, initialLeft, initialTop;

function startDrag(e) {
  isDragging = true;
  const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
  
  startX = clientX;
  startY = clientY;
  
  const rect = floatingPlayer.getBoundingClientRect();
  initialLeft = rect.left;
  initialTop = rect.top;
  
  floatingPlayer.style.bottom = 'auto';
  floatingPlayer.style.right = 'auto';
  floatingPlayer.style.left = initialLeft + 'px';
  floatingPlayer.style.top = initialTop + 'px';
}

function drag(e) {
  if (!isDragging) return;
  e.preventDefault();
  const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
  
  const dx = clientX - startX;
  const dy = clientY - startY;
  
  floatingPlayer.style.left = (initialLeft + dx) + 'px';
  floatingPlayer.style.top = (initialTop + dy) + 'px';
}

function endDrag() {
  isDragging = false;
}

playerHeader.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', endDrag);

playerHeader.addEventListener('touchstart', startDrag, {passive: false});
document.addEventListener('touchmove', drag, {passive: false});
document.addEventListener('touchend', endDrag);

// ==========================================
// トップへ戻るボタンの機能
// ==========================================
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollToTopBtn.classList.add('show');
  } else {
    scrollToTopBtn.classList.remove('show');
  }
});

scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
