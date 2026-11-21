
/* =========================================================
   1. HEADER INTELIGENTE
   Oculta el header al bajar y lo muestra al subir.
   Permanece visible cuando estamos cerca del inicio.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");

    // Evita errores si no existe el elemento en el HTML.
    if (!header) return;

    let ultimaPosicion = window.scrollY;

    window.addEventListener("scroll", () => {
        const posicionActual = window.scrollY;

        // Mantener visible el header cerca del inicio.
        if (posicionActual < 80) {
            header.classList.remove("header-oculto");
        }

        // Ocultar el header cuando el usuario baja.
        else if (posicionActual > ultimaPosicion) {
            header.classList.add("header-oculto");
        }

        // Mostrar el header cuando el usuario sube.
        else if (posicionActual < ultimaPosicion) {
            header.classList.remove("header-oculto");
        }

        // Actualizar la última posición del scroll.
        ultimaPosicion = posicionActual;

    }, { passive: true });
});


/* =========================================================
   2. GESTIÓN DE COOKIES
   Controla el banner, el modal y las preferencias.
   Guarda las decisiones del usuario en localStorage.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // Elementos principales.
    const banner = document.getElementById("cookie-banner");
    const modal = document.getElementById("cookie-modal");

    // Si no existen los elementos, no ejecutamos el sistema.
    if (!banner || !modal) return;

    // Clave utilizada para guardar las preferencias.
    const KEY = "magikarp-cookie-preferences";

    // Controles de preferencias.
    const analytics = document.getElementById("cookie-analytics");
    const marketing = document.getElementById("cookie-marketing");

    // Botones del sistema de cookies.
    const acceptButton = document.getElementById("cookie-accept");
    const rejectButton = document.getElementById("cookie-reject");
    const settingsButton = document.getElementById("cookie-settings");
    const saveButton = document.getElementById("cookie-save");
    const closeButton = document.getElementById("cookie-close");
    const reopenButton = document.getElementById("open-cookie-settings");

    // Comprueba que los controles esenciales existen.
    if (
        !analytics ||
        !marketing ||
        !acceptButton ||
        !rejectButton ||
        !settingsButton ||
        !saveButton ||
        !closeButton
    ) {
        console.warn("Sistema de cookies: faltan algunos elementos HTML.");
        return;
    }


    /* -----------------------------------------------------
       LEER PREFERENCIAS GUARDADAS
       Recupera las preferencias desde localStorage.
    ----------------------------------------------------- */

    function readPreferences() {
        try {
            const saved = localStorage.getItem(KEY);

            return saved ? JSON.parse(saved) : null;

        } catch (error) {
            console.error("Error al leer las preferencias:", error);
            return null;
        }
    }


    /* -----------------------------------------------------
       GUARDAR PREFERENCIAS
       Las cookies necesarias siempre permanecen activas.
    ----------------------------------------------------- */

    function savePreferences(preferences) {

        try {

            const data = {
                necessary: true,
                analytics: Boolean(preferences.analytics),
                marketing: Boolean(preferences.marketing),
                savedAt: new Date().toISOString()
            };

            localStorage.setItem(KEY, JSON.stringify(data));

            // Cerrar banner y modal después de guardar.
            banner.hidden = true;
            modal.hidden = true;

            // Actualizar el bloqueo del desplazamiento.
            updatePageLock();

        } catch (error) {

            console.error("Error al guardar las preferencias:", error);

            alert("Não foi possível guardar as preferências neste navegador.");
        }
    }


    /* -----------------------------------------------------
       CARGAR PREFERENCIAS
       Si no hay preferencias guardadas, mostrar el banner.
    ----------------------------------------------------- */

    const saved = readPreferences();

    if (!saved) {

        banner.hidden = false;

    } else {

        analytics.checked = saved.analytics === true;
        marketing.checked = saved.marketing === true;

        banner.hidden = true;
    }


    /* -----------------------------------------------------
       ACEPTAR TODAS LAS COOKIES
       Activa las cookies analíticas y de marketing.
    ----------------------------------------------------- */

    acceptButton.addEventListener("click", () => {

        analytics.checked = true;
        marketing.checked = true;

        savePreferences({
            analytics: true,
            marketing: true
        });
    });


    /* -----------------------------------------------------
       RECHAZAR COOKIES OPCIONALES
       Mantiene únicamente las cookies necesarias.
    ----------------------------------------------------- */

    rejectButton.addEventListener("click", () => {

        savePreferences({
            analytics: false,
            marketing: false
        });
    });


    /* -----------------------------------------------------
       ABRIR CONFIGURACIÓN
       Recupera las preferencias actuales antes de abrir.
    ----------------------------------------------------- */

    function openCookieSettings() {

        const current = readPreferences();

        analytics.checked = current?.analytics === true;
        marketing.checked = current?.marketing === true;

        modal.hidden = false;

        updatePageLock();
    }

    settingsButton.addEventListener("click", openCookieSettings);


    /* -----------------------------------------------------
       GUARDAR CONFIGURACIÓN PERSONALIZADA
       Guarda las opciones seleccionadas por el usuario.
    ----------------------------------------------------- */

    saveButton.addEventListener("click", () => {

        savePreferences({
            analytics: analytics.checked,
            marketing: marketing.checked
        });
    });


    /* -----------------------------------------------------
       CERRAR MODAL
       Cierra la ventana de configuración sin guardar cambios.
    ----------------------------------------------------- */

    closeButton.addEventListener("click", () => {

        modal.hidden = true;

        updatePageLock();
    });


    /* -----------------------------------------------------
       REABRIR CONFIGURACIÓN DESDE EL FOOTER
       Permite modificar las preferencias posteriormente.
    ----------------------------------------------------- */

    if (reopenButton) {
        reopenButton.addEventListener("click", openCookieSettings);
    }


    /* -----------------------------------------------------
       BLOQUEAR EL SCROLL
       Impide desplazar la página cuando el banner o modal
       están visibles.
    ----------------------------------------------------- */

    function updatePageLock() {

        const isOpen = !banner.hidden || !modal.hidden;

        document.body.style.overflow = isOpen ? "hidden" : "";
    }


    // Detectar cambios en la visibilidad del banner y modal.
    const observer = new MutationObserver(updatePageLock);

    observer.observe(banner, {
        attributes: true,
        attributeFilter: ["hidden"]
    });

    observer.observe(modal, {
        attributes: true,
        attributeFilter: ["hidden"]
    });

    // Aplicar el estado inicial.
    updatePageLock();

});


/* =========================================================
   3. NAVEGACIÓN ACTIVA (SCROLL SPY)
   Detecta la sección visible y activa su enlace
   correspondiente en el menú de navegación.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // Enlaces del menú principal.
    const navLinks = document.querySelectorAll("#header nav a");

    // Secciones principales de la página.
    const sections = document.querySelectorAll("main section[id]");

    // Evitar ejecutar si no existen enlaces o secciones.
    if (!navLinks.length || !sections.length) return;


    /* -----------------------------------------------------
       ACTUALIZAR ENLACE ACTIVO
       Comprueba qué sección está ocupando la zona de lectura.
    ----------------------------------------------------- */

    function updateActiveLink() {

        let currentSection = "";

        // Ajuste para tener en cuenta la altura del header.
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {

            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            // Comprobar si el scroll está dentro de la sección.
            if (
                scrollPosition >= sectionTop &&
                scrollPosition < sectionBottom
            ) {
                currentSection = section.id;
            }
        });


        // Actualizar las clases de los enlaces.
        navLinks.forEach(link => {

            const href = link.getAttribute("href");

            // Eliminar el estado activo anterior.
            link.classList.remove("active");

            // Activar el enlace de la sección actual.
            if (href === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    }


    // Detectar el desplazamiento del usuario.
    window.addEventListener("scroll", updateActiveLink, {
        passive: true
    });

    // Ejecutar una vez al cargar la página.
    updateActiveLink();

});
