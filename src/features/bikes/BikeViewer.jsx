import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { BikeScene } from './BikeScene';
import catalog from './catalog.json';
import './bikes.css';

const mm = value => Math.round(value * 1000).toLocaleString('fr-FR');
const metrics = [['Longueur', m => m.size[0]], ['Largeur hors tout', m => m.size[2]], ['Hauteur hors tout', m => m.size[1]], ['Empattement', m => m.wheelbase]];

/** Compare saved bicycle models at their original physical scale. */
export const BikeViewer = () => {
  const [selected, setSelected] = useState(catalog.map(m => m.id));
  const [solo, setSolo] = useState(catalog[0].id);
  const [mode, setMode] = useState('solo');
  const [view, setView] = useState('Profil');
  const [dimensions, setDimensions] = useState(true);
  const [alignment, setAlignment] = useState('rear');
  const [reset, setReset] = useState(0);
  const [retry, setRetry] = useState(0);
  const [lost, setLost] = useState(false);
  const shown = catalog.filter(m => mode === 'solo' ? m.id === solo : selected.includes(m.id));
  useEffect(() => { document.title = 'Vélos · Comparateur de dimensions'; document.documentElement.lang = 'fr'; }, []);
  const toggle = id => setSelected(previous => previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]);
  return <main className="bv-app">
    <header className="bv-header"><div><span className="bv-mark">↔</span><strong>Atelier vélos</strong><span className="bv-subtitle">Comparateur de dimensions</span></div><a href="https://Fabien-Pinna.github.io/trailer-ops-viewer/">Voir les remorques ↗</a></header>
    <div className="bv-workspace">
      <aside className="bv-sidebar">
        <div className="bv-heading"><span className="bv-eyebrow">BIBLIOTHÈQUE 3D</span><h1>Les vélos,<br />à la même échelle.</h1><p>5 modèles · dimensions réelles du modèle</p></div>
        <div className="bv-selection"><h2>Modèles</h2><button onClick={() => { setSelected(catalog.map(m => m.id)); setMode('all'); }}>Tout afficher</button></div>
        <div className="bv-models">{catalog.map(model => <div key={model.id} className={`bv-card ${shown.includes(model) ? 'is-selected' : ''}`} style={{ '--bike-color': model.color }}>
          <label><input type={mode === 'solo' ? 'radio' : 'checkbox'} name="bike" checked={mode === 'solo' ? solo === model.id : selected.includes(model.id)} onChange={() => mode === 'solo' ? setSolo(model.id) : toggle(model.id)} /><span><strong>{model.name}</strong><small>{model.type}</small></span></label>
          <div className="bv-card-bottom"><span>{mm(model.size[0])} × {mm(model.size[2])} × {mm(model.size[1])}<small> mm</small></span><button aria-label={`Voir ${model.name} seul`} onClick={() => { setSolo(model.id); setMode('solo'); }}>Isoler ↗</button></div>
        </div>)}</div>
        <p className="bv-note">Longueur × largeur × hauteur. Les modèles sont reconstruits d’après photos ; les cotes décrivent leur géométrie, pas une fiche constructeur.</p>
      </aside>
      <section className="bv-main" aria-label="Comparaison des vélos">
        <div className="bv-toolbar"><div className="bv-segment" aria-label="Mode d’affichage">{[['solo', 'Individuel'], ['all', 'Ensemble'], ['overlay', 'Superposition']].map(([id, label]) => <button key={id} aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</button>)}</div><label className="bv-check"><input type="checkbox" checked={dimensions} disabled={mode === 'overlay'} onChange={e => setDimensions(e.target.checked)} />Cotes 3D</label></div>
        <div className="bv-stage">
          <div className="bv-stage-caption"><span className="bv-eyebrow">{mode === 'solo' ? shown[0]?.name : `${shown.length} VÉLOS · ${mode === 'overlay' ? 'SUPERPOSITION' : 'COMPARAISON'}`}</span><span>Projection orthographique · mm</span></div>
          {shown.length ? <div className="bv-canvas"><Canvas key={retry} orthographic frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 0.5, 8], zoom: 230, near: 0.01, far: 100 }} fallback={<p>La 3D nécessite un navigateur compatible WebGL.</p>} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); setLost(true); }); }}><BikeScene models={shown} mode={mode} view={view} dimensions={dimensions} alignment={alignment} reset={reset} retry={retry} /></Canvas></div> : <div className="bv-empty"><h2>Aucun vélo sélectionné</h2><p>Cochez des modèles pour les comparer.</p><button onClick={() => setSelected(catalog.map(m => m.id))}>Afficher tous les vélos</button></div>}
          {lost && <div className="bv-empty" role="alert"><p>La vue 3D a été interrompue.</p><button onClick={() => { setLost(false); setRetry(x => x + 1); }}>Relancer la 3D</button></div>}
          <div className="bv-views">{['Profil', '3D', 'Dessus', 'Face'].map(preset => <button key={preset} aria-pressed={view === preset} onClick={() => { setView(preset); setReset(x => x + 1); }}>{preset}</button>)}<button aria-label="Recentrer la vue" onClick={() => setReset(x => x + 1)}>↺ Recentrer</button></div>
        </div>
        <div className="bv-understage"><span>Glisser : tourner · Ctrl + molette : zoomer · clic droit : déplacer</span><button onClick={() => { setLost(false); setRetry(x => x + 1); }}>Réessayer le chargement</button></div>
        <div className="bv-options"><label>Alignement <select value={alignment} onChange={e => setAlignment(e.target.value)}><option value="rear">Axe de roue arrière</option><option value="center">Centre du vélo</option></select></label><span>{mode === 'overlay' ? 'Chaque couleur correspond à un vélo. Cotes dans le tableau.' : 'Échelle identique pour tous les vélos · aucun redimensionnement'}</span></div>
        <section className="bv-table-panel"><div className="bv-table-title"><h2>Comparer les cotes</h2><span>mm · arrondis au millimètre</span></div><div className="bv-table-scroll"><table><caption className="bv-sr-only">Dimensions des vélos affichés en millimètres</caption><thead><tr><th scope="col">Dimension</th>{shown.map(m => <th scope="col" key={m.id}><span style={{ color: m.color }}>●</span> {m.name}</th>)}</tr></thead><tbody>{metrics.map(([name, get]) => <tr key={name}><th scope="row">{name}</th>{shown.map(m => <td key={m.id}>{mm(get(m))}</td>)}</tr>)}</tbody></table></div><p>L’empattement est la distance entre les axes des roues. Les cotes hors tout incluent les accessoires présents sur le modèle.</p></section>
      </section>
    </div>
  </main>;
};
