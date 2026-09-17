# Bicycle comparison viewer

[Open the viewer](https://Fabien-Pinna.github.io/bike-viewer/).

French 3D comparison of Perf XS, ePerf M, ePerf XL, Perf XXL and eTouring L.
Choose individual, collective or transparent overlay mode; switch camera views,
select models and compare dimensions at their original scale.

## Development

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
npm run build
```

No environment variables are required. Models are included in public/models/bikes.
The standalone viewer was extracted from the existing trailer operations viewer.

## Deployment

GitHub Actions builds main and deploys to GitHub Pages on every push.
Repository Pages settings must use GitHub Actions. The workflow sets Vite's base
path from the Pages configuration.

The site, source and included GLB models are public; no account is needed to view.
Original Blender projects and reference photographs are not included.

## Dimensions

Models are photo reconstructions. Dimensions describe the exported geometry,
not manufacturer-certified specifications. Geometry is in metres; the interface
displays millimetres. The catalogue includes exported bounds and wheel axle datums.
