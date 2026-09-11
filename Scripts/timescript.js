const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

/** Weekly schedule from college timetable (local time). */
const SCHEDULE = [
    { name: "Programming", day: "Monday", location: "D053", start: "09:00", end: "12:30" },
    { name: "IT systems", day: "Monday", location: "D053", start: "13:15", end: "16:00" },
    { name: "Vespa", day: "Tuesday", location: "G229", start: "09:00", end: "10:00" },
    { name: "Databases", day: "Tuesday", location: "G229", start: "10:15", end: "12:30" },
    { name: "Welsh Bacc", day: "Tuesday", location: "G229", start: "13:00", end: "16:00" },
    { name: "IT systems", day: "Wednesday", location: "G229", start: "09:00", end: "12:00" },
    { name: "Web Dev", day: "Wednesday", location: "G229", start: "12:30", end: "14:00" },
    { name: "Web Dev", day: "Friday", location: "G229", start: "09:00", end: "10:30" },
    { name: "IT systems", day: "Friday", location: "G229", start: "11:00", end: "13:00" },
    { name: "Databases", day: "Friday", location: "G229", start: "13:30", end: "15:45" }
];

function parseTimeOnDate(date, hhmm) {
    const [hours, minutes] = hhmm.split(":").map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
}

function lessonsForDay(dayName) {
    return SCHEDULE.filter(function (lesson) {
        return lesson.day === dayName;
    }).map(function (lesson) {
        return Object.assign({}, lesson);
    }).sort(function (a, b) {
        return a.start.localeCompare(b.start);
    });
}

function formatClock(date) {
    return date.toLocaleString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

function formatTime(date) {
    return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatDuration(ms) {
    if (ms < 0) {
        ms = 0;
    }
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours > 0) {
        parts.push(hours + "h");
    }
    parts.push(minutes + "m");
    parts.push(seconds + "s");
    return parts.join(" ");
}

function describeLesson(lesson) {
    return lesson.name + " · " + lesson.location + " · " + lesson.start + "–" + lesson.end;
}

function withTimes(lesson, now) {
    return {
        name: lesson.name,
        day: lesson.day,
        location: lesson.location,
        start: lesson.start,
        end: lesson.end,
        startAt: parseTimeOnDate(now, lesson.start),
        endAt: parseTimeOnDate(now, lesson.end)
    };
}

function updateTimetable() {
    const now = new Date();
    const dayName = DAY_NAMES[now.getDay()];
    const todayLessons = lessonsForDay(dayName).map(function (lesson) {
        return withTimes(lesson, now);
    });

    const clockEl = document.getElementById("clock");
    const currentEl = document.getElementById("current-lesson");
    const progressWrap = document.getElementById("progress-wrap");
    const progressBar = document.getElementById("progress-bar");
    const timeLeftEl = document.getElementById("time-left");
    const nextEl = document.getElementById("next-lesson");
    const nextCountdownEl = document.getElementById("next-countdown");
    const dayListEl = document.getElementById("day-lessons");

    clockEl.textContent = formatClock(now);

    let current = null;
    let next = null;

    for (let i = 0; i < todayLessons.length; i += 1) {
        const lesson = todayLessons[i];
        if (now >= lesson.startAt && now < lesson.endAt) {
            current = lesson;
        } else if (now < lesson.startAt && next === null) {
            next = lesson;
        }
    }

    if (current) {
        const total = current.endAt - current.startAt;
        const elapsed = now - current.startAt;
        const remaining = current.endAt - now;
        const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));

        currentEl.textContent = "In progress: " + describeLesson(current);
        progressWrap.hidden = false;
        progressBar.style.width = percent.toFixed(1) + "%";
        progressBar.setAttribute("aria-valuenow", String(Math.round(percent)));
        timeLeftEl.textContent = "Time left in lesson: " + formatDuration(remaining);
    } else {
        progressWrap.hidden = true;
        progressBar.style.width = "0%";
        progressBar.setAttribute("aria-valuenow", "0");
        timeLeftEl.textContent = "";

        if (todayLessons.length === 0) {
            currentEl.textContent = "No lessons scheduled today.";
        } else if (now < todayLessons[0].startAt) {
            currentEl.textContent = "Not in a lesson yet.";
        } else {
            currentEl.textContent = "All lessons finished for today.";
        }
    }

    const lastLesson = todayLessons.length > 0 ? todayLessons[todayLessons.length - 1] : null;
    const afterLastLesson = lastLesson && now >= lastLesson.endAt;

    if (next) {
        nextEl.textContent = "Next: " + describeLesson(next) + " (starts " + formatTime(next.startAt) + ")";
        nextCountdownEl.textContent = "Starts in: " + formatDuration(next.startAt - now);
    } else if (afterLastLesson) {
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        nextEl.textContent = "No more lessons today.";
        nextCountdownEl.textContent = "Time until end of day: " + formatDuration(endOfDay - now);
    } else if (todayLessons.length === 0) {
        nextEl.textContent = "Nothing scheduled.";
        nextCountdownEl.textContent = "";
    } else if (current && !next) {
        nextEl.textContent = "This is the last lesson of the day.";
        nextCountdownEl.textContent = "";
    } else {
        nextEl.textContent = "";
        nextCountdownEl.textContent = "";
    }

    dayListEl.innerHTML = "";
    if (todayLessons.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "No lessons today.";
        dayListEl.appendChild(empty);
    } else {
        todayLessons.forEach(function (lesson) {
            const item = document.createElement("li");
            if (current && lesson.start === current.start && lesson.name === current.name) {
                item.className = "current";
            }
            item.innerHTML =
                "<strong>" + lesson.name + "</strong>" +
                "<span class=\"lesson-meta\">" +
                lesson.location + " · " + lesson.start + "–" + lesson.end +
                "</span>";
            dayListEl.appendChild(item);
        });
    }
}

function startTimetable() {
    updateTimetable();
    // Smooth countdown; lesson status still follows real start/end times.
    setInterval(updateTimetable, 1000);
}

startTimetable();