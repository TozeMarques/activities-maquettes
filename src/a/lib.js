const DAY_DATE = { sam: '20270213', dim: '20270214' };

// Prochain créneau à mettre en avant pour un jour donné
export function nextSession(act, day) {
	const list = act.sessions.filter((s) => s.day === day);
	return list.find((s) => !['past', 'started'].includes(s.phase)) ?? list.at(-1);
}

export function ics(session) {
	const d = DAY_DATE[session.day];
	const t = (h) => h.replace(':', '') + '00';
	const text = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `UID:${session.id}@japan-impact.ch`,
		`DTSTART:${d}T${t(session.start)}`, `DTEND:${d}T${t(session.end)}`,
		`SUMMARY:${session.activity.title}`, `LOCATION:${session.room ?? ''}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
	return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(text);
}
