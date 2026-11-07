# WMA Converter

Aplicación web para convertir archivos WMA a MP3 sin salir del equipo del usuario. El procesamiento se realiza localmente en el navegador mediante FFmpeg.wasm y la salida puede descargarse individualmente o empaquetarse en ZIP.

## Requisitos

- Servidor local HTTP/HTTPS.
- Navegador moderno con soporte WebAssembly.

## Inicio rápido

```powershell
cd "C:\Users\gomez\OneDrive\Escritorio\proyectos HTML\Convertidor"
npm install
python -m http.server 8080
```

Luego abre la URL `http://localhost:8080/html/convertidor.html`.

## Observación sobre FFmpeg

La aplicación sirve localmente FFmpeg.wasm, su worker y JSZip desde `node_modules`, de modo que el worker se carga desde el mismo origen y no queda bloqueado por el navegador. El runtime WebAssembly se busca primero en `vendor/ffmpeg`; si no está presente, se descarga desde jsDelivr y se requiere Internet. Los archivos compilados del core FFmpeg no se incluyen en el repositorio.
