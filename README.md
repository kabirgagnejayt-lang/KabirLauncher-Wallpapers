# KabirLauncher site and wallpaper catalog

This repository contains the existing KabirLauncher landing page and its support pages, the six original image wallpapers, and their optimized WebP files for Android.

## Wallpaper files

`wallpapers.json` is the shared catalog. Each wallpaper has `720p` (720 × 1280), `1080p` (1080 × 1920), `2k` (1440 × 2560), and `4k` (2160 × 3840) files. The `bytes` value is the exact file size; the Android market displays it in decimal MB. The landing page uses its original 540 × 960 preview images in `assets/`.

The Android app keeps Dusk as its offline default. The six image wallpapers load their 720p preview from this site and download the selected quality only when the user applies one. Applying a different downloaded wallpaper replaces the previous active image.

## Hosting

Deploy the repository root on Vercel with the `Other` framework preset. The landing page is `/`, the shared catalog is `/wallpapers.json`, and files are under `/wallpapers/<id>/<quality>.webp`.
