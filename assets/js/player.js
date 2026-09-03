/**
 * player.js — Lecteur radio Radio Anar
 * - Lecture / pause avec mémorisation de l'état (localStorage)
 * - Réglage et mémorisation du volume
 * - Récupération artiste/titre via le status Icecast (status-json.xsl)
 */
(function () {
  'use strict';

  // --- Configuration ---
  var STATUS_URL = 'https://manager.radioanar.fm/listen/radio_anar/status-json.xsl';
  var NOWPLAYING_INTERVAL = 15000; // 15s

  // --- Point d'entrée : on attend que le DOM soit prêt ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    // le DOM est déjà chargé (script exécuté en fin de page ou en defer)
    initPlayer();
  }

  function initPlayer() {
    var audio = document.getElementById('radio-stream');

    if (!audio) {
      console.error('player.js: #radio-stream introuvable dans le DOM, script arrêté.');
      return;
    }
    if (audio.dataset.init) return; // évite la double init si le script est rechargé
    audio.dataset.init = '1';

    var btn = document.getElementById('radio-playpause');
    var volume = document.getElementById('radio-volume');
    var titreEl = document.getElementById('radio-titre');
    var artisteEl = document.getElementById('radio-artiste');

    console.log('player.js: initialisation OK, éléments trouvés :', {
      audio: audio, btn: btn, volume: volume, titreEl: titreEl, artisteEl: artisteEl
    });

    setupPlayback(audio, btn, volume);
    setupNowPlaying(titreEl, artisteEl);
  }

  // --- Lecture / pause / volume ---
  function setupPlayback(audio, btn, volume) {
    function updateBtn() {
      if (btn) btn.textContent = audio.paused ? '▶' : '⏸';
    }

    // Restaurer le volume sauvegardé
    var savedVolume = localStorage.getItem('radio_volume');
    if (savedVolume !== null && volume) {
      audio.volume = parseFloat(savedVolume);
      volume.value = savedVolume;
    }

    // Reprendre la lecture si elle était active
    if (localStorage.getItem('radio_playing') === '1') {
      audio.play().catch(function () {
        // autoplay bloqué par le navigateur : on attend une interaction utilisateur
      });
    }

    if (btn) {
      btn.addEventListener('click', function () {
        if (audio.paused) {
          audio.play();
          localStorage.setItem('radio_playing', '1');
        } else {
          audio.pause();
          localStorage.setItem('radio_playing', '0');
        }
        updateBtn();
      });
    }

    if (volume) {
      volume.addEventListener('input', function () {
        audio.volume = parseFloat(volume.value);
        localStorage.setItem('radio_volume', volume.value);
      });
    }

    audio.addEventListener('play', updateBtn);
    audio.addEventListener('pause', updateBtn);
    updateBtn();
  }

  // --- Nowplaying via status Icecast ---
  function setupNowPlaying(titreEl, artisteEl) {
    if (!titreEl && !artisteEl) return; // rien à mettre à jour

    function updateNowPlaying() {
      fetch(STATUS_URL, { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          console.log('Icecast status:', data);

          var source = data && data.icestats && data.icestats.source;
          if (Array.isArray(source)) source = source[0]; // plusieurs mounts : on prend le premier

          var rawTitle = source && source.title;
          if (!rawTitle) return;

          var parts = rawTitle.split(' - ');
          if (parts.length >= 2) {
            if (artisteEl) artisteEl.textContent = parts[0].trim();
            if (titreEl) titreEl.textContent = parts.slice(1).join(' - ').trim();
          } else {
            if (artisteEl) artisteEl.textContent = '';
            if (titreEl) titreEl.textContent = rawTitle;
          }
        })
        .catch(function (err) {
          console.error('Erreur nowplaying (Icecast):', err);
        });
    }

    updateNowPlaying();
    setInterval(updateNowPlaying, NOWPLAYING_INTERVAL);
  }
})();