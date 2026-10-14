// API pública que resuelve un enlace de TikTok a sus URLs de video/audio.
// Se usa porque la app es 100% estática (gh-pages) y TikTok no permite CORS directo.
const API_BASE = 'https://www.tikwm.com';
const API_ENDPOINT = `${API_BASE}/api/`;

const TIKTOK_URL_REGEX =
  /^https?:\/\/(www\.|m\.|vm\.|vt\.)?tiktok\.com\/.+/i;

// --- Referencias al DOM ---
const form = document.querySelector('#download-form');
const input = document.querySelector('#tiktok-url');
const pasteBtn = document.querySelector('#paste-btn');
const submitBtn = document.querySelector('#submit-btn');
const statusMessage = document.querySelector('#status-message');
const loader = document.querySelector('#loader');
const resultSection = document.querySelector('#result-section');

const thumbnail = document.querySelector('#video-thumbnail');
const authorAvatar = document.querySelector('#author-avatar');
const authorName = document.querySelector('#author-name');
const description = document.querySelector('#video-description');

const btnNoWatermark = document.querySelector('#btn-download-no-watermark');
const btnHd = document.querySelector('#btn-download-hd');
const btnAudio = document.querySelector('#btn-download-audio');
const hdNote = document.querySelector('#hd-note');

// --- Utilidades de UI ---
const ALERT_CLASSES = {
  error: 'alert-error',
  success: 'alert-success',
  info: 'alert-info',
  warning: 'alert-warning',
};

function showStatus(message, type = 'error') {
  statusMessage.classList.remove(...Object.values(ALERT_CLASSES));
  statusMessage.classList.add(ALERT_CLASSES[type] ?? ALERT_CLASSES.info);
  statusMessage.textContent = message;
  statusMessage.dataset.type = type;
  statusMessage.hidden = false;
}

function hideStatus() {
  statusMessage.hidden = true;
  statusMessage.textContent = '';
}

function setLoading(isLoading) {
  loader.hidden = !isLoading;
  submitBtn.disabled = isLoading;
  input.disabled = isLoading;
}

/** Convierte rutas relativas devueltas por la API en absolutas. */
function toAbsoluteUrl(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

// --- Lógica principal ---
async function fetchVideoInfo(tiktokUrl) {
  const params = new URLSearchParams({ url: tiktokUrl, hd: '1' });
  const response = await fetch(`${API_ENDPOINT}?${params}`);

  if (!response.ok) {
    throw new Error(`Error del servidor (${response.status})`);
  }

  const json = await response.json();

  if (json.code !== 0 || !json.data) {
    throw new Error(json.msg || 'No se pudo obtener el video. Verifica el enlace.');
  }

  const { data } = json;
  const play = toAbsoluteUrl(data.play);
  const hdplay = toAbsoluteUrl(data.hdplay);

  return {
    id: data.id,
    title: data.title || '',
    cover: toAbsoluteUrl(data.origin_cover || data.cover),
    author: {
      nickname: data.author?.nickname || '',
      username: data.author?.unique_id || '',
      avatar: toAbsoluteUrl(data.author?.avatar),
    },
    play,
    // Solo se ofrece HD si realmente es un archivo distinto al normal.
    hdplay: isSameMedia(play, hdplay, data.size, data.hd_size) ? '' : hdplay,
    music: toAbsoluteUrl(data.music),
  };
}

/**
 * Extrae el identificador del archivo en el CDN de TikTok: el último segmento
 * de la ruta (p. ej. `.../tos-alisg-pve-0037c001/ocIrQ4Aegk3g.../`).
 * El host y el hash inicial cambian entre `play` y `hdplay` aunque sea el mismo archivo.
 */
function getMediaKey(url) {
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    return segments.at(-1) ?? '';
  } catch {
    return '';
  }
}

/** tikwm a veces devuelve en `hdplay` el mismo archivo que en `play`. */
function isSameMedia(playUrl, hdUrl, size, hdSize) {
  if (!hdUrl) return true;
  if (hdUrl === playUrl) return true;

  const playKey = getMediaKey(playUrl);
  if (playKey && playKey === getMediaKey(hdUrl)) return true;

  return Boolean(size) && size === hdSize;
}

/**
 * Descarga un archivo forzando el diálogo de guardado.
 * El atributo `download` se ignora en URLs de otro origen, así que se
 * descarga como blob; si CORS lo impide, se abre en una pestaña nueva.
 */
async function downloadFile(url, filename, button) {
  const originalContent = button.innerHTML;
  button.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Descargando...';
  button.setAttribute('aria-disabled', 'true');
  button.classList.add('btn-disabled');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (error) {
    console.warn('Descarga directa falló, abriendo en nueva pestaña:', error);
    window.open(url, '_blank', 'noopener,noreferrer');
  } finally {
    button.innerHTML = originalContent;
    button.removeAttribute('aria-disabled');
    button.classList.remove('btn-disabled');
  }
}

function bindDownloadButton(button, url, filename) {
  if (!url) {
    button.hidden = true;
    return;
  }
  button.hidden = false;
  button.href = url;
  button.onclick = (event) => {
    event.preventDefault();
    if (button.getAttribute('aria-disabled') === 'true') return;
    downloadFile(url, filename, button);
  };
}

function renderResult(video) {
  thumbnail.src = video.cover;
  thumbnail.alt = video.title || 'Miniatura del video';

  authorAvatar.src = video.author.avatar;
  authorAvatar.hidden = !video.author.avatar;
  authorName.textContent = video.author.username
    ? `@${video.author.username}`
    : video.author.nickname;

  description.textContent = video.title || 'Sin descripción';

  const baseName = `tiktok_${video.author.username || 'video'}_${video.id}`;
  bindDownloadButton(btnNoWatermark, video.play, `${baseName}.mp4`);
  bindDownloadButton(btnHd, video.hdplay, `${baseName}_hd.mp4`);
  bindDownloadButton(btnAudio, video.music, `${baseName}.mp3`);
  hdNote.hidden = Boolean(video.hdplay);

  resultSection.hidden = false;
}

async function handleSubmit(event) {
  event.preventDefault();
  hideStatus();
  resultSection.hidden = true;

  const url = input.value.trim();

  if (!TIKTOK_URL_REGEX.test(url)) {
    showStatus('Ingresa un enlace válido de TikTok (ej. https://www.tiktok.com/@usuario/video/123...).');
    input.focus();
    return;
  }

  setLoading(true);
  try {
    const video = await fetchVideoInfo(url);
    renderResult(video);
    showStatus('¡Video encontrado! Elige una opción de descarga.', 'success');
  } catch (error) {
    console.error(error);
    showStatus(
      error instanceof TypeError
        ? 'No se pudo conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.'
        : error.message,
    );
  } finally {
    setLoading(false);
  }
}

async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText();
    input.value = text.trim();
    input.focus();
  } catch {
    showStatus('No se pudo acceder al portapapeles. Pega el enlace manualmente.');
  }
}

// --- Eventos ---
form.addEventListener('submit', handleSubmit);
pasteBtn.addEventListener('click', handlePaste);

