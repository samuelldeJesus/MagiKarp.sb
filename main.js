
const header = document.getElementById("header");

let ultimaPosicion = window.scrollY;

window.addEventListener("scroll", () => {
    const posicionActual = window.scrollY;

    // Mantener visible el header cerca del inicio
    if (posicionActual < 80) {
        header.classList.remove("header-oculto");
    }
    // Ocultar al bajar
    else if (posicionActual > ultimaPosicion) {
        header.classList.add("header-oculto");
    }
    // Mostrar al subir
    else if (posicionActual < ultimaPosicion) {
        header.classList.remove("header-oculto");
    }

    ultimaPosicion = posicionActual;
}, { passive: true });



(() => {
    const banner = document.getElementById("cookie-banner");
    const modal = document.getElementById("cookie-modal");

    if (!banner || !modal) return;

    const KEY = "magikarp-cookie-preferences";

    const analytics = document.getElementById("cookie-analytics");
    const marketing = document.getElementById("cookie-marketing");

    function readPreferences() {
        try {
            const saved = localStorage.getItem(KEY);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    }

    function savePreferences(preferences) {
        try {
            localStorage.setItem(KEY, JSON.stringify({
                necessary: true,
                analytics: Boolean(preferences.analytics),
                marketing: Boolean(preferences.marketing),
                savedAt: new Date().toISOString()
            }));

            banner.hidden = true;
            modal.hidden = true;
        } catch {
            alert("Não foi possível guardar as preferências neste navegador.");
        }
    }

    const saved = readPreferences();

    if (!saved) {
        banner.hidden = false;
    } else {
        analytics.checked = saved.analytics === true;
        marketing.checked = saved.marketing === true;
    }

    document.getElementById("cookie-accept").addEventListener("click", () => {
        analytics.checked = true;
        marketing.checked = true;

        savePreferences({
            analytics: true,
            marketing: true
        });
    });

    document.getElementById("cookie-reject").addEventListener("click", () => {
        savePreferences({
            analytics: false,
            marketing: false
        });
    });

    document.getElementById("cookie-settings").addEventListener("click", () => {
        const current = readPreferences();

        analytics.checked = current?.analytics === true;
        marketing.checked = current?.marketing === true;

        modal.hidden = false;
    });

    document.getElementById("cookie-save").addEventListener("click", () => {
        savePreferences({
            analytics: analytics.checked,
            marketing: marketing.checked
        });
    });

    document.getElementById("cookie-close").addEventListener("click", () => {
        modal.hidden = true;
    });

    // Permite voltar a abrir as preferências através de um botão no footer.
    const reopen = document.getElementById("open-cookie-settings");

    if (reopen) {
        reopen.addEventListener("click", () => {
            const current = readPreferences();

            analytics.checked = current?.analytics === true;
            marketing.checked = current?.marketing === true;

            modal.hidden = false;
        });
    }
})();



function updatePageLock() {
    const isOpen = !banner.hidden || !modal.hidden;

    document.body.style.overflow = isOpen ? "hidden" : "";
}

const observer = new MutationObserver(updatePageLock);

observer.observe(banner, {
    attributes: true,
    attributeFilter: ["hidden"]
});

observer.observe(modal, {
    attributes: true,
    attributeFilter: ["hidden"]
});

updatePageLock();
