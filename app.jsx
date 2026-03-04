// Lumio app - single-file React with inline styles
const { useState, useEffect, useRef, useCallback } = React;

// Utilities for storage
const storage = {
  get(key) { const val = window.localStorage.getItem(key); return val ? JSON.parse(val) : null; },
  set(key, val) { window.localStorage.setItem(key, JSON.stringify(val)); },
};

const defaultSettings = storage.get('lumio-settings-v1') || {
  background:'#000',
  animation:true,
  speed:1,
  audio:true,
};
function useSettings(){
  const [settings,setSettings]=useState(defaultSettings);
  useEffect(()=>storage.set('lumio-settings-v1',settings),[settings]);
  return [settings,setSettings];
}

// default palettes
const palette = [
  '#ff6b6b', '#ff9f43', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd',
  '#54a0ff', '#00d2d3', '#f368e0', '#c8d6e5', '#576574', '#222f3e'
];
// generate random 6-letter code
function randomCode(){
  return Array.from({length:6},()=>String.fromCharCode(65+Math.floor(Math.random()*26))).join('');
}

// audio pop effect
function popSound(){
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type='sine'; osc.frequency.setValueAtTime(880,ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440,ctx.currentTime+0.08);
  gain.gain.setValueAtTime(0.18,ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.18);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime+0.2);
}

// dummy background component (black)
function Stars(){
  return null; // removed starfield, background handled via body style
}

// Logo component
function Logo({size=48}){
  return (
    <svg width={size} height={size} viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f0c27b" />
          <stop offset="100%" stopColor="#4b1248" />
        </linearGradient>
      </defs>
      <text x="0" y="17" fill="url(#grad)" fontFamily="Verdana" fontSize="18">lumio</text>
      {/* decorative planets */}
      <circle cx="80" cy="12" r="2" fill="#ff6b6b" />
      <circle cx="90" cy="8" r="1.5" fill="#48dbfb" />
      <circle cx="98" cy="16" r="2" fill="#feca57" />
    </svg>
  );
}

// Splash screen
function Splash({onStart}){
  return (
    <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',textAlign:'center',color:'#fff'}}>
      <Logo size={120} />
      <h1 style={{fontSize:'2.5rem'}}>Map Your Universe</h1>
      <p style={{maxWidth:300}}>Uma ferramenta visual de mapas mentais com estética de sistema solar.</p>
      <button onClick={onStart} style={{marginTop:20,padding:'10px 20px',fontSize:'1rem',cursor:'pointer'}}>Começar →</button>
    </div>
  );
}

// Basic Map data management
function useMaps() {
  const [maps, setMaps] = useState(storage.get('lumio-v3') || []);
  useEffect(() => storage.set('lumio-v3', maps), [maps]);
  return [maps, setMaps];
}

// Dashboard component
function Dashboard({maps, onOpen, onCreate, onJoin, onDelete, onRename}){
  const [newName,setNewName]=useState('');
  const [color,setColor]=useState(palette[0]);
  const [joinCode,setJoinCode]=useState('');
  return (
    <div style={{padding:20}}>
      <h2>Seus universos</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:20}}>
        {maps.map((m,i)=>{
          return <div key={i} style={{padding:10,background:'#111',borderRadius:8,position:'relative'}}>
            <div style={{cursor:'pointer'}} onClick={()=>onOpen(m)}>
              <svg width={60} height={60}><circle cx={30} cy={30} r={20} fill={m.color} /></svg>
              <div>{m.name}</div>
            </div>
            <button onClick={()=>{const n=prompt('Novo nome',m.name);if(n){onRename && onRename(m,n);}}} style={{position:'absolute',top:5,right:30}}>✎</button>
            <button onClick={()=>{if(confirm('Eliminar?')) onDelete && onDelete(m);}} style={{position:'absolute',top:5,right:5}}>×</button>
          </div>;
        })}
        <div style={{padding:10,background:'#222',borderRadius:8}}>
          <input placeholder="Nome do mapa" value={newName} onChange={e=>setNewName(e.target.value)} />
          <div>
            {palette.map(c=> <span key={c} onClick={()=>setColor(c)} style={{display:'inline-block',width:20,height:20,background:c,margin:2,cursor:'pointer',border: c===color?'2px solid #fff':'1px solid #333'}}></span>)}
          </div>
          <button onClick={()=>{if(newName){onCreate({name:newName,color});setNewName('');}}}>Criar</button>
        </div>
      </div>
      <div style={{marginTop:20}}>
        <h3>Entrar com código</h3>
        <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="XXXXXX" style={{textTransform:'uppercase'}} />
        <button onClick={()=>{if(joinCode)onJoin(joinCode);}}>Entrar</button>
      </div>
    </div>
  );
}

// helper to find node by path of ids
function findNode(node, path) {
  if (!path || path.length === 0) return node;
  const [head, ...rest] = path;
  const child = node.children && node.children.find(c => c.id === head);
  return child ? findNode(child, rest) : null;
}

// Settings modal
function SettingsModal({settings,onChange,onClose}){
  const [bg,setBg]=useState(settings.background);
  const [anim,setAnim]=useState(settings.animation);
  const [speed,setSpeed]=useState(settings.speed);
  const [audio,setAudio]=useState(settings.audio);
  const save=()=>{onChange({background:bg,animation:anim,speed,audio});onClose();};
  return (
    <div onClick={onClose} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#111',padding:20,borderRadius:8,width:320,color:'#fff'}}>
        <h3>Configurações</h3>
        <div>
          <label>Cor de fundo</label>
          <input type="color" value={bg} onChange={e=>setBg(e.target.value)} />
          <div style={{marginTop:4}}>
            {['#070b1a','#001f3f','#0a0a0a','#1a1a2e','#000','#101010'].map(c=><span key={c} onClick={()=>setBg(c)} style={{display:'inline-block',width:20,height:20,background:c,margin:2,cursor:'pointer',border:c===bg?'2px solid #fff':'1px solid #333'}}></span>)}
          </div>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={anim} onChange={e=>setAnim(e.target.checked)} /> Animação de translação
          </label>
        </div>
        <div>
          <label>Velocidade ({speed.toFixed(1)}x)</label>
          <input type="range" min="0.2" max="2" step="0.1" value={speed} onChange={e=>setSpeed(parseFloat(e.target.value))} />
        </div>
        <div>
          <label>
            <input type="checkbox" checked={audio} onChange={e=>setAudio(e.target.checked)} /> Som ao adicionar nós
          </label>
        </div>
        <div style={{marginTop:10,textAlign:'right'}}>
          <button onClick={onClose} style={{marginRight:10}}>Cancelar</button>
          <button onClick={save}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// Share modal
function ShareModal({map,onClose}){
  const [tab,setTab]=useState('image');
  const [code,setCode]=useState(map.collabCode||'');
  const exportLink = () => {
    const str = btoa(JSON.stringify(map));
    return window.location.href.split('#')[0] + '#map=' + str;
  };
  const doShare = () => {
    const c = randomCode();
    storage.set('lumio-collab-'+c,map);
    setCode(c);
  };
  const exportImage = async () => {
    const svg = document.querySelector('svg');
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(xml);
    const b64start = 'data:image/svg+xml;base64,';
    const img = new Image();
    img.src = b64start + svg64;
    const canvas = document.createElement('canvas');
    canvas.width = 900; canvas.height=620;
    const ctx = canvas.getContext('2d');
    img.onload = () => {
      ctx.drawImage(img,0,0);
      const png = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = png; a.download = `${map.name}.png`;
      a.click();
    };
  };
  return (
    <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#111',padding:20,borderRadius:8,width:320,color:'#fff'}}>
        <h3>Partilhar</h3>
        <div style={{marginBottom:10}}>
          <button onClick={()=>setTab('image')} style={{marginRight:5}}>Imagem</button>
          <button onClick={()=>setTab('link')} style={{marginRight:5}}>Link</button>
          <button onClick={()=>setTab('colab')}>Colaborar</button>
        </div>
        {tab==='image'&&<div><button onClick={exportImage}>Exportar PNG</button></div>}
        {tab==='link'&&<div><textarea readOnly value={exportLink()} style={{width:'100%',height:80}}/></div>}
        {tab==='colab'&&<div>
          {code?<div>Código: {code}</div>:<button onClick={doShare}>Gerar código</button>}
        </div>}
        <div style={{marginTop:10,textAlign:'right'}}>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

// icon renderer
function NodeIcon({node,r}){
  if(!node.image) return null;
  if(node.image.startsWith('data:')){
    return <image href={node.image} x={-r/2} y={-r/2} width={r} height={r} clipPath="circle()" />;
  }
  return <text textAnchor="middle" dy="0.35em" style={{fontSize:r/1.5}}>{node.image}</text>;
}

// helper to render wrapped text (max 2 lines)
function WrappedText({text, r}){
  const words = text.split(' ');
  const lines=[words[0]||''];
  for(let i=1;i<words.length;i++){
    if(lines[lines.length-1].length + words[i].length +1 > 10 && lines.length<2) lines.push(words[i]);
    else lines[lines.length-1]+= ' '+words[i];
  }
  return (
    <text textAnchor="middle" dy="0.35em" style={{fill:'#000',fontSize:12}}>
      {lines.map((l,i)=><tspan x="0" dy={i===0?"0":"1.2em"} key={i}>{l}</tspan>)}
    </text>
  );
}

// NodeEditor modal
function NodeEditor({node, onSave, onClose}){
  const [label,setLabel]=useState(node.label||'');
  const [color,setColor]=useState(node.color||palette[0]);
  const [emoji,setEmoji]=useState(node.image||'');
  const [fileData,setFileData]=useState('');
  const [searchText,setSearchText]=useState('');
  const [searchResults,setSearchResults]=useState([]);
  const handleSave=()=>{
    onSave({...node,label,color,image:emoji});
    onClose();
  };
  return (
    <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#111',padding:20,borderRadius:8,width:300,color:'#fff'}}>
        <h3>{node.id?'Editar nó':'Novo nó'}</h3>
        <div>
          <label>Nome</label>
          <input value={label} onChange={e=>setLabel(e.target.value)} style={{width:'100%'}} />
        </div>
        <div>
          <label>Cor</label>
          <div>
            {palette.map(c=> <span key={c} onClick={()=>setColor(c)} style={{display:'inline-block',width:20,height:20,background:c,margin:2,cursor:'pointer',border: c===color?'2px solid #fff':'1px solid #333'}}></span>)}
          </div>
        </div>
        <div>
          <label>Emoji/Icone</label>
          <input value={emoji} onChange={e=>setEmoji(e.target.value)} style={{width:'100%'}} placeholder="😀" />
          {emoji && <div style={{marginTop:4, fontSize:32}}>{emoji.startsWith('data:')?<img src={emoji} width={32} />:emoji}</div>}
          <div style={{marginTop:4}}>
            <input type="file" accept="image/*" onChange={e=>{
              const f=e.target.files[0];
              if(f){
                const r=new FileReader();
                r.onload=ev=>{setEmoji(ev.target.result);};
                r.readAsDataURL(f);
              }
            }} />
          </div>
          <div style={{marginTop:6}}>
            <input placeholder="procurar emoji" value={searchText} onChange={e=>setSearchText(e.target.value)} />
            <button onClick={()=>{
              // stub search: filter basic list
              const all = ['😀','🚀','🌟','🪐','✨','💡','📘','🧠','🌌','🛸','🔭','🌙'];
              const res = all.filter(x=>x.includes(searchText)).slice(0,6);
              setSearchResults(res);
            }}>🔍</button>
            <div>
              {searchResults.map(e=> <span key={e} style={{cursor:'pointer',fontSize:24,margin:4}} onClick={()=>setEmoji(e)}>{e}</span>)}
            </div>
          </div>
        </div>
        <div style={{marginTop:10,textAlign:'right'}}>
          <button onClick={onClose} style={{marginRight:10}}>Cancelar</button>
          <button onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// MapView with orbits
function MapView({map, onBack, onUpdate, settings}){
  const [path,setPath]=useState([]);
  const [zoom,setZoom]=useState(1);
  const svgRef = useRef();
  const [angle,setAngle]=useState(0);
  const [editingNode,setEditingNode]=useState(null);
  const [showShare,setShowShare]=useState(false);
  const centerNode = findNode(map.root, path) || map.root;
  const children = centerNode.children || [];
  useEffect(()=>{
    let id;
    function tick(){
      if(settings.animation){
        setAngle(a=>a+0.005*settings.speed);
      }
      id=requestAnimationFrame(tick);
    }
    id=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(id);
  },[settings]);
  const handleAdd=(parent)=>{
    const newNode={id:Date.now().toString(),label:'Novo',color:palette[0],children:[]};
    parent.children=parent.children||[];
    parent.children.push(newNode);
    if(settings.audio) popSound();
    onUpdate(map);
    setEditingNode(newNode);
  };
  const handleSaveNode=(node)=>{
    onUpdate(map);
  };
  const handleDelete=(parent,child)=>{
    parent.children=parent.children.filter(c=>c!==child);
    onUpdate(map);
  };
  // update back button
  const navigate=(id)=>{
    setPath([...path,id]);
  };
  const goBack=()=>{
    setPath(path.slice(0,-1));
  };
  useEffect(()=>{
    const svg = svgRef.current;
    if(!svg) return;
    const wheel = e=>{
      e.preventDefault();
      const delta = e.deltaY<0?0.1:-0.1;
      setZoom(z=>Math.min(3,Math.max(0.5,z+delta)));
    };
    svg.addEventListener('wheel',wheel,{passive:false});
    return ()=>svg.removeEventListener('wheel',wheel);
  },[]);
  // collaboration sync
  useEffect(()=>{
    if(map.collabCode){
      const id = setInterval(()=>{
        const fresh = storage.get('lumio-collab-'+map.collabCode);
        if(fresh && JSON.stringify(fresh) !== JSON.stringify(map)){
          onUpdate(fresh);
        }
      },3000);
      return ()=>clearInterval(id);
    }
  },[map]);
  return (
    <div style={{position:'relative',width:'100%',height:'100%',overflow:'hidden'}}>
      <button onClick={goBack} style={{position:'absolute',top:10,left:10,zIndex:10}}>‹ Voltar</button>
      <div style={{position:'absolute',bottom:10,right:10,zIndex:10}}>
        <button onClick={()=>setZoom(z=>Math.min(3,z+0.2))}>+</button>
        <button onClick={()=>setZoom(z=>Math.max(0.5,z-0.2))}>−</button>
      </div>
      <button onClick={()=>setShowShare(true)} style={{position:'absolute',top:10,right:10,zIndex:10}}>Partilhar</button>
      {map.readOnly && <div style={{position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',background:'#e44',padding:'2px 6px',borderRadius:4,zIndex:10}}>Leitura</div>}
      <div style={{position:'absolute',top:10,left:60,zIndex:10}}>
        {(() => {
          const crumbs = [{id:'root',label:map.root.label}];
          let cur=map.root;
          path.forEach(id=>{
            const nxt = (cur.children||[]).find(c=>c.id===id);
            if(nxt){cur=nxt;crumbs.push({id:id,label:nxt.label});}
          });
          return crumbs.map((c,i)=><span key={i} style={{cursor:'pointer'}} onClick={()=>setPath(path.slice(0,i))}>{i>0?" / ":""}{c.label}</span>);
        })()}
      </div>
      <svg ref={svgRef} width={900} height={620} viewBox="0 0 900 620" style={{background:'transparent',transform:`scale(${zoom})`,transformOrigin:'center'}}>
        {/* center node */}
        <g transform="translate(450 310)">
          <circle r={48} fill={centerNode.color||palette[0]} onClick={()=>{}} />
          <NodeIcon node={centerNode} r={48} />
          <text textAnchor="middle" dy="0.35em" style={{fill:'#fff',fontSize:14}}>
            <tspan x="0" dy="0">{centerNode.label}</tspan>
          </text>
          {/* children orbit */}
          {children.map((child,i)=>{
            const theta=angle + (i/children.length)*2*Math.PI;
            const x=Math.cos(theta)*155;
            const y=Math.sin(theta)*155;
            const grandchildren = child.children||[];
            return (
              <g key={child.id} transform={`translate(${x} ${y})`}>
                <circle r={30} fill={child.color||palette[0]} onClick={()=>navigate(child.id)} />
                <NodeIcon node={child} r={30} />
                <WrappedText text={child.label} r={30} />
                {!map.readOnly && <g transform="translate(0 -40)" style={{pointerEvents:'all'}}>
                  <text style={{cursor:'pointer',fontSize:14}} onClick={()=>setEditingNode(child)}>✎</text>
                  <text style={{cursor:'pointer',fontSize:14,marginLeft:6}} onClick={()=>handleAdd(child)}>＋</text>
                  <text style={{cursor:'pointer',fontSize:14,marginLeft:6}} onClick={()=>handleDelete(centerNode,child)}>×</text>
                </g>}
                {grandchildren.map((gc,j)=>{
                    const phi = angle*2 + (j/grandchildren.length)*2*Math.PI;
                    const gx = Math.cos(phi)*70;
                    const gy = Math.sin(phi)*70;
                    return (
                      <g key={gc.id} transform={`translate(${gx} ${gy})`}>
                        <circle r={18} fill={gc.color||palette[0]} />
                        <NodeIcon node={gc} r={18} />
                        {!map.readOnly && <g transform="translate(0 -30)" style={{pointerEvents:'all'}}>
                          <text style={{cursor:'pointer',fontSize:12}} onClick={()=>setEditingNode(gc)}>✎</text>
                          <text style={{cursor:'pointer',marginLeft:4,fontSize:12}} onClick={()=>handleAdd(gc)}>＋</text>
                          <text style={{cursor:'pointer',marginLeft:4,fontSize:12}} onClick={()=>handleDelete(child,gc)}>×</text>
                        </g>}
                      </g>
                    );
                })}
              </g>
            );
          })}
        </g>
      </svg>
      {editingNode && <NodeEditor node={editingNode} onSave={handleSaveNode} onClose={()=>setEditingNode(null)} />}
      {showShare && <ShareModal map={map} onClose={()=>setShowShare(false)} />}
    </div>
  );
}

function App(){
  console.log('Lumio app init');
  const [showSplash,setShowSplash]=useState(true);
  const [maps,setMaps]=useMaps();
  const [activeMap,setActiveMap]=useState(null);
  const [settings,setSettings]=useSettings();
  const [showSettings,setShowSettings]=useState(false);
  useEffect(()=>{document.body.style.background=settings.background;},[settings.background]);
  useEffect(()=>{
    if(window.location.hash.startsWith('#map=')){
      try{
        const data = JSON.parse(atob(window.location.hash.split('=')[1]));
        setActiveMap({...data,readOnly:true});
        setShowSplash(false);
      }catch(e){}
    }
  },[]);
  const handleCreate=m=>{
    // initialize root node
    m.root={id:'root',label:m.name,color:m.color,children:[]};
    setMaps([...maps,m]);
  };
  const handleDeleteMap = m => {
    setMaps(maps.filter(x=>x!==m));
  };
  const handleRename = (m,newName)=>{
    m.name=newName;
    if(m.root) m.root.label=newName;
    setMaps([...maps]);
  };
  const handleJoin=code=>{
    const data = storage.get('lumio-collab-'+code);
    if(data){
      setActiveMap({...data,readOnly:true,collabCode:code});
      setShowSplash(false);
    } else alert('Código inválido');
  };
  const handleOpen=m=>setActiveMap(m);
  const handleUpdate=(updated)=>{
    const clone = JSON.parse(JSON.stringify(updated));
    if(clone.collabCode){
      storage.set('lumio-collab-'+clone.collabCode,clone);
    }
    setMaps(maps.map(m=>m===activeMap?clone:m));
    setActiveMap(clone);
  };
  return (
    <>
      {/* background handled via body style; no starfield */}
      <Stars />
      <button onClick={()=>setShowSettings(true)} style={{position:'absolute',top:10,right:10,zIndex:20}}>⚙</button>
      {showSettings && <SettingsModal settings={settings} onChange={setSettings} onClose={()=>setShowSettings(false)}/>}
      {showSplash && <Splash onStart={()=>setShowSplash(false)}/>}
      {!showSplash && !activeMap && <Dashboard maps={maps} onOpen={handleOpen} onCreate={handleCreate} onJoin={handleJoin} onDelete={handleDeleteMap} onRename={handleRename}/>}
      {activeMap && <MapView map={activeMap} onBack={()=>setActiveMap(null)} onUpdate={handleUpdate} settings={settings}/>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
