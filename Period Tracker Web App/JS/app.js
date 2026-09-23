/* =========================================================
   LUNARA
   Main JavaScript
========================================================= */


/* =========================================================
   APPLICATION DATA
========================================================= */

const defaultData = {

    lastPeriod: null,

    cycleLength: 28,

    periodLength: 5,

    cyclesTracked: 1,

    logs: {}

};


let lunaraData =
    JSON.parse(
        localStorage.getItem("lunaraData")
    ) || defaultData;


let currentCalendarDate =
    new Date();


let selectedDate =
    new Date();


let selectedLog = {

    mood: null,

    flow: null,

    symptoms: []

};


/* =========================================================
   DOM HELPERS
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveData() {

    localStorage.setItem(
        "lunaraData",
        JSON.stringify(lunaraData)
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        getElement("toast");

    if (!toast) return;

    toast.textContent =
        message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* =========================================================
   DATE FUNCTIONS
========================================================= */

function normalizeDate(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

}


function addDays(date, days) {

    const result =
        new Date(date);

    result.setDate(
        result.getDate() + days
    );

    return result;

}


function dateKey(date) {

    return date
        .toISOString()
        .split("T")[0];

}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================================
   CYCLE CALCULATION
========================================================= */

function calculateCycle() {

    if (!lunaraData.lastPeriod) {

        return {

            day: 1,

            nextPeriod: null,

            daysUntil: 0,

            phase: "Menstrual Phase",

            description:
                "Your menstrual phase."

        };

    }


    const lastPeriod =
        normalizeDate(
            new Date(
                lunaraData.lastPeriod
            )
        );


    const today =
        normalizeDate(
            new Date()
        );


    const difference =
        Math.floor(
            (
                today -
                lastPeriod
            ) /
            (1000 * 60 * 60 * 24)
        );


    const cycleDay =
        (
            difference %
            lunaraData.cycleLength
        ) + 1;


    const cyclesPassed =
        Math.floor(
            difference /
            lunaraData.cycleLength
        );


    const nextPeriod =
        addDays(
            lastPeriod,
            (
                cyclesPassed + 1
            ) *
            lunaraData.cycleLength
        );


    const daysUntil =
        Math.ceil(
            (
                nextPeriod -
                today
            ) /
            (1000 * 60 * 60 * 24)
        );


    let phase;

    let description;


    if (
        cycleDay <=
        lunaraData.periodLength
    ) {

        phase =
            "Menstrual Phase";

        description =
            "Your period phase. Your uterine lining is shedding.";

    }

    else if (
        cycleDay <
        lunaraData.cycleLength * .45
    ) {

        phase =
            "Follicular Phase";

        description =
            "Your body is preparing for ovulation. Estrogen typically begins to rise.";

    }

    else if (
        cycleDay <=
        lunaraData.cycleLength * .55
    ) {

        phase =
            "Ovulation Window";

        description =
            "You're around your estimated ovulation window.";

    }

    else {

        phase =
            "Luteal Phase";

        description =
            "Your body is moving toward the next menstrual phase.";

    }


    return {

        day: cycleDay,

        nextPeriod,

        daysUntil,

        phase,

        description

    };

}


/* =========================================================
   UPDATE DASHBOARD
========================================================= */

function updateDashboard() {

    const cycle =
        calculateCycle();


    const cycleDay =
        getElement("cycleDay");

    const phaseName =
        getElement("phaseName");

    const phaseDescription =
        getElement("phaseDescription");

    const nextPeriod =
        getElement("nextPeriod");

    const progressBar =
        getElement("cycleProgressBar");

    const progressText =
        getElement("cycleProgressText");

    const progressCurrentDay =
        getElement("progressCurrentDay");

    const progressCycleLength =
        getElement("progressCycleLength");


    if (cycleDay) {

        cycleDay.textContent =
            cycle.day;

    }


    if (phaseName) {

        phaseName.textContent =
            cycle.phase;

    }


    if (phaseDescription) {

        phaseDescription.textContent =
            cycle.description;

    }


    if (nextPeriod) {

        nextPeriod.textContent =
            `Next period in ${cycle.daysUntil} days`;

    }

    // Visual cycle progress
    const cycleLength =
        Number(lunaraData.cycleLength) || 28;

    const progress =
        Math.min(100, Math.max(0, (cycle.day / cycleLength) * 100));

    if (progressBar) {
        requestAnimationFrame(() => {
            progressBar.style.width = `${progress}%`;
        });
    }

    if (progressText) {
        progressText.textContent = `${Math.round(progress)}%`;
    }

    if (progressCurrentDay) {
        progressCurrentDay.textContent = cycle.day;
    }

    if (progressCycleLength) {
        progressCycleLength.textContent = cycleLength;
    }


    updateInsight(cycle);

    updateStatistics();

    renderCalendar();

}


/* =========================================================
   INSIGHTS
========================================================= */

function updateInsight(cycle) {

    const title =
        getElement("insightTitle");

    const text =
        getElement("insightText");


    if (!title || !text) return;


    if (
        cycle.phase.includes(
            "Menstrual"
        )
    ) {

        title.textContent =
            "Give yourself space.";

        text.textContent =
            "You're currently in your menstrual phase. Pay attention to your energy levels and give yourself permission to rest.";

    }

    else if (
        cycle.phase.includes(
            "Follicular"
        )
    ) {

        title.textContent =
            "A fresh phase begins.";

        text.textContent =
            "You're in your follicular phase. Your body is preparing for ovulation.";

    }

    else if (
        cycle.phase.includes(
            "Ovulation"
        )
    ) {

        title.textContent =
            "You're near ovulation.";

        text.textContent =
            "You're around your estimated ovulation window. Remember that this is only an estimate.";

    }

    else {

        title.textContent =
            "Listen to your body.";

        text.textContent =
            "You're in your luteal phase. Continue tracking how your mood and energy change.";

    }

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const cycles =
        getElement("cyclesTracked");

    const symptoms =
        getElement("symptomsLogged");

    const averageCycle =
        getElement("averageCycle");

    const averagePeriod =
        getElement("averagePeriod");


    if (cycles) {

        cycles.textContent =
            lunaraData.cyclesTracked || 1;

    }


    if (averageCycle) {

        averageCycle.textContent =
            `${lunaraData.cycleLength} days`;

    }


    if (averagePeriod) {

        averagePeriod.textContent =
            `${lunaraData.periodLength} days`;

    }


    let symptomCount = 0;


    Object.values(
        lunaraData.logs
    ).forEach(log => {

        if (log.symptoms) {

            symptomCount +=
                log.symptoms.length;

        }

    });


    if (symptoms) {

        symptoms.textContent =
            symptomCount;

    }

}


/* =========================================================
   CALENDAR
========================================================= */

function renderCalendar() {

    const calendar =
        getElement("calendarGrid");

    if (!calendar) return;


    const month =
        currentCalendarDate.getMonth();

    const year =
        currentCalendarDate.getFullYear();


    const monthTitle =
        getElement("calendarMonth");


    if (monthTitle) {

        monthTitle.textContent =
            new Date(
                year,
                month,
                1
            ).toLocaleDateString(
                "en-US",
                {
                    month: "long",
                    year: "numeric"
                }
            );

    }


    calendar.innerHTML = "";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /* Empty cells before month */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );

        calendar.appendChild(
            empty
        );

    }


    /* Actual days */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const cell =
            document.createElement(
                "div"
            );


        cell.className =
            "day";


        cell.textContent =
            day;


        /* Today */

        const today =
            normalizeDate(
                new Date()
            );


        if (
            date.getTime() ===
            today.getTime()
        ) {

            cell.classList.add(
                "today"
            );

        }


        /* Cycle predictions */

        if (
            lunaraData.lastPeriod
        ) {

            const lastPeriod =
                normalizeDate(
                    new Date(
                        lunaraData.lastPeriod
                    )
                );


            const difference =
                Math.floor(
                    (
                        date -
                        lastPeriod
                    ) /
                    (1000 * 60 * 60 * 24)
                );


            const cycleDay =
                (
                    difference %
                    lunaraData.cycleLength
                ) + 1;


            if (
                cycleDay >= 1 &&
                cycleDay <=
                lunaraData.periodLength
            ) {

                cell.classList.add(
                    "period"
                );

            }


            const ovulationDay =
                Math.round(
                    lunaraData.cycleLength * .5
                );


            if (
                cycleDay ===
                ovulationDay
            ) {

                cell.classList.add(
                    "ovulation"
                );

            }


            if (
                cycleDay >
                lunaraData.periodLength + 1 &&
                cycleDay <
                ovulationDay - 1
            ) {

                cell.classList.add(
                    "fertile"
                );

            }

        }


        /* Selected day */

        if (
            dateKey(date) ===
            dateKey(selectedDate)
        ) {

            cell.classList.add(
                "selected"
            );

        }


        cell.addEventListener(
            "click",
            () => {

                selectedDate = date;

                updateSelectedDate();

                renderCalendar();

                showDateDetails(date);

            }
        );


        calendar.appendChild(
            cell
        );

    }

}


/* =========================================================
   SELECTED DATE
========================================================= */

function updateSelectedDate() {

    const selected =
        getElement("selectedDate");

    if (!selected) return;


    if (
        dateKey(selectedDate) ===
        dateKey(new Date())
    ) {

        selected.textContent =
            "Today";

        return;

    }


    selected.textContent =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );

}


/* =========================================================
   DAILY LOG BUTTONS
========================================================= */

function setupChoiceButtons() {

    document
        .querySelectorAll(".choice")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const type =
                        button.dataset.type;

                    const value =
                        button.dataset.value;


                    /* Symptoms are multi-select */

                    if (
                        type ===
                        "symptom"
                    ) {

                        button.classList.toggle(
                            "active"
                        );


                        if (
                            selectedLog
                                .symptoms
                                .includes(value)
                        ) {

                            selectedLog
                                .symptoms =
                                selectedLog
                                    .symptoms
                                    .filter(
                                        item =>
                                            item !==
                                            value
                                    );

                        }

                        else {

                            selectedLog
                                .symptoms
                                .push(value);

                        }

                        return;

                    }


                    /* Mood and flow are single-select */

                    document
                        .querySelectorAll(
                            `[data-type="${type}"]`
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    selectedLog[type] =
                        value;

                }
            );

        });

}


/* =========================================================
   SAVE DAILY LOG
========================================================= */

/* =========================================================
   SAVE DAILY LOG
========================================================= */

function saveDailyLog() {

    const key =
        dateKey(selectedDate);


    lunaraData.logs[key] = {

        mood:
            selectedLog.mood,

        flow:
            selectedLog.flow,

        symptoms:
            [
                ...selectedLog.symptoms
            ]

    };


    saveData();

    updateStatistics();


    const isToday =
        dateKey(selectedDate) ===
        dateKey(new Date());


    showToast(
        isToday
            ? "Today's wellness log saved ✓"
            : "Changes saved successfully ✓"
    );


    /* Refresh the detail panel */

    showDateDetails(
        selectedDate
    );

}


/* =========================================================
   LOG TODAY
========================================================= */

function setupLogToday() {

    const button =
        getElement("logToday");


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            selectedDate =
                new Date();


            updateSelectedDate();


            const dailyLog =
                document.querySelector(
                    ".daily-log"
                );


            if (dailyLog) {

                dailyLog.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }


            renderCalendar();

        }
    );

}


/* =========================================================
   CALENDAR NAVIGATION
========================================================= */

function setupCalendarControls() {

    const previous =
        getElement("previousMonth");

    const next =
        getElement("nextMonth");


    if (previous) {

        previous.addEventListener(
            "click",
            () => {

                currentCalendarDate.setMonth(
                    currentCalendarDate.getMonth() - 1
                );

                renderCalendar();

            }
        );

    }


    if (next) {

        next.addEventListener(
            "click",
            () => {

                currentCalendarDate.setMonth(
                    currentCalendarDate.getMonth() + 1
                );

                renderCalendar();

            }
        );

    }

}


/* =========================================================
   DARK MODE
========================================================= */

function setupTheme() {

    const button =
        getElement("themeToggle");


    if (!button) return;


    const savedTheme =
        localStorage.getItem(
            "lunaraTheme"
        );


    if (
        savedTheme ===
        "dark"
    ) {

        document.body.classList.add(
            "dark"
        );

        button.textContent =
            "☀️";

    }


    button.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );


            const dark =
                document.body.classList.contains(
                    "dark"
                );


            button.textContent =
                dark
                    ? "☀️"
                    : "🌙";


            localStorage.setItem(
                "lunaraTheme",
                dark
                    ? "dark"
                    : "light"
            );

        }
    );

}


/* =========================================================
   ONBOARDING
========================================================= */

function setupOnboarding() {

    const modal =
        getElement(
            "onboardingModal"
        );


    const start =
        getElement(
            "startButton"
        );


    const heroStart =
        getElement(
            "heroStart"
        );


    const close =
        getElement(
            "closeModal"
        );


    const create =
        getElement(
            "createCycle"
        );


    function openModal() {

        if (modal) {

            modal.classList.add(
                "active"
            );

        }

    }


    function closeModal() {

        if (modal) {

            modal.classList.remove(
                "active"
            );

        }

    }


    if (start) {

        start.addEventListener(
            "click",
            openModal
        );

    }


    if (heroStart) {

        heroStart.addEventListener(
            "click",
            openModal
        );

    }


    if (close) {

        close.addEventListener(
            "click",
            closeModal
        );

    }


    if (create) {

        create.addEventListener(
            "click",
            createCycle
        );

    }

}


/* =========================================================
   CREATE CYCLE
========================================================= */

function createCycle() {

    const dateInput =
        getElement(
            "periodDate"
        );


    const cycleInput =
        getElement(
            "cycleLength"
        );


    const periodInput =
        getElement(
            "periodLength"
        );


    const date =
        dateInput?.value;


    if (!date) {

        showToast(
            "Please select your last period date."
        );

        return;

    }


    lunaraData.lastPeriod =
        date;


    lunaraData.cycleLength =
        Number(
            cycleInput.value
        ) || 28;


    lunaraData.periodLength =
        Number(
            periodInput.value
        ) || 5;


    lunaraData.cyclesTracked =
        lunaraData.cyclesTracked || 1;


    saveData();


    const modal =
        getElement(
            "onboardingModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }


    showToast(
        "Your cycle has been created ✦"
    );


    setTimeout(() => {

        window.location.href =
            "dashboard.html";

    }, 700);

}


/* =========================================================
   SAVE LOG BUTTON
========================================================= */

function setupSaveLog() {

    const button =
        getElement(
            "saveLog"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        saveDailyLog
    );

}


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

function initializeApp() {

    setupTheme();

    setupOnboarding();

    setupChoiceButtons();

    setupSaveLog();

    setupLogToday();

    setupCalendarControls();

    setupDateDetails();

    setupLunaraAssistant();


    if (
        document.querySelector(
            ".dashboard"
        )
    ) {

        updateDashboard();

        updateSelectedDate();

    }

}

/* =========================================================
   DATE DETAILS
========================================================= */

function showDateDetails(date) {

    const panel =
        getElement("dateDetailCard");

    if (!panel) return;


    const detailDate =
        getElement("detailDate");

    const detailPhase =
        getElement("detailPhase");

    const detailCycleDay =
        getElement("detailCycleDay");

    const detailMood =
        getElement("detailMood");

    const detailFlow =
        getElement("detailFlow");

    const detailSymptoms =
        getElement("detailSymptoms");


    /* Date */

    detailDate.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );


    /* Cycle information */

    const cycleInfo =
        getCycleInformation(date);


    detailPhase.textContent =
        cycleInfo.phase;


    detailCycleDay.textContent =
        `Day ${cycleInfo.day}`;


    /* Logged data */

    const key =
        dateKey(date);


    const log =
        lunaraData.logs[key];


    if (!log) {

        detailMood.textContent =
            "Not logged";

        detailFlow.textContent =
            "Not logged";

        detailSymptoms.innerHTML =
            `
            <span class="empty-detail">
                No symptoms logged
            </span>
            `;

    }

    else {

        detailMood.textContent =
            log.mood ||
            "Not logged";


        detailFlow.textContent =
            log.flow ||
            "Not logged";


        if (
            log.symptoms &&
            log.symptoms.length > 0
        ) {

            detailSymptoms.innerHTML =
                log.symptoms
                    .map(
                        symptom =>
                            `
                            <span class="symptom-tag">
                                ${symptom}
                            </span>
                            `
                    )
                    .join("");

        }

        else {

            detailSymptoms.innerHTML =
                `
                <span class="empty-detail">
                    No symptoms logged
                </span>
                `;

        }

    }


    /* Show panel */

    panel.classList.remove(
        "active"
    );


    /*
        Force browser to restart
        animation when switching dates.
    */

    void panel.offsetWidth;


    panel.classList.add(
        "active"
    );


    /* Bring panel into view */

    setTimeout(() => {

        panel.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }, 100);

}

/* =========================================================
   GET CYCLE INFORMATION FOR A DATE
========================================================= */

function getCycleInformation(date) {

    if (!lunaraData.lastPeriod) {

        return {

            day: 1,

            phase: "Cycle not configured"

        };

    }


    const lastPeriod =
        normalizeDate(
            new Date(
                lunaraData.lastPeriod
            )
        );


    const selected =
        normalizeDate(date);


    const difference =
        Math.floor(
            (
                selected -
                lastPeriod
            ) /
            (1000 * 60 * 60 * 24)
        );


    const day =
        (
            (
                difference %
                lunaraData.cycleLength
            ) +
            lunaraData.cycleLength
        ) %
        lunaraData.cycleLength + 1;


    let phase;


    if (
        day <=
        lunaraData.periodLength
    ) {

        phase =
            "Menstrual Phase";

    }

    else if (
        day <
        lunaraData.cycleLength * .45
    ) {

        phase =
            "Follicular Phase";

    }

    else if (
        day <=
        lunaraData.cycleLength * .55
    ) {

        phase =
            "Ovulation Window";

    }

    else {

        phase =
            "Luteal Phase";

    }


    return {

        day,

        phase

    };

}


/* =========================================================
   DATE DETAILS
========================================================= */

function setupDateDetails() {

    const panel =
        getElement("dateDetailCard");

    const close =
        getElement("closeDetail");

    const edit =
        getElement("editSelectedDate");


    if (!panel || !close) return;


    /* Close details */

    close.addEventListener(
        "click",
        () => {

            panel.classList.remove(
                "active"
            );

        }
    );


    /* Edit selected date */

    if (edit) {

        edit.addEventListener(
            "click",
            () => {

                loadLogForDate(
                    selectedDate
                );


                const dailyLog =
                    document.querySelector(
                        ".daily-log"
                    );


                if (dailyLog) {

                    dailyLog.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }

            }
        );

    }

}

/* =========================================================
   LOAD LOG FOR SELECTED DATE
========================================================= */

function loadLogForDate(date) {

    const key =
        dateKey(date);


    const log =
        lunaraData.logs[key];


    /* Reset current selections */

    selectedLog = {

        mood: null,

        flow: null,

        symptoms: []

    };


    /* Remove active states */

    document
        .querySelectorAll(".choice")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    /* If this date already has a log,
       load it into the form */

    if (log) {

        selectedLog.mood =
            log.mood || null;


        selectedLog.flow =
            log.flow || null;


        selectedLog.symptoms =
            [
                ...(log.symptoms || [])
            ];


        /* Restore mood */

        if (log.mood) {

            const moodButton =
                document.querySelector(
                    `[data-type="mood"][data-value="${log.mood}"]`
                );


            if (moodButton) {

                moodButton.classList.add(
                    "active"
                );

            }

        }


        /* Restore flow */

        if (log.flow) {

            const flowButton =
                document.querySelector(
                    `[data-type="flow"][data-value="${log.flow}"]`
                );


            if (flowButton) {

                flowButton.classList.add(
                    "active"
                );

            }

        }


        /* Restore symptoms */

        selectedLog.symptoms.forEach(
            symptom => {

                const symptomButton =
                    document.querySelector(
                        `[data-type="symptom"][data-value="${symptom}"]`
                    );


                if (symptomButton) {

                    symptomButton.classList.add(
                        "active"
                    );

                }

            }
        );

    }


    /* Update the date shown above the form */

    updateLogDateHeading();

}

/* =========================================================
   UPDATE LOG DATE HEADING
========================================================= */

function updateLogDateHeading() {

    const selected =
        getElement("selectedDate");


    if (!selected) return;


    selected.textContent =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        );

}

/* =========================================================
   ASK LUNARA ASSISTANT
========================================================= */

const lunaraAnswers = [
    {
        keywords: ["cramp", "cramps", "pain"],
        answer:
            "For common menstrual cramps, gentle movement, rest, hydration, and a warm compress may help. If your pain is severe, suddenly different, or interfering with normal activities, consider speaking with a healthcare professional."
    },

    {
        keywords: ["bloat", "bloating", "stomach"],
        answer:
            "Bloating can happen around your period because hormonal changes can affect fluid balance and digestion. Staying hydrated, eating balanced meals, and gentle movement may help you feel more comfortable."
    },

    {
        keywords: ["headache", "migraine", "head"],
        answer:
            "Headaches can sometimes happen around the menstrual cycle. Rest, hydration, regular meals, and a calm environment may help. If headaches are severe, unusual, or persistent, seek medical advice."
    },

    {
        keywords: ["tired", "fatigue", "energy", "sleep"],
        answer:
            "Feeling tired can happen during parts of the menstrual cycle. Try prioritizing sleep, hydration, nutritious meals, and gentle activity while paying attention to what your body needs."
    },

    {
        keywords: ["mood", "sad", "irritable", "angry", "stress"],
        answer:
            "Mood changes can occur around the menstrual cycle. Tracking your mood alongside your period dates can help you notice patterns over time. Rest, movement, supportive conversations, and relaxing routines may be useful."
    },

    {
        keywords: ["period", "menstruation", "cycle", "next period"],
        answer:
            "Your menstrual cycle can naturally vary from person to person and from month to month. Lunara helps you track your dates, symptoms, and moods so you can understand your own patterns rather than relying only on a prediction."
    },

    {
        keywords: ["exercise", "workout", "gym", "run"],
        answer:
            "Gentle exercise such as walking, stretching, yoga, or other comfortable movement can be useful during your period. Listen to your body and choose an activity that feels appropriate for your energy level."
    },

    {
        keywords: ["water", "hydration", "drink", "dehydrated"],
        answer:
            "Staying hydrated is a simple way to support your overall wellbeing during your cycle. Keep water nearby and drink regularly, especially if you are active or feeling tired."
    },

    {
        keywords: ["food", "eat", "eating", "diet"],
        answer:
            "Try to eat regular, balanced meals and include foods that give you sustained energy. Staying hydrated and paying attention to how different foods make you feel can also help you understand your own cycle patterns."
    }
];


function getLunaraResponse(question) {

    const text =
        question
            .toLowerCase()
            .trim();


    if (!text) {

        return "Ask me something about your cycle, symptoms, mood, or self-care.";

    }


    for (const item of lunaraAnswers) {

        const match =
            item.keywords.some(keyword =>
                text.includes(keyword)
            );


        if (match) {

            return item.answer;

        }

    }


    return "I'm still learning about that. Try asking me about cramps, bloating, headaches, fatigue, mood, exercise, hydration, food, or your menstrual cycle.";
}


function createAssistantMessage(text, type = "lunara") {

    const message =
        document.createElement("div");


    message.className =
        `lunara-message ${type}`;


    message.textContent =
        text;


    return message;

}


function addAssistantMessage(text, type = "lunara") {

    const chat =
        getElement("lunaraChat");


    if (!chat) return;


    const message =
        createAssistantMessage(
            text,
            type
        );


    chat.appendChild(message);


    chat.scrollTop =
        chat.scrollHeight;

}


function askLunara(question) {

    const cleanQuestion =
        question.trim();


    if (!cleanQuestion) return;


    const input =
        getElement("lunaraQuestion");


    if (input) {

        input.value = "";

    }


    addAssistantMessage(
        cleanQuestion,
        "user"
    );


    /* Typing indicator */

    const typing =
        createAssistantMessage(
            "Lunara is thinking...",
            "typing"
        );


    const chat =
        getElement("lunaraChat");


    if (chat) {

        chat.appendChild(typing);

        chat.scrollTop =
            chat.scrollHeight;

    }


    setTimeout(() => {

        if (typing) {

            typing.remove();

        }


        addAssistantMessage(
            getLunaraResponse(
                cleanQuestion
            )
        );

    }, 700);

}


/* =========================================================
   LUNARA AI ASSISTANT
========================================================= */

/* =========================================================
   ASK LUNARA ASSISTANT
========================================================= */

function setupLunaraAssistant() {

    /* =====================================================
       GET THE EXISTING HTML ELEMENTS
    ===================================================== */

    const form =
        getElement("askLunaraForm");

    const input =
        getElement("lunaraQuestion");


    const chat =
        getElement("lunaraChat");


    /* =====================================================
       MAKE SURE LUNARA EXISTS
    ===================================================== */

    if (!form || !input || !chat) {

        console.log(
            "Lunara Assistant elements not found."
        );

        return;

    }


    /* =====================================================
       ASK BUTTON / FORM SUBMIT
    ===================================================== */

    form.addEventListener(
        "submit",
        function(event) {

            /* STOP THE PAGE FROM REFRESHING */

            event.preventDefault();

            event.stopPropagation();


            /* GET QUESTION */

            const question =
                input.value.trim();


            /* DON'T SEND EMPTY QUESTIONS */

            if (!question) {

                input.focus();

                return;

            }


            /* ASK LUNARA */

            askLunara(question);

        }
    );


    /* =====================================================
       SUGGESTED QUESTIONS
    ===================================================== */

    document
        .querySelectorAll(".suggestion")
        .forEach(button => {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    const question =
                        button.dataset.question;


                    if (question) {

                        askLunara(
                            question
                        );

                    }

                }
            );

        });


    console.log(
        "Lunara Assistant connected successfully ✦"
    );

}


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);