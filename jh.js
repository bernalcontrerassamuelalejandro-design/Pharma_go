document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // DATOS DE LOS MEDICAMENTOS
    // ==========================================

    const medicamentos = [
        {
            nombre: "Acetaminofén",
            descripcion: "Tabletas 500 mg",
            cantidad: 125,
            estado: "disponible",
            icono: "💊",
            precio: 3500,
            categoria: "dolor",
            popular: true
        },
        {
            nombre: "Losartán",
            descripcion: "Tabletas 50 mg",
            cantidad: 74,
            estado: "disponible",
            icono: "💊",
            precio: 8200,
            categoria: "cardiovascular",
            popular: true
        },
        {
            nombre: "Metformina",
            descripcion: "Tabletas 850 mg",
            cantidad: 42,
            estado: "disponible",
            icono: "💊",
            precio: 5600,
            categoria: "diabetes",
            popular: false
        },
        {
            nombre: "Omeprazol",
            descripcion: "Cápsulas 20 mg",
            cantidad: 0,
            estado: "agotado",
            icono: "💊",
            precio: 12000,
            categoria: "digestivo",
            popular: false
        },
        {
            nombre: "Amoxicilina",
            descripcion: "Cápsulas 500 mg",
            cantidad: 31,
            estado: "disponible",
            icono: "💊",
            precio: 15800,
            categoria: "infecciones",
            popular: true
        },
        {
            nombre: "Loratadina",
            descripcion: "Tabletas 10 mg",
            cantidad: 0,
            estado: "agotado",
            icono: "💊",
            precio: 8500,
            categoria: "alergias",
            popular: false
        },
        {
            nombre: "Ibuprofeno",
            descripcion: "Tabletas 400 mg",
            cantidad: 89,
            estado: "disponible",
            icono: "💊",
            precio: 4200,
            categoria: "dolor",
            popular: true
        },
        {
            nombre: "Enalapril",
            descripcion: "Tabletas 10 mg",
            cantidad: 55,
            estado: "disponible",
            icono: "💊",
            precio: 6800,
            categoria: "cardiovascular",
            popular: false
        },
        {
            nombre: "Ciprofloxacino",
            descripcion: "Tabletas 500 mg",
            cantidad: 18,
            estado: "disponible",
            icono: "💊",
            precio: 22400,
            categoria: "infecciones",
            popular: false
        }
    ];


    // ==========================================
    // FAVORITOS
    // ==========================================

    let favoritos = JSON.parse(localStorage.getItem("pharmago_favs") || "[]");

    function guardarFavoritos() {
        localStorage.setItem("pharmago_favs", JSON.stringify(favoritos));
        actualizarContadorFavoritos();
    }

    function toggleFavorito(nombre) {
        const idx = favoritos.indexOf(nombre);
        if (idx > -1) {
            favoritos.splice(idx, 1);
            mostrarToast(nombre + " eliminado de favoritos", "warning");
        } else {
            favoritos.push(nombre);
            mostrarToast(nombre + " agregado a favoritos ✨", "success");
        }
        guardarFavoritos();
    }

    function actualizarContadorFavoritos() {
        const count = document.getElementById("favCount");
        if (count) {
            count.textContent = favoritos.length;
            count.style.display = favoritos.length > 0 ? "flex" : "none";
        }
    }

    actualizarContadorFavoritos();


    // ==========================================
    // DOM
    // ==========================================

    const resultados = document.getElementById("resultados");
    const input = document.getElementById("inputMedicamento");
    const btnBuscar = document.getElementById("btnBuscar");
    const filtros = document.querySelectorAll(".filtro");
    const modal = document.getElementById("modal");
    const modalTitulo = document.getElementById("modalTitulo");
    const modalTexto = document.getElementById("modalTexto");
    const modalIcono = document.getElementById("modalIcono");
    const modalExtra = document.getElementById("modalExtra");
    const cerrarModal = document.getElementById("cerrarModal");
    const modalBoton = document.getElementById("modalBoton");
    const tema = document.getElementById("tema");
    const autocomplete = document.getElementById("autocomplete");

    let filtroActual = "todos";
    let itemsMostrados = 0;
    const ITEMS_POR_PAGINA = 6;


    // ==========================================
    // PRELOADER
    // ==========================================

    setTimeout(function () {
        const preloader = document.getElementById("preloader");
        if (preloader) preloader.classList.add("hidden");
    }, 1800);


    // ==========================================
    // PROMO BANNER
    // ==========================================

    const promoBanner = document.getElementById("promoBanner");
    const promoClose = document.getElementById("promoClose");

    if (promoClose) {
        promoClose.addEventListener("click", function () {
            promoBanner.style.display = "none";
        });
    }


    // ==========================================
    // CONTADOR ANIMADO
    // ==========================================

    function animarContadores() {
        const contadores = document.querySelectorAll(".dato-numero");
        contadores.forEach(function (el) {
            const target = parseInt(el.getAttribute("data-count"));
            const duracion = 2000;
            const inicio = performance.now();

            function actualizar(ahora) {
                const progreso = Math.min((ahora - inicio) / duracion, 1);
                const eased = 1 - Math.pow(1 - progreso, 3);
                el.textContent = Math.floor(target * eased);
                if (progreso < 1) requestAnimationFrame(actualizar);
                else el.textContent = target;
            }

            requestAnimationFrame(actualizar);
        });
    }


    // ==========================================
    // SCROLL ANIMATIONS
    // ==========================================

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.getAttribute("data-delay") || "0");
                setTimeout(function () {
                    entry.target.classList.add("visible");
                }, delay);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll("[data-animate]").forEach(function (el) {
        observer.observe(el);
    });


    // ==========================================
    // MOSTRAR MEDICAMENTOS
    // ==========================================

    function mostrarMedicamentos(lista, append) {
        if (!append) resultados.innerHTML = "";

        if (lista.length === 0 && !append) {
            const mensaje = document.createElement("div");
            mensaje.className = "sin-resultados";
            mensaje.innerHTML = `
                <h3>😕 No encontramos ese medicamento</h3>
                <p>Intenta buscar con otro nombre.</p>
            `;
            resultados.appendChild(mensaje);
            return;
        }

        const start = append ? itemsMostrados : 0;
        const end = Math.min(start + ITEMS_POR_PAGINA, lista.length);

        for (let i = start; i < end; i++) {
            const med = lista[i];
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("medicamento");

            const esFav = favoritos.includes(med.nombre);
            const estadoTexto = med.estado === "disponible" ? "🟢 Disponible" : "🔴 Agotado";
            const precioFormateado = "$" + med.precio.toLocaleString("es-CO");

            tarjeta.innerHTML = `
                <div class="med-top">
                    <div class="med-icono">${med.icono}</div>
                    <span class="estado ${med.estado}">${estadoTexto}</span>
                </div>
                <h3>${med.nombre}</h3>
                <p class="med-desc">${med.descripcion}</p>
                <p class="med-precio">${precioFormateado}</p>
                <div class="med-abajo">
                    <span>${med.cantidad > 0 ? med.cantidad + " unidades" : "Sin existencias"}</span>
                    <div>
                        <button class="btn-fav ${esFav ? "active" : ""}" data-nombre="${med.nombre}" aria-label="Favorito">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${esFav ? "#ff6b6b" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </button>
                        <button class="btn-detalle" data-nombre="${med.nombre}">Ver detalles →</button>
                    </div>
                </div>
            `;

            resultados.appendChild(tarjeta);
        }

        itemsMostrados = end;

        // Show/hide "ver más"
        const verMasWrapper = document.getElementById("verMasWrapper");
        if (end < lista.length) {
            verMasWrapper.style.display = "block";
            verMasWrapper.querySelector("#verMas").onclick = function () {
                mostrarMedicamentos(lista, true);
            };
        } else {
            verMasWrapper.style.display = "none";
        }
    }


    // Get currently displayed list
    let listaActual = medicamentos;

    // Initial display
    mostrarMedicamentos(medicamentos);


    // ==========================================
    // EVENT DELEGATION FOR DYNAMIC ELEMENTS
    // ==========================================

    resultados.addEventListener("click", function (e) {
        // Favorite button
        const favBtn = e.target.closest(".btn-fav");
        if (favBtn) {
            const nombre = favBtn.getAttribute("data-nombre");
            toggleFavorito(nombre);
            buscarYFiltrar();
            return;
        }

        // Detail button
        const detailBtn = e.target.closest(".btn-detalle");
        if (detailBtn) {
            const nombre = detailBtn.getAttribute("data-nombre");
            const med = medicamentos.find(function (m) { return m.nombre === nombre; });
            if (med) mostrarModal(med);
        }
    });


    // ==========================================
    // BUSCAR
    // ==========================================

    function buscarYFiltrar() {
        const texto = input.value.toLowerCase().trim();

        let encontrados = medicamentos.filter(function (med) {
            const coincideNombre = med.nombre.toLowerCase().includes(texto) ||
                                   med.descripcion.toLowerCase().includes(texto);
            return coincideNombre;
        });

        if (filtroActual === "disponible") {
            encontrados = encontrados.filter(function (m) { return m.estado === "disponible"; });
        } else if (filtroActual === "agotado") {
            encontrados = encontrados.filter(function (m) { return m.estado === "agotado"; });
        } else if (filtroActual === "popular") {
            encontrados = encontrados.filter(function (m) { return m.popular; });
        }

        listaActual = encontrados;
        itemsMostrados = 0;
        mostrarMedicamentos(encontrados);
    }

    function buscar() {
        buscarYFiltrar();
        autocomplete.classList.remove("active");
    }

    btnBuscar.addEventListener("click", buscar);

    input.addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") buscar();
    });


    // ==========================================
    // AUTOCOMPLETE
    // ==========================================

    input.addEventListener("input", function () {
        const texto = input.value.toLowerCase().trim();

        if (texto.length < 2) {
            autocomplete.classList.remove("active");
            return;
        }

        const sugerencias = medicamentos.filter(function (med) {
            return med.nombre.toLowerCase().includes(texto) ||
                   med.descripcion.toLowerCase().includes(texto);
        });

        if (sugerencias.length === 0) {
            autocomplete.classList.remove("active");
            return;
        }

        autocomplete.innerHTML = "";
        sugerencias.forEach(function (med) {
            const item = document.createElement("div");
            item.className = "autocomplete-item";
            item.innerHTML = `
                <span class="ac-icon">💊</span>
                <span class="ac-name">${med.nombre}</span>
                <span class="ac-desc">${med.descripcion}</span>
            `;
            item.addEventListener("click", function () {
                input.value = med.nombre;
                buscar();
            });
            autocomplete.appendChild(item);
        });

        autocomplete.classList.add("active");
    });

    // Close autocomplete when clicking outside
    document.addEventListener("click", function (e) {
        if (!e.target.closest(".buscador-wrapper")) {
            autocomplete.classList.remove("active");
        }
    });


    // ==========================================
    // FILTROS
    // ==========================================

    filtros.forEach(function (filtro) {
        filtro.addEventListener("click", function () {
            filtros.forEach(function (btn) { btn.classList.remove("activo"); });
            filtro.classList.add("activo");
            filtroActual = filtro.getAttribute("data-filtro");
            itemsMostrados = 0;
            buscarYFiltrar();
        });
    });


    // ==========================================
    // CATEGORÍAS
    // ==========================================

    document.querySelectorAll(".categoria-card").forEach(function (card) {
        card.addEventListener("click", function () {
            const cat = card.getAttribute("data-categoria");
            input.value = "";
            filtroActual = "todos";
            filtros.forEach(function (btn) { btn.classList.remove("activo"); });
            filtros[0].classList.add("activo");

            const filtrados = medicamentos.filter(function (m) {
                return m.categoria === cat;
            });

            listaActual = filtrados;
            itemsMostrados = 0;
            mostrarMedicamentos(filtrados);

            document.getElementById("buscar").scrollIntoView({ behavior: "smooth" });

            mostrarToast("Mostrando medicamentos de " + card.querySelector("h3").textContent, "success");
        });
    });


    // ==========================================
    // CIUDADES
    // ==========================================

    const ciudadesData = {
        bogota: { nombre: "Bogotá", puntos: "+80" },
        medellin: { nombre: "Medellín", puntos: "+45" },
        cali: { nombre: "Cali", puntos: "+35" },
        barranquilla: { nombre: "Barranquilla", puntos: "+25" }
    };

    document.querySelectorAll(".ciudad-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".ciudad-btn").forEach(function (b) {
                b.classList.remove("activo");
            });
            btn.classList.add("activo");

            const ciudad = btn.getAttribute("data-ciudad");
            const data = ciudadesData[ciudad];

            const ciudadMapa = document.getElementById("ciudadMapa");
            const puntosMapa = document.getElementById("puntosMapa");
            if (ciudadMapa) ciudadMapa.textContent = data.nombre;
            if (puntosMapa) puntosMapa.textContent = data.puntos + " puntos disponibles";
        });
    });


    // ==========================================
    // MODAL
    // ==========================================

    function mostrarModal(medicamento) {
        modalTitulo.textContent = medicamento.nombre;
        modalIcono.textContent = medicamento.icono;

        const precioFormateado = "$" + medicamento.precio.toLocaleString("es-CO");

        if (medicamento.estado === "disponible") {
            modalTexto.textContent =
                "Hay " + medicamento.cantidad + " unidades disponibles de " +
                medicamento.nombre + " a " + precioFormateado +
                ". Puedes consultar el punto de dispensación más cercano.";

            modalExtra.style.display = "block";
            modalExtra.innerHTML = `
                <div style="display:flex;gap:20px;justify-content:center;margin-top:10px">
                    <div style="text-align:center">
                        <div style="font-size:24px;font-weight:800;color:var(--primary);font-family:var(--font-mono)">${medicamento.cantidad}</div>
                        <div style="font-size:11px;color:var(--text-muted)">Unidades</div>
                    </div>
                    <div style="text-align:center">
                        <div style="font-size:24px;font-weight:800;color:var(--text);font-family:var(--font-mono)">${precioFormateado}</div>
                        <div style="font-size:11px;color:var(--text-muted)">Precio</div>
                    </div>
                </div>
            `;
        } else {
            modalTexto.textContent =
                "Actualmente " + medicamento.nombre +
                " aparece agotado. Te recomendamos agregarlo a favoritos para recibir una alerta cuando vuelva a estar disponible.";

            modalExtra.style.display = "block";
            const safeName = medicamento.nombre.replace(/'/g, "\\'");
            modalExtra.innerHTML = `
                <button onclick="toggleFavoritoGlobal('${safeName}')" style="border:none;background:linear-gradient(135deg,#ff6b6b,#ee5a24);color:white;padding:12px 24px;border-radius:12px;cursor:pointer;font-weight:600;font-size:14px;margin-top:8px">
                    ❤️ Agregar a favoritos
                </button>
            `;
        }

        modal.classList.add("activo");
    }

    window.toggleFavoritoGlobal = function (nombre) {
        toggleFavorito(nombre);
        cerrar();
    };

    function cerrar() {
        modal.classList.remove("activo");
    }

    cerrarModal.addEventListener("click", cerrar);
    modalBoton.addEventListener("click", cerrar);

    modal.addEventListener("click", function (evento) {
        if (evento.target === modal) cerrar();
    });


    // ==========================================
    // TEXT MODALS
    // ==========================================

    function mostrarModalTexto(titulo, texto) {
        modalTitulo.textContent = titulo;
        modalTexto.textContent = texto;
        modalIcono.textContent = "✨";
        modalExtra.style.display = "none";
        modal.classList.add("activo");
    }


    // ==========================================
    // BUTTON EVENTS
    // ==========================================

    document.getElementById("verComoFunciona").addEventListener("click", function () {
        document.getElementById("funciona").scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("login").addEventListener("click", function () {
        mostrarModalTexto(
            "🔐 Iniciar sesión",
            "Aquí podrás ingresar a tu cuenta para consultar tus medicamentos, guardar favoritos y recibir notificaciones de disponibilidad."
        );
    });

    document.getElementById("btnAyuda").addEventListener("click", function () {
        mostrarModalTexto(
            "💬 Soporte PharmaGo",
            "Nuestro equipo de soporte está disponible para ayudarte. Puedes contactarnos por chat, WhatsApp o llamada."
        );
    });

    var btnPuntos = document.getElementById("btnPuntos");
    if (btnPuntos) {
        btnPuntos.addEventListener("click", function () {
            mostrarModalTexto(
                "📍 Puntos de dispensación",
                "Selecciona tu ciudad para consultar los puntos disponibles y encontrar el más conveniente para recoger tu medicamento."
            );
        });
    }

    document.getElementById("btnDomicilio").addEventListener("click", function () {
        mostrarModalTexto(
            "🚚 Domicilio de medicamentos",
            "Solicita el domicilio de tus medicamentos directamente desde la plataforma. Envío gratuito en pedidos superiores a $20.000."
        );
    });

    document.getElementById("irBuscar").addEventListener("click", function () {
        document.getElementById("buscar").scrollIntoView({ behavior: "smooth" });
        setTimeout(function () { input.focus(); }, 700);
    });


    // ==========================================
    // NEWSLETTER
    // ==========================================

    document.getElementById("btnNewsletter").addEventListener("click", function () {
        const email = document.getElementById("emailNewsletter").value;
        if (!email || !email.includes("@")) {
            mostrarToast("Por favor ingresa un correo válido", "error");
            return;
        }
        mostrarToast("¡Suscripción exitosa! Recibirás novedades pronto 📬", "success");
        document.getElementById("emailNewsletter").value = "";
    });


    // ==========================================
    // FAVORITOS BUTTON (HEADER)
    // ==========================================

    document.getElementById("favoritosBtn").addEventListener("click", function () {
        if (favoritos.length === 0) {
            mostrarModalTexto(
                "❤️ Tus favoritos",
                "Aún no tienes medicamentos en favoritos. Agrega medicamentos para recibir alertas de disponibilidad."
            );
            return;
        }

        const listaFavs = favoritos.map(function (nombre) {
            const med = medicamentos.find(function (m) { return m.nombre === nombre; });
            if (!med) return "";
            const estado = med.estado === "disponible" ? "🟢 Disponible" : "🔴 Agotado";
            return "<div style='padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center'>" +
                   "<span style='font-weight:600'>" + med.nombre + "</span>" +
                   "<span style='font-size:12px'>" + estado + "</span>" +
                   "</div>";
        }).join("");

        modalTitulo.textContent = "❤️ Tus favoritos";
        modalTexto.textContent = "";
        modalIcono.textContent = "❤️";
        modalExtra.style.display = "block";
        modalExtra.innerHTML = listaFavs;
        modal.classList.add("activo");
    });


    // ==========================================
    // FAQ
    // ==========================================

    document.querySelectorAll(".faq-pregunta").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const item = btn.parentElement;
            const wasActive = item.classList.contains("active");

            document.querySelectorAll(".faq-item").forEach(function (fi) {
                fi.classList.remove("active");
            });

            if (!wasActive) item.classList.add("active");
        });
    });


    // ==========================================
    // TOAST
    // ==========================================

    function mostrarToast(mensaje, tipo) {
        const container = document.getElementById("toastContainer");
        const toast = document.createElement("div");
        toast.className = "toast " + (tipo || "");
        toast.textContent = mensaje;
        container.appendChild(toast);

        setTimeout(function () {
            toast.remove();
        }, 3500);
    }


    // ==========================================
    // DARK MODE
    // ==========================================

    const savedTheme = localStorage.getItem("pharmago_theme");
    if (savedTheme === "oscuro") {
        document.body.classList.add("oscuro");
        tema.querySelector(".icon-moon").style.display = "none";
        tema.querySelector(".icon-sun").style.display = "block";
    }

    tema.addEventListener("click", function () {
        document.body.classList.toggle("oscuro");
        const isDark = document.body.classList.contains("oscuro");
        localStorage.setItem("pharmago_theme", isDark ? "oscuro" : "claro");

        tema.querySelector(".icon-moon").style.display = isDark ? "none" : "block";
        tema.querySelector(".icon-sun").style.display = isDark ? "block" : "none";
    });


    // ==========================================
    // HEADER SCROLL
    // ==========================================

    window.addEventListener("scroll", function () {
        const header = document.getElementById("header");
        const scrollTopBtn = document.getElementById("scrollTop");

        if (window.scrollY > 30) {
            header.classList.add("sombra");
        } else {
            header.classList.remove("sombra");
        }

        if (window.scrollY > 600) {
            scrollTopBtn.classList.add("visible");
        } else {
            scrollTopBtn.classList.remove("visible");
        }

        const sections = ["inicio", "buscar", "categorias", "puntos", "testimonios", "ayuda"];
        let current = "inicio";
        sections.forEach(function (id) {
            const section = document.getElementById(id);
            if (section && window.scrollY >= section.offsetTop - 120) {
                current = id;
            }
        });

        document.querySelectorAll(".nav-link").forEach(function (link) {
            link.classList.remove("active");
            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("active");
            }
        });
    });


    document.getElementById("scrollTop").addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });


    // ==========================================
    // HAMBURGER MENU
    // ==========================================

    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");

    hamburger.addEventListener("click", function () {
        hamburger.classList.toggle("active");
        mobileMenu.classList.toggle("active");
    });

    document.querySelectorAll(".mobile-link").forEach(function (link) {
        link.addEventListener("click", function () {
            hamburger.classList.remove("active");
            mobileMenu.classList.remove("active");
        });
    });


    // ==========================================
    // VOICE SEARCH (Web Speech API)
    // ==========================================

    const btnVoz = document.getElementById("btnVoz");

    if (btnVoz && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "es-CO";
        recognition.continuous = false;

        btnVoz.addEventListener("click", function () {
            btnVoz.style.background = "rgba(0,168,120,0.2)";
            btnVoz.style.color = "var(--primary)";
            mostrarToast("🎙️ Escuchando... Habla el nombre del medicamento", "success");
            recognition.start();
        });

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            input.value = transcript;
            buscar();
            btnVoz.style.background = "";
            btnVoz.style.color = "";
        };

        recognition.onerror = function () {
            btnVoz.style.background = "";
            btnVoz.style.color = "";
            mostrarToast("No se pudo reconocer la voz. Intenta de nuevo.", "error");
        };

        recognition.onend = function () {
            btnVoz.style.background = "";
            btnVoz.style.color = "";
        };
    } else if (btnVoz) {
        btnVoz.style.display = "none";
    }


    // ==========================================
    // COUNTER ANIMATION ON HERO VISIBLE
    // ==========================================

    let countersAnimated = false;
    const heroObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !countersAnimated) {
            countersAnimated = true;
            animarContadores();
        }
    }, { threshold: 0.3 });

    const heroSection = document.querySelector(".hero-contenido");
    if (heroSection) heroObserver.observe(heroSection);


    // ==========================================
    // CARD FAVORITE BUTTON (HERO)
    // ==========================================

    const heroFavBtn = document.querySelector(".btn-fav-tarjeta");
    if (heroFavBtn) {
        heroFavBtn.addEventListener("click", function () {
            this.classList.toggle("active");
            toggleFavorito("Acetaminofén");
        });
    }

    if (favoritos.includes("Acetaminofén") && heroFavBtn) {
        heroFavBtn.classList.add("active");
    }


    // ==========================================
    // KEYBOARD SHORTCUT: Ctrl+K to focus search
    // ==========================================

    document.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
            e.preventDefault();
            input.focus();
            document.getElementById("buscar").scrollIntoView({ behavior: "smooth" });
        }
    });


    // ==========================================
    // INIT
    // ==========================================

    console.log("✅ PharmaGo cargado correctamente");

});
