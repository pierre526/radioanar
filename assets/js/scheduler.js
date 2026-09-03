(function () {
	'use strict';

	var DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
	var DAYS_SHORT = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

	var root = document.getElementById('programme-scheduler');
	var data = window.PROGRAMME_DATA || [];
	if (!root) return;

	// Semaine actuellement affichée : lundi de la semaine en cours, décalable
	var today = new Date();
	var weekOffset = 0;

	function getMonday(offsetWeeks) {
		var d = new Date();
		var day = (d.getDay() + 6) % 7; // 0 = lundi
		d.setDate(d.getDate() - day + offsetWeeks * 7);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	var selectedDayIndex = (today.getDay() + 6) % 7; // aujourd'hui par défaut

	// Convertit "HH:MM" en minutes, en poussant les heures 00:00–04:59
	// après minuit à la fin de la journée de diffusion (comme sur la grille papier)
    function sortableMinutes(heure) {
        var parts = (heure || '00:00').split(':');
        var h = parseInt(parts[0], 10) || 0;
        var m = parseInt(parts[1], 10) || 0;
        return h * 60 + m;
    }

	function render() {
		var monday = getMonday(weekOffset);
		root.innerHTML = '';

		// ---- Barre de jours ----
		var tabs = document.createElement('div');
		tabs.className = 'sched-tabs';

		var prevBtn = document.createElement('button');
		prevBtn.className = 'sched-nav';
		prevBtn.setAttribute('aria-label', 'Semaine précédente');
		prevBtn.textContent = '‹';
		prevBtn.addEventListener('click', function () {
			weekOffset -= 1;
			render();
		});
		tabs.appendChild(prevBtn);

		var tabsList = document.createElement('div');
		tabsList.className = 'sched-tabs-list';

		DAYS_SHORT.forEach(function (label, i) {
			var d = new Date(monday);
			d.setDate(d.getDate() + i);
			var isToday = d.toDateString() === today.toDateString();

			var tab = document.createElement('button');
			tab.className = 'sched-tab' + (i === selectedDayIndex ? ' is-active' : '') + (isToday ? ' is-today' : '');
			tab.innerHTML = label + ' <span class="sched-tab-date">' + String(d.getDate()).padStart(2, '0') + '</span>';
			tab.addEventListener('click', function () {
				selectedDayIndex = i;
				render();
			});
			tabsList.appendChild(tab);
		});
		tabs.appendChild(tabsList);

		var nextBtn = document.createElement('button');
		nextBtn.className = 'sched-nav';
		nextBtn.setAttribute('aria-label', 'Semaine suivante');
		nextBtn.textContent = '›';
		nextBtn.addEventListener('click', function () {
			weekOffset += 1;
			render();
		});
		tabs.appendChild(nextBtn);

		root.appendChild(tabs);

		// ---- Liste des émissions du jour sélectionné ----
		var dayKey = DAYS[selectedDayIndex];
		var shows = data
			.filter(function (item) {
				return item.jours && item.jours.indexOf(dayKey) !== -1;
			})
			.sort(function (a, b) {
				return sortableMinutes(a.heure) - sortableMinutes(b.heure);
			});

		var list = document.createElement('div');
		list.className = 'sched-list';

		if (shows.length === 0) {
			var empty = document.createElement('p');
			empty.className = 'sched-empty';
			empty.textContent = 'Pas de programme renseigné pour ce jour.';
			list.appendChild(empty);
		}

		shows.forEach(function (item) {
			var hasDetails = item.description && item.description.trim().length > 0;
			var row = document.createElement(item.url ? 'a' : 'div');
			if (item.url) row.href = item.url;
			row.className = 'sched-row' + (hasDetails ? ' sched-row--show' : ' sched-row--filler');

			var time = document.createElement('span');
			time.className = 'sched-time';
			time.textContent = item.heure;
			row.appendChild(time);

			if (hasDetails && item.image) {
				var img = document.createElement('img');
				img.className = 'sched-thumb';
				img.src = item.image;
				img.alt = '';
				img.loading = 'lazy';
				row.appendChild(img);
			}

			var body = document.createElement('div');
			body.className = 'sched-body';

			var titleLine = document.createElement('div');
			titleLine.className = 'sched-title-line';

			var title = document.createElement('span');
			title.className = 'sched-title';
			title.textContent = item.titre;
			titleLine.appendChild(title);

			if (item.genre) {
				var genre = document.createElement('span');
				genre.className = 'sched-genre';
				genre.textContent = item.genre;
				titleLine.appendChild(genre);
			}

			body.appendChild(titleLine);

			if (hasDetails) {
				var desc = document.createElement('p');
				desc.className = 'sched-desc';
				desc.textContent = item.description;
				body.appendChild(desc);
			}

			row.appendChild(body);
			list.appendChild(row);
		});

		root.appendChild(list);
	}

	render();
})();