
/* ==========================================================
   PICHISOFT · SORPRESA DE VIN
   Aparece en cada carga de página.
   No utiliza Firebase ni modifica cuentas de usuarios.
   ========================================================== */

(() => {
  "use strict";

  const iniciarSorpresa = () => {
    // Evita duplicar el cartel en la misma página.
    if (document.getElementById("vin-sorpresa-overlay")) return;

    const estilos = document.createElement("style");

    estilos.textContent = `
      #vin-sorpresa-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(0, 0, 0, .78);
        backdrop-filter: blur(7px);
        -webkit-backdrop-filter: blur(7px);
        animation: vinFadeIn .5s ease;
      }

      #vin-sorpresa-card {
        position: relative;
        width: 100%;
        max-width: 440px;
        padding: 42px 28px;
        text-align: center;
        color: #f7f1e8;
        background: linear-gradient(145deg, #20232c, #111319);
        border: 1px solid rgba(220, 185, 125, .55);
        border-radius: 18px;
        box-shadow: 0 20px 70px rgba(0,0,0,.55);
        animation: vinAppear .65s ease;
        font-family: Georgia, 'Times New Roman', serif;
      }

      #vin-sorpresa-card .vin-heart {
        font-size: 42px;
        margin-bottom: 16px;
      }

      #vin-sorpresa-card h2 {
        margin: 0 0 18px;
        color: #e7c58e;
        font-size: clamp(22px, 5vw, 29px);
        line-height: 1.35;
        font-weight: normal;
      }

      #vin-sorpresa-card p {
        margin: 0;
        color: #e8e4df;
        font-size: 17px;
        line-height: 1.7;
      }

      #vin-sorpresa-card .vin-firma {
        display: block;
        margin-top: 25px;
        color: #e7c58e;
        font-size: 19px;
        font-style: italic;
      }

      #vin-sorpresa-cerrar {
        margin-top: 30px;
        padding: 11px 28px;
        color: #171717;
        background: #e7c58e;
        border: none;
        border-radius: 7px;
        font-size: 14px;
        cursor: pointer;
        transition: background .2s ease, transform .2s ease;
      }

      #vin-sorpresa-cerrar:hover {
        background: #f2d8a9;
        transform: translateY(-2px);
      }

      @keyframes vinFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes vinAppear {
        from { opacity: 0; transform: translateY(18px) scale(.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @media (max-width: 480px) {
        #vin-sorpresa-card {
          padding: 35px 22px;
        }
      }
    `;

    document.head.appendChild(estilos);

    const overlay = document.createElement("div");
    overlay.id = "vin-sorpresa-overlay";

    overlay.innerHTML = `
      <div id="vin-sorpresa-card" role="dialog"
           aria-modal="true" aria-labelledby="vin-sorpresa-titulo">

        <div class="vin-heart">❤️</div>

        <h2 id="vin-sorpresa-titulo">
          ¡TE AMO, BEBOTE!
        </h2>

        <p>
          Te extraño mucho.
        </p>

        <span class="vin-firma">Vin</span>

        <button id="vin-sorpresa-cerrar" type="button">
          Cerrar ❤️
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    const cerrar = () => {
      overlay.remove();
      estilos.remove();
      document.removeEventListener("keydown", teclaEscape);
    };

    const teclaEscape = (event) => {
      if (event.key === "Escape") cerrar();
    };

    overlay.querySelector("#vin-sorpresa-cerrar")
      .addEventListener("click", cerrar);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) cerrar();
    });

    document.addEventListener("keydown", teclaEscape);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarSorpresa, {
      once: true
    });
  } else {
    iniciarSorpresa();
  }
})();
