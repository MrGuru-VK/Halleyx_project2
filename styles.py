css_content='''\
:root {
    --bg: #07111f;
    --bg-soft: #0d1b2f;
    --panel: rgba(9, 19, 34, 0.78);
    --panel-border: rgba(157, 181, 255, 0.16);
    --panel-strong: rgba(12, 25, 44, 0.96);
    --text: #e9f1ff;
    --muted: #9bb0d3;
    --accent: #38bdf8;
    --accent-strong: #0ea5e9;
    --accent-warm: #f97316;
    --success: #22c55e;
    --danger: #ef4444;
    --shadow: 0 30px 80px rgba(2, 8, 23, 0.45);
    --radius-xl: 28px;
    --radius-lg: 22px;
    --radius-md: 16px;
}

* {
    box-sizing: border-box;
}

html {
    min-height: 100%;
}

body {
    margin: 0;
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: var(--text);
    background:
        radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 30%),
        radial-gradient(circle at top right, rgba(249, 115, 22, 0.16), transparent 24%),
        linear-gradient(180deg, #08111f 0%, #0c1628 52%, #09111c 100%);
    position: relative;
    overflow-x: hidden;
}

button,
input,
select {
    font: inherit;
}

.page-glow {
    position: fixed;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.45;
    pointer-events: none;
    z-index: 0;
}

.page-glow-one {
    top: -120px;
    left: -80px;
    background: rgba(56, 189, 248, 0.22);
}

.page-glow-two {
    right: -80px;
    bottom: -160px;
    background: rgba(249, 115, 22, 0.22);
}

.hidden {
    display: none !important;
}

.eyebrow {
    display: inline-block;
    margin-bottom: 0.65rem;
    color: #7dd3fc;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-weight: 700;
}

.app-shell {
    position: relative;
    z-index: 1;
    width: min(1680px, calc(100vw - 40px));
    margin: 0 auto;
    padding: 28px 0 40px;
}

.topbar,
.panel,
.hero-panel,
.login-card,
.login-intro {
    border: 1px solid var(--panel-border);
    box-shadow: var(--shadow);
    backdrop-filter: blur(18px);
}

.topbar {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    align-items: flex-start;
    padding: 28px 30px;
    border-radius: var(--radius-xl);
    background: linear-gradient(135deg, rgba(18, 34, 59, 0.92), rgba(9, 18, 33, 0.86));
}

.brand-block h1,
.hero-copy h2,
.section-heading h2,
.login-intro h1,
.login-card h2 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: -0.03em;
}

.brand-block p,
.hero-copy p,
.login-intro p,
.login-card p {
    color: var(--muted);
}

.brand-block p {
    max-width: 650px;
    margin: 10px 0 0;
}

.topbar-actions,
.inline-actions,
.form-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

button {
    border: none;
    border-radius: 999px;
    padding: 12px 18px;
    cursor: pointer;
    color: #03111d;
    font-weight: 700;
    background: linear-gradient(135deg, #67e8f9, #38bdf8);
    box-shadow: 0 12px 28px rgba(14, 165, 233, 0.28);
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

button:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 34px rgba(14, 165, 233, 0.34);
}

.secondary-btn,
.ghost-btn,
.edit,
.delete {
    color: var(--text);
    box-shadow: none;
}

.secondary-btn {
    background: rgba(148, 163, 184, 0.16);
}

.ghost-btn {
    background: rgba(249, 115, 22, 0.15);
    border: 1px solid rgba(249, 115, 22, 0.22);
}

.edit {
    background: rgba(56, 189, 248, 0.16);
}

.delete {
    background: rgba(239, 68, 68, 0.16);
}

.workspace-grid {
    display: grid;
    gap: 24px;
    margin-top: 24px;
}

.hero-panel,
.panel {
    background: var(--panel);
    border-radius: var(--radius-xl);
}

.hero-panel {
    display: grid;
    grid-template-columns: 1.7fr 1fr;
    gap: 24px;
    padding: 28px 30px;
}

.hero-copy p {
    max-width: 720px;
    margin-top: 12px;
}

.hero-stats {
    display: grid;
    gap: 14px;
}

.mini-stat {
    padding: 18px 20px;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.06);
}

.mini-stat span {
    display: block;
    color: var(--muted);
    margin-bottom: 6px;
}

.mini-stat strong {
    font-size: 1.05rem;
}

.panel {
    padding: 24px;
}

.section-heading {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-start;
    margin-bottom: 18px;
}

.section-heading h2 {
    font-size: 1.5rem;
}

.workspace-panel {
    min-height: 560px;
}

.filter-bar {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-wrap: wrap;
}

.filter-bar label,
.login-form label {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

input,
select {
    width: 100%;
    padding: 13px 14px;
    color: var(--text);
    background: rgba(10, 18, 32, 0.78);
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 14px;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
select:focus {
    border-color: rgba(56, 189, 248, 0.8);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.16);
}

.grid-container {
    display: grid;
    gap: 16px;
}

@media (min-width: 1200px) {
    .grid-container {
        grid-template-columns: repeat(16, minmax(0, 1fr));
    }
}

@media (min-width: 768px) and (max-width: 1199px) {
    .grid-container {
        grid-template-columns: repeat(8, minmax(0, 1fr));
    }
}

@media (max-width: 767px) {
    .grid-container {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.board-canvas {
    min-height: 460px;
    padding: 6px;
}

.widget {
    position: relative;
    padding: 20px;
    border-radius: 22px;
    background:
        linear-gradient(180deg, rgba(22, 37, 61, 0.96), rgba(12, 22, 39, 0.96));
    border: 1px solid rgba(148, 163, 184, 0.12);
    overflow: hidden;
    transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.widget:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 35px rgba(2, 8, 23, 0.34);
}

.widget h3 {
    margin: 0 0 12px;
}

.widget .settings,
.widget .delete {
    position: absolute;
    top: 16px;
    width: 38px;
    height: 38px;
    padding: 0;
    border-radius: 50%;
    opacity: 0;
}

.widget .settings {
    right: 16px;
}

.widget .delete {
    right: 60px;
}

.widget:hover .settings,
.widget:hover .delete {
    opacity: 1;
}

.kpi-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2rem, 4vw, 3.4rem);
    font-weight: 700;
    color: #7dd3fc;
}

.config-layout {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 18px;
}

.palette-panel {
    padding: 20px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.palette-header h3 {
    margin: 0 0 18px;
}

.widget-item {
    padding: 14px 16px;
    margin-top: 10px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(148, 163, 184, 0.08));
    border: 1px solid rgba(125, 211, 252, 0.14);
    cursor: grab;
    font-weight: 600;
}

.drop-zone {
    min-height: 500px;
    border: 1px dashed rgba(103, 232, 249, 0.35);
    border-radius: 24px;
    background: rgba(5, 12, 22, 0.3);
    padding: 16px;
}

.orders-panel {
    overflow: hidden;
}

.table-wrap {
    overflow: auto;
    border-radius: 20px;
    border: 1px solid rgba(148, 163, 184, 0.12);
}

table {
    width: 100%;
    min-width: 1400px;
    border-collapse: collapse;
    background: rgba(8, 16, 28, 0.92);
}

th,
td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    color: var(--text);
    vertical-align: top;
}

th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: rgba(10, 25, 45, 0.98);
    color: #7dd3fc;
    font-size: 0.86rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.02);
}

td:last-child {
    display: flex;
    gap: 8px;
}

.modal {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: grid;
    place-items: center;
    padding: 24px;
    background: rgba(2, 8, 23, 0.62);
}

.modal-content {
    width: min(720px, 100%);
    max-height: 88vh;
    overflow: auto;
    padding: 28px;
    border-radius: 28px;
    background: var(--panel-strong);
    border: 1px solid var(--panel-border);
    box-shadow: var(--shadow);
    position: relative;
}

.wide-modal {
    width: min(980px, 100%);
}

.close {
    position: absolute;
    top: 16px;
    right: 20px;
    font-size: 2rem;
    color: var(--muted);
    cursor: pointer;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group-span-2 {
    grid-column: span 2;
}

.form-actions {
    justify-content: flex-end;
}

.widget-config-form {
    display: grid;
    gap: 14px;
}

.widget-config-form br {
    display: none;
}

.widget-config-form input[type="checkbox"] {
    width: auto;
    padding: 0;
}

.login-shell {
    display: grid;
    place-items: center;
    padding: 24px;
}

.login-layout {
    position: relative;
    z-index: 1;
    width: min(1180px, 100%);
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 28px;
}

.login-intro,
.login-card {
    border-radius: 30px;
    padding: 40px;
    background: var(--panel);
}

.login-intro {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.login-intro h1 {
    font-size: clamp(2.2rem, 4vw, 4.6rem);
    max-width: 620px;
}

.login-example {
    display: grid;
    gap: 8px;
    margin-top: 28px;
    padding: 20px 22px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.04);
    max-width: 340px;
}

.login-example span,
.login-message {
    color: var(--muted);
}

.login-form {
    display: grid;
    gap: 16px;
    margin-top: 20px;
}

.login-form button {
    margin-top: 8px;
}

.login-message {
    min-height: 24px;
    margin: 0;
}

canvas {
    width: 100%;
    max-width: 100%;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.02);
}

@media (max-width: 980px) {
    .topbar,
    .hero-panel,
    .section-heading,
    .login-layout,
    .config-layout {
        grid-template-columns: 1fr;
        display: grid;
    }

    .topbar-actions,
    .inline-actions {
        flex-wrap: wrap;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-group-span-2 {
        grid-column: span 1;
    }
}

@media (max-width: 767px) {
    .app-shell {
        width: min(100vw - 20px, 100%);
        padding-top: 14px;
    }

    .topbar,
    .panel,
    .hero-panel,
    .login-intro,
    .login-card,
    .modal-content {
        padding: 20px;
        border-radius: 22px;
    }

    .filter-bar {
        width: 100%;
    }

    .filter-bar label,
    .filter-bar button {
        width: 100%;
    }
}
'''
