// 주요 변수 설정
const calendar = document.getElementById('calendar');//html에 있는 canlendar를 가져옴 
//현재 컴퓨터 기준으로 연도와 월을 가져옴
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
//감정 키워드
const emotionKeywords = {
  '행복': ['행복'],
  '기쁨': ['기쁨', '기쁘다', '기뻐', '기뻤다'],
  '즐거움': ['즐거움', '즐겁다', '즐거웠어','재미','재밌'],
  '설렘': ['설렘', '설레다', '설렜어'],
  '감사': ['감사', '고맙다'],
  '사랑': ['사랑'],
  '평온': ['평온', '차분하다'],
  '자신감': ['자신감', '자신 있다', '할 수 있다'],
  '뿌듯함': ['뿌듯'],
  '만족': ['만족'],
  '슬픔': ['슬픔', '슬프다', '슬펐', '눈물', '눈물이 났다','슬픈'],
  '우울': ['우울'],
  '불안': ['불안'],
  '외로움': ['외롭다', '외로웠어', '혼자'],
  '후회': ['후회'],
  '무기력': ['무기력', '힘이 없다'],
  '지침': ['지치다', '지쳤어', '힘들다','힘든'],
  '피곤': ['피곤하다', '피곤해', '졸려'],
  '화남': ['화', '열받아'],
  '짜증': ['짜증'],
  '분노': ['분노', '폭발'],
  '실망': ['실망'],
  '답답함': ['답답'],
  '긴장': ['긴장', '떨린다'],
  '놀람': ['놀라다', '깜짝', '놀랐'],
  '혼란': ['혼란', '복잡해'],
  '멍함': ['멍하다', '머리가 하얘짐'],
  '그냥': ['그냥', '무난하다', '평범했다']
};
//이모지 선언
const emotionMap = {
  '행복': '😊', '기쁨': '😄', '즐거움': '😁', '설렘': '😍',
  '감사': '🙏', '사랑': '❤️', '평온': '😌', '자신감': '💪',
  '뿌듯함': '🤗', '만족': '😋',
  '슬픔': '😢', '우울': '😞', '불안': '😟', '외로움': '😔',
  '후회': '😣', '무기력': '🥱', '지침': '😩', '피곤': '😪', '실망': '😑',
  '화남': '😠', '짜증': '😤', '분노': '😡', '답답함': '😣',
  '긴장': '😬', '놀람': '😲', '혼란': '😵', '멍함': '😶',
  '그냥': '🤔', '기타': '✍️'
};
//차트 카테고리색상
const emotionCategoryColors = {
  '긍정': '#FFD54F',
  '부정': '#90CAF9',
  '분노': '#EF5350',
  '긴장': '#BA68C8',
  '기타': '#BDBDBD'
};
//카테고리 분류
function getEmotionCategory(emotion) {
  if (['행복', '기쁨', '즐거움', '설렘', '감사', '사랑', '평온', '자신감', '뿌듯함', '만족'].includes(emotion)) return '긍정';
  if (['슬픔', '우울', '불안', '외로움', '후회', '무기력', '지침', '피곤', '실망'].includes(emotion)) return '부정';
  if (['화남', '짜증', '분노', '답답함'].includes(emotion)) return '분노';
  if (['긴장', '놀람', '혼란', '멍함', '피곤'].includes(emotion)) return '긴장';
  return '기타';
}
//저장된 일기 불러오기  저장된게 없으면 {}빈 객체로 초기화
let diaryData = JSON.parse(localStorage.getItem('diary')) || {};
let emotionChart = null;
//달력 만들기
function renderCalendar(year, month) {
  //요일,달 계산
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  calendar.innerHTML = '';
  //만들기
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'day';
    blank.style.visibility = 'hidden';
    calendar.appendChild(blank);
  }
  //날짜 셀 만들기
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.textContent = day;
    //해당 날짜에 감정 일기가 있는지 확인
    const dateKey = `${year}-${month + 1}-${day}`;
    const entry = diaryData[dateKey];
    //이모지 삽입
    if (entry && entry.emotion) {
      const emoji = document.createElement('span');
      emoji.className = 'emoji';
      emoji.textContent = emotionMap[entry.emotion] || '✍️';
      cell.appendChild(emoji);
    }
    //날짜 클릭시 입력창 실행
    cell.onclick = () => openDiaryPrompt(dateKey);
    calendar.appendChild(cell);
  }

  document.getElementById('monthText').textContent = `${year}년 ${month + 1}월`;

}
//감정 분석 함수
//사용자가 입력한 일기 내용을 감정 키워드 목록과 비교해서 해당 감정을 찾아 반환
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
//차트 그리기 함수
function renderChart(year, month) {
  //초기화
  const count = {
    긍정: 0,
    부정: 0,
    분노: 0,
    긴장: 0,
    기타: 0
  };

  const detailCount = {
    긍정: {},
    부정: {},
    분노: {},
    긴장: {},
    기타: {}
  };
  //감정 카운트
  //일기 날짜가 현재 연도/월이면 그 감정을 해당 카테고리로 셈
  for (const key in diaryData) {
    const [entryYear, entryMonth] = key.split('-').map(Number);
    if (entryYear === year && entryMonth === (month + 1)) {
      const emotion = diaryData[key].emotion;
      const category = getEmotionCategory(emotion);
      count[category]++;

      if (!detailCount[category][emotion]) {
        detailCount[category][emotion] = 0;
      }
      detailCount[category][emotion]++;
    }
  }
//차트 그리기
//이미 차트가 있으면 제거하고 새로 그림
  const ctx = document.getElementById('emotionChart').getContext('2d');
  if (emotionChart) {
    emotionChart.destroy();
  }
//차트 옵션에서 
//ctx란? 2D그리기 도구 
  emotionChart = new Chart(ctx, {
    //막대 그래프
    type: 'bar',
    data: {
      //labels:X축에 표시될 카테고리 이름
      labels: ['😊 긍정', '😢 부정', '😠 분노', '😨 긴장', '🤔 기타'],
      //ㅅ실제 막대그래프에 들어갈 값
      datasets: [{
        data: [count.긍정, count.부정, count.분노, count.긴장, count.기타],
        //색 가져옴 emotionCategoryColors에서
        backgroundColor: [
          emotionCategoryColors['긍정'],
          emotionCategoryColors['부정'],
          emotionCategoryColors['분노'],
          emotionCategoryColors['긴장'],
          emotionCategoryColors['기타']
        ],
        borderRadius: 12, //막대 둥글게 처리
        barThickness: 50  //막대 굴기 설정
      }]
    },
    options: {
      //반응형 디자인(화면 크기에 맞게 차트 크기 자동 조정)
      responsive: true,
      //차트 제목표시 
      //현재 연도와 월을 넣어줌 ex)2025년 6월 감정 통계
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `${year}년 ${month + 1}월 감정 통계`,
          font: {
            size: 20,
            weight: 'bold'
          }
        },
        //마우스를 그래프에 올렸을때 감정이 뜸
        tooltip: {
          callbacks: {
            label: function (context) {
              const categoryLabels = ['긍정', '부정', '분노', '긴장', '기타'];
              const category = categoryLabels[context.dataIndex];
              const details = detailCount[category];
              //해당 카테고리에 감정이 없으면 "없음"표시
              if (!details || Object.keys(details).length === 0) {
                return `${category}: 없음`;
              }

              return `${category} 감정:\n` + Object.entries(details)
                .map(([emotion, value]) => `• ${emotion}: ${value}`)
                .join('\n');
            }
          }
        }
      },
      //y축은 0부터 시작, 눈금 간격 1
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}


//월 이동 
//prev 번튼 클릭시 ->월 감소
//1월에서 이전달로 가면->연도도 감소
document.getElementById('prev').onclick = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentYear, currentMonth);
  renderChart(currentYear, currentMonth); 
};
//next도 동일 방식
document.getElementById('next').onclick = () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonth);
  renderChart(currentYear, currentMonth); 
};

//일기 입력 모달 열기
//클릭된 날짜를 기준으로 모달 팝업을 열고
//기존에 저장된 일기 있으면 미리 입력되게 함
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
  //저장 버튼 클릭시:
  saveBtn.onclick = function () {
    //텍스트 입력 읽기
    const text = diaryText.value;
    const emotion = analyzeEmotion(text);
    //감정 분석
    diaryData[dateKey] = { text, emotion };
    //로컬에 저장
    localStorage.setItem('diary', JSON.stringify(diaryData));
    //달력과 차트 다시 그림
    renderCalendar(currentYear, currentMonth);
    renderChart(currentYear, currentMonth);
    //닫음
    modal.style.display = 'none';
  };
}
//모달 닫기 기능
//모달 바깥을 클릭하면 모달이 꺼지도록
window.onclick = function (event) {
  const modal = document.getElementById('diaryModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};
//페이지 처음 열릴때 
//처음 페이지가 로딩될 때 현재 월 기준으로 달력과 차트 출력
renderCalendar(currentYear, currentMonth);
renderChart(currentYear, currentMonth);

