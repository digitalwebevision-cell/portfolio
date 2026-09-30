/* =========================================================
   DIGITAL WEB EVISION
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
    preloaderMinDuration: 1200,
    threeModule: "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js",
    timeZone: "Europe/Lisbon"
};

const body = document.body;

const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hasFinePointer =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;


/* =========================================================
   PRELOADER
========================================================= */

function initPreloader() {

    const preloader = document.getElementById("preloader");
    const bar = document.getElementById("preloaderBar");
    const count = document.getElementById("preloaderCount");

    if (!preloader) {
        body.classList.remove("is-loading");
        body.classList.add("is-ready");
        return;
    }

    const start = performance.now();
    let loaded = document.readyState === "complete";
    let progress = 0;

    window.addEventListener("load", () => { loaded = true; });

    function tick(now) {

        const elapsed = now - start;
        const timeProgress = Math.min(elapsed / CONFIG.preloaderMinDuration, 1);
        const target = loaded ? timeProgress : Math.min(timeProgress, 0.85);

        progress += (target - progress) * 0.12;

        if (bar) bar.style.transform = `scaleX(${progress})`;
        if (count) count.textContent = String(Math.round(progress * 100)).padStart(3, "0");

        if (loaded && timeProgress >= 1 && progress > 0.995) {
            if (count) count.textContent = "100";
            finish();
            return;
        }

        requestAnimationFrame(tick);
    }

    function finish() {
        preloader.classList.add("is-hidden");
        body.classList.remove("is-loading");

        setTimeout(() => body.classList.add("is-ready"), 250);
    }

    requestAnimationFrame(tick);
}


/* =========================================================
   HEADER & SCROLL PROGRESS
========================================================= */

function initHeader() {

    const header = document.getElementById("header");
    const progressBar = document.getElementById("scrollProgress");

    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;

    function update() {

        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        header.classList.toggle("is-scrolled", y > 40);

        // Esconde ao descer, mostra ao subir
        const menuOpen = body.classList.contains("menu-open");
        header.classList.toggle("is-hidden", !menuOpen && y > lastY && y > 400);

        if (progressBar && max > 0) {
            progressBar.style.transform = `scaleX(${y / max})`;
        }

        lastY = y;
        ticking = false;
    }

    update();

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
}


/* =========================================================
   MOBILE MENU
========================================================= */

function initMobileMenu() {

    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("mobileMenu");

    if (!toggle || !menu) return;

    const links = menu.querySelectorAll("a");

    function setOpen(open) {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
        menu.setAttribute("aria-hidden", String(!open));
        menu.classList.toggle("is-open", open);
        body.classList.toggle("menu-open", open);

        links.forEach((link, index) => {
            link.style.transitionDelay = open ? `${0.15 + index * 0.05}s` : "0s";
        });
    }

    toggle.addEventListener("click", () => {
        setOpen(!menu.classList.contains("is-open"));
    });

    links.forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menu.classList.contains("is-open")) {
            setOpen(false);
            toggle.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 960 && menu.classList.contains("is-open")) {
            setOpen(false);
        }
    });
}


/* =========================================================
   SMOOTH ANCHOR NAVIGATION
========================================================= */

function initSmoothNavigation() {

    document.querySelectorAll('a[href^="#"]').forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId.length <= 1) return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            const top = targetId === "#top"
                ? 0
                : target.getBoundingClientRect().top + window.scrollY - 20;

            window.scrollTo({
                top,
                behavior: prefersReducedMotion ? "auto" : "smooth"
            });
        });
    });
}


/* =========================================================
   CUSTOM CURSOR
========================================================= */

function initCursor() {

    const cursor = document.getElementById("cursor");
    const follower = document.getElementById("cursorFollower");

    if (!cursor || !follower || !hasFinePointer) return;

    let mouseX = -100;
    let mouseY = -100;
    let followerX = mouseX;
    let followerY = mouseY;

    document.addEventListener("mousemove", (event) => {

        mouseX = event.clientX;
        mouseY = event.clientY;

        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

        body.classList.add("has-cursor");

    }, { passive: true });

    document.addEventListener("mouseleave", () => {
        body.classList.remove("has-cursor");
    });

    function animate() {

        followerX += (mouseX - followerX) * 0.16;
        followerY += (mouseY - followerY) * 0.16;

        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;

        requestAnimationFrame(animate);
    }

    animate();

    const interactive = "a, button, .service-card, .lab-card";

    document.addEventListener("mouseover", (event) => {
        if (event.target.closest(interactive)) body.classList.add("cursor-hover");
    });

    document.addEventListener("mouseout", (event) => {
        if (event.target.closest(interactive) && !event.relatedTarget?.closest?.(interactive)) {
            body.classList.remove("cursor-hover");
        }
    });
}


/* =========================================================
   SCROLL REVEAL
========================================================= */

function initScrollReveal() {

    const elements = document.querySelectorAll(".reveal");

    if (!elements.length) return;

    // Stagger automático entre irmãos
    const groups = new Map();

    elements.forEach((element) => {
        const parent = element.parentElement;
        const index = groups.get(parent) || 0;
        element.style.setProperty("--delay", `${Math.min(index, 6) * 0.08}s`);
        groups.set(parent, index + 1);
    });

    if (!("IntersectionObserver" in window)) {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });

    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    elements.forEach((element) => observer.observe(element));
}


/* =========================================================
   STATEMENT — WORD BY WORD
========================================================= */

function initStatement() {

    const statement = document.getElementById("statementText");

    if (!statement) return;

    // Divide cada nó de texto em palavras, preservando <em>
    function split(node) {

        [...node.childNodes].forEach((child) => {

            if (child.nodeType === Node.TEXT_NODE) {

                const fragment = document.createDocumentFragment();

                child.textContent.split(/(\s+)/).forEach((part) => {

                    if (!part) return;

                    if (/^\s+$/.test(part)) {
                        fragment.appendChild(document.createTextNode(part));
                        return;
                    }

                    const span = document.createElement("span");
                    span.className = "word";
                    span.textContent = part;
                    fragment.appendChild(span);
                });

                child.replaceWith(fragment);

            } else if (child.nodeType === Node.ELEMENT_NODE) {
                split(child);
            }
        });
    }

    split(statement);

    const words = statement.querySelectorAll(".word");

    if (prefersReducedMotion) {
        words.forEach((word) => word.classList.add("is-lit"));
        return;
    }

    let ticking = false;

    function update() {

        const rect = statement.getBoundingClientRect();
        const vh = window.innerHeight;

        // 0 quando o topo entra a 85% do ecrã, 1 quando o fundo chega a 45%
        const start = vh * 0.85;
        const end = vh * 0.45;
        const progress = (start - rect.top) / (rect.height + start - end);
        const clamped = Math.max(0, Math.min(1, progress));
        const litCount = Math.round(clamped * words.length);

        words.forEach((word, index) => {
            word.classList.toggle("is-lit", index < litCount);
        });

        ticking = false;
    }

    update();

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
}


/* =========================================================
   PROCESS — ACTIVE STEP
========================================================= */

function initProcess() {

    const items = document.querySelectorAll(".process-item");

    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {
            entry.target.classList.toggle("is-active", entry.isIntersecting);
        });

    }, {
        rootMargin: "-30% 0px -30% 0px"
    });

    items.forEach((item) => observer.observe(item));
}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function initActiveNavigation() {

    const links = document.querySelectorAll(".main-nav a[data-nav]");

    if (!links.length) return;

    const sections = [...links]
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (!entry.isIntersecting) return;

            links.forEach((link) => {
                link.classList.toggle(
                    "is-active",
                    link.getAttribute("href") === `#${entry.target.id}`
                );
            });
        });

    }, {
        rootMargin: "-45% 0px -50% 0px"
    });

    sections.forEach((section) => observer.observe(section));
}


/* =========================================================
   MAGNETIC BUTTONS
========================================================= */

function initMagneticButtons() {

    if (!hasFinePointer || prefersReducedMotion) return;

    document.querySelectorAll(".magnetic").forEach((element) => {

        element.addEventListener("mousemove", (event) => {

            const rect = element.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;

            element.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
        });

        element.addEventListener("mouseleave", () => {
            element.style.transform = "";
        });
    });
}


/* =========================================================
   SERVICE CARDS — SPOTLIGHT
========================================================= */

function initSpotlight() {

    if (!hasFinePointer) return;

    document.querySelectorAll(".service-card").forEach((card) => {

        card.addEventListener("mousemove", (event) => {

            const rect = card.getBoundingClientRect();

            card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
            card.style.setProperty("--my", `${event.clientY - rect.top}px`);
        });
    });
}


/* =========================================================
   LAB — INTERACTION GRID
========================================================= */

function initInteractionGrid() {

    const grid = document.getElementById("interactionGrid");

    if (!grid) return;

    const total = 36;
    const cells = [];

    for (let i = 0; i < total; i++) {
        const cell = document.createElement("span");
        grid.appendChild(cell);
        cells.push(cell);
    }

    function flash(cell) {
        cell.classList.add("is-on");
        setTimeout(() => cell.classList.remove("is-on"), 120);
    }

    cells.forEach((cell) => {
        cell.addEventListener("mouseenter", () => flash(cell));
    });

    // Movimento ambiente enquanto ninguém interage
    if (prefersReducedMotion) return;

    let idle = true;
    const card = grid.closest(".lab-card");

    card?.addEventListener("mouseenter", () => { idle = false; });
    card?.addEventListener("mouseleave", () => { idle = true; });

    setInterval(() => {
        if (!idle) return;
        flash(cells[Math.floor(Math.random() * total)]);
    }, 260);
}


/* =========================================================
   FOOTER — CLOCK & YEAR
========================================================= */

function initFooter() {

    const clock = document.getElementById("footerClock");
    const year = document.getElementById("year");

    if (year) year.textContent = new Date().getFullYear();

    if (!clock) return;

    const formatter = new Intl.DateTimeFormat("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: CONFIG.timeZone
    });

    function update() {
        clock.textContent = formatter.format(new Date());
    }

    update();
    setInterval(update, 15000);
}


/* =========================================================
   HERO 3D
========================================================= */

async function initHero3D() {

    const canvas = document.getElementById("heroCanvas");

    if (!canvas) return;

    let THREE;

    try {
        THREE = await import(CONFIG.threeModule);
    } catch (error) {
        console.warn("Three.js não pôde ser carregado.", error);
        return;
    }

    const hero = canvas.parentElement;

    // Cores da marca (logótipo): ciano → violeta → magenta
    const BRAND = [
        new THREE.Color(0x22d8ff),
        new THREE.Color(0x8b6cff),
        new THREE.Color(0xd45cff)
    ];

    function brandColor(t) {
        const clamped = Math.max(0, Math.min(1, t));
        const color = new THREE.Color();

        return clamped < 0.5
            ? color.lerpColors(BRAND[0], BRAND[1], clamped * 2)
            : color.lerpColors(BRAND[1], BRAND[2], (clamped - 0.5) * 2);
    }


    /* -----------------------------------------------------
       RENDERER / SCENE / CAMERA
    ----------------------------------------------------- */

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 9);


    /* -----------------------------------------------------
       LIGHTS
    ----------------------------------------------------- */

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    const cyanLight = new THREE.PointLight(0x22d8ff, 60, 20);
    cyanLight.position.set(-4, 2, 4);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xd45cff, 60, 20);
    magentaLight.position.set(4, -2, 4);
    scene.add(magentaLight);


    /* -----------------------------------------------------
       GLOBE
    ----------------------------------------------------- */

    const group = new THREE.Group();
    scene.add(group);

    const globe = new THREE.Group();
    globe.rotation.z = -0.35;
    group.add(globe);

    const radius = 1.55;

    globe.add(new THREE.Mesh(
        new THREE.SphereGeometry(radius * 0.99, 64, 48),
        new THREE.MeshStandardMaterial({
            color: 0x0d1238,
            metalness: 0.4,
            roughness: 0.35
        })
    ));

    // Grelha de latitude/longitude, como o globo do logótipo
    const gridPoints = [];
    const gridColors = [];

    function addSegment(a, b) {
        gridPoints.push(a.x, a.y, a.z, b.x, b.y, b.z);

        [a, b].forEach((point) => {
            const color = brandColor((point.x / radius + 1) / 2);
            gridColors.push(color.r, color.g, color.b);
        });
    }

    function spherePoint(lat, lon) {
        return new THREE.Vector3(
            Math.cos(lat) * Math.cos(lon),
            Math.sin(lat),
            Math.cos(lat) * Math.sin(lon)
        ).multiplyScalar(radius);
    }

    const steps = 96;

    for (let lat = -60; lat <= 60; lat += 20) {

        const phi = THREE.MathUtils.degToRad(lat);

        for (let i = 0; i < steps; i++) {
            addSegment(
                spherePoint(phi, (i / steps) * Math.PI * 2),
                spherePoint(phi, ((i + 1) / steps) * Math.PI * 2)
            );
        }
    }

    for (let lon = 0; lon < 360; lon += 20) {

        const theta = THREE.MathUtils.degToRad(lon);

        for (let i = 0; i < steps / 2; i++) {
            addSegment(
                spherePoint(-Math.PI / 2 + (i / (steps / 2)) * Math.PI, theta),
                spherePoint(-Math.PI / 2 + ((i + 1) / (steps / 2)) * Math.PI, theta)
            );
        }
    }

    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridPoints, 3));
    gridGeometry.setAttribute("color", new THREE.Float32BufferAttribute(gridColors, 3));

    globe.add(new THREE.LineSegments(
        gridGeometry,
        new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        })
    ));

    // Halo suave à volta do globo
    group.add(new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.14, 48, 32),
        new THREE.MeshBasicMaterial({
            color: 0x8b6cff,
            transparent: true,
            opacity: 0.07,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    ));


    /* -----------------------------------------------------
       ORBITS — gradiente ao longo do anel
    ----------------------------------------------------- */

    function createOrbit(ringRadius, tube, opacity) {

        const geometry = new THREE.TorusGeometry(ringRadius, tube, 12, 240);
        const position = geometry.attributes.position;
        const colors = [];

        for (let i = 0; i < position.count; i++) {
            const angle = Math.atan2(position.getY(i), position.getX(i));
            const color = brandColor(0.5 - 0.5 * Math.cos(angle));
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

        return new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
    }

    const orbits = new THREE.Group();
    orbits.rotation.set(Math.PI / 2.35, 0.18, -0.3);
    group.add(orbits);

    const ring = createOrbit(2.55, 0.028, 0.95);
    const ringGlow = createOrbit(2.55, 0.1, 0.12);
    orbits.add(ring, ringGlow);

    const ring2 = createOrbit(3.05, 0.008, 0.45);
    ring2.rotation.set(0.35, -0.25, 0);
    orbits.add(ring2);

    // Satélite a percorrer a órbita principal
    const satellite = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    orbits.add(satellite);


    /* -----------------------------------------------------
       PIXELS — partículas quadradas nas cores da marca
    ----------------------------------------------------- */

    const particleCount = 420;
    const positions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {

        const distance = 3.4 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = distance * Math.cos(phi);

        const color = brandColor(Math.random());
        particleColors[i * 3] = color.r;
        particleColors[i * 3 + 1] = color.g;
        particleColors[i * 3 + 2] = color.b;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particles = new THREE.Points(
        particlesGeometry,
        new THREE.PointsMaterial({
            vertexColors: true,
            size: 0.05,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true
        })
    );

    scene.add(particles);


    /* -----------------------------------------------------
       LAYOUT / RESIZE
    ----------------------------------------------------- */

    function resize() {

        const width = hero.clientWidth;
        const height = hero.clientHeight;

        renderer.setSize(width, height, false);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        // Desktop: objeto à direita. Mobile: centrado e atrás do texto.
        const isWide = width > 900;
        group.position.set(isWide ? 2.7 : 0, isWide ? 0.2 : 1.2, 0);
        group.scale.setScalar(isWide ? 0.88 : 0.8);
    }

    resize();
    window.addEventListener("resize", resize);


    /* -----------------------------------------------------
       MOUSE & SCROLL
    ----------------------------------------------------- */

    const mouse = { x: 0, y: 0 };

    window.addEventListener("mousemove", (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -((event.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });


    /* -----------------------------------------------------
       ANIMATION (pausa fora do ecrã)
    ----------------------------------------------------- */

    const clock = new THREE.Clock();
    let visible = true;
    let frameId = null;

    function render() {

        const t = clock.getElapsedTime();
        const scroll = Math.min(window.scrollY / window.innerHeight, 1);

        globe.rotation.y = t * 0.18;

        ring2.rotation.z = -t * 0.08;

        satellite.position.set(Math.cos(t * 0.7) * 2.55, Math.sin(t * 0.7) * 2.55, 0);

        particles.rotation.y = t * 0.012;
        particles.rotation.x = Math.sin(t * 0.1) * 0.05;

        group.rotation.x += (mouse.y * 0.25 - group.rotation.x) * 0.04;
        group.rotation.y += (mouse.x * 0.35 - group.rotation.y) * 0.04;

        // Afasta-se suavemente ao fazer scroll
        camera.position.z = 9 + scroll * 3;
        camera.position.y = -scroll * 1.2;

        renderer.render(scene, camera);
    }

    function loop() {
        render();
        frameId = visible ? requestAnimationFrame(loop) : null;
    }

    new IntersectionObserver(([entry]) => {

        visible = entry.isIntersecting;

        if (visible && !frameId && !prefersReducedMotion) {
            loop();
        }

    }).observe(hero);

    if (prefersReducedMotion) {
        render();
    } else {
        loop();
    }

    canvas.classList.add("is-ready");
}


/* =========================================================
   INIT
========================================================= */

initPreloader();
initHeader();
initMobileMenu();
initSmoothNavigation();
initCursor();
initScrollReveal();
initStatement();
initProcess();
initActiveNavigation();
initMagneticButtons();
initSpotlight();
initInteractionGrid();
initFooter();
initHero3D();

console.log(
    "%cDigital Web Evision%c\nIdeias que ganham forma na web.",
    "font: 600 20px 'Space Grotesk', sans-serif;",
    "font: 12px Inter, sans-serif; color: #888;"
);
