import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownAZ, ChevronDown, Database, GripVertical, ImagePlus, Plus, Ruler, Settings, Sparkles, Trash2, Upload, X } from 'lucide-react'
import { Character, clearDatabase, loadCharacters, removeCharacter, saveCharacter } from './db'

type SortMode = 'created' | 'tall' | 'short' | 'custom'
const colors = ['#a78bfa', '#60a5fa', '#f472b6', '#34d399', '#fb923c']
const demo: Character[] = [
  { id: 'demo-a', name: 'LUMI', height: 168, image: '', bottom: 0, top: 100, color: '#a78bfa', order: 0, createdAt: 1 },
  { id: 'demo-b', name: 'NOAH', height: 184, image: '', bottom: 0, top: 100, color: '#60a5fa', order: 1, createdAt: 2 },
  { id: 'demo-c', name: 'MIO', height: 152, image: '', bottom: 0, top: 100, color: '#f472b6', order: 2, createdAt: 3 },
]

const fileToData = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(file)
})

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loaded, setLoaded] = useState(false)
  const [sort, setSort] = useState<SortMode>(() => (localStorage.getItem('heightary-sort') as SortMode) || 'created')
  const [modal, setModal] = useState(false)
  const [settings, setSettings] = useState(false)
  const [editing, setEditing] = useState<Character | null>(null)
  const [dragged, setDragged] = useState<string | null>(null)

  useEffect(() => { loadCharacters().then(data => { setCharacters(data.length ? data : demo); setLoaded(true) }) }, [])
  useEffect(() => { localStorage.setItem('heightary-sort', sort) }, [sort])

  const visible = useMemo(() => [...characters].sort((a, b) => sort === 'tall' ? b.height-a.height : sort === 'short' ? a.height-b.height : sort === 'custom' ? a.order-b.order : a.createdAt-b.createdAt), [characters, sort])
  const maxHeight = Math.max(200, ...characters.map(c => c.height + 20))
  const save = async (item: Character) => { await saveCharacter(item); setCharacters(old => [...old.filter(c => c.id !== item.id), item]); setModal(false); setEditing(null) }
  const remove = async (id: string) => { await removeCharacter(id); setCharacters(old => old.filter(c => c.id !== id)) }
  const clear = async () => { if (confirm('등록한 이미지와 모든 데이터를 비울까요?')) { await clearDatabase(); localStorage.removeItem('heightary-sort'); setCharacters([]); setSettings(false) } }
  const dropOn = async (target: string) => {
    if (!dragged || dragged === target) return
    const arr = [...visible], from = arr.findIndex(c => c.id === dragged), to = arr.findIndex(c => c.id === target)
    const [item] = arr.splice(from, 1); arr.splice(to, 0, item)
    const updated = arr.map((c, order) => ({ ...c, order })); setCharacters(updated); setSort('custom'); setDragged(null)
    await Promise.all(updated.map(saveCharacter))
  }

  return <div className="app">
    <header><a className="brand"><span className="brand-mark"><Ruler size={20}/></span><b>HEIGHTARY</b><span>키를 한눈에.</span></a><div className="header-actions"><span className="storage"><Database size={14}/> 이 브라우저에 안전하게 저장됨</span><button className="icon-btn" onClick={() => setSettings(!settings)} aria-label="설정"><Settings size={19}/></button><button className="primary" onClick={() => { setEditing(null); setModal(true) }}><Plus size={18}/> 캐릭터 추가</button></div></header>
    {settings && <div className="settings-pop"><b>로컬 데이터 관리</b><p>이미지를 포함한 데이터는 서버로 전송되지 않고 IndexedDB에만 저장됩니다.</p><button onClick={clear}><Trash2 size={16}/> 모든 데이터 비우기</button></div>}
    <main>
      <section className="intro"><div><div className="eyebrow"><Sparkles size={13}/> CHARACTER HEIGHT STUDIO</div><h1>좋아하는 캐릭터의 키를<br/><em>나란히 비교해 보세요.</em></h1><p>이미지를 올리고 키를 입력하면, 실제 비율 그대로 한 화면에 정렬해 드려요.</p></div><div className="stats"><div><b>{characters.length}</b><span>CHARACTERS</span></div><i/><div><b>{characters.length ? Math.max(...characters.map(c=>c.height)) : 0}<small> cm</small></b><span>TALLEST</span></div></div></section>
      <section className="toolbar"><div><b>비교 스튜디오</b><span>{characters.length}명의 캐릭터</span></div><label><ArrowDownAZ size={17}/><select value={sort} onChange={e => setSort(e.target.value as SortMode)}><option value="created">등록순</option><option value="tall">키 큰 순</option><option value="short">키 작은 순</option><option value="custom">커스텀 순서</option></select><ChevronDown size={15}/></label></section>
      <section className="stage-wrap">
        <div className="scale" style={{height:maxHeight*2.7+50}}>{Array.from({length:Math.floor(maxHeight/20)+1},(_,i)=>i*20).map(cm=><div className="scale-line" key={cm} style={{bottom:cm*2.7}}><span>{cm}</span><i/><small>cm</small></div>)}</div>
        <div className="stage" style={{height:maxHeight*2.7+50}}>
          <div className="stage-hint">드래그하여 순서를 바꿀 수 있어요</div>
          {visible.map(char => <article className="character" key={char.id} draggable onDragStart={()=>setDragged(char.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>dropOn(char.id)} style={{height:char.height*2.7}}>
            <div className="char-tools"><button title="순서 이동"><GripVertical size={15}/></button><button onClick={()=>{setEditing(char);setModal(true)}}>수정</button><button title="삭제" onClick={()=>remove(char.id)}><X size={14}/></button></div>
            <div className="char-label"><b>{char.name}</b><span>{char.height} cm</span></div>
            {char.image ? <img src={char.image} style={{height:`${100/(char.top-char.bottom)*100}%`, bottom:`${-char.bottom/(char.top-char.bottom)*100}%`}}/> : <HumanSilhouette color={char.color}/>}
          </article>)}
          {!characters.length && <div className="empty"><ImagePlus size={32}/><h3>첫 캐릭터를 등록해 보세요</h3><p>PNG, JPG, WEBP 이미지를 사용할 수 있어요.</p><button className="primary" onClick={()=>setModal(true)}><Plus size={18}/> 캐릭터 추가</button></div>}
          <div className="ground"><span>GROUND · 0 CM</span></div>
        </div>
      </section>
      <p className="privacy"><Database size={14}/> 모든 캐릭터 데이터와 이미지는 이 기기의 브라우저에만 저장됩니다.</p>
    </main>
    {modal && <CharacterModal initial={editing} order={characters.length} onClose={()=>{setModal(false);setEditing(null)}} onSave={save}/>} 
    <footer><b>HEIGHTARY</b><span>당신의 세계를, 같은 눈높이에서.</span><small>© 2026 Heightary Studio</small></footer>
    {!loaded && <div className="loading">HEIGHTARY</div>}
  </div>
}

function HumanSilhouette({color}:{color:string}) {
  return <svg className="silhouette" viewBox="0 0 150 500" preserveAspectRatio="xMidYMax meet" style={{'--tone':color} as React.CSSProperties} aria-label="기본 사람 실루엣" role="img">
    <path d="M75 2c-22 0-38 18-38 43 0 20 8 39 20 48l-3 17c-21 7-35 19-40 42L2 246c-2 16 8 26 19 23l13-84 3 105-11 178c-1 18 7 29 20 29 11 0 18-7 20-24l9-129 9 129c2 17 9 24 20 24 13 0 21-11 20-29l-11-178 3-105 13 84c11 3 21-7 19-23l-12-94c-5-23-19-35-40-42l-3-17c12-9 20-28 20-48C113 20 97 2 75 2Z"/>
  </svg>
}

function CharacterModal({initial, order, onClose, onSave}:{initial:Character|null,order:number,onClose:()=>void,onSave:(c:Character)=>void}) {
  const [name,setName]=useState(initial?.name||''); const [height,setHeight]=useState(initial?.height||170); const [image,setImage]=useState(initial?.image||''); const [bottom,setBottom]=useState(initial?.bottom||0); const [top,setTop]=useState(initial?.top||100)
  const fileRef=useRef<HTMLInputElement>(null)
  const upload=async(file?:File)=>{if(file) { setImage(await fileToData(file)); setBottom(0); setTop(100) }}
  return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><div className="modal-head"><div><span>CHARACTER PROFILE</span><h2>{initial?'캐릭터 수정':'새 캐릭터 추가'}</h2></div><button className="icon-btn" onClick={onClose}><X/></button></div>
    <div className="form-grid"><div className={`upload-panel ${image?'has-image':''}`} onClick={()=>!image&&fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();upload(e.dataTransfer.files[0])}}>{image?<AnchorEditor image={image} top={top} bottom={bottom} onTop={setTop} onBottom={setBottom} onReplace={()=>fileRef.current?.click()}/>:<><div><Upload/></div><b>이미지를 놓거나 클릭하세요</b><span>PNG, JPG, WEBP · 최대 10MB</span></>}<input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(e.target.files?.[0])}/></div>
      <div className="fields"><label>캐릭터 이름<input value={name} onChange={e=>setName(e.target.value)} placeholder="예: 아리아" maxLength={24}/></label><label>키 <div className="height-input"><input type="number" min="20" max="400" value={height} onChange={e=>setHeight(Number(e.target.value))}/><span>cm</span></div></label>
      <div className="anchor-title"><b>이미지 기준점</b><span>투명 여백이 있다면 조정하세요</span></div><label className="range"><span>위 기준점 <b>{top}%</b></span><input type="range" min={bottom+10} max="100" value={top} onChange={e=>setTop(Number(e.target.value))}/></label><label className="range"><span>아래 기준점 <b>{bottom}%</b></span><input type="range" min="0" max={top-10} value={bottom} onChange={e=>setBottom(Number(e.target.value))}/></label></div></div>
    <div className="modal-foot"><button className="cancel" onClick={onClose}>취소</button><button className="primary" disabled={!name.trim()||!height} onClick={()=>onSave({id:initial?.id||crypto.randomUUID(),name:name.trim(),height,image,bottom,top,color:initial?.color||colors[order%colors.length],order:initial?.order??order,createdAt:initial?.createdAt||Date.now()})}>{initial?'변경 저장':'비교에 추가'}</button></div>
  </div></div>
}

function AnchorEditor({image,top,bottom,onTop,onBottom,onReplace}:{image:string,top:number,bottom:number,onTop:(value:number)=>void,onBottom:(value:number)=>void,onReplace:()=>void}) {
  const preview=useRef<HTMLDivElement>(null)
  const move=(kind:'top'|'bottom',clientY:number)=>{
    const rect=preview.current?.getBoundingClientRect(); if(!rect) return
    const value=Math.round(100-(clientY-rect.top)/rect.height*100)
    if(kind==='top') onTop(Math.max(bottom+10,Math.min(100,value)))
    else onBottom(Math.max(0,Math.min(top-10,value)))
  }
  const start=(kind:'top'|'bottom',e:React.PointerEvent<HTMLButtonElement>)=>{
    e.preventDefault(); e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); move(kind,e.clientY)
  }
  return <div className="anchor-preview" ref={preview}>
    <img src={image} alt="캐릭터 기준점 미리보기" draggable={false}/>
    {(['top','bottom'] as const).map(kind=><button key={kind} type="button" className={`anchor-line ${kind}`} style={{top:`${100-(kind==='top'?top:bottom)}%`}} onPointerDown={e=>start(kind,e)} onPointerMove={e=>e.currentTarget.hasPointerCapture(e.pointerId)&&move(kind,e.clientY)} onClick={e=>e.stopPropagation()} aria-label={`${kind==='top'?'위':'아래'} 기준점: ${kind==='top'?top:bottom}%`}><span>{kind==='top'?'위':'아래'} 기준점</span><b>{kind==='top'?top:bottom}%</b></button>)}
    <div className="anchor-help">선을 위아래로 드래그해 기준점을 맞추세요</div>
    <button type="button" className="replace-image" onClick={e=>{e.stopPropagation();onReplace()}}><Upload size={13}/> 이미지 교체</button>
  </div>
}
