import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  BRAND,
  EXPERTISES,
  FAQ_ITEMS,
  FEATURED_PROJECTS,
  HERO_CARDS,
  PROCESS_CARDS,
  REEL_SEQUENCE,
  TEAM_DECK,
  WHY_CARDS,
} from './data/sandosData.js';
import {
  S2_ISOTIPO_PATHS,
  SANDOS_WORDMARK_PATHS,
  SANDOS_WORDMARK_VIEWBOX,
} from './data/sandosBrandVectors.js';

gsap.registerPlugin(ScrollTrigger);

const state = {
  introDone: false,
  menuOpen: false,
  whatsappOpen: false,
  featuredDismissed: false,
  reelPlaying: true,
  reelIndex: 0,
  reelSecondsLeft: 14,
  teamIndex: 0,
  projectIndex: 0,
  projectStoryIndex: 0,
  likedProjects: new Set(),
  activeExpertise: 0,
};

const appEl = document.getElementById('app');
const globalBgEl = document.getElementById('global-bg');
const caseDialog = document.getElementById('case-dialog');
const quizDialog = document.getElementById('quiz-dialog');

let lenisInstance = null;
let reelTimer = null;
let introAutoTimer = null;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const BENI_ACCENT_MAP = {
  Á: 'A',
  É: 'E',
  Í: 'I',
  Ó: 'O',
  Ú: 'U',
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
};

function renderBeni(value) {
  return escapeHtml(value)
    .replace(/[ÁÉÍÓÚáéíóú]/g, (ch) => `<span class="b-acc">${BENI_ACCENT_MAP[ch]}</span>`)
    .replace(/[Ññ]/g, (ch) => `<span class="b-tilde">${ch === 'Ñ' ? 'N' : 'n'}</span>`)
    .replace(/¿/g, '<span class="b-inv-q" aria-hidden="true">?</span>')
    .replace(/°/g, '<span class="b-deg" aria-hidden="true"></span><span class="visually-hidden">°</span>');
}

function renderGiantSandosSvg(className, bicolor = false) {
  return `
    <svg class="giant-wordmark ${className}" viewBox="${SANDOS_WORDMARK_VIEWBOX}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      ${SANDOS_WORDMARK_PATHS.map(
        (item, idx) => `
          <g class="wm-letter" style="--delay:${idx * 45}ms">
            <path
              d="${item.d}"
              fill="${bicolor ? (idx < 3 ? '#D0217E' : '#FDC415') : 'currentColor'}"
              fill-rule="evenodd"
            />
          </g>
        `,
      ).join('')}
    </svg>
  `;
}

function renderWhyIcon(name) {
  switch (name) {
    case 'bolt':
      return `<svg viewBox="0 0 48 48" width="44" height="44" fill="none" aria-hidden="true"><path d="M27 5L11 26H23L20 43L37 21H25L27 5Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>`;
    case 'cam':
      return `<svg viewBox="0 0 48 48" width="44" height="44" fill="none" aria-hidden="true"><rect x="7" y="13" width="24" height="22" rx="4" stroke="currentColor" stroke-width="2.6"/><path d="M31 20L41 14V34L31 28V20Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><circle cx="19" cy="24" r="5" stroke="currentColor" stroke-width="2.4"/></svg>`;
    case 'target':
      return `<svg viewBox="0 0 48 48" width="44" height="44" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="17" stroke="currentColor" stroke-width="2.6"/><circle cx="24" cy="24" r="10" stroke="currentColor" stroke-width="2.6"/><circle cx="24" cy="24" r="3" fill="currentColor"/></svg>`;
    default:
      return `<svg viewBox="0 0 48 48" width="44" height="44" fill="none" aria-hidden="true"><path d="M24 40C24 40 8 30 8 18C8 12.5 12.5 8 17.8 8C20.8 8 22.8 9.6 24 11.4C25.2 9.6 27.2 8 30.2 8C35.5 8 40 12.5 40 18C40 30 24 40 24 40Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>`;
  }
}

function renderMenuSocialsSvg(kind) {
  switch (kind) {
    case 'instagram':
      return `<svg viewBox="0 0 113.1 124.8" width="44" height="44" fill="currentColor" aria-hidden="true"><path d="M109.4 96.7c1.3-17.7 4-32.8 3.7-50.4-.2-10.4-1.4-20.3-1.6-30.6 0-1.4 1.1-3 1-4 0-.6-2-1-2.8-2.1-1-1.4-1.6-4.4-2.4-5.2-1-.9-3-.7-4.1-1.4-1.3-.8-1.5-2.3-1.8-2.6C100-.4 76.7.2 73 .3 64.5.3 55.5 0 47 0 36.5.3 21.6-.2 11.6 3.8 9 4.8 5 9.8 2 11.2c-.5 7.4-.4 14.9-.7 22.2-.4 8.8-.1 18-.2 26.9-.2 14.1-2.7 33 .5 46.2.1.5 5.4 6.7 6.4 8.8.6 1.4.3 3.5.6 3.9 0 .1 1.5-.7 2.7-.3s1.8 2.8 4.2 3.6c11.5 3.8 28.5 1.9 40.5 1.7 10.3 0 26 1.5 34.7-.2 6.7-1.3 16-7.3 18.3-13.8 1.7-4.6.2-9.6.4-13.5M98.2 89c-.3 3.2.2 9.9-.3 12.1-.3 1-5 9.1-5.6 9.7-3.1 2.6-18.4 1.1-23.3 1.3-9.3.3-17-.4-25.8-.7-7.5-.2-13 4-22.1.7-4.7-1.8-3-3.3-4-4.8-.2-.5-1.8-.7-2.4-1.9-3.8-8.5-1-18.9-1.1-27.8-.1-11.3-1.1-22.7-1-34q0-14.3 1-28.4Q21.3 14 28.8 12c14.5-3.2 33.7-1.6 49.6-.5 5 .3 15-1.1 18.6 2.6 3.1 3.3 3 15.7 3.2 20.7.6 17-.6 36.6-2 54.2"/><path d="m81.6 59.8-2-1.1 1.8-.6.2-4.9h-3l2-1v-2c-5.8.5-3-6-7.4-8.6a73 73 0 0 0-19.7-5.8c-1.7.3-4.3 3-7 2.4l1 2c-7.8.6-9.2 8.8-13 13.5-.8 1.1-2.6 1.3-2.9 1.6-.3.7.1 13.7.4 14.9.6 2.2 2.9 4.8 3.6 7.2l8 9.6c3.5-1.3 6.4 1.4 9.6 1.8 5.6.9 14.7-1.6 19.2-5.2 4.9-4 6.6-9.6 9.2-15l-2-1.9zM69.2 71c-.3.4-7.1 5.8-7.6 5.9-1.9.4-3.1-3.8-3.2.2l-2.3-.8c-1 3.8-8.3 1.7-10.5-.6-.9-1-4-5.8-3.9-6.7 0-.7 4-12.1 4.4-12.7q1.8-2.1 4.4-1l.2-2.8c6-.7 8.5-6.3 14.5-.8 3.7 3.3 3.5 6.6 4.6 10.3.1.3 1.4.3 1.6.8s-1.7 7.5-2.2 8.2"/></svg>`;
    case 'tiktok':
      return `<svg viewBox="0 0 125.66 126.4" width="44" height="44" fill="currentColor" aria-hidden="true"><path d="M114.19 8.59c3.13 2.34 5.47 2.08 5.65 2.36.28.43-.75 2-.47 3.12.61 2.42 3.27 6.68 4.03 9.84 4.32 17.83 1.85 62.61-2.27 80.84-.31 1.39-3.93 11.64-4.43 12.05-.73.6-2.77 0-3.86.16.46.82.83 1.62.06 2.44-1.88 2.01-14.24 6.51-17.26 6.96-2.04.31-2.7-1.08-4.11-1.08-17.2.03-32.12 1.32-50.16-.35-15.83-1.46-35.95-2.18-40.45-20.55.64-13.17-2.87-28.75.94-40.96l-1.85-.95 1.62-17.03C.81 30.73 1.98 8.33 18.34 2.87c2.76-.92 4.18.25 5.76-.13 4.19-1 2.81-1.18 8.23-1.72 20.12-2 43.77-.73 63.99.99 2.72.23 6.19-.94 8.35-.4 3.9.98 7.09 5.16 9.52 6.98Zm-3.93 11.98c-7.16-12.63-23.05-8.71-34.93-8.53-10.65.16-22.09-.92-32.81-.72-5.2.1-19.66 1.41-23.69 4.14-4.3 2.91-5.12 8.2-6.02 12.92l2.06 1.96c-2.7 7.41-3.79 17.13-4.11 25.13s3.03 17.62 2.14 24.87c-.08.67-2 .51-2.11 1.25-.49 3.26-.15 14.31.24 17.91.2 1.83 2.17 3.18.82 5.73 1.75.53 1.94 3.13 2.26 3.38 1.29 1.03 11.57 5.56 13.37 5.97 5.01 1.13 15.97-.58 20.61-.35 8.38.42 38.03 4.46 44.23 2.52.93-.29.75-2.05 2.11-2.62.95-.4 2.6 1.01 4.91-.11 4.67-2.27 11.62-9.78 13.19-14.85 3.34-10.8 2.96-47.71 2.31-59.76-.33-6.01-1.93-14.12-4.6-18.84Z"/><path d="M77.25 35.54c.92 1.16 3.57 4.09 4.64 4.86 5.35 3.87 11.61 2.2 11.62 11.25 0 2.48-1.99 4.53-.67 7.3-6.04.58-10.85-3.64-15.99-5.99l-.02 21.42 1.99 3.56c-2.92-.42-1.19 3.61-2.24 6.25-.62 1.57-2.1 2.29-2.66 3.45-1.95 4.02-.93 4.74-5.75 8.16-9.27 6.57-20.95 7.03-29.66-.8-.38-.34-5.91-7.63-6.13-8.09-6.37-13.68 8.52-34.39 24.23-31.72 2.65 3.28 1.97 7.94.73 11.8-1.48 1.79-5.94-.26-8.24 1.25-.31.21-4.51 5.42-4.72 5.79-.55 1.01-.44 4.96-1.4 6.44 3.54 4.22 6.59 8.2 13.36 7.58 4.97-.45 5.93-5.71 8.22-8.81l.72-47.33c7.6-8.36 8.14-1.18 11.96 3.65Z"/></svg>`;
    case 'linkedin':
      return `<svg viewBox="0 0 115.33 117.27" width="44" height="44" fill="currentColor" aria-hidden="true"><path d="M102.26 7.03c2.66 1.54 4.94 5.73 5.62 6.37.59.55 2.18-.16 2.78.9 2.27 3.98 3.23 15.17 3.46 19.91.71 14.67 2.17 38.05.23 52.66-.66 4.95-4.05 16.96-8 20.5-9.79 8.79-33.09 9.9-46.06 9.89-12.37 0-33.34-2.35-44.89-6.9-2.69-1.06-3.66-3.44-5.02-4.42-.26-.19-1.29.59-1.52.38C-2.56 95.81.16 73.38.58 59.16.95 46.79.18 25.69 3.69 14.2c1.22-4 8.74-11.5 12.72-12.36C21.59.71 36.59.11 42.3.03 53.83-.13 77.07.3 87.98 2.01c3.58.56 11.1 3.17 14.28 5.02ZM72.42 9c-9.33-1.34-21.23-.86-30.27-.43-9.48.46-22.67.17-27.9 9.2-5.89 10.17-.71 24.84-4.62 35.42l2.05.97c-3.34 5.06.06 9.06 0 14.96-.04 4.84-1.54 8.93-1.68 13.2-.12 3.61 2.04 7.75.52 11.84 4.93 8.95 11.52 10.67 21.1 12.08 11.05 1.63 35.26 2.86 46.49 2.2 3-.18 16-2.07 18.22-3.47 1.63-1.03 6.04-7.43 6.87-9.32 6.48-14.79-.99-40.5 3.47-56.45l-1.96-.98c2.22-5.24-1.42-11.09-.39-16.37-4.87-6.12-11.6-8.65-19.33-10.09C81.3 11.07 74.17 9.25 72.4 9Z"/><path d="M56.26 46.06c2.18 1.24 2.4 3.35 2.87 5.59 5.68-6.55 11.49-5.4 19.35-6.81.07 2.53 2.72 1.99 3.86 3.1 2.56 2.49 4.77 6.75 6.4 9.9.39.76 1.72.77 1.82 1.45.67 4.47-.81 10.51-.97 14.81-.2 5.46 1.13 10.85-.95 16.08l-5.03-.53 1.02 1.98h-8.01l.73-1.81-1.63-.6c.83-9.21 2.86-17.63-2.44-25.61-.31-.47.29-1.64.13-1.81-.45-.47-5.31-1.99-6.31-2.03-3.88-.14-4.11 3.36-5.51 6.14-.31.61-1.75.58-1.94 1.43-1.56 6.98-.14 16.16-.02 23.3l-13 1-.84-43.31c2.29-2.94 7.06-4.21 10.45-2.29ZM28.11 46.08l9.04-.06 1.14 1.07 1 40.11c-.33 2.39-12.75 4.6-14.23 2.5-1.51-4.83.48-9.75.61-14.55.19-7.6-.56-15.43.02-23.05.15-1.97-.01-5.62 2.42-6.03ZM36.26 25.06c4.33 2.2 4.27 8.86 1.83 12.56-1.4 2.12-3.06 1.63-5.16 2.42-.36.14-.35 1.6-.76 1.56-8.89-.92-13.59-16.14-.59-17.5 1.95-.2 2.97.09 4.68.96Z"/></svg>`;
    default:
      return `<svg viewBox="0 0 115.33 117.27" width="44" height="44" fill="currentColor" aria-hidden="true"><path d="M102.26 7.03c2.66 1.54 4.94 5.73 5.62 6.37.59.55 2.18-.16 2.78.9 2.27 3.98 3.23 15.17 3.46 19.91.71 14.67 2.17 38.05.23 52.66-.66 4.95-4.05 16.96-8 20.5-9.79 8.79-33.09 9.9-46.06 9.89-12.37 0-33.34-2.35-44.89-6.9-2.69-1.06-3.66-3.44-5.02-4.42-.26-.19-1.29.59-1.52.38C-2.56 95.81.16 73.38.58 59.16.95 46.79.18 25.69 3.69 14.2c1.22-4 8.74-11.5 12.72-12.36C21.59.71 36.59.11 42.3.03 53.83-.13 77.07.3 87.98 2.01c3.58.56 11.1 3.17 14.28 5.02ZM72.42 9c-9.33-1.34-21.23-.86-30.27-.43-9.48.46-22.67.17-27.9 9.2-5.89 10.17-.71 24.84-4.62 35.42l2.05.97c-3.34 5.06.06 9.06 0 14.96-.04 4.84-1.54 8.93-1.68 13.2-.12 3.61 2.04 7.75.52 11.84 4.93 8.95 11.52 10.67 21.1 12.08 11.05 1.63 35.26 2.86 46.49 2.2 3-.18 16-2.07 18.22-3.47 1.63-1.03 6.04-7.43 6.87-9.32 6.48-14.79-.99-40.5 3.47-56.45l-1.96-.98c2.22-5.24-1.42-11.09-.39-16.37-4.87-6.12-11.6-8.65-19.33-10.09C81.3 11.07 74.17 9.25 72.4 9Z"/><path d="M58.4 28.4c-16.2 0-29.4 13.1-29.4 29.3 0 5.3 1.4 10.4 4 14.9l-4.2 15.4 15.8-4.1c4.3 2.3 9.1 3.5 14 3.5 16.2 0 29.4-13.1 29.4-29.3 0-16.3-13.2-29.7-29.6-29.7Zm15.4 41.3c-.6 1.8-3.8 3.5-5.2 3.7-1.4.2-3.2.3-5.2-.3-3.6-1.2-8.2-3.2-13.8-8.7-5.1-5.1-7.4-9.8-7.7-11.5-.3-1.6-.9-3.9 1-6 1.1-1.3 2.5-1.6 3.3-1.6.9 0 1.7.1 2.4.1.8.1 1.8-.3 2.8 2.1 1 2.5 3.4 8.3 3.7 8.9.3.6.5 1.3.1 2.1-.4.8-.6 1.3-1.2 2-.6.7-1.3 1.6-1.8 2.1-.6.6-1.2 1.3-.5 2.5.7 1.2 3.1 5.1 6.7 8.2 4.6 4.1 8.5 5.3 9.7 5.9 1.2.6 1.9.5 2.6-.3.7-.8 3-3.5 3.8-4.7.8-1.2 1.6-1 2.7-.6 1.1.4 7 3.3 8.2 3.9 1.2.6 2 .9 2.3 1.4.3.5.3 3-.4 4.8Z"/></svg>`;
  }
}

function renderTemplate() {
  const firstCase = FEATURED_PROJECTS[0];
  const currentReel = REEL_SEQUENCE[state.reelIndex];

  return `
    <!-- AUTO (~4.5s) & SCROLL-DRIVEN S2 OPENING ENTRANCE CURTAIN -->
    <div id="intro-gate" class="o-introGate js-intro-gate" ${state.introDone ? 'style="display:none"' : ''} aria-hidden="${state.introDone ? 'true' : 'false'}">
      <svg class="o-introGate_curtain" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <mask id="intro-s2-cutout-mask">
            <rect width="1000" height="1000" fill="white" />
            <g class="js-intro-cutout" transform="translate(500, 500) scale(0)">
              <circle class="js-intro-core-hole" cx="0" cy="0" r="0" fill="black" />
              <g transform="translate(-540, -548)">
                <path d="${S2_ISOTIPO_PATHS.sPath}" fill="black" fill-rule="evenodd" />
                <path d="${S2_ISOTIPO_PATHS.twoPath}" fill="black" fill-rule="evenodd" />
              </g>
            </g>
          </mask>
        </defs>
        <rect width="1000" height="1000" fill="#0D0C12" mask="url(#intro-s2-cutout-mask)" />
        <g class="js-intro-cutout-rim" transform="translate(500, 500) scale(0)" opacity="0">
          <g transform="translate(-540, -548)">
            <path d="${S2_ISOTIPO_PATHS.sPath}" fill="none" stroke="#D0217E" stroke-width="11" fill-rule="evenodd" />
            <path d="${S2_ISOTIPO_PATHS.twoPath}" fill="none" stroke="#FDC415" stroke-width="11" fill-rule="evenodd" />
          </g>
        </g>
      </svg>

      <div class="o-introGate_content js-intro-content">
        <img src="${BRAND.logoS2}" alt="Sandos S2" width="110" height="128" class="o-introGate_s2" />
        <p class="o-introGate_lines">
          <span>${renderBeni('HACERSE ESCUCHAR, SIN HACER RUIDO.')}</span>
          <span>${renderBeni('MOSTRAR TODO LO QUE TU EMPRESA HACE.')}</span>
          <span class="o-introGate_accent">${renderBeni('Y SALIR DE LA SOMBRA, PARA LIDERAR EL MERCADO.')}</span>
        </p>
      </div>
    </div>

    <!-- FIXED GLOBAL CHROME (FOUDRE CORNER CIRCLES + S2 BADGE) -->
    <header class="o-header">
      <button
        type="button"
        class="o-header_circle o-header_menuBtn js-menu-toggle"
        data-action="toggle-menu"
        aria-label="${state.menuOpen ? 'Cerrar menú' : 'Abrir menú'}"
        aria-expanded="${state.menuOpen ? 'true' : 'false'}"
      >
        <span class="hamburger-glyph ${state.menuOpen ? 'is-open' : ''}" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
      </button>

      <a href="#hero" class="o-header_logo js-header-logo is-hidden" aria-label="Volver arriba — Sandos">
        <img src="${BRAND.logoS2}" alt="Sandos S2" width="32" height="32" />
      </a>

      <button
        type="button"
        class="o-header_circle o-header_waBtn"
        data-action="toggle-whatsapp"
        aria-label="Abrir contacto por WhatsApp"
        aria-expanded="${state.whatsappOpen ? 'true' : 'false'}"
      >
        <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM17.46 15.9C17.24 16.52 16.21 17.08 15.69 17.16C15.22 17.23 14.63 17.26 13.97 17.05C13.57 16.92 13.06 16.75 12.41 16.47C9.68 15.29 7.89 12.54 7.75 12.35C7.62 12.16 6.64 10.87 6.64 9.53C6.64 8.19 7.34 7.53 7.59 7.26C7.84 6.99 8.14 6.92 8.32 6.92C8.51 6.92 8.69 6.92 8.85 6.93C9.02 6.94 9.25 6.86 9.48 7.41C9.71 7.97 10.26 9.31 10.33 9.45C10.4 9.59 10.44 9.75 10.35 9.93C10.26 10.11 10.21 10.22 10.08 10.37C9.94 10.52 9.79 10.71 9.67 10.83C9.53 10.97 9.39 11.12 9.55 11.39C9.71 11.66 10.25 12.54 11.05 13.25C12.08 14.17 12.95 14.45 13.23 14.59C13.5 14.72 13.66 14.7 13.82 14.52C13.98 14.34 14.51 13.72 14.69 13.44C14.87 13.16 15.05 13.21 15.3 13.3C15.55 13.39 16.89 14.05 17.16 14.18C17.43 14.32 17.61 14.38 17.68 14.5C17.75 14.62 17.75 15.28 17.46 15.9Z"/>
        </svg>
      </button>
    </header>

    <!-- FLOATING BOTTOM-RIGHT "CASO DEL MES" WIDGET -->
    <aside class="m-featuredProject js-featured-widget is-intro-hidden ${state.featuredDismissed ? 'is-dismissed' : ''}" aria-label="Caso destacado del mes">
      <div class="m-featuredProject_progressTrack" aria-hidden="true">
        <span class="m-featuredProject_scrollBar js-scroll-progress"></span>
      </div>

      <button
        type="button"
        class="m-featuredProject_close"
        data-action="dismiss-featured"
        aria-label="Ocultar caso destacado"
      >
        ✕
      </button>

      <div class="m-featuredProject_grid">
        <img
          src="${firstCase.image}"
          alt="${escapeHtml(firstCase.title)}"
          width="150"
          height="220"
          class="m-featuredProject_thumb"
        />
        <div class="m-featuredProject_content">
          <span class="m-featuredProject_eyebrow">CASO DEL MES</span>
          <strong>${renderBeni(firstCase.title)}</strong>
          <div class="m-featuredProject_tags">
            ${firstCase.tags.map((t) => `<span class="a-miniPill">${escapeHtml(t)}</span>`).join('')}
          </div>
          <button
            type="button"
            class="m-featuredProject_cta"
            data-action="open-case"
            data-case-id="${escapeHtml(firstCase.id)}"
          >
            Ver el caso →
          </button>
        </div>
      </div>
    </aside>

    <!-- FULLSCREEN SPLIT MENU OVERLAY WITH S2 ISOTIPO CUTOUT -->
    <nav id="menu-overlay" class="m-menu ${state.menuOpen ? 'is-open' : ''}" aria-label="Menú principal" aria-hidden="${state.menuOpen ? 'false' : 'true'}">
      <div class="m-menu_backdrop"></div>

      <div class="m-menu_panel m-menu_panel--left">
        <ul class="m-menu_links">
          <li><a href="#hero" data-action="menu-jump">HOME</a></li>
          <li><a href="#agence" data-action="menu-jump">AGENCIA</a></li>
          <li><a href="#projets" data-action="menu-jump">PROYECTOS</a></li>
          <li><a href="#expertises" data-action="menu-jump">EXPERTISES</a></li>
          <li><a href="#process" data-action="menu-jump">PROCESO</a></li>
          <li><a href="#why" data-action="menu-jump">${renderBeni('POR QUÉ SANDOS')}</a></li>
          <li><a href="#faq" data-action="menu-jump">FAQ</a></li>
          <li><a href="#contact" data-action="menu-jump">CONTACTO</a></li>
        </ul>

        <div class="m-menu_socials">
          <a
            href="${BRAND.instagramUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="m-menu_socialIcon"
            aria-label="Instagram de Sandos"
          >
            ${renderMenuSocialsSvg('instagram')}
          </a>
          <a
            href="${BRAND.instagramUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="m-menu_socialIcon"
            aria-label="Reels de Sandos"
          >
            ${renderMenuSocialsSvg('tiktok')}
          </a>
          <a
            href="${BRAND.whatsappUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="m-menu_socialIcon"
            aria-label="WhatsApp de Sandos"
          >
            ${renderMenuSocialsSvg('whatsapp')}
          </a>
          <a
            href="${BRAND.whatsappUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="m-menu_socialIcon"
            aria-label="LinkedIn & B2B Sandos"
          >
            ${renderMenuSocialsSvg('linkedin')}
          </a>
          <span class="m-menu_location">NQN • BUE</span>
        </div>
      </div>

      <div class="m-menu_cutout" aria-hidden="true">
        <svg class="m-menu_cutoutSvg" viewBox="0 0 260 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <mask id="menu-s2-cutout-mask">
              <rect width="260" height="900" fill="white" />
              <g transform="translate(130, 450) scale(0.39) translate(-540, -548)">
                <path d="${S2_ISOTIPO_PATHS.sPath}" fill="black" fill-rule="evenodd" />
                <path d="${S2_ISOTIPO_PATHS.twoPath}" fill="black" fill-rule="evenodd" />
              </g>
            </mask>
          </defs>
          <rect width="260" height="900" fill="#0D0C12" mask="url(#menu-s2-cutout-mask)" />
          <g transform="translate(130, 450) scale(0.39) translate(-540, -548)">
            <path d="${S2_ISOTIPO_PATHS.sPath}" fill="none" stroke="#D0217E" stroke-width="11" fill-rule="evenodd" />
            <path d="${S2_ISOTIPO_PATHS.twoPath}" fill="none" stroke="#FDC415" stroke-width="11" fill-rule="evenodd" />
          </g>
        </svg>
      </div>

      <div class="m-menu_panel m-menu_panel--right">
        <img src="${BRAND.logoS2}" alt="Sandos S2" width="110" height="128" class="m-menu_s2" />
        <h2>${renderBeni('¿CHARLAMOS POR WHATSAPP?')}</h2>
        <p>
          Preferimos las conversaciones directas y sin vueltas. Escribinos y te respondemos en el día para potenciar tu marca.
        </p>
        <a href="${BRAND.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="foudre-btn foudre-btn--yellow">
          Escribir al WhatsApp de Sandos ↗
        </a>
      </div>
    </nav>

    <!-- WHATSAPP POPIN -->
    <div id="whatsapp-popin" class="m-whatsappPopin ${state.whatsappOpen ? 'is-open' : ''}" aria-hidden="${state.whatsappOpen ? 'false' : 'true'}">
      <div class="m-whatsappPopin_overlay" data-action="toggle-whatsapp"></div>
      <div class="m-whatsappPopin_card" role="dialog" aria-label="Contacto directo WhatsApp Sandos">
        <button type="button" class="foudre-circle-close foudre-circle-close--dark" data-action="toggle-whatsapp" aria-label="Cerrar WhatsApp">
          ✕
        </button>
        <img src="${BRAND.logoS2}" alt="Sandos S2" width="68" height="79" />
        <h3>${renderBeni('¿LLEVAMOS TU MARCA AL SIGUIENTE NIVEL?')}</h3>
        <p>
          +200 marcas potenciadas desde Neuquén y Buenos Aires. Mandanos un mensaje directo y coordinamos una reunión esta semana.
        </p>
        <a href="${BRAND.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="foudre-btn foudre-btn--yellow">
          Abrir chat en WhatsApp →
        </a>
      </div>
    </div>

    <main id="main-content">
      <!-- 01. HERO -->
      <section id="hero" class="o-homeHero js-hero-section">
        <div class="o-homeHero_inner">
          <div class="o-homeHero_wordmarkWrap">
            ${renderGiantSandosSvg('o-homeHero_wordmark')}
          </div>

          <div class="o-homeHero_deck js-parallax-deck">
            ${HERO_CARDS.map((card, i) => {
              const isCenter = i === 1;
              return `
                <figure class="o-homeHero_card o-homeHero_card--${card.id}" data-parallax-depth="${i === 1 ? '18' : '28'}">
                  <img
                    src="${card.image}"
                    alt="${escapeHtml(card.alt)}"
                    width="640"
                    height="640"
                    ${isCenter ? 'fetchpriority="high"' : ''}
                  />
                  <div class="a-chatBubble a-chatBubble--${card.bubblePos}" aria-hidden="true">
                    <span>${card.bubble}</span>
                    <i class="bubble-dot-1"></i>
                    <i class="bubble-dot-2"></i>
                  </div>
                </figure>
              `;
            }).join('')}
          </div>

          <div class="o-homeHero_bottom">
            <span class="a-whisperLabel">Agencia creativa 360° · NQN • BUE</span>
            <h1 class="a-displayStack">
              <span class="a-displayLine a-displayLine--magenta">AGENCIA</span>
              <span class="a-displayLine a-displayLine--bubblegum">CREATIVE CLUB</span>
            </h1>
          </div>
        </div>
      </section>

      <!-- 02. AGENCY REEL PLAYER (SMOOTH TRANSITION INTO MAGENTA) -->
      <section id="agence" class="o-homeAgency">
        <div class="o-homeAgency_grid">
          <h2 class="o-homeAgency_left js-agency-left">
            SOMOS<br />LA POTENCIA,
          </h2>

          <div class="m-videoPlayer js-agency-player">
            <div class="m-videoPlayer_frame">
              <img
                src="${currentReel.image}"
                alt="${escapeHtml(currentReel.label)}"
                width="640"
                height="640"
                class="js-reel-img ${state.reelPlaying ? 'is-animating' : ''}"
                loading="lazy"
              />
              <div class="m-videoPlayer_hud">
                <span class="m-videoPlayer_rec"><i aria-hidden="true"></i> REEL · ${escapeHtml(currentReel.durationLabel)}</span>
                <span class="m-videoPlayer_timer js-reel-timer">-${String(state.reelSecondsLeft).padStart(2, '0')}s</span>
              </div>
              <div class="m-videoPlayer_caption js-reel-caption">
                ${escapeHtml(currentReel.label)}
              </div>
              <div class="m-videoPlayer_controls">
                <button
                  type="button"
                  class="m-videoPlayer_circleBtn js-reel-toggle"
                  data-action="toggle-reel"
                  aria-label="${state.reelPlaying ? 'Pausar showreel' : 'Reproducir showreel'}"
                >
                  ${state.reelPlaying ? '❚❚' : '▶'}
                </button>
                <a
                  href="${BRAND.instagramUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="m-videoPlayer_circleBtn m-videoPlayer_igBtn"
                  aria-label="Ver reels completos en Instagram"
                >
                  IG ↗
                </a>
              </div>
            </div>
          </div>

          <p class="o-homeAgency_right js-agency-right" aria-hidden="true">
            VOS SOS<br />LA HISTORIA.
          </p>
        </div>
      </section>

      <!-- 03. TEAM & ESSENCE (SCROLL-PINNED PHOTO STACK + FLOWING NARRATIVE) -->
      <section id="team" class="o-homeTeam js-team-section">
        <div class="o-homeTeam_grid">
          <div class="o-homeTeam_leftCol">
            <div class="o-homeTeam_leftSticky">
              <div class="a-chatBubble a-chatBubble--inline" aria-hidden="true">
                <span>📱 ⚡ 😜</span>
                <i class="bubble-dot-1"></i>
                <i class="bubble-dot-2"></i>
              </div>

              <h2 class="a-displayStack">
                <span class="a-displayLine a-displayLine--magenta">ELECTRIZAMOS<br />TUS REDES,</span>
                <span class="a-displayLine a-displayLine--bubblegum">Y TU MARCA.</span>
              </h2>

              <span class="a-sectionMicro">AGENCIA</span>
            </div>
          </div>

          <div class="o-homeTeam_centerCol">
            <div class="o-homeTeam_centerSticky">
              <div class="team-fan" role="region" aria-label="Mazo de equipo Sandos">
                ${TEAM_DECK.map((member, idx) => {
                  const offset = (idx - state.teamIndex + TEAM_DECK.length) % TEAM_DECK.length;
                  return `
                    <button
                      type="button"
                      class="team-card team-card--pos-${offset}"
                      data-action="cycle-team"
                      data-index="${idx}"
                      aria-label="Ver foto de ${escapeHtml(member.name)}"
                    >
                      <img src="${member.image}" alt="${escapeHtml(member.alt)}" width="640" height="640" loading="lazy" />
                    </button>
                  `;
                }).join('')}
              </div>

              <div class="team-pills">
                ${TEAM_DECK.map(
                  (member, idx) => `
                  <button
                    type="button"
                    class="a-pill ${idx === state.teamIndex ? 'is-active' : ''}"
                    data-action="cycle-team"
                    data-index="${idx}"
                  >
                    ${escapeHtml(member.name)}
                  </button>
                `,
                ).join('')}
              </div>
            </div>
          </div>

          <div class="o-homeTeam_rightScroll">
            ${TEAM_DECK.map(
              (beat, idx) => `
              <article class="team-story-beat js-team-beat ${idx === 0 ? 'is-current' : ''}" data-beat-index="${idx}">
                <span class="team-beat-eyebrow">${escapeHtml(beat.role)}</span>
                <p class="team-beat-lead"><strong>${escapeHtml(beat.lead)}</strong></p>
                <p class="team-beat-copy">${escapeHtml(beat.copy)}</p>
                <blockquote class="team-quote">${escapeHtml(beat.quote)}</blockquote>
              </article>
            `,
            ).join('')}
          </div>
        </div>
      </section>

      <!-- 04 & 05. UNIFIED HORIZONTAL PROJECTS TRAIN + CENTER-OPENING MANIFESTO & S2 LILAC WIPE -->
      <section id="projets" class="o-homeProjects js-projects-section">
        <div id="manifesto" class="o-homeManifest_anchor" aria-hidden="true"></div>
        <div class="o-homeProjects_sticky">
          <div class="o-homeProjects_grid">
            <div class="o-homeProjects_left">
              <div class="a-chatBubble a-chatBubble--inline" aria-hidden="true">
                <span>📱 💖 😎</span>
                <i class="bubble-dot-1"></i>
                <i class="bubble-dot-2"></i>
              </div>

              <h2 class="a-displayStack">
                <span class="a-displayLine a-displayLine--chalk">LOS HACEMOS,<br />VISIBLES</span>
              </h2>

              <div class="o-homeProjects_avatars" role="tablist" aria-label="Seleccionar proyecto">
                ${FEATURED_PROJECTS.map(
                  (proj, idx) => `
                  <button
                    type="button"
                    role="tab"
                    aria-selected="${idx === state.projectIndex ? 'true' : 'false'}"
                    class="project-avatar-btn ${idx === state.projectIndex ? 'is-active' : ''}"
                    data-action="select-project"
                    data-index="${idx}"
                    aria-label="Ir al proyecto ${escapeHtml(proj.title)}"
                  >
                    <img src="${proj.avatar}" alt="" width="150" height="150" loading="lazy" />
                  </button>
                `,
                ).join('')}
                <a
                  href="${BRAND.instagramUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="project-avatar-more"
                  aria-label="Ver más proyectos en Instagram"
                >
                  +7
                </a>
              </div>

              <span class="a-sectionMicro a-sectionMicro--light">PROYECTOS</span>
            </div>

            <div class="o-homeProjects_railViewport js-projects-viewport">
              <div class="o-homeProjects_track js-projects-track">
                <!-- Leading Agency Intro Card -->
                <article class="train-card train-card--intro">
                  <img
                    src="/assets/ig/post-02-founders.jpg"
                    alt="Dupla Sandos Agency"
                    width="640"
                    height="640"
                    loading="lazy"
                  />
                  <div class="story-scrim" aria-hidden="true"></div>
                  <span class="story-title story-title--small">${renderBeni('CASOS REALES')}<br />${renderBeni('360°')}</span>
                </article>

                ${FEATURED_PROJECTS.map((proj, idx) => {
                  const stories = proj.stories || [proj.image];
                  return `
                  <article
                    class="train-card story-card ${idx === state.projectIndex ? 'is-spotlight' : ''}"
                    data-proj-index="${idx}"
                  >
                    <div class="story-bars" aria-hidden="true">
                      ${stories
                        .map(
                          (_, barIdx) => `
                        <span class="story-bar ${idx === state.projectIndex && barIdx === state.projectStoryIndex ? 'is-current' : idx === state.projectIndex && barIdx < state.projectStoryIndex ? 'is-seen' : ''}"></span>
                      `,
                        )
                        .join('')}
                    </div>

                    <img
                      src="${stories[0]}"
                      alt="${escapeHtml(proj.title)}"
                      width="640"
                      height="640"
                      class="js-proj-img"
                      loading="lazy"
                    />

                    <div class="story-scrim" aria-hidden="true"></div>

                    <h3 class="story-title">${renderBeni(proj.title)}</h3>

                    <div class="story-bottom-bar">
                      <div class="story-bottom-btns">
                        <button
                          type="button"
                          class="story-circle story-circle--magenta"
                          data-action="open-case"
                          data-case-id="${escapeHtml(proj.id)}"
                          aria-label="Abrir detalle de ${escapeHtml(proj.title)}"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          class="story-circle story-circle--like ${state.likedProjects.has(proj.id) ? 'is-liked' : ''}"
                          data-action="like-project"
                          data-case-id="${escapeHtml(proj.id)}"
                          aria-label="Me gusta ${escapeHtml(proj.title)}"
                        >
                          ${state.likedProjects.has(proj.id) ? '♥' : '♡'}
                        </button>
                      </div>
                      <span class="story-cat-pill">${escapeHtml(proj.category)}</span>
                    </div>
                  </article>
                `;
                }).join('')}

                <!-- Trailing Final Card -->
                <article class="train-card train-card--more">
                  <div class="more-card-inner">
                    <span class="more-eyebrow">¿MÁS PROYECTOS?</span>
                    <h3>${renderBeni('EXPLORÁ TODO EN @SANDOSAGENCY')}</h3>
                    <a
                      href="${BRAND.instagramUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="foudre-btn foudre-btn--yellow"
                    >
                      Ver Instagram ↗
                    </a>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <!-- Unified Center-Opening Manifesto Stage (no scroll gap) -->
          <div class="o-homeManifest_screen js-manifest-screen" aria-hidden="true">
            <!-- Layer 1: Center-Expanding Magenta Portal -->
            <div class="o-homeManifest_magentaPortal js-manifest-portal"></div>

            <!-- Layer 2: Phase 1 Blush Cream copy emerging from center -->
            <div class="o-homeManifest_layer o-homeManifest_text1">
              <div class="manifest-line"><span class="manifest-word js-m1-word">ES EL IMPACTO DE TU</span></div>
              <div class="manifest-line"><span class="manifest-word js-m1-word">SOLIDEZ</span></div>
              <div class="manifest-line"><span class="manifest-word js-m1-word">ES APUNTAR JUSTO</span></div>
            </div>

            <!-- Layer 3: Center-Locked Vector Lilac S2 Wipe -->
            <svg
              class="o-homeManifest_wipeSvg"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <g class="js-manifest-s2-group" transform="translate(500, 500) scale(0)">
                <circle class="js-manifest-core" cx="0" cy="0" r="0" fill="#D1CFE4" />
                <g transform="translate(-540, -548)">
                  <path d="${S2_ISOTIPO_PATHS.sPath}" fill="#D1CFE4" fill-rule="evenodd" />
                  <path d="${S2_ISOTIPO_PATHS.twoPath}" fill="#D1CFE4" fill-rule="evenodd" />
                </g>
              </g>
            </svg>

            <!-- Layer 4: Phase 3 Lipstick Magenta statement emerging from center inside pure Lilac -->
            <div class="o-homeManifest_layer o-homeManifest_text2">
              <div class="manifest-line"><span class="manifest-word manifest-word--highlight js-m2-word">Y</span></div>
              <div class="manifest-line"><span class="manifest-word manifest-word--highlight js-m2-word">PISAR</span></div>
              <div class="manifest-line"><span class="manifest-word manifest-word--highlight js-m2-word">FUERTE.</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 06. EXPERTISES (SCROLL-DRIVEN AUTO-PROGRESSION ON #D1CFE4 LILAC) -->
      <section id="expertises" class="o-homeExpertises js-expertises-section">
        <div class="o-homeExpertises_sticky">
          <div class="o-homeExpertises_grid">
            <div class="o-homeExpertises_left">
              <h2 class="a-displayStack">
                <span class="a-displayLine a-displayLine--magenta">PENSAR BIEN<br />PARA SONAR:</span>
                <span class="a-displayLine a-displayLine--chalk">FUERTE.</span>
              </h2>
              <p class="o-homeExpertises_sub">
                Sandos es una agencia creativa 360° fundada sobre tres pilares estratégicos concretos.
              </p>
              <span class="a-sectionMicro">EXPERTISES</span>
            </div>

            <div class="o-homeExpertises_center">
              <div class="expertise-stack">
                ${EXPERTISES.map((exp, idx) => {
                  const pos = (idx - state.activeExpertise + EXPERTISES.length) % EXPERTISES.length;
                  return `
                    <figure class="expertise-photo expertise-photo--pos-${pos}">
                      <img src="${exp.image}" alt="${escapeHtml(exp.alt)}" width="640" height="640" loading="lazy" />
                    </figure>
                  `;
                }).join('')}
                <div class="a-chatBubble a-chatBubble--exp" aria-hidden="true">
                  <span>👀 📱 📊</span>
                  <i class="bubble-dot-1"></i>
                  <i class="bubble-dot-2"></i>
                </div>
              </div>
            </div>

            <div class="o-homeExpertises_right" role="tablist" aria-label="Áreas de expertise">
              ${EXPERTISES.map((exp, idx) => {
                const isActive = idx === state.activeExpertise;
                return `
                  <div class="expertise-row ${isActive ? 'is-active' : ''}">
                    <button
                      type="button"
                      role="tab"
                      aria-selected="${isActive ? 'true' : 'false'}"
                      class="expertise-row-btn"
                      data-action="select-expertise"
                      data-index="${idx}"
                    >
                      ${renderBeni(exp.title)}
                    </button>
                    <div class="expertise-row-tags">
                      <div class="expertise-row-tagsInner">
                        <p class="expertise-summary">${escapeHtml(exp.summary)}</p>
                        <div class="expertise-tag-cloud">
                          ${exp.tags.map((tag) => `<span class="a-tag">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- 07. METHOD & PROCESS: 5 STACKING OVERSIZED CARDS -->
      <section id="process" class="o-homeProcess">
        <div class="o-homeProcess_grid">
          <div class="o-homeProcess_left">
            <div class="a-chatBubble a-chatBubble--inline" aria-hidden="true">
              <span>🫡 ⚡ 🧠</span>
              <i class="bubble-dot-1"></i>
              <i class="bubble-dot-2"></i>
            </div>

            <h2 class="a-displayStack">
              <span class="a-displayLine a-displayLine--magenta">PREFERIMOS<br />ESTE ORDEN.</span>
              <span class="a-displayLine a-displayLine--bubblegum">SIEMPRE.</span>
            </h2>

            <span class="a-sectionMicro">MÉTODO & PROCESO</span>
          </div>

          <div class="o-homeProcess_stack">
            ${PROCESS_CARDS.map(
              (card, idx) => `
              <article
                class="process-card process-card--${card.theme}"
                style="--card-tilt:${card.tilt}; --card-index:${idx}"
              >
                <h3>${renderBeni(card.title)}</h3>
                <span class="process-card_num">${card.num}</span>
                <p>${escapeHtml(card.desc)}</p>
              </article>
            `,
            ).join('')}
          </div>

          <div class="o-homeProcess_right">
            <p class="o-homeProcess_lead">
              <strong>En Sandos cada proyecto sigue un método claro y probado.</strong>
            </p>
            <p>
              Porque una comunicación B2B o comercial que convierte no se improvisa: unimos estrategia, dirección creativa, rodaje ágil y pauta para garantizar resultados reales.
            </p>
          </div>
        </div>
      </section>

      <!-- 08. WHY CHOOSE SANDOS: PINNED CREAM TITLE OVER OBSIDIAN BLACK -->
      <section id="why" class="o-homeWhy js-why-section">
        <div class="o-homeWhy_titlePin">
          <div class="o-homeWhy_bgTitle" aria-hidden="true">
            ${renderBeni('POR QUÉ')}<br />ELEGIR<br />SANDOS
          </div>
        </div>

        <h2 class="visually-hidden">Por qué elegir Sandos</h2>

        <div class="o-homeWhy_cards">
          ${WHY_CARDS.map(
            (card, idx) => `
            <article class="why-card why-card--${card.theme} why-card--col-${idx + 1}" style="--why-tilt:${card.tilt}">
              ${
                card.image
                  ? `<figure class="why-card_illus"><img src="${card.image}" alt="" width="135" height="120" loading="lazy" /></figure>`
                  : `<div class="why-card_icon">${renderWhyIcon(card.icon)}</div>`
              }
              <h3>${renderBeni(card.title)}</h3>
              <p>${escapeHtml(card.desc)}</p>
            </article>
          `,
          ).join('')}
        </div>
      </section>

      <!-- 09. FAQ -->
      <section id="faq" class="o-homeFaq">
        <div class="o-homeFaq_grid">
          <div class="o-homeFaq_left">
            <div class="a-chatBubble a-chatBubble--inline" aria-hidden="true">
              <span>⛑️ 👐 📣</span>
              <i class="bubble-dot-1"></i>
              <i class="bubble-dot-2"></i>
            </div>

            <h2 class="a-displayStack">
              <span class="a-displayLine a-displayLine--magenta">PREGUNTAS<br />CORTAS,</span>
              <span class="a-displayLine a-displayLine--bubblegum">RESPUESTAS<br />CLARAS</span>
            </h2>

            <span class="a-sectionMicro">FAQ</span>
          </div>

          <div class="o-homeFaq_list">
            ${FAQ_ITEMS.map(
              (item, idx) => `
              <details class="foudre-faq-item" ${idx === 0 ? 'open' : ''}>
                <summary>
                  <span>${escapeHtml(item.q)}</span>
                  <span class="faq-toggle-circle" aria-hidden="true"></span>
                </summary>
                <div class="faq-answer">
                  <p>${escapeHtml(item.a)}</p>
                </div>
              </details>
            `,
            ).join('')}
          </div>
        </div>
      </section>
    </main>

    <!-- 10. FOOTER & OVERLAPPING CONTACT QUIZ -->
    <footer id="contact" class="o-footer">
      <div class="o-footer_cards">
        <figure class="o-footer_photo">
          <img
            src="/assets/ig/post-02-founders.jpg"
            alt="Equipo Sandos listo para potenciar tu marca"
            width="640"
            height="640"
            loading="lazy"
          />
        </figure>

        <div class="o-footer_quizCard">
          <span class="o-footer_quizEyebrow">Contacto</span>
          <h2>CONTANOS TU HISTORIA.</h2>
          <p>
            Un mini brief de 3 pasos, menos de un minuto. Recibimos tus respuestas en WhatsApp y te respondemos rápido.
          </p>
          <button
            type="button"
            class="foudre-btn foudre-btn--soft"
            data-action="open-quiz"
          >
            Lanzar el brief →
          </button>
        </div>
      </div>

      <div class="o-footer_wordmarkWrap">
        ${renderGiantSandosSvg('o-footer_wordmark')}
      </div>

      <div class="o-footer_meta">
        <span>© 2026 SANDOS | Agencia Creativa 360°</span>
        <div class="o-footer_links">
          <a href="${BRAND.instagramUrl}" target="_blank" rel="noopener noreferrer">Instagram (@sandosagency)</a>
          <a href="${BRAND.whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp NQN • BUE</a>
        </div>
      </div>
    </footer>
  `;
}

function renderApp() {
  appEl.innerHTML = renderTemplate();
  initAnimationsAndScroll();
  startReelLoop();
}

function addSmoothBgTransition(triggerSelector, fromColor, toColor, start = 'top 82%', end = 'top 22%') {
  if (!globalBgEl) return;
  gsap.fromTo(
    globalBgEl,
    { backgroundColor: fromColor },
    {
      backgroundColor: toColor,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: {
        trigger: triggerSelector,
        start,
        end,
        scrub: true,
      },
    },
  );
}

function initAnimationsAndScroll() {
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
  ScrollTrigger.getAll().forEach((st) => st.kill());

  if (!prefersReduced) {
    lenisInstance = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });
    lenisInstance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      if (lenisInstance) lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // Reveal centered S2 header badge after leaving hero + progress bar + tuck widget cleanly when footer or intro gate is active
  const headerLogo = document.querySelector('.js-header-logo');
  const scrollProgressEl = document.querySelector('.js-scroll-progress');
  const featuredWidget = document.querySelector('.js-featured-widget');
  const footerEl = document.getElementById('contact');

  if (featuredWidget && (prefersReduced || state.introDone)) {
    featuredWidget.classList.remove('is-intro-hidden');
  }

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'bottom 35%',
    onEnter: () => headerLogo?.classList.remove('is-hidden'),
    onLeaveBack: () => headerLogo?.classList.add('is-hidden'),
  });

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      if (scrollProgressEl) {
        scrollProgressEl.style.transform = `scaleX(${self.progress})`;
      }
      if (featuredWidget) {
        const footerHidden = footerEl ? footerEl.getBoundingClientRect().top < window.innerHeight * 0.92 : false;
        featuredWidget.classList.toggle('is-footer-hidden', footerHidden);
      }
    },
  });

  setupIntroGateAutoAndScroll();

  if (!prefersReduced) {
    // 1. CONTINUOUS VIDEO-LIKE GLOBAL BACKGROUND COLOR MORPHS
    gsap.set(globalBgEl, { backgroundColor: '#FFF8F6' });
    addSmoothBgTransition('#agence', '#FFF8F6', '#DB3C8A');
    addSmoothBgTransition('#team', '#DB3C8A', '#FCE5DF');
    addSmoothBgTransition('#projets', '#FCE5DF', FEATURED_PROJECTS[0].bg, 'top 85%', 'top 20%');
    addSmoothBgTransition('#process', '#D1CFE4', '#FCE5DF');
    addSmoothBgTransition('#why', '#FCE5DF', '#0D0C12', 'top 85%', 'top 25%');
    addSmoothBgTransition('#faq', '#0D0C12', '#FFF8F6');
    addSmoothBgTransition('#contact', '#FFF8F6', '#F29EBD', 'top 85%', 'top 30%');

    // 2. AGENCY VIDEO PLAYER 3D CARD ENTRANCE
    gsap.fromTo(
      '.js-agency-player',
      { scale: 0.72, rotateY: 32, xPercent: 18, opacity: 0.6 },
      {
        scale: 1,
        rotateY: 0,
        xPercent: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#agence',
          start: 'top 90%',
          end: 'center center',
          scrub: true,
        },
      },
    );

    // 3. TEAM SECTION SCROLL-DRIVEN CARD & NARRATIVE PROGRESSION
    const teamBeats = gsap.utils.toArray('.js-team-beat');
    teamBeats.forEach((beat, idx) => {
      ScrollTrigger.create({
        trigger: beat,
        start: 'top 65%',
        end: 'bottom 35%',
        onEnter: () => {
          if (state.teamIndex !== idx) {
            state.teamIndex = idx;
            updateTeamDeckDOM();
          }
        },
        onEnterBack: () => {
          if (state.teamIndex !== idx) {
            state.teamIndex = idx;
            updateTeamDeckDOM();
          }
        },
        onLeaveBack: () => {
          const prev = Math.max(0, idx - 1);
          if (state.teamIndex !== prev) {
            state.teamIndex = prev;
            updateTeamDeckDOM();
          }
        },
      });
    });

    // 4 & 5. UNIFIED PROJECTS TRAIN + CENTER-OPENING MANIFESTO + CENTER-LOCKED S2 LILAC WIPE
    const trackEl = document.querySelector('.js-projects-track');
    const viewportEl = document.querySelector('.js-projects-viewport');
    const manifestPortalEl = document.querySelector('.js-manifest-portal');
    const manifestS2GroupEl = document.querySelector('.js-manifest-s2-group');
    const manifestCoreEl = document.querySelector('.js-manifest-core');

    if (trackEl && viewportEl) {
      const getMaxTrainTravel = () => {
        const viewportWidth = viewportEl.getBoundingClientRect().width || window.innerWidth * 0.56;
        return Math.max(1100, trackEl.scrollWidth - viewportWidth + 48);
      };

      const manifestWipeProxy = { scale: 0, rot: -8, coreR: 0 };
      const applyManifestWipe = () => {
        if (manifestS2GroupEl) {
          manifestS2GroupEl.setAttribute(
            'transform',
            `translate(500, 500) scale(${manifestWipeProxy.scale.toFixed(4)}) rotate(${manifestWipeProxy.rot.toFixed(2)})`,
          );
        }
        if (manifestCoreEl) {
          manifestCoreEl.setAttribute('r', manifestWipeProxy.coreR.toFixed(2));
        }
      };

      const projTl = gsap.timeline({
        onUpdate: applyManifestWipe,
        scrollTrigger: {
          trigger: '.js-projects-section',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            const trainProgress = Math.min(1, p / 0.45);
            const rawProj = Math.min(
              FEATURED_PROJECTS.length - 0.0001,
              trainProgress * FEATURED_PROJECTS.length,
            );
            const activeProj = Math.floor(rawProj);
            const localProg = rawProj - activeProj;
            const storyCount = FEATURED_PROJECTS[activeProj]?.stories?.length || 1;
            const activeSlide = Math.min(storyCount - 1, Math.floor(localProg * storyCount));

            if (activeProj !== state.projectIndex || activeSlide !== state.projectStoryIndex) {
              state.projectIndex = activeProj;
              state.projectStoryIndex = activeSlide;
              updateProjectStageDOM();
            }

            if (globalBgEl) {
              if (p >= 0.82) {
                globalBgEl.style.backgroundColor = '#D1CFE4';
              } else if (p >= 0.48) {
                globalBgEl.style.backgroundColor = '#DB3C8A';
              } else if (p > 0.01) {
                const colorStops = [...FEATURED_PROJECTS.map((pr) => pr.bg), '#F29EBD'];
                const scaled = trainProgress * (colorStops.length - 1);
                const idx = Math.min(colorStops.length - 2, Math.floor(scaled));
                const frac = scaled - idx;
                globalBgEl.style.backgroundColor = gsap.utils.interpolate(
                  colorStops[idx],
                  colorStops[idx + 1],
                  frac,
                );
              }
            }
          },
        },
      });

      // Strict initial states at t=0
      projTl.set('.js-manifest-screen', { autoAlpha: 0 }, 0);
      projTl.set('.o-homeManifest_text1', { autoAlpha: 0, scale: 0.32 }, 0);
      projTl.set('.js-m1-word', { autoAlpha: 0, scale: 0.55 }, 0);
      projTl.set('.o-homeManifest_text2', { autoAlpha: 0, scale: 0.32 }, 0);
      projTl.set('.js-m2-word', { autoAlpha: 0, scale: 0.55 }, 0);

      // Horizontal projects train (0.00 -> 0.45)
      projTl.to(
        trackEl,
        {
          x: () => -getMaxTrainTravel(),
          ease: 'none',
          duration: 0.45,
        },
        0,
      );

      // Enable Manifesto stage right as the center portal begins
      projTl.set('.js-manifest-screen', { autoAlpha: 1 }, 0.43);

      // Phase 0: Center-Expanding Magenta Portal directly over #projets (0.43 -> 0.55)
      if (manifestPortalEl) {
        projTl.fromTo(
          manifestPortalEl,
          { scale: 0, borderRadius: '64px' },
          { scale: 1, borderRadius: '0px', ease: 'power2.out', duration: 0.12 },
          0.43,
        );
      }

      // Phase 1: Blush Cream copy emerges from center in sync with the portal (0.47 -> 0.59), holds, then scales out (0.67 -> 0.72)
      projTl.fromTo(
        '.o-homeManifest_text1',
        { autoAlpha: 0, scale: 0.32 },
        { autoAlpha: 1, scale: 1, ease: 'back.out(1.15)', duration: 0.12 },
        0.47,
      );
      projTl.fromTo(
        '.js-m1-word',
        { autoAlpha: 0, scale: 0.55 },
        { autoAlpha: 1, scale: 1, stagger: 0.02, ease: 'back.out(1.2)', duration: 0.09 },
        0.48,
      );
      projTl.to(
        '.o-homeManifest_text1',
        { autoAlpha: 0, scale: 1.22, ease: 'power2.in', duration: 0.05 },
        0.67,
      );

      // Phase 2: Center-locked Lilac S2 blooms radially from (500, 500) + center core seals the gap completely (0.70 -> 0.85)
      projTl.to(
        manifestWipeProxy,
        { scale: 0.88, rot: 0, coreR: 0, ease: 'power1.out', duration: 0.07 },
        0.7,
      );
      projTl.to(
        manifestWipeProxy,
        { scale: 16, rot: 10, ease: 'power2.inOut', duration: 0.08 },
        0.77,
      );
      projTl.to(
        manifestWipeProxy,
        { coreR: 980, ease: 'power2.inOut', duration: 0.08 },
        0.77,
      );

      // Phase 3: Lipstick Magenta statement emerges from center inside solid Lilac & holds cleanly until end (0.81 -> 1.00)
      projTl.fromTo(
        '.o-homeManifest_text2',
        { autoAlpha: 0, scale: 0.32 },
        { autoAlpha: 1, scale: 1, ease: 'back.out(1.15)', duration: 0.1 },
        0.81,
      );
      projTl.fromTo(
        '.js-m2-word',
        { autoAlpha: 0, scale: 0.55 },
        { autoAlpha: 1, scale: 1, stagger: 0.02, ease: 'back.out(1.2)', duration: 0.08 },
        0.82,
      );
      projTl.to({}, { duration: 0.09 }, 0.91);
    }

    // 6. EXPERTISES PINNED SCROLL AUTO-PROGRESSION
    ScrollTrigger.create({
      trigger: '.js-expertises-section',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const nextExp = Math.min(
          EXPERTISES.length - 1,
          Math.floor(self.progress * EXPERTISES.length),
        );
        if (nextExp !== state.activeExpertise) {
          state.activeExpertise = nextExp;
          updateExpertiseDOM();
        }
      },
    });

    // Hero mouse parallax
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.addEventListener('pointermove', (event) => {
        const rect = heroSection.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        heroSection.querySelectorAll('[data-parallax-depth]').forEach((card) => {
          const depth = Number(card.dataset.parallaxDepth || '20');
          gsap.to(card, {
            x: nx * depth,
            y: ny * depth * 0.7,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
  }
}

function runIntroGateOpening() {
  if (state.introDone) return;
  state.introDone = true;
  if (introAutoTimer) {
    clearTimeout(introAutoTimer);
    introAutoTimer = null;
  }

  const introGateEl = document.querySelector('.js-intro-gate');
  const introCutoutEl = document.querySelector('.js-intro-cutout');
  const introCoreHoleEl = document.querySelector('.js-intro-core-hole');
  const introRimEl = document.querySelector('.js-intro-cutout-rim');
  const featuredWidget = document.querySelector('.js-featured-widget');

  if (!introGateEl || !introCutoutEl || !introCoreHoleEl || !introRimEl) {
    if (introGateEl) introGateEl.style.display = 'none';
    featuredWidget?.classList.remove('is-intro-hidden');
    return;
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    introGateEl.style.display = 'none';
    introGateEl.setAttribute('aria-hidden', 'true');
    featuredWidget?.classList.remove('is-intro-hidden');
    return;
  }

  const introProxy = { scale: 0, rot: 0, coreR: 0 };
  const applyIntroMask = () => {
    const tf = `translate(500, 500) scale(${introProxy.scale.toFixed(4)}) rotate(${introProxy.rot.toFixed(2)})`;
    introCutoutEl.setAttribute('transform', tf);
    introRimEl.setAttribute('transform', tf);
    introCoreHoleEl.setAttribute('r', introProxy.coreR.toFixed(2));
  };

  const tl = gsap.timeline({
    onUpdate: applyIntroMask,
    onComplete: () => {
      introGateEl.style.display = 'none';
      introGateEl.setAttribute('aria-hidden', 'true');
      featuredWidget?.classList.remove('is-intro-hidden');
    },
  });

  tl.to('.js-intro-content', { yPercent: -18, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0);
  tl.to(introProxy, { scale: 0.95, rot: -4, duration: 0.38, ease: 'power1.out' }, 0.08);
  tl.to(introRimEl, { attr: { opacity: 1 }, duration: 0.14, ease: 'none' }, 0.12);
  tl.to(introProxy, { scale: 16, rot: -12, duration: 0.72, ease: 'power2.in' }, 0.44);
  tl.to(introProxy, { coreR: 980, duration: 0.42, ease: 'power2.in' }, 0.68);
  tl.to(introRimEl, { attr: { opacity: 0 }, duration: 0.25, ease: 'none' }, 0.82);
  tl.to(introGateEl, { autoAlpha: 0, duration: 0.18, ease: 'none' }, 1.1);
}

function setupIntroGateAutoAndScroll() {
  if (introAutoTimer) {
    clearTimeout(introAutoTimer);
    introAutoTimer = null;
  }
  if (state.introDone) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    runIntroGateOpening();
    return;
  }

  const triggerEarly = () => {
    window.removeEventListener('wheel', triggerEarly);
    window.removeEventListener('touchmove', triggerEarly);
    window.removeEventListener('scroll', triggerEarly);
    window.removeEventListener('keydown', onKeyDown);
    document.getElementById('intro-gate')?.removeEventListener('pointerdown', triggerEarly);
    runIntroGateOpening();
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ' || event.key === 'Enter') {
      triggerEarly();
    }
  };

  window.addEventListener('wheel', triggerEarly, { passive: true, once: true });
  window.addEventListener('touchmove', triggerEarly, { passive: true, once: true });
  window.addEventListener('scroll', triggerEarly, { passive: true, once: true });
  window.addEventListener('keydown', onKeyDown);
  document.getElementById('intro-gate')?.addEventListener('pointerdown', triggerEarly, { once: true });

  introAutoTimer = setTimeout(() => {
    triggerEarly();
  }, 4500);
}

function getHeroOpenedScrollY() {
  if (!state.introDone) runIntroGateOpening();
  return 0;
}

function startReelLoop() {
  if (reelTimer) {
    clearInterval(reelTimer);
    reelTimer = null;
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  reelTimer = setInterval(() => {
    if (!state.reelPlaying) return;
    state.reelSecondsLeft -= 1;
    if (state.reelSecondsLeft <= 0) {
      state.reelSecondsLeft = 14;
      state.reelIndex = (state.reelIndex + 1) % REEL_SEQUENCE.length;
      const reel = REEL_SEQUENCE[state.reelIndex];
      const img = document.querySelector('.js-reel-img');
      const cap = document.querySelector('.js-reel-caption');
      const rec = document.querySelector('.m-videoPlayer_rec');
      if (img) {
        img.src = reel.image;
        img.alt = reel.label;
      }
      if (cap) cap.textContent = reel.label;
      if (rec) rec.innerHTML = `<i aria-hidden="true"></i> REEL · ${escapeHtml(reel.durationLabel)}`;
    }
    const timerEl = document.querySelector('.js-reel-timer');
    if (timerEl) {
      timerEl.textContent = `-${String(state.reelSecondsLeft).padStart(2, '0')}s`;
    }
  }, 1000);
}

function updateTeamDeckDOM() {
  document.querySelectorAll('.team-card').forEach((card) => {
    const idx = Number(card.dataset.index);
    const pos = (idx - state.teamIndex + TEAM_DECK.length) % TEAM_DECK.length;
    card.className = `team-card team-card--pos-${pos}`;
  });
  document.querySelectorAll('.team-pills .a-pill').forEach((pill) => {
    const idx = Number(pill.dataset.index);
    pill.classList.toggle('is-active', idx === state.teamIndex);
  });
  document.querySelectorAll('.js-team-beat').forEach((beat, idx) => {
    beat.classList.toggle('is-current', idx === state.teamIndex);
  });
}

function updateProjectStageDOM() {
  document.querySelectorAll('.project-avatar-btn').forEach((btn) => {
    const idx = Number(btn.dataset.index);
    const active = idx === state.projectIndex;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  document.querySelectorAll('.train-card[data-proj-index]').forEach((card) => {
    const idx = Number(card.dataset.projIndex);
    const isSpot = idx === state.projectIndex;
    card.classList.toggle('is-spotlight', isSpot);
    const proj = FEATURED_PROJECTS[idx];
    const id = proj?.id;
    const stories = proj?.stories || (proj?.image ? [proj.image] : []);
    const slideIdx = isSpot ? Math.min(Math.max(0, stories.length - 1), state.projectStoryIndex) : 0;
    const imgEl = card.querySelector('.js-proj-img');
    if (imgEl && stories[slideIdx] && imgEl.getAttribute('src') !== stories[slideIdx]) {
      imgEl.setAttribute('src', stories[slideIdx]);
    }
    card.querySelectorAll('.story-bar').forEach((bar, barIdx) => {
      bar.classList.toggle('is-current', isSpot && barIdx === slideIdx);
      bar.classList.toggle('is-seen', isSpot && barIdx < slideIdx);
    });
    const likeBtn = card.querySelector('.story-circle--like');
    if (likeBtn && id) {
      const liked = state.likedProjects.has(id);
      likeBtn.classList.toggle('is-liked', liked);
      likeBtn.textContent = liked ? '♥' : '♡';
    }
  });
}

function scrollToProjectIndex(idx) {
  const section = document.querySelector('.js-projects-section');
  if (!section) return;
  const maxTravel = section.offsetHeight - window.innerHeight;
  const frac = ((idx + 0.18) / FEATURED_PROJECTS.length) * 0.45;
  const targetY = section.offsetTop + maxTravel * frac;
  if (lenisInstance) {
    lenisInstance.scrollTo(targetY, { duration: 0.9 });
  } else {
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }
}

function updateExpertiseDOM() {
  document.querySelectorAll('.expertise-row').forEach((row, idx) => {
    const active = idx === state.activeExpertise;
    row.classList.toggle('is-active', active);
    row.querySelector('.expertise-row-btn')?.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  document.querySelectorAll('.expertise-photo').forEach((fig, idx) => {
    const pos = (idx - state.activeExpertise + EXPERTISES.length) % EXPERTISES.length;
    fig.className = `expertise-photo expertise-photo--pos-${pos}`;
  });
}

function openCaseModal(caseId) {
  const proj = FEATURED_PROJECTS.find((p) => p.id === caseId) || FEATURED_PROJECTS[0];
  if (!proj || !caseDialog) return;

  document.getElementById('case-dialog-tag').textContent = proj.category.toUpperCase();
  const img = document.getElementById('case-dialog-img');
  img.src = proj.image;
  img.alt = proj.title;
  document.getElementById('case-dialog-meta').textContent = `SANDOS // ${proj.subtitle}`;
  document.getElementById('case-dialog-title').innerHTML = renderBeni(proj.title);
  document.getElementById('case-dialog-desc').textContent = proj.summary;
  document.getElementById('case-dialog-pills').innerHTML = proj.tags
    .map((t) => `<span class="a-tag">${escapeHtml(t)}</span>`)
    .join('');
  document.getElementById('case-dialog-ig').href = proj.url;

  caseDialog.showModal();
}

function setupLightDismissFallback(dialogEl) {
  if (!dialogEl || 'closedBy' in HTMLDialogElement.prototype) return;
  dialogEl.addEventListener('click', (event) => {
    if (event.target !== dialogEl) return;
    const rect = dialogEl.getBoundingClientRect();
    const inside =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!inside) dialogEl.close();
  });
}

setupLightDismissFallback(caseDialog);
setupLightDismissFallback(quizDialog);

document.getElementById('quiz-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const services = formData.getAll('services').join(', ') || 'Estrategia 360°';
  const location = formData.get('location') || 'Argentina';
  const brand = formData.get('brand') || 'Mi marca';
  const message = encodeURIComponent(
    `Hola Sandos! Soy ${brand} (${location}). Me interesa potenciar mi marca con: ${services}.`,
  );
  quizDialog?.close();
  window.open(`${BRAND.whatsappUrl}?text=${message}`, '_blank', 'noopener,noreferrer');
});

document.addEventListener('click', (event) => {
  const headerLogoLink = event.target.closest('a.js-header-logo');
  if (headerLogoLink) {
    event.preventDefault();
    const targetY = getHeroOpenedScrollY();
    if (lenisInstance) lenisInstance.scrollTo(targetY, { duration: 1.0 });
    else window.scrollTo({ top: targetY, behavior: 'smooth' });
    return;
  }

  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;

  const action = trigger.dataset.action;

  if (action === 'toggle-menu') {
    state.menuOpen = !state.menuOpen;
    state.whatsappOpen = false;
    document.getElementById('menu-overlay')?.classList.toggle('is-open', state.menuOpen);
    document.getElementById('whatsapp-popin')?.classList.remove('is-open');
    document.querySelector('.hamburger-glyph')?.classList.toggle('is-open', state.menuOpen);
    trigger.setAttribute('aria-expanded', state.menuOpen ? 'true' : 'false');
    trigger.setAttribute('aria-label', state.menuOpen ? 'Cerrar menú' : 'Abrir menú');
  } else if (action === 'menu-jump') {
    state.menuOpen = false;
    document.getElementById('menu-overlay')?.classList.remove('is-open');
    document.querySelector('.hamburger-glyph')?.classList.remove('is-open');
    document.querySelector('.js-menu-toggle')?.setAttribute('aria-expanded', 'false');
    const href = trigger.getAttribute('href');
    if (href === '#hero') {
      event.preventDefault();
      const targetY = getHeroOpenedScrollY();
      if (lenisInstance) lenisInstance.scrollTo(targetY, { duration: 1.1 });
      else window.scrollTo({ top: targetY, behavior: 'smooth' });
    } else if (href && lenisInstance) {
      event.preventDefault();
      lenisInstance.scrollTo(href, { duration: 1.1 });
    }
  } else if (action === 'toggle-whatsapp') {
    state.whatsappOpen = !state.whatsappOpen;
    state.menuOpen = false;
    document.getElementById('whatsapp-popin')?.classList.toggle('is-open', state.whatsappOpen);
    document.getElementById('menu-overlay')?.classList.remove('is-open');
    document.querySelector('.hamburger-glyph')?.classList.remove('is-open');
  } else if (action === 'dismiss-featured') {
    state.featuredDismissed = true;
    document.querySelector('.js-featured-widget')?.classList.add('is-dismissed');
  } else if (action === 'toggle-reel') {
    state.reelPlaying = !state.reelPlaying;
    const btn = document.querySelector('.js-reel-toggle');
    const img = document.querySelector('.js-reel-img');
    if (btn) {
      btn.textContent = state.reelPlaying ? '❚❚' : '▶';
      btn.setAttribute('aria-label', state.reelPlaying ? 'Pausar showreel' : 'Reproducir showreel');
    }
    if (img) img.classList.toggle('is-animating', state.reelPlaying);
  } else if (action === 'cycle-team') {
    const idx = Number(trigger.dataset.index);
    state.teamIndex = Number.isNaN(idx)
      ? (state.teamIndex + 1) % TEAM_DECK.length
      : idx;
    updateTeamDeckDOM();
  } else if (action === 'select-project') {
    const idx = Number(trigger.dataset.index);
    if (!Number.isNaN(idx)) {
      state.projectIndex = idx;
      state.projectStoryIndex = 0;
      updateProjectStageDOM();
      scrollToProjectIndex(idx);
    }
  } else if (action === 'like-project') {
    const id = trigger.dataset.caseId;
    if (id) {
      if (state.likedProjects.has(id)) state.likedProjects.delete(id);
      else state.likedProjects.add(id);
      updateProjectStageDOM();
    }
  } else if (action === 'select-expertise') {
    const idx = Number(trigger.dataset.index);
    if (!Number.isNaN(idx)) {
      state.activeExpertise = idx;
      updateExpertiseDOM();
    }
  } else if (action === 'open-case') {
    openCaseModal(trigger.dataset.caseId);
  } else if (action === 'open-quiz') {
    quizDialog?.showModal();
  }
});

renderApp();
