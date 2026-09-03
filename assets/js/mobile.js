(function () {
    "use strict";

    var CIBLE = "https://m.radioanar.fm";
    var host = window.location.hostname;

    // Déjà sur le site mobile : on ne fait rien
    if (host === "m.radioanar.fm") {
        return;
    }

    var ua = navigator.userAgent || navigator.vendor || "";

    // Détection UA classique
    var uaMobile = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    // iPad depuis iPadOS 13 : le user-agent ne contient plus "iPad",
    // il se présente comme un Mac mais avec écran tactile
    var iPadOS = /Macintosh/i.test(ua) && "ontouchend" in document;

    // Filet de sécurité supplémentaire : petit écran + support tactile
    var smallTouchScreen =
        "ontouchstart" in window && window.innerWidth <= 820;

    var estMobile = uaMobile || iPadOS || smallTouchScreen;

    if (estMobile) {
        window.location.replace(CIBLE);
    }
})();