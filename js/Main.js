// 주요 변수 설정
const calendar = document.getElementById('calendar');
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

// 감정 키워드와 이모지 매핑
const emotionKeywords = {
  '행복': ['행복'],
  '기쁨': ['기쁨', '기쁘다', '기뻐', '기뻤다'],
  '즐거움': ['즐거움', '즐겁다', '즐거웠어', '재미', '재밌'],
  '설렘': ['설렘', '설레다', '설렜어'],
  '감사': ['감사', '고맙다'],
  '사랑': ['사랑'],
  '평온': ['평온', '차분하다'],
  '자신감': ['자신감', '자신 있다', '할 수 있다'],
  '뿌듯함': ['뿌듯'],
  '만족': ['만족'],
  '슬픔': ['슬픔', '슬프다', '슬펐', '눈물', '눈물이 났다', '슬픈'],
  '우울': ['우울'],
  '불안': ['불안'],
  '외로움': ['외롭다', '외로웠어', '혼자'],
  '후회': ['후회'],
  '무기력': ['무기력', '힘이 없다'],
  '지침': ['지치다', '지쳤어', '힘들다', '힘든'],
  '화남': ['화', '열받아'],
  '짜증': ['짜증'],
  '분노': ['분노', '폭발'],
  '실망': ['실망'],
  '답답함': ['답답'],
  '긴장': ['긴장', '떨린다'],
  '놀람': ['놀라다', '깜짝', '놀랐'],
  '혼란': ['혼란', '복잡해'],
  '멍함': ['멍하다', '머리가 하얘짐'],
  '피곤': ['피곤하다', '피곤해', '졸려'],
  '그냥': ['그냥', '무난하다', '평범했다']
};

const emotionMap = {
  '행복': '😊', '기쁨': '😄', '즐거움': '😁', '설렘': '😍',
  '감사': '🙏', '사랑': '❤️', '평온': '😌', '자신감': '💪',
  '뿌듯함': '🤗', '만족': '😋',
  '슬픔': '😢', '우울': '😞', '불안': '😟', '외로움': '😔',
  '후회': '😣', '무기력': '🥱', '지침': '😩',
  '화남': '😠', '짜증': '😤', '분노': '😡', '실망': '😑',
  '답답함': '😣', '긴장': '😬',
  '놀람': '😲', '혼란': '😵', '멍함': '😶', '피곤': '😪',
  '그냥': '🤔',
  '기타': '✍️'
};

let diaryData = JSON.parse(localStorage.getItem('diary')) || {};
let emotionChart = null;

// 달력 렌더링
function renderCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  calendar.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'day';
    blank.style.visibility = 'hidden';
    calendar.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.textContent = day;
    const dateKey = `${year}-${month + 1}-${day}`;
    const entry = diaryData[dateKey];
    if (entry && entry.emotion) {
      const emoji = document.createElement('span');
      emoji.className = 'emoji';
      emoji.textContent = emotionMap[entry.emotion] || '✍️';
      cell.appendChild(emoji);
    }
    cell.onclick = () => openDiaryPrompt(dateKey);
    calendar.appendChild(cell);
  }

  document.getElementById('monthText').textContent = `${year}년 ${month + 1}월`;

  // 월별 감정 차트 렌더링
  renderChart(year, month);
}

// 감정 분석
function analyzeEmotion(text) {
  for (const emotion in emotionKeywords) {
    const keywords = emotionKeywords[emotion];
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return emotion;
      }
    }
  }
  return '기타';
}

// 월별 감정 차트 렌더링
function renderChart(year, month) {
  const count = {};
  for (const key in diaryData) {
    const [entryYear, entryMonth] = key.split('-').map(Number);
    if (entryYear === year && entryMonth === (month + 1)) {
      const emotion = diaryData[key].emotion;
      count[emotion] = (count[emotion] || 0) + 1;
    }
  }

  const ctx = document.getElementById('emotionChart').getContext('2d');
  if (emotionChart) {
    emotionChart.destroy();
  }

  const labels = Object.keys(count).map(e => emotionMap[e] || '✍️');
  const values = Object.values(count);

  emotionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ['#FBC02D', '#64B5F6', '#EF5350', '#81C784', '#FFB74D', '#BA68C8'],
        borderRadius: 12,
        barThickness: 50
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `${year}년 ${month + 1}월 감정 추이`,
          font: {
            size: 20,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// 이전 달, 다음 달 버튼
document.getElementById('prev').onclick = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentYear, currentMonth);
};

document.getElementById('next').onclick = () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonth);
};

// 일기 작성 모달
function openDiaryPrompt(dateKey) {
  const modal = document.getElementById('diaryModal');
  const modalDate = document.getElementById('modalDate');
  const diaryText = document.getElementById('diaryText');
  const saveBtn = document.getElementById('saveDiary');

  const prev = diaryData[dateKey]?.text || '';
  diaryText.value = prev;

  const [year, month, day] = dateKey.split('-');
  modalDate.textContent = `${year}년 ${month}월 ${day}일`;

  modal.style.display = 'flex';

  saveBtn.onclick = function () {
    const text = diaryText.value;
    const emotion = analyzeEmotion(text);
    diaryData[dateKey] = { text, emotion };
    localStorage.setItem('diary', JSON.stringify(diaryData));
    renderCalendar(currentYear, currentMonth);
    modal.style.display = 'none';
  };
}

// 모달 외부 클릭 시 닫기
window.onclick = function (event) {
  const modal = document.getElementById('diaryModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

// 초기 렌더링
renderCalendar(currentYear, currentMonth);
