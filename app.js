const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsArea = document.getElementById('resultsArea');

// 浮かぶプレイヤー用の要素を取得
const floatingPlayer = document.getElementById('floatingPlayer');
const playerHeader = document.getElementById('playerHeader');
const closePlayerBtn = document.getElementById('closePlayer');
const youtubeIframe = document.getElementById('youtubeIframe');

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

// 検索を実行（AND検索対応）
function performSearch() {
  const keywordString = searchInput.value.trim().toLowerCase();
  resultsArea.innerHTML = '';

  if (keywordString === '') {
    resultsArea.innerHTML = '<p>キーワードを入力してください。</p>';
    return;
  }

  // 全角スペースを半角に変換し、スペースごとに区切って「検索ワードの配列」を作る
  const keywords = keywordString.replace(/　/g, ' ').split(' ').filter(kw => kw !== '');

  // データの中から探す
  const filteredData = qaData.filter(item => {
    // タイトル・質問・回答を1つの文章にまとめる
    const combinedText = (item.title + " " + item.question + " " + item.answer).toLowerCase();
    
    // 【AND検索】入力されたすべてのキーワードが文章に含まれているかチェック
    return keywords.every(kw => combinedText.includes(kw));
  });

  if (filteredData.length === 0) {
    resultsArea.innerHTML = '<p>該当する結果がありませんでした。</p>';
    return;
  }

  // 検索結果を画面に作る
  filteredData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'qa-card';
    card.innerHTML = `
      <div class="qa-header">${item.title}</div>
      <div class="qa-question">質問：${item.question}</div>
      <div class="qa-answer">回答：${item.answer}</div>
    `;

    // クリックされたら浮かぶプレイヤーを表示する
    card.addEventListener('click', () => {
      const seconds = timeToSeconds(item.time);
      let videoId = "";
      
      // 動画のIDを取り出す（youtu.be でも youtube.com/watch でも対応）
      if (item.videoBaseUrl.includes("youtu.be/")) {
        videoId = item.videoBaseUrl.split("youtu.be/")[1];
      } else if (item.videoBaseUrl.includes("v=")) {
        videoId = item.videoBaseUrl.split("v=")[1].split("&")[0];
      }

      // 埋め込み用のURLを作成（autoplay=1 で自動再生）
      const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1`;
      
      youtubeIframe.src = embedUrl;
      floatingPlayer.style.display = 'block'; // プレイヤーを表示
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
  youtubeIframe.src = ''; // 動画を止めるためにURLを空にする
});

// ==========================================
// ▼▼ ここから：プレイヤーをドラッグで移動する機能 ▼▼
// ==========================================
let isDragging = false;
let startX, startY, initialLeft, initialTop;

// ドラッグ開始
function startDrag(e) {
  isDragging = true;
  // マウスか指（タッチ）かを判定して座標を取得
  const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
  
  startX = clientX;
  startY = clientY;
  
  // 現在のプレイヤーの位置を取得
  const rect = floatingPlayer.getBoundingClientRect();
  initialLeft = rect.left;
  initialTop = rect.top;
  
  // 右下固定を解除して、自由に動かせるようにする
  floatingPlayer.style.bottom = 'auto';
  floatingPlayer.style.right = 'auto';
  floatingPlayer.style.left = initialLeft + 'px';
  floatingPlayer.style.top = initialTop + 'px';
}

// ドラッグ中
function drag(e) {
  if (!isDragging) return;
  e.preventDefault(); // スマホで画面全体がスクロールされるのを防ぐ

  const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
  
  // どれくらい移動したかを計算
  const dx = clientX - startX;
  const dy = clientY - startY;
  
  // プレイヤーの位置を更新
  floatingPlayer.style.left = (initialLeft + dx) + 'px';
  floatingPlayer.style.top = (initialTop + dy) + 'px';
}

// ドラッグ終了
function endDrag() {
  isDragging = false;
}

// マウス用（PC）
playerHeader.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', endDrag);

// タッチ用（スマホ）
playerHeader.addEventListener('touchstart', startDrag, {passive: false});
document.addEventListener('touchmove', drag, {passive: false});
document.addEventListener('touchend', endDrag);

// ==========================================
// ▼▼ 追加：トップへ戻るボタンの機能 ▼▼
// ==========================================
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// 画面がスクロールされたときの処理
window.addEventListener('scroll', () => {
  // 上から300px以上スクロールされたらボタンを表示
  if (window.scrollY > 300) {
    scrollToTopBtn.classList.add('show');
  } else {
    scrollToTopBtn.classList.remove('show');
  }
});

// ボタンがクリックされたときの処理
scrollToTopBtn.addEventListener('click', () => {
  // 画面の一番上へ、滑らかに（smooth）移動する
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
