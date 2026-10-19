console.log("Конструктор планет запущен");

// ===== Элементы =====
const $ = (id) => document.getElementById(id);

const presetSelect = $("presetSelect");
const presetNote = $("presetNote");

const starSelect = $("starType");
const distanceSlider = $("distance");
const distanceValue = $("distanceValue");
const temperatureValue = $("temperatureValue");
const moonCheck = $("hasMoon");

const oceansSlider = $("oceans");
const oceansValue = $("oceansValue");
const atmosphereSlider = $("atmosphere");
const atmosphereValue = $("atmosphereValue");
const oxygenSlider = $("oxygen");
const oxygenValue = $("oxygenValue");
const gravitySlider = $("gravity");
const gravityValue = $("gravityValue");

const magneticCheck = $("hasMagneticField");
const radiationSlider = $("radiation");
const radiationValue = $("radiationValue");

const scoreEl = $("habitabilityScore");
const verdictEl = $("verdict");
const detailsEl = $("details");
const planetVisual = $("planetVisual");

// ===== Типы звёзд =====
// lum       — светимость относительно Солнца
// radiation — множитель радиации (вспышки красных карликов, УФ голубых звёзд)
// points    — баллы за стабильность и долгожительство звезды
const STARS = {
    ultracool: { name: "Ультрахолодный карлик", lum: 0.000553, radiation: 2.5, points: 3,
              note: "⚠️ Ультрахолодный карлик: очень тусклый, планета должна быть почти вплотную, с мощными вспышками" },
    red:    { name: "Красный карлик",   lum: 0.04, radiation: 2.5, points: 3,
              note: "⚠️ Красный карлик: частые вспышки, планета может быть повёрнута к звезде одной стороной" },
    orange: { name: "Оранжевый карлик", lum: 0.4,  radiation: 1,   points: 5,
              note: "✅ Оранжевый карлик: спокойная звезда, живёт десятки миллиардов лет" },
    yellow: { name: "Жёлтый карлик",    lum: 1,    radiation: 1,   points: 5,
              note: "✅ Жёлтый карлик: стабильная звезда, как наше Солнце" },
    blue:   { name: "Голубой гигант",   lum: 25,   radiation: 3,   points: 0,
              note: "❌ Голубой гигант: сильное УФ-излучение, звезда живёт слишком недолго для эволюции" }
};

// ===== Логарифмические ползунки =====
// Давление: 0 → 0 атм; иначе 10^((p-60)/20): 1 атм на позиции 60, 100 атм на позиции 100
const pressureFromSlider = (p) => (p <= 0 ? 0 : Math.pow(10, (p - 60) / 20));
const sliderFromPressure = (v) => (v < 0.001 ? 0 : Math.min(100, 60 + 20 * Math.log10(v)));
// Расстояние: 10^((p-50)/25): 1 а. е. на позиции 50, от 0.01 до 100 а. е.
const distanceFromSlider = (p) => Math.pow(10, (p - 50) / 25);
const sliderFromDistance = (d) => Math.max(0, Math.min(100, 50 + 25 * Math.log10(d)));

// Красивый вывод чисел разного порядка
function fmt(v) {
    if (v === 0) return "0";
    if (v < 0.01) return v.toFixed(4);
    if (v < 1) return v.toFixed(3);
    if (v < 10) return v.toFixed(2);
    return v.toFixed(1);
}

// ===== Готовые планеты =====
// dist — а. е., pressure — атм, o2 — %, g — g, rad — × от земной, ocean — %
const FICTION_NOTE = " Значения приблизительные: точных данных в первоисточниках мало.";
const PRESETS = {
    earth: { star: "yellow", dist: 1, moon: true, ocean: 71, pressure: 1, o2: 21, g: 1, mag: true, rad: 1,
        note: "Эталон: все параметры в комфортной зоне." },
    moon: { star: "yellow", dist: 1, moon: false, ocean: 0, pressure: 0, o2: 0, g: 0.165, mag: false, rad: 1,
        note: "Нет атмосферы и воды. Расчёт даёт среднюю температуру, а реально днём до +120 °C, ночью до −170 °C." },
    mars: { star: "yellow", dist: 1.524, moon: false, ocean: 0, pressure: 0.006, o2: 0.13, g: 0.38, mag: false, rad: 1,
        note: "Очень тонкая атмосфера (около 0,006 атм) и нет глобального магнитного поля." },
    venus: { star: "yellow", dist: 0.723, moon: false, ocean: 0, pressure: 92, o2: 0, g: 0.9, mag: false, rad: 1,
        note: "Давление около 92 атм и сильный парниковый эффект. Реально там около 460 °C, наша упрощённая формула занижает." },
    titan: { star: "yellow", dist: 9.54, moon: false, ocean: 0, pressure: 1.45, o2: 0, g: 0.14, mag: false, rad: 1,
        note: "Плотная азотная атмосфера, но вместо воды на поверхности жидкий метан, поэтому океанов воды здесь нет." },
    ganymede: { star: "yellow", dist: 5.2, moon: false, ocean: 0, pressure: 0, o2: 0, g: 0.146, mag: true, rad: 10,
        note: "Океан есть только под ледяной корой, на поверхности воды нет. Своё магнитное поле есть, но радиация Юпитера огромна (ползунок ограничен 10×, реально намного выше)." },
    trappist: { star: "ultracool", dist: 0.029, moon: false, ocean: 70, pressure: 2, o2: 0, g: 0.93, mag: true, rad: 1,
        note: "Гипотетический сценарий: атмосфера у планеты не подтверждена. Взята плотная атмосфера (около 2 атм) без кислорода, как у планеты без жизни." },

    coruscant: { star: "yellow", dist: 1, moon: true, ocean: 0, pressure: 1, o2: 21, g: 1, mag: true, rad: 1,
        note: "Планета-город с земной атмосферой и стандартной гравитацией." + FICTION_NOTE },
    tatooine: { star: "yellow", dist: 0.7, moon: true, ocean: 1, pressure: 1, o2: 21, g: 1, mag: true, rad: 1,
        note: "Пустыня с почти нулевым запасом воды. На самом деле у Татуина две звезды, здесь одна жёлтая, поэтому жара задана через близкую орбиту." + FICTION_NOTE },
    terra: { star: "yellow", dist: 1, moon: true, ocean: 10, pressure: 1, o2: 17, g: 1, mag: true, rad: 3,
        note: "Земля далёкого будущего: загрязнённая атмосфера, осушенные океаны, ослабленная защита от радиации." + FICTION_NOTE },
    cadia: { star: "yellow", dist: 1, moon: false, ocean: 40, pressure: 1, o2: 21, g: 1, mag: true, rad: 1,
        note: "Умеренный землеподобный мир (до разрушения)." + FICTION_NOTE }
};

function applyPreset(key) {
    const p = PRESETS[key];
    if (!p) {
        presetNote.textContent = "";
        return;
    }
    starSelect.value = p.star;
    distanceSlider.value = sliderFromDistance(p.dist);
    moonCheck.checked = p.moon;
    oceansSlider.value = p.ocean;
    atmosphereSlider.value = sliderFromPressure(p.pressure);
    oxygenSlider.value = p.o2 * 10;
    gravitySlider.value = p.g * 100;
    magneticCheck.checked = p.mag;
    radiationSlider.value = p.rad * 10;
    presetNote.textContent = p.note;
    updateAll();
}

// Расчётная температура поверхности (°C):
// равновесная температура с альбедо 0.3 + парниковый эффект атмосферы
function calcTemperature(star, distanceAU, pressureAtm) {
    const equilibriumK = 255 * Math.pow(star.lum, 0.25) / Math.sqrt(distanceAU);
    const greenhouseK = 33 * Math.sqrt(pressureAtm);
    return equilibriumK + greenhouseK - 273.15;
}

// ===== Пересчёт пригодности =====
function calculateHabitability() {
    const star = STARS[starSelect.value];
    const distance = distanceFromSlider(Number(distanceSlider.value));
    const hasMoon = moonCheck.checked;

    const oceans = Number(oceansSlider.value);
    const atmosphere = pressureFromSlider(Number(atmosphereSlider.value));
    const oxygen = Number(oxygenSlider.value) / 10;
    const gravity = Number(gravitySlider.value) / 100;

    const hasMagnetic = magneticCheck.checked;
    const radiationBase = Number(radiationSlider.value) / 10;

    const temp = calcTemperature(star, distance, atmosphere);
    temperatureValue.textContent = Math.round(temp);

    let score = 0;
    const details = [];

    // Звезда (5)
    score += star.points;
    details.push(star.note);

    // Температура (20)
    if (temp >= -15 && temp <= 45) {
        score += 20;
        details.push("✅ Температура комфортная для жизни");
    } else if (temp >= -40 && temp <= 70) {
        score += 10;
        details.push("⚠️ Температура экстремальная, но возможна");
    } else {
        details.push("❌ Температура непригодна для жизни");
    }

    // Вода (20): жидкая вода возможна, только если 0 < T < 100 °C и есть давление
    const liquidPossible = temp > 0 && temp < 100 && atmosphere >= 0.1;
    if (oceans === 0) {
        details.push("❌ Нет океанов");
    } else if (temp <= 0) {
        details.push("❌ Вода замёрзла (температура ниже 0 °C)");
    } else if (temp >= 100) {
        details.push("❌ Вода испарилась (температура выше 100 °C)");
    } else if (!liquidPossible) {
        details.push("❌ Давление слишком низкое: вода не может оставаться жидкой");
    } else if (oceans >= 30 && oceans <= 80) {
        score += 20;
        details.push("✅ Много жидкой воды: океаны и суша");
    } else if (oceans >= 10 && oceans < 30 || oceans > 80 && oceans <= 95) {
        score += 12;
        details.push(oceans < 30
            ? "⚠️ Воды маловато: пустынная планета"
            : "⚠️ Почти сплошной океан, суши мало");
    } else {
        score += 6;
        details.push(oceans < 10
            ? "⚠️ Воды очень мало"
            : "⚠️ Планета-океан без суши");
    }

    // Атмосфера (15)
    if (atmosphere >= 0.5 && atmosphere <= 3) {
        score += 15;
        details.push("✅ Подходящее атмосферное давление");
    } else if (atmosphere >= 0.1 && atmosphere < 5) {
        score += 6;
        details.push(atmosphere < 0.5
            ? "⚠️ Атмосфера слишком разреженная"
            : "⚠️ Атмосфера слишком плотная");
    } else if (atmosphere < 0.1) {
        details.push("❌ Почти нет атмосферы");
    } else {
        details.push("❌ Давление слишком высокое");
    }

    // Кислород (10): без атмосферы кислорода нет
    if (atmosphere < 0.1) {
        details.push("❌ Без атмосферы нет и кислорода");
    } else if (oxygen >= 15 && oxygen <= 25) {
        score += 10;
        details.push("✅ Кислорода достаточно для дыхания");
    } else if (oxygen >= 10 && oxygen < 15) {
        score += 5;
        details.push("⚠️ Кислорода маловато, как высоко в горах");
    } else if (oxygen > 25 && oxygen <= 30) {
        score += 5;
        details.push("⚠️ Кислорода много: растёт риск пожаров");
    } else {
        details.push(oxygen < 10
            ? "❌ Кислорода слишком мало"
            : "❌ Кислорода слишком много: леса горели бы постоянно");
    }

    // Магнитное поле (10)
    if (hasMagnetic) {
        score += 10;
        details.push("✅ Есть магнитное поле (защита от радиации)");
    } else {
        details.push("❌ Нет магнитного поля");
    }

    // Радиация (10): магнитное поле и атмосфера её ослабляют
    // Делим на 0.21, чтобы у Земли (1.0 × 1 × 0.3 × 0.7) получилось ровно 1.0
    const dose = radiationBase * star.radiation
        * (hasMagnetic ? 0.3 : 1)
        * (atmosphere >= 0.5 ? 0.7 : 1) / 0.21;
    const doseText = dose.toFixed(1) + "× земной";
    if (dose <= 2) {
        score += 10;
        details.push(`✅ Радиация на поверхности безопасна (${doseText})`);
    } else if (dose <= 6) {
        score += 5;
        details.push(`⚠️ Повышенная радиация (${doseText})`);
    } else {
        details.push(`❌ Опасная радиация (${doseText})`);
    }

    // Гравитация (5)
    if (gravity >= 0.7 && gravity <= 1.4) {
        score += 5;
        details.push("✅ Комфортная сила тяжести");
    } else if (gravity >= 0.3 && gravity <= 2.0) {
        score += 2;
        details.push("⚠️ Гравитация приемлемая");
    } else {
        details.push("❌ Гравитация слишком экстремальная");
    }

    // Спутник (5)
    if (hasMoon) {
        score += 5;
        details.push("✅ Крупный спутник стабилизирует наклон оси и климат");
    } else {
        details.push("⚠️ Нет крупного спутника: климат может сильно «качаться»");
    }

    score = Math.min(100, Math.max(0, score));

    // ===== Обновляем интерфейс =====
    scoreEl.textContent = score;

    let color;
    if (score >= 80) {
        verdictEl.textContent = "Планета отлично подходит для жизни!";
        color = "#22c55e";
    } else if (score >= 50) {
        verdictEl.textContent = "Планета условно пригодна для жизни";
        color = "#eab308";
    } else if (score >= 25) {
        verdictEl.textContent = "Условия очень сложные";
        color = "#f97316";
    } else {
        verdictEl.textContent = "Планета непригодна для жизни";
        color = "#ef4444";
    }
    planetVisual.style.background = color;
    planetVisual.style.boxShadow = `0 0 30px ${color}80`;

    detailsEl.innerHTML = details.map(d => `<li>${d}</li>`).join("");
}

// ===== Обновление подписей + пересчёт =====
function updateAll() {
    distanceValue.textContent = fmt(distanceFromSlider(Number(distanceSlider.value)));
    oceansValue.textContent = oceansSlider.value;
    atmosphereValue.textContent = fmt(pressureFromSlider(Number(atmosphereSlider.value)));
    oxygenValue.textContent = (Number(oxygenSlider.value) / 10).toFixed(1);
    gravityValue.textContent = (Number(gravitySlider.value) / 100).toFixed(2);
    radiationValue.textContent = (Number(radiationSlider.value) / 10).toFixed(1);
    calculateHabitability();
}

// Ручное изменение параметров сбрасывает выбранный пресет
function onManualChange() {
    presetSelect.value = "";
    presetNote.textContent = "";
    updateAll();
}

// ===== Слушатели =====
[distanceSlider, oceansSlider, atmosphereSlider, oxygenSlider,
 gravitySlider, radiationSlider].forEach(el => el.addEventListener("input", onManualChange));

[starSelect, moonCheck, magneticCheck].forEach(el => el.addEventListener("change", onManualChange));

presetSelect.addEventListener("change", () => applyPreset(presetSelect.value));

// Первый запуск
updateAll();
