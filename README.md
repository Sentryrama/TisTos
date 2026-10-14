# TikTok Downloader

Aplicación web estática, rápida y moderna para consultar y descargar videos de TikTok a partir de su enlace.

> [!IMPORTANT]  
> **Aviso de Uso Educativo y Personal**  
> Este proyecto ha sido desarrollado exclusivamente con **fines educativos, de investigación y para uso personal**. No está afiliado, respaldado ni asociado de ninguna manera con TikTok o ByteDance Ltd. Respeta los derechos de autor y la propiedad intelectual de los creadores de contenido al utilizar esta herramienta.

---

## ✨ Cualidades y Características

- **Descarga sin marca de agua**: Obtén el video limpio y listo para reproducir.
- **Soporte de alta definición (HD)**: Descarga la versión de mayor calidad disponible cuando el video cuenta con una pista de resolución superior.
- **Extracción de audio (MP3)**: Permite descargar únicamente la pista de sonido o música original del video.
- **Diseño moderno y responsive**: Construido con **DaisyUI 5** y **Tailwind CSS**, adaptado fluidamente para dispositivos móviles, tablets y ordenadores de escritorio.
- **Modo oscuro / claro**: Selector de temas integrado que recuerda las preferencias del usuario.
- **Detección inteligente de URLs**: Compatible con enlaces estándar (`tiktok.com/@usuario/video/...`) y enlaces cortos móviles (`vm.tiktok.com`, `vt.tiktok.com`).
- **Botón rápido para pegar**: Integración con la Clipboard API para pegar el enlace con un solo clic.
- **100% estático y sin servidor propio**: Puede alojarse de forma totalmente gratuita en plataformas como GitHub Pages.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5 semántico, CSS3 moderno, JavaScript vanilla (ES Modules, Fetch & Blob API).
- **Estilos & UI**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/).
- **Servidor de desarrollo**: [Servor](https://github.com/lukejacksonn/servor) (recarga en vivo sin dependencias pesadas).
- **Despliegue**: [gh-pages](https://github.com/tschaub/gh-pages) para publicación directa en GitHub Pages.
- **Gestor de paquetes**: [pnpm](https://pnpm.io/).

---

## 🚀 Inicio Rápido en Local

### 1. Prerrequisitos
Asegúrate de tener instalado **Node.js** y **pnpm**:
```bash
npm install -g pnpm
```

### 2. Instalación
Clona el repositorio e instala las dependencias:
```bash
git clone https://github.com/TU_USUARIO/TiktokDownloader.git
cd TiktokDownloader
pnpm install
```

### 3. Ejecución en desarrollo
Inicia el servidor local con recarga en tiempo real:
```bash
pnpm dev
```
La aplicación se abrirá en `http://localhost:8080`.

---

## 📦 Despliegue en GitHub Pages

El proyecto ya está preconfigurado para publicarse fácilmente en GitHub Pages:

```bash
pnpm run deploy
```

Este comando publica automáticamente la carpeta `src/` en la rama `gh-pages` de tu repositorio. Luego, en la configuración de tu repositorio en GitHub (**Settings > Pages**), selecciona la rama `gh-pages` como fuente del despliegue.

---

## 📄 Licencia

Distribuido bajo la licencia ISC. Consulta el archivo [package.json](package.json) para más detalles.
