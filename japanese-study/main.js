// ===== 문제 데이터 =====
// q: 문제(일본어), a: 정답(발음/뜻), label: 문제 안내문
const QUESTIONS = {
    hiragana: [
        { q: "あ", a: "a" }, { q: "い", a: "i" }, { q: "う", a: "u" },
        { q: "え", a: "e" }, { q: "お", a: "o" }, { q: "か", a: "ka" },
        { q: "き", a: "ki" }, { q: "く", a: "ku" }, { q: "け", a: "ke" },
        { q: "こ", a: "ko" }, { q: "さ", a: "sa" }, { q: "し", a: "shi" },
        { q: "す", a: "su" }, { q: "せ", a: "se" }, { q: "そ", a: "so" },
        { q: "た", a: "ta" }, { q: "ち", a: "chi" }, { q: "つ", a: "tsu" },
        { q: "な", a: "na" }, { q: "に", a: "ni" }, { q: "は", a: "ha" },
        { q: "ひ", a: "hi" }, { q: "ま", a: "ma" }, { q: "や", a: "ya" },
        { q: "ら", a: "ra" }, { q: "わ", a: "wa" }, { q: "ん", a: "n" },
    ],
    word: [
        { q: "水（みず）", a: "물" }, { q: "猫（ねこ）", a: "고양이" },
        { q: "犬（いぬ）", a: "개" }, { q: "本（ほん）", a: "책" },
        { q: "車（くるま）", a: "자동차" }, { q: "学校（がっこう）", a: "학교" },
        { q: "先生（せんせい）", a: "선생님" }, { q: "友達（ともだち）", a: "친구" },
        { q: "食べ物（たべもの）", a: "음식" }, { q: "時間（じかん）", a: "시간" },
        { q: "家（いえ）", a: "집" }, { q: "空（そら）", a: "하늘" },
        { q: "花（はな）", a: "꽃" }, { q: "雨（あめ）", a: "비" },
        { q: "山（やま）", a: "산" }, { q: "海（うみ）", a: "바다" },
    ],
    greeting: [
        { q: "おはよう", a: "안녕(아침 인사)" },
        { q: "こんにちは", a: "안녕하세요(낮 인사)" },
        { q: "こんばんは", a: "안녕하세요(밤 인사)" },
        { q: "ありがとう", a: "고마워" },
        { q: "すみません", a: "죄송합니다" },
        { q: "さようなら", a: "안녕히 가세요" },
        { q: "はじめまして", a: "처음 뵙겠습니다" },
        { q: "いただきます", a: "잘 먹겠습니다" },
        { q: "おやすみ", a: "잘 자" },
        { q: "おねがいします", a: "부탁합니다" },
    ],
};

const LABELS = {
    hiragana: "다음 글자의 발음(로마자)은?",
    word: "다음 단어의 뜻은?",
    greeting: "다음 인사말의 뜻은?",
};

// ===== 상태 =====
let settings = { category: "hiragana", mode: "choice", count: 5 };
let quiz = [];
let current = 0;
let score = 0;

// ===== 유틸 =====
function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function getPool(category) {
    if (category === "all") {
        return Object.keys(QUESTIONS).flatMap((cat) =>
            QUESTIONS[cat].map((item) => ({ ...item, category: cat }))
        );
    }
    return QUESTIONS[category].map((item) => ({ ...item, category }));
}

// ===== 칩(선택 버튼) 동작 =====
function setupChips(containerId, key, parse) {
    const container = document.getElementById(containerId);
    container.addEventListener("click", (e) => {
        const btn = e.target.closest(".chip");
        if (!btn) return;
        container.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
        btn.classList.add("selected");
        settings[key] = parse(btn.dataset[key]);
    });
}

setupChips("categoryOptions", "category", (v) => v);
setupChips("modeOptions", "mode", (v) => v);
setupChips("countOptions", "count", (v) => parseInt(v, 10));

// ===== 화면 전환 =====
function show(id) {
    ["startScreen", "quizScreen", "resultScreen"].forEach((s) =>
        document.getElementById(s).classList.add("hidden")
    );
    document.getElementById(id).classList.remove("hidden");
}

// ===== 퀴즈 시작 =====
document.getElementById("startBtn").addEventListener("click", () => {
    const pool = shuffle(getPool(settings.category));
    quiz = pool.slice(0, Math.min(settings.count, pool.length));
    current = 0;
    score = 0;
    show("quizScreen");
    renderQuestion();
});

// ===== 문제 렌더링 =====
function renderQuestion() {
    const item = quiz[current];
    const cat = item.category;

    document.getElementById("progressText").textContent = `${current + 1} / ${quiz.length}`;
    document.getElementById("scoreText").textContent = `점수: ${score}`;
    document.getElementById("progressFill").style.width = `${(current / quiz.length) * 100}%`;
    document.getElementById("questionLabel").textContent = LABELS[cat];
    document.getElementById("questionText").textContent = item.q;

    document.getElementById("feedback").textContent = "";
    document.getElementById("feedback").className = "feedback";
    document.getElementById("nextBtn").classList.add("hidden");

    const choiceArea = document.getElementById("choiceArea");
    const inputArea = document.getElementById("inputArea");

    if (settings.mode === "choice") {
        inputArea.classList.add("hidden");
        choiceArea.classList.remove("hidden");
        renderChoices(item);
    } else {
        choiceArea.classList.add("hidden");
        inputArea.classList.remove("hidden");
        const input = document.getElementById("answerInput");
        input.value = "";
        input.disabled = false;
        input.focus();
        document.getElementById("submitBtn").disabled = false;
    }
}

// ===== 객관식 보기 =====
function renderChoices(item) {
    const pool = getPool(item.category);
    const wrongs = shuffle(pool.filter((p) => p.a !== item.a)).slice(0, 3);
    const options = shuffle([item, ...wrongs]);

    const area = document.getElementById("choiceArea");
    area.innerHTML = "";
    options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = opt.a;
        btn.addEventListener("click", () => checkChoice(btn, opt.a, item.a));
        area.appendChild(btn);
    });
}

function checkChoice(btn, picked, answer) {
    const buttons = document.querySelectorAll(".choice-btn");
    buttons.forEach((b) => {
        b.disabled = true;
        if (b.textContent === answer) b.classList.add("correct");
    });

    const feedback = document.getElementById("feedback");
    if (picked === answer) {
        score++;
        feedback.textContent = "정답이에요! 🎉";
        feedback.className = "feedback correct";
    } else {
        btn.classList.add("wrong");
        feedback.textContent = `아쉬워요! 정답은 "${answer}"`;
        feedback.className = "feedback wrong";
    }
    document.getElementById("scoreText").textContent = `점수: ${score}`;
    document.getElementById("nextBtn").classList.remove("hidden");
}

// ===== 주관식 제출 =====
function submitInput() {
    const input = document.getElementById("answerInput");
    if (input.disabled) return;
    const item = quiz[current];
    const userAns = input.value.trim().toLowerCase();
    const answer = item.a.toLowerCase();

    input.disabled = true;
    document.getElementById("submitBtn").disabled = true;

    const feedback = document.getElementById("feedback");
    // 단어/인사말은 정답에 보조 설명이 있으니 포함 여부로 채점
    const isCorrect = userAns === answer || (answer.includes(userAns) && userAns.length > 0);

    if (isCorrect) {
        score++;
        feedback.textContent = "정답이에요! 🎉";
        feedback.className = "feedback correct";
    } else {
        feedback.textContent = `아쉬워요! 정답은 "${item.a}"`;
        feedback.className = "feedback wrong";
    }
    document.getElementById("scoreText").textContent = `점수: ${score}`;
    document.getElementById("nextBtn").classList.remove("hidden");
}

document.getElementById("submitBtn").addEventListener("click", submitInput);
document.getElementById("answerInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitInput();
});

// ===== 다음 문제 =====
document.getElementById("nextBtn").addEventListener("click", () => {
    current++;
    if (current < quiz.length) {
        renderQuestion();
    } else {
        showResult();
    }
});

// ===== 결과 =====
function showResult() {
    show("resultScreen");
    document.getElementById("resultScore").textContent = `${score} / ${quiz.length}`;
    const ratio = score / quiz.length;
    let msg;
    if (ratio === 1) msg = "완벽해요! 일본어 마스터 🏆";
    else if (ratio >= 0.7) msg = "훌륭해요! 조금만 더 하면 완벽! 👍";
    else if (ratio >= 0.4) msg = "좋아요! 반복하면 금방 늘어요 💪";
    else msg = "괜찮아요! 처음엔 다 그래요. 다시 도전! 🌱";
    document.getElementById("resultMsg").textContent = msg;
}

document.getElementById("restartBtn").addEventListener("click", () => show("startScreen"));
