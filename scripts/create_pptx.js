const pptxgen = require("pptxgenjs");

// ── Nordic Modern Palette ─────────────────────────────────────────────────
const C = {
  dark: "2B3A4E",
  light: "F4F1EB",
  accent: "7BA58F",
  accentDark: "5B8C7A",
  text: "2D3436",
  muted: "636E72",
  white: "FFFFFF",
  card: "FFFFFF",
  cardBorder: "E8E4DE",
  chart1: "7BA58F",
  chart2: "2B3A4E",
  chart3: "D4A574",
  chart4: "A8D5BA",
  chart5: "E8B4B8",
};

const FONT = { title: "Georgia", body: "Calibri" };

// ── Helpers ────────────────────────────────────────────────────────────────
function addFooter(slide, pageNum) {
  slide.addText(`${pageNum} / 15`, {
    x: 8.8, y: 5.2, w: 1, h: 0.3,
    fontSize: 9, fontFace: FONT.body, color: C.muted, align: "right",
  });
}

function addDarkFooter(slide, pageNum) {
  slide.addText(`${pageNum} / 15`, {
    x: 8.8, y: 5.2, w: 1, h: 0.3,
    fontSize: 9, fontFace: FONT.body, color: "8899AA", align: "right",
  });
}

function addSectionTitle(slide, title, y = 0.4) {
  slide.addText(title, {
    x: 0.7, y: y, w: 8.6, h: 0.5,
    fontSize: 28, fontFace: FONT.title, color: C.dark, bold: true, margin: 0,
  });
}

function addStatCard(slide, x, y, w, h, number, label, numColor) {
  slide.addShape(slide._slideLayout ? "rect" : "rect", {});
  slide.addShape("rect", {
    x: x, y: y, w: w, h: h,
    fill: { color: C.card },
    shadow: { type: "outer", blur: 4, offset: 1, angle: 135, color: "000000", opacity: 0.08 },
  });
  slide.addText(number, {
    x: x + 0.2, y: y + 0.15, w: w - 0.4, h: h * 0.55,
    fontSize: 32, fontFace: FONT.title, color: numColor || C.accent, bold: true, align: "center", valign: "bottom", margin: 0,
  });
  slide.addText(label, {
    x: x + 0.2, y: y + h * 0.55, w: w - 0.4, h: h * 0.4,
    fontSize: 11, fontFace: FONT.body, color: C.muted, align: "center", valign: "top", margin: 0,
  });
}

// ── Presentation ───────────────────────────────────────────────────────────
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "ABC-RAG";
pres.title = "Yes24 IT 모바일 베스트셀러 분석";

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 1: 표지
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.dark };
  // Decorative accent bar
  s.addShape("rect", { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.accent } });
  s.addText("YES24 IT\nMOBILE\nBESTSELLER", {
    x: 0.7, y: 0.8, w: 5, h: 2.8,
    fontSize: 40, fontFace: FONT.title, color: C.white, bold: true, lineSpacingMultiple: 1.1, margin: 0,
  });
  s.addText("독서 기획을 위한 시장 분석 리포트", {
    x: 0.7, y: 3.5, w: 5, h: 0.5,
    fontSize: 16, fontFace: FONT.body, color: C.accent, margin: 0,
  });
  s.addText("2026.07  |  데이터 기반 독서 기획", {
    x: 0.7, y: 4.2, w: 5, h: 0.4,
    fontSize: 12, fontFace: FONT.body, color: "8899AA", margin: 0,
  });
  // Right side decorative circle
  s.addShape("oval", { x: 7.0, y: 1.0, w: 3.5, h: 3.5, fill: { color: C.accent, transparency: 15 } });
  s.addShape("oval", { x: 7.8, y: 1.8, w: 2.0, h: 2.0, fill: { color: C.accent, transparency: 30 } });
  addDarkFooter(s, 1);
  s.addNotes(
    "안녕하세요. 오늘 발표는 Yes24 IT 모바일 베스트셀러 1,000권을 분석하여 독서 기획에 활용하기 위한 시장 분석 리포트입니다. " +
    "데이터는 2026년 7월 기준으로 수집되었으며, AI 시대의 IT 출판 시장 동향과 소비자 선호도를 파악하는 데 중점을 두었습니다. " +
    "표지 슬라이드입니다. 주목할 점은 2026년 현재 IT 출판 시장이 전례 없는 폭발적 성장을 보이고 있다는 것입니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 2: Executive Summary
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "Executive Summary");

  const insights = [
    { num: "40.9%", label: "AI 관련 도서 비중\n전체 베스트셀러의 2권 중 nearly 1권" },
    { num: "83권", label: "2026년 6월 출판\n월 최고 기록 (2025년 평균의 3배)" },
    { num: "30.4%", label: "제목에 'AI' 포함\n가장 흔한 키워드" },
    { num: "₩22,959", label: "평균 가격\n가격대: 5,625원 ~ 85,000원" },
    { num: "15.1%", label: "한빛미디어 점유율\n1위 출판사 (151권)" },
  ];

  insights.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.7 + col * 3.0;
    const y = 1.2 + row * 2.0;
    addStatCard(s, x, y, 2.7, 1.7, item.num, item.label, C.accent);
  });

  addFooter(s, 2);
  s.addNotes(
    "Executive Summary입니다. 핵심 인사이트 다섯 가지를 요약했습니다. " +
    "첫째, AI 관련 도서가 전체의 40.9%를 차지합니다. 둘째, 2026년 6월에 한 달에 83권이 출판되어 역대 최고 기록을 세웠습니다. " +
    "셋째, 제목에 'AI'가 포함된 도서가 30.4%로 가장 흔한 키워드입니다. " +
    "넷째, 평균 가격은 22,959원이며, 다섯째, 한빛미디어가 151권으로 시장 점유율 1위입니다. " +
    "이러한 데이터는 독서 기획 시 AI 트렌드를 반드시 반영해야 한다는 것을 보여줍니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 3: 데이터 개요
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "데이터 개요");

  // Big stat cards - 2x2 grid
  addStatCard(s, 0.7, 1.2, 4.0, 1.8, "1,000권", "수집된 IT 모바일 베스트셀러\nYes24 온라인 서점 기준", C.dark);
  addStatCard(s, 5.3, 1.2, 4.0, 1.8, "₩22,959", "평균 가격\n중앙값: ₩21,600", C.accent);
  addStatCard(s, 0.7, 3.3, 4.0, 1.8, "405권", "2026년 출판 (7월까지)\n전체의 40.5%", C.accentDark);
  addStatCard(s, 5.3, 3.3, 4.0, 1.8, "₩5,625 ~ ₩85,000", "가격 범위\n10권 중 8.5권이 1만~3만원", C.chart3);

  addFooter(s, 3);
  s.addNotes(
    "데이터 개요입니다. 분석 대상은 Yes24에서 수집한 IT 모바일 베스트셀러 1,000권입니다. " +
    "평균 가격은 22,959원이며, 중앙값은 21,600원으로 약간 낮습니다. " +
    "가격 범위는 5,625원부터 85,000원까지 다양합니다. " +
    "특히 주목할 점은 2026년 7월까지 405권이 출판되어 전체 데이터의 40.5%를 차지한다는 것입니다. " +
    "이는 IT 출판 시장이 2026년에 폭발적 성장을 보이고 있음을 시사합니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 4: 출판 트렌드
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "출판 트렌드: 연도별 변화");

  s.addChart(pres.charts.BAR, [{
    name: "출판 권수",
    labels: ["2020", "2021", "2022", "2023", "2024", "2025", "2026(7월)"],
    values: [18, 15, 47, 36, 122, 326, 405],
  }], {
    x: 0.7, y: 1.2, w: 8.6, h: 3.8,
    barDir: "col",
    chartColors: [C.accent],
    chartArea: { fill: { color: C.card }, roundedCorners: true },
    catAxisLabelColor: C.muted,
    valAxisLabelColor: C.muted,
    catAxisLabelFontSize: 10,
    valGridLine: { color: "E8E4DE", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelPosition: "outEnd",
    dataLabelColor: C.dark,
    dataLabelFontSize: 10,
    showLegend: false,
  });

  s.addText("2026년(7월까지) 405권 = 2024+2025 합계의 89%", {
    x: 0.7, y: 5.0, w: 8.6, h: 0.35,
    fontSize: 11, fontFace: FONT.body, color: C.accent, italic: true, margin: 0,
  });

  addFooter(s, 4);
  s.addNotes(
    "출판 트렌드 슬라이드입니다. 연도별 출판 권수를 보면 뚜렷한 폭발적 성장이 보입니다. " +
    "2020년 18권에서 2022년 47권으로 소폭 성장한 후, 2024년 122권으로 급증합니다. " +
    "2025년에는 326권으로 2.7배 성장했고, 2026년 7월까지 이미 405권이 출판되었습니다. " +
    "2026년의 405권은 2024년과 2025년을 합한 것의 89%에 해당합니다. " +
    "이러한 성장은 AI, 바이브 코딩, 생성형 AI 관련 도서의 수요 폭증과 직결됩니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 5: 출판사 시장 점유율
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "출판사 시장 점유율");

  s.addChart(pres.charts.BAR, [{
    name: "도서 수",
    labels: ["한빛미디어", "길벗", "이지스퍼블리싱", "커뮤니케이션북스", "골든래빗", "영진닷컴", "제이펍", "앤써북", "위키북스", "인사이트"],
    values: [151, 74, 55, 53, 47, 44, 36, 33, 26, 23],
  }], {
    x: 0.7, y: 1.2, w: 5.5, h: 4.0,
    barDir: "bar",
    chartColors: [C.accent],
    chartArea: { fill: { color: C.card }, roundedCorners: true },
    catAxisLabelColor: C.text,
    valAxisLabelColor: C.muted,
    catAxisLabelFontSize: 10,
    valGridLine: { color: "E8E4DE", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelPosition: "outEnd",
    dataLabelColor: C.dark,
    dataLabelFontSize: 9,
    showLegend: false,
  });

  // Right side insight box
  s.addShape("rect", {
    x: 6.5, y: 1.5, w: 3.0, h: 3.2,
    fill: { color: C.dark },
  });
  s.addText([
    { text: "핵심 인사이트\n", options: { fontSize: 14, bold: true, color: C.accent, breakLine: true } },
    { text: "\n", options: { fontSize: 6, breakLine: true } },
    { text: "한빛미디어가 1위\n151권 (15.1%)\n\n", options: { fontSize: 12, color: C.white, breakLine: true } },
    { text: "2위 길벗의 2배 이상\n\n", options: { fontSize: 11, color: "AABBCC", breakLine: true } },
    { text: "Top 5 출판사가\n전체의 38% 점유", options: { fontSize: 11, color: "AABBCC" } },
  ], {
    x: 6.7, y: 1.7, w: 2.6, h: 2.8, fontFace: FONT.body, margin: 0,
  });

  addFooter(s, 5);
  s.addNotes(
    "출판사 시장 점유율입니다. 한빛미디어가 151권으로 압도적 1위입니다. " +
    "2위 길벗(74권)의 2배 이상이며, 시장 점유율 15.1%를 차지합니다. " +
    "Top 5 출판사가 전체의 38%를 점유하고 있어 시장이 상당히 집중되어 있습니다. " +
    "골든래빗은 47권으로 5위이지만, 2026년에는 2위로 부상했습니다. " +
    "독서 기획 시 이 출판사들의 전략과 트렌드를 참고하는 것이 중요합니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 6: 가격 분포 분석
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "가격 분포 분석");

  s.addChart(pres.charts.BAR, [{
    name: "도서 수",
    labels: ["1만원 미만", "1만~2만원", "2만~3만원", "3만~4만원", "4만원 이상"],
    values: [5, 404, 445, 118, 28],
  }], {
    x: 0.7, y: 1.2, w: 5.5, h: 3.5,
    barDir: "col",
    chartColors: [C.chart4, C.accent, C.accentDark, C.chart3, C.chart5],
    chartArea: { fill: { color: C.card }, roundedCorners: true },
    catAxisLabelColor: C.muted,
    valAxisLabelColor: C.muted,
    catAxisLabelFontSize: 9,
    valGridLine: { color: "E8E4DE", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelPosition: "outEnd",
    dataLabelColor: C.dark,
    dataLabelFontSize: 10,
    showLegend: false,
  });

  // Right side stats
  s.addShape("rect", {
    x: 6.5, y: 1.2, w: 3.0, h: 3.8,
    fill: { color: C.card },
    shadow: { type: "outer", blur: 4, offset: 1, angle: 135, color: "000000", opacity: 0.08 },
  });

  const priceStats = [
    { label: "84.9%", desc: "1만~3만원대" },
    { label: "₩18,000", desc: "25번째 백분위" },
    { label: "₩21,600", desc: "중앙값" },
    { label: "₩26,600", desc: "75번째 백분위" },
    { label: "2.8%", desc: "4만원 이상" },
  ];

  priceStats.forEach((item, i) => {
    s.addText(item.label, {
      x: 6.7, y: 1.35 + i * 0.7, w: 1.2, h: 0.35,
      fontSize: 16, fontFace: FONT.title, color: C.accent, bold: true, align: "left", margin: 0,
    });
    s.addText(item.desc, {
      x: 7.9, y: 1.35 + i * 0.7, w: 1.4, h: 0.35,
      fontSize: 10, fontFace: FONT.body, color: C.muted, align: "left", valign: "middle", margin: 0,
    });
    if (i < priceStats.length - 1) {
      s.addShape("rect", {
        x: 6.7, y: 1.7 + i * 0.7, w: 2.6, h: 0.01,
        fill: { color: C.cardBorder },
      });
    }
  });

  addFooter(s, 6);
  s.addNotes(
    "가격 분포 분석입니다. IT 모바일 베스트셀러의 가격은 1만~3만원대에高度集中되어 있습니다. " +
    "1만~2만원대가 404권(40.4%), 2만~3만원대가 445권(44.5%)으로 전체의 84.9%를 차지합니다. " +
    "3만~4만원대는 118권(11.8%), 4만원 이상은 28권(2.8%)에 불과합니다. " +
    "평균 가격은 22,959원이며, 중앙값은 21,600원입니다. " +
    "독서 기획 시 가격대는 18,000원~25,000원이 가장 적합한 범위입니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 7: 키워드 트렌드
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "키워드 트렌드: 도서명 분석");

  const keywords = [
    { word: "AI", count: 304, pct: "30.4%" },
    { word: "코딩", count: 59, pct: "5.9%" },
    { word: "GPT", count: 46, pct: "4.6%" },
    { word: "디자인", count: 45, pct: "4.5%" },
    { word: "입문", count: 42, pct: "4.2%" },
    { word: "만들기", count: 38, pct: "3.8%" },
    { word: "바이브", count: 37, pct: "3.7%" },
    { word: "수업", count: 35, pct: "3.5%" },
    { word: "파이썬", count: 35, pct: "3.5%" },
    { word: "데이터", count: 35, pct: "3.5%" },
  ];

  // Bar chart for keywords
  s.addChart(pres.charts.BAR, [{
    name: "빈도",
    labels: keywords.map(k => k.word),
    values: keywords.map(k => k.count),
  }], {
    x: 0.7, y: 1.2, w: 5.5, h: 4.0,
    barDir: "bar",
    chartColors: [C.accent],
    chartArea: { fill: { color: C.card }, roundedCorners: true },
    catAxisLabelColor: C.text,
    valAxisLabelColor: C.muted,
    catAxisLabelFontSize: 10,
    valGridLine: { color: "E8E4DE", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelPosition: "outEnd",
    dataLabelColor: C.dark,
    dataLabelFontSize: 9,
    showLegend: false,
  });

  // Right side categories
  s.addShape("rect", {
    x: 6.5, y: 1.2, w: 3.0, h: 3.8,
    fill: { color: C.dark },
  });
  s.addText([
    { text: "키워드 클러스터\n\n", options: { fontSize: 13, bold: true, color: C.accent, breakLine: true } },
    { text: "1. AI / 생성형 AI\n   AI, GPT, 바이브\n\n", options: { fontSize: 11, color: C.white, breakLine: true } },
    { text: "2. 프로그래밍\n   코딩, 파이썬, 만들기\n\n", options: { fontSize: 11, color: "AABBCC", breakLine: true } },
    { text: "3. 교육 / 입문\n   입문, 수업, 배우는\n\n", options: { fontSize: 11, color: "AABBCC", breakLine: true } },
    { text: "4. 디자인 / 실습\n   디자인, 가이드", options: { fontSize: 11, color: "AABBCC" } },
  ], {
    x: 6.7, y: 1.4, w: 2.6, h: 3.4, fontFace: FONT.body, margin: 0,
  });

  addFooter(s, 7);
  s.addNotes(
    "키워드 트렌드입니다. 도서명에서 추출한 주요 키워드를 분석했습니다. " +
    "'AI'가 304번으로 압도적 1위이며, 전체의 30.4%에서 등장합니다. " +
    "2위 '코딩'은 59번, 3위 'GPT'는 46번입니다. " +
    "이 키워드들은 크게 4개의 클러스터로 분류됩니다: AI/생성형 AI, 프로그래밍, 교육/입문, 디자인/실습입니다. " +
    "특히 '바이브'(37번)는 바이브 코딩 트렌드를 반영하는 새로운 키워드입니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 8: AI 도구별 현황
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "AI 도구별 도서 현황");

  s.addChart(pres.charts.BAR, [{
    name: "도서 수",
    labels: ["챗GPT", "바이브코딩", "제미나이", "클로드", "엑셀", "캔바", "커서", "노션"],
    values: [50, 36, 35, 30, 28, 15, 8, 8],
  }], {
    x: 0.7, y: 1.2, w: 8.6, h: 3.5,
    barDir: "col",
    chartColors: [C.accent, C.chart3, C.chart2, C.accentDark, C.chart4, C.chart5, C.muted, C.muted],
    chartArea: { fill: { color: C.card }, roundedCorners: true },
    catAxisLabelColor: C.text,
    valAxisLabelColor: C.muted,
    catAxisLabelFontSize: 10,
    valGridLine: { color: "E8E4DE", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelPosition: "outEnd",
    dataLabelColor: C.dark,
    dataLabelFontSize: 10,
    showLegend: false,
  });

  s.addText("챗GPT가 1위지만, 바이브코딩+클로드가 빠르게 성장 중", {
    x: 0.7, y: 4.9, w: 8.6, h: 0.35,
    fontSize: 11, fontFace: FONT.body, color: C.accent, italic: true, margin: 0,
  });

  addFooter(s, 8);
  s.addNotes(
    "AI 도구별 도서 현황입니다. 챗GPT 관련 도서가 50권으로 1위이지만, " +
    "바이브코딩(36권), 제미나이(35권), 클로드(30권)가 뒤를 잇고 있습니다. " +
    "바이브코딩은 Claude를 활용한 AI 코딩 방식으로, 2026년 가장 빠르게 성장하는 트렌드입니다. " +
    "엑셀(28권)은 여전히 강세를 보이며, 캔바(15권), 커서(8권), 노션(8권) 등 생산성 도구도 주목받고 있습니다. " +
    "독서 기획 시 다중 도구를 다루는 것이 인기 있는 포맷입니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 9: 카테고리 분석
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "카테고리 분석");

  s.addChart(pres.charts.PIE, [{
    name: "카테고리",
    labels: ["AI 관련", "프로그래밍", "교육", "디자인", "기타"],
    values: [409, 166, 86, 76, 263],
  }], {
    x: 0.7, y: 1.2, w: 4.5, h: 3.8,
    showPercent: true,
    showTitle: false,
    chartColors: [C.accent, C.chart2, C.chart3, C.chart5, C.muted],
    chartArea: { fill: { color: C.card }, roundedCorners: true },
    dataLabelColor: C.dark,
    dataLabelFontSize: 10,
    legendPos: "b",
    legendFontSize: 10,
  });

  // Right side details
  const cats = [
    { name: "AI 관련", count: "409권", pct: "40.9%", color: C.accent, desc: "AI, ChatGPT, 생성형 AI, 바이브 코딩" },
    { name: "프로그래밍", count: "166권", pct: "16.6%", color: C.chart2, desc: "파이썬, 개발, 알고리즘" },
    { name: "교육", count: "86권", pct: "8.6%", color: C.chart3, desc: "교사, 수업, 학교" },
    { name: "디자인", count: "76권", pct: "7.6%", color: C.chart5, desc: "포토샵, 피그마, 캔바" },
  ];

  cats.forEach((cat, i) => {
    const y = 1.3 + i * 0.95;
    s.addShape("rect", {
      x: 5.5, y: y, w: 0.08, h: 0.7,
      fill: { color: cat.color },
    });
    s.addText(cat.name, {
      x: 5.8, y: y, w: 1.5, h: 0.35,
      fontSize: 12, fontFace: FONT.body, color: C.dark, bold: true, margin: 0,
    });
    s.addText(cat.count + " (" + cat.pct + ")", {
      x: 7.3, y: y, w: 1.5, h: 0.35,
      fontSize: 11, fontFace: FONT.body, color: C.accent, bold: true, margin: 0,
    });
    s.addText(cat.desc, {
      x: 5.8, y: y + 0.35, w: 3.5, h: 0.3,
      fontSize: 9, fontFace: FONT.body, color: C.muted, margin: 0,
    });
  });

  addFooter(s, 9);
  s.addNotes(
    "카테고리 분석입니다. AI 관련 도서가 409권으로 전체의 40.9%를 차지하며, " +
    "프로그래밍(166권, 16.6%), 교육(86권, 8.6%), 디자인(76권, 7.6%)이 뒤를 잇습니다. " +
    "AI 관련 도서가 전체의 40%를 넘어서는 것은 매우 인상적인 수치입니다. " +
    "교육 카테고리(8.6%)는 교사 대상 AI 활용 도서가 주를 이루며, " +
    "디자인 카테고리는 캔바, 포토샵, 피그마 등 실용적 디자인 도구가 인기입니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 10: 베스트셀러 Top 5
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "베스트셀러 Top 5");

  const top5 = [
    { rank: "1", title: "바로바로 클로드 with\n코워크, 스킬, 클로드 코드", author: "차진우", pub: "골든래빗", price: "25,200원" },
    { rank: "2", title: "혼자 공부하는\n바이브 코딩 with 클로드 코드", author: "조태호", pub: "한빛미디어", price: "27,000원" },
    { rank: "3", title: "뚝딱 바로 써먹는\nAI 3대장 챗GPT/제미나이/클로드", author: "코리아교육그룹", pub: "안경다리BOOKS", price: "19,800원" },
    { rank: "4", title: "이게 되네?\n제미나이 완전 미친 활용법 81제", author: "이찬", pub: "골든래빗", price: "21,600원" },
    { rank: "5", title: "요즘 교사를 위한\n에듀테크 5대장", author: "안익재, 황의태", pub: "앤써북", price: "17,820원" },
  ];

  top5.forEach((book, i) => {
    const y = 1.1 + i * 0.88;
    // Rank circle
    s.addShape("oval", {
      x: 0.7, y: y + 0.1, w: 0.55, h: 0.55,
      fill: { color: i === 0 ? C.accent : C.dark },
    });
    s.addText(book.rank, {
      x: 0.7, y: y + 0.1, w: 0.55, h: 0.55,
      fontSize: 16, fontFace: FONT.title, color: C.white, bold: true, align: "center", valign: "middle", margin: 0,
    });
    // Book info
    s.addText(book.title, {
      x: 1.5, y: y, w: 4.0, h: 0.75,
      fontSize: 12, fontFace: FONT.body, color: C.dark, bold: true, valign: "middle", margin: 0,
    });
    s.addText(`${book.author}  |  ${book.pub}`, {
      x: 5.7, y: y, w: 2.5, h: 0.75,
      fontSize: 10, fontFace: FONT.body, color: C.muted, valign: "middle", margin: 0,
    });
    s.addText(book.price, {
      x: 8.3, y: y, w: 1.2, h: 0.75,
      fontSize: 11, fontFace: FONT.body, color: C.accent, bold: true, align: "right", valign: "middle", margin: 0,
    });
    // Divider
    if (i < 4) {
      s.addShape("rect", {
        x: 0.7, y: y + 0.82, w: 8.6, h: 0.01,
        fill: { color: C.cardBorder },
      });
    }
  });

  addFooter(s, 10);
  s.addNotes(
    "베스트셀러 Top 5입니다. 1위는 '바로바로 클로드 with 코워크, 스킬, 클로드 코드'로, " +
    "Claude 생태계를 다룬 도서입니다. 2위는 '혼자 공부하는 바이브 코딩 with 클로드 코드'로, " +
    "바이브 코딩 트렌드를 반영합니다. 3위는 'AI 3대장'으로 챗GPT, 제미나이, 클로드를 비교합니다. " +
    "4위는 '제미나이 완전 미친 활용법', 5위는 '요즘 교사를 위한 에듀테크'입니다. " +
    "Top 5 모두 AI 관련 도서이며, 다중 도구를 다루는 것이 인기 포맷입니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 11: 출판사별 가격 전략
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "출판사별 가격 전략");

  // Price positioning grid
  const tiers = [
    { label: "프리미엄\n23,000원~28,000원", x: 0.7, publishers: "한빛미디어 (₩25,741)\n골든래빗 (₩24,952)\n길벗 (₩23,264)", color: C.dark },
    { label: "미드레인지\n18,000원~22,000원", x: 3.7, publishers: "이지스퍼블리싱 (₩21,440)\n영진닷컴\n제이펍", color: C.accentDark },
    { label: "버짓\n12,000원~15,000원", x: 6.7, publishers: "커뮤니케이션북스 (₩13,940)\n앤써북\nBOOKK(부크크)", color: C.chart3 },
  ];

  tiers.forEach((tier) => {
    // Header
    s.addShape("rect", {
      x: tier.x, y: 1.2, w: 2.7, h: 0.9,
      fill: { color: tier.color },
    });
    s.addText(tier.label, {
      x: tier.x + 0.15, y: 1.25, w: 2.4, h: 0.8,
      fontSize: 12, fontFace: FONT.body, color: C.white, bold: true, align: "center", valign: "middle", margin: 0,
    });
    // Content
    s.addShape("rect", {
      x: tier.x, y: 2.1, w: 2.7, h: 2.5,
      fill: { color: C.card },
      shadow: { type: "outer", blur: 3, offset: 1, angle: 135, color: "000000", opacity: 0.06 },
    });
    s.addText(tier.publishers, {
      x: tier.x + 0.2, y: 2.3, w: 2.3, h: 2.1,
      fontSize: 11, fontFace: FONT.body, color: C.text, valign: "top", margin: 0,
    });
  });

  addFooter(s, 11);
  s.addNotes(
    "출판사별 가격 전략입니다. 시장은 크게 3개의 가격 티어로 나뉩니다. " +
    "프리미엄 티어(23,000~28,000원)에는 한빛미디어, 골든래빗, 길벗이 있습니다. " +
    "미드레인지(18,000~22,000원)에는 이지스퍼블리싱, 영진닷컴, 제이펍이 있습니다. " +
    "버짓(12,000~15,000원)에는 커뮤니케이션북스가 'AI와...' 시리즈로 저가 전략을 펼치고 있습니다. " +
    "독서 기획 시 이 가격 티어를 참고하여 적정 가격대를 설정하는 것이 중요합니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 12: 월별 출판 추이
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "월별 출판 추이: 2025 vs 2026");

  s.addChart(pres.charts.LINE, [
    {
      name: "2025",
      labels: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
      values: [23, 13, 17, 35, 25, 35, 24, 31, 33, 27, 32, 31],
    },
    {
      name: "2026",
      labels: ["1월", "2월", "3월", "4월", "5월", "6월", "7월"],
      values: [44, 40, 50, 66, 63, 83, 57],
    },
  ], {
    x: 0.7, y: 1.2, w: 8.6, h: 3.5,
    lineSize: 3,
    lineSmooth: true,
    chartColors: [C.muted, C.accent],
    chartArea: { fill: { color: C.card }, roundedCorners: true },
    catAxisLabelColor: C.muted,
    valAxisLabelColor: C.muted,
    catAxisLabelFontSize: 9,
    valGridLine: { color: "E8E4DE", size: 0.5 },
    catGridLine: { style: "none" },
    showLegend: true,
    legendPos: "t",
    legendFontSize: 10,
    showMarker: true,
  });

  s.addText("2026년 6월: 83권 (2025년 월평균의 3배)", {
    x: 0.7, y: 4.9, w: 8.6, h: 0.35,
    fontSize: 11, fontFace: FONT.body, color: C.accent, italic: true, margin: 0,
  });

  addFooter(s, 12);
  s.addNotes(
    "월별 출판 추이 비교입니다. 2025년은 월평균 약 27권이 출판되었으나, " +
    "2026년에는 급격한 증가 추세를 보입니다. " +
    "2026년 1월 44권, 2월 40권, 3월 50권, 4월 66권, 5월 63권, 6월 83권으로 지속적 성장입니다. " +
    "6월 83권은 2025년 월평균의 3배에 해당합니다. " +
    "이러한 트렌드는 2026년 하반기에도 지속될 것으로 예상됩니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 13: 시장 인사이트
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "시장 인사이트: 핵심 패턴 10가지");

  const insights = [
    "AI 쓰나미: 40.9%가 AI 관련 도서",
    "바이브 코딩: 36권, 가장 빠르게 성장하는 트렌드",
    "클로드 생태계: 30권, 1위 베스트셀러가 Claude 도서",
    "교육 시장: 86권, 교사 대상 AI 활용 콘텐츠 수요",
    "6월 피크: 83권, 역대 월 최고 기록",
    "가격 천장: 84.9%가 3만원 미만",
    "한빛미디어 독주: 151권, 시장 점유율 15.1%",
    "자기출판 부상: BOOKK 18권, IT 콘텐츠 민주화",
    "'미친 활용법' 공식: 실용서 제목 공식",
    "멀티도구 도서: Top 5 모두 복수 AI 도구 다룸",
  ];

  // Two columns of insights
  insights.forEach((insight, i) => {
    const col = i < 5 ? 0 : 1;
    const row = i < 5 ? i : i - 5;
    const x = 0.7 + col * 4.5;
    const y = 1.2 + row * 0.82;

    s.addShape("oval", {
      x: x, y: y + 0.1, w: 0.4, h: 0.4,
      fill: { color: C.accent },
    });
    s.addText(String(i + 1), {
      x: x, y: y + 0.1, w: 0.4, h: 0.4,
      fontSize: 11, fontFace: FONT.body, color: C.white, bold: true, align: "center", valign: "middle", margin: 0,
    });
    s.addText(insight, {
      x: x + 0.55, y: y, w: 3.8, h: 0.6,
      fontSize: 11, fontFace: FONT.body, color: C.text, valign: "middle", margin: 0,
    });
  });

  addFooter(s, 13);
  s.addNotes(
    "시장 인사이트 10가지입니다. " +
    "첫째, AI 쓰나미: 40.9%가 AI 관련 도서입니다. " +
    "둘째, 바이브 코딩이 36권으로 가장 빠르게 성장하는 트렌드입니다. " +
    "셋째, 클로드 생태계가 30권이며, 1위 베스트셀러가 Claude 도서입니다. " +
    "넷째, 교육 시장이 86권으로 교사 대상 AI 활용 콘텐츠 수요가 높습니다. " +
    "다섯째, 6월에 83권이 출판되어 역대 월 최고 기록을 세웠습니다. " +
    "여섯째, 84.9%가 3만원 미만입니다. " +
    "일곱째, 한빛미디어가 151권으로 시장 점유율 15.1%입니다. " +
    "여덟째, BOOKK이 18권으로 자기출판이 부상하고 있습니다. " +
    "아홉째, '미친 활용법'이 실용서 제목 공식입니다. " +
    "열째, Top 5 모두 복수 AI 도구를 다루고 있습니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 14: 신규 기획 제안
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTitle(s, "신규 독서 기획 제안");

  const recs = [
    { icon: "01", title: "클로드 생태계 집중", desc: "Code, COWORK, MCP 다루기" },
    { icon: "02", title: "4~6월 출간 전략", desc: "역대 최고 출판 시즌 활용" },
    { icon: "03", title: "가격 19,800~25,200원", desc: "85%가 속하는 가격대" },
    { icon: "04", title: "멀티도구 포맷", desc: "3개 이상 AI 도구 비교/활용" },
    { icon: "05", title: "바이브 코딩 입문서", desc: "36권 수요, 성장 잠재력" },
    { icon: "06", title: "교육 크로스오버", desc: "교사 대상 AI 활용 (86권 시장)" },
  ];

  recs.forEach((rec, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.7 + col * 3.0;
    const y = 1.2 + row * 2.0;

    s.addShape("rect", {
      x: x, y: y, w: 2.7, h: 1.7,
      fill: { color: C.card },
      shadow: { type: "outer", blur: 4, offset: 1, angle: 135, color: "000000", opacity: 0.08 },
    });
    s.addText(rec.icon, {
      x: x + 0.2, y: y + 0.15, w: 0.5, h: 0.4,
      fontSize: 20, fontFace: FONT.title, color: C.accent, bold: true, margin: 0,
    });
    s.addText(rec.title, {
      x: x + 0.2, y: y + 0.6, w: 2.3, h: 0.4,
      fontSize: 13, fontFace: FONT.body, color: C.dark, bold: true, margin: 0,
    });
    s.addText(rec.desc, {
      x: x + 0.2, y: y + 1.05, w: 2.3, h: 0.4,
      fontSize: 10, fontFace: FONT.body, color: C.muted, margin: 0,
    });
  });

  addFooter(s, 14);
  s.addNotes(
    "신규 독서 기획 제안입니다. " +
    "첫째, 클로드 생태계에 집중하세요. Code, COWORK, MCP를 다루는 도서가 1위입니다. " +
    "둘째, 4~6월 출간을 권합니다. 이 시기가 역대 최고 출판 시즌입니다. " +
    "셋째, 가격은 19,800~25,200원으로 설정하세요. 85%가 이 범위에 속합니다. " +
    "넷째, 멀티도구 포맷을 사용하세요. 3개 이상 AI 도구를 비교/활용하는 것이 인기입니다. " +
    "다섯째, 바이브 코딩 입문서를 기획하세요. 36권의 수요와 성장 잠재력이 있습니다. " +
    "여섯째, 교육 크로스오버를 고려하세요. 교사 대상 AI 활용 시장이 86권입니다."
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 15: 엔딩
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.dark };
  s.addShape("rect", { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.accent } });

  s.addText("감사합니다", {
    x: 0.7, y: 1.5, w: 5, h: 1.2,
    fontSize: 44, fontFace: FONT.title, color: C.white, bold: true, margin: 0,
  });
  s.addText("질문이 있으시면 말씀해 주세요", {
    x: 0.7, y: 2.8, w: 5, h: 0.5,
    fontSize: 16, fontFace: FONT.body, color: C.accent, margin: 0,
  });
  s.addText("데이터: Yes24 IT 모바일 베스트셀러 1,000권\n분석일: 2026년 7월", {
    x: 0.7, y: 3.8, w: 5, h: 0.8,
    fontSize: 12, fontFace: FONT.body, color: "8899AA", margin: 0,
  });

  // Decorative circles
  s.addShape("oval", { x: 7.0, y: 1.0, w: 3.5, h: 3.5, fill: { color: C.accent, transparency: 15 } });
  s.addShape("oval", { x: 7.8, y: 1.8, w: 2.0, h: 2.0, fill: { color: C.accent, transparency: 30 } });

  addDarkFooter(s, 15);
  s.addNotes(
    "마지막 슬라이드입니다. 감사합니다. " +
    "오늘 발표는 Yes24 IT 모바일 베스트셀러 1,000권을 분석한 결과였습니다. " +
    "핵심은 AI 관련 도서가 전체의 40.9%를 차지하며, 바이브 코딩과 Claude 생태계가 가장 빠르게 성장하고 있다는 것입니다. " +
    "독서 기획 시 이러한 트렌드를 반영하여, 적정 가격대(19,800~25,200원)와 출간 시기(4~6월)를 고려하시기 바랍니다. " +
    "질문이 있으시면 말씀해 주세요. 감사합니다."
  );
}

// ── Save ───────────────────────────────────────────────────────────────────
const outPath = "data/yes24_analysis.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("PPTX 생성 완료:", outPath);
}).catch(err => {
  console.error("PPTX 생성 실패:", err);
});
