import { useEffect, useMemo, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from 'firebase/auth'
import {
  Activity, AlertCircle, ArrowUpRight, Check, CheckCircle2, Circle, ClipboardList,
  Clock3, LayoutDashboard, ListTodo, LogOut, Plus, Search, ShieldCheck, Sparkles,
  Target, Trash2, X, Pencil, CalendarDays, Flag
} from 'lucide-react'
import { auth, db, firebaseConfigured } from './firebase'

const sampleTasks = [
  { id: 'sample-1', title: 'Organizar entregas de la universidad', description: 'Revisar las actividades pendientes y sus fechas.', dueDate: '', priority: 'Alta', status: 'En progreso' },
  { id: 'sample-2', title: 'Estudiar React', description: 'Repasar componentes, props y estados.', dueDate: '', priority: 'Media', status: 'Pendiente' },
  { id: 'sample-3', title: 'Actualizar mi agenda', description: 'Planear las tareas de la semana.', dueDate: '', priority: 'Baja', status: 'Completada' }
]
const statuses = ['Todas', 'Pendiente', 'En progreso', 'Completada']
const priorities = ['Todas', 'Alta', 'Media', 'Baja']

function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setError('')
    if (!firebaseConfigured) { setError('Primero configura Firebase siguiendo el archivo README.md.'); return }
    setBusy(true)
    try {
      if (mode === 'register') await createUserWithEmailAndPassword(auth, email, password)
      else await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'Este correo ya está registrado.',
        'auth/invalid-email': 'Escribe un correo válido.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-credential': 'Correo o contraseña incorrectos.'
      }
      setError(messages[err.code] || 'No se pudo completar la operación. Verifica los datos e inténtalo de nuevo.')
    } finally { setBusy(false) }
  }
  return <main className="auth-wrap">
    <section className="auth-art">
      <div className="brand brand-light"><span className="brand-mark"><Check size={19}/></span> taskflow</div>
      <div className="art-copy"><span className="eyebrow">MENOS CAOS, MÁS LOGROS</span><h1>Haz espacio para lo que realmente importa.</h1><p>Organiza tus pendientes, enfócate en tus prioridades y celebra cada avance.</p></div>
      <div className="art-bottom"><div className="art-stat"><strong>Tu día,</strong><span>un paso a la vez.</span></div><Sparkles size={30}/></div>
      <div className="decor decor-one"/><div className="decor decor-two"/>
    </section>
    <section className="auth-panel">
      <div className="auth-card">
        <div className="mobile-brand brand"><span className="brand-mark"><Check size={19}/></span> taskflow</div>
        <span className="eyebrow purple">{mode === 'login' ? 'QUÉ BUENO TENERTE AQUÍ' : 'EMPIEZA HOY'}</span>
        <h2>{mode === 'login' ? 'Bienvenida de nuevo' : 'Crea tu cuenta'}</h2>
        <p className="muted">{mode === 'login' ? 'Ingresa tus datos para continuar.' : 'Regístrate para organizar tus tareas.'}</p>
        <form onSubmit={submit} className="auth-form">
          <label>Correo electrónico<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="nombre@correo.com"/></label>
          <label>Contraseña<input type="password" minLength="6" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"/></label>
          {error && <div className="error"><AlertCircle size={16}/>{error}</div>}
          <button className="btn primary full" disabled={busy}>{busy ? 'Un momento...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} <ArrowUpRight size={17}/></button>
        </form>
        <p className="switch-auth">{mode === 'login' ? '¿Todavía no tienes cuenta?' : '¿Ya tienes una cuenta?'} <button onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode === 'login' ? 'Regístrate' : 'Inicia sesión'}</button></p>
        {!firebaseConfigured && <div className="setup-note"><ShieldCheck size={17}/><span>Configuración pendiente: conecta Firebase para habilitar las cuentas y guardar tareas en la nube. Consulta README.md.</span></div>}
      </div>
      <span className="auth-footer">TASKFLOW · ORGANIZA TU DÍA CON INTENCIÓN</span>
    </section>
  </main>
}

function TaskModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || { title: '', description: '', dueDate: '', priority: 'Media', status: 'Pendiente' })
  const [error, setError] = useState('')
  const change = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('El título es obligatorio.'); return }
    onSave({ ...form, title: form.title.trim(), description: form.description.trim() })
  }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-head"><div><span className="eyebrow purple">{initial ? 'ACTUALIZA TUS PLANES' : 'NUEVO PENDIENTE'}</span><h2>{initial ? 'Editar tarea' : 'Crear tarea'}</h2></div><button type="button" className="icon-btn" onClick={onClose}><X/></button></div>
      <label>Título de la tarea<input autoFocus value={form.title} onChange={e=>change('title',e.target.value)} placeholder="Ej. Entregar proyecto de React" maxLength="90"/></label>
      <label>Descripción<textarea value={form.description} onChange={e=>change('description',e.target.value)} placeholder="Agrega algunos detalles..." rows="3" maxLength="400"/></label>
      <div className="form-grid">
        <label>Fecha de vencimiento<input type="date" value={form.dueDate} onChange={e=>change('dueDate',e.target.value)}/></label>
        <label>Prioridad<select value={form.priority} onChange={e=>change('priority',e.target.value)}>{priorities.slice(1).map(p=><option key={p}>{p}</option>)}</select></label>
      </div>
      <label>Estado<select value={form.status} onChange={e=>change('status',e.target.value)}>{statuses.slice(1).map(s=><option key={s}>{s}</option>)}</select></label>
      {error && <div className="error"><AlertCircle size={16}/>{error}</div>}
      <div className="modal-actions"><button type="button" className="btn ghost" onClick={onClose}>Cancelar</button><button className="btn primary">{initial ? 'Guardar cambios' : 'Agregar tarea'}</button></div>
    </form>
  </div>
}

function App() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todas')
  const [priorityFilter, setPriorityFilter] = useState('Todas')
  const [activeView, setActiveView] = useState('Todas')
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!firebaseConfigured) { setAuthReady(true); return }
    return onAuthStateChanged(auth, u => { setUser(u); setAuthReady(true) })
  }, [])

  useEffect(() => {
    if (!user || !db) { setTasks([]); return }
    setLoading(true)
    const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => { setNotice('No se pudieron cargar las tareas. Revisa las reglas de Firestore.'); setLoading(false) })
  }, [user])

  const counts = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t=>t.status==='Pendiente').length,
    progress: tasks.filter(t=>t.status==='En progreso').length,
    done: tasks.filter(t=>t.status==='Completada').length
  }), [tasks])

  const visibleTasks = useMemo(() => tasks.filter(t => {
    const term = search.toLowerCase()
    return (!term || `${t.title} ${t.description || ''}`.toLowerCase().includes(term))
      && (statusFilter === 'Todas' || t.status === statusFilter)
      && (priorityFilter === 'Todas' || t.priority === priorityFilter)
      && (activeView === 'Todas' || t.status === activeView)
  }), [tasks, search, statusFilter, priorityFilter, activeView])

  const saveTask = async (data) => {
    try {
      if (modal?.id) await updateDoc(doc(db, 'users', user.uid, 'tasks', modal.id), { ...data, updatedAt: serverTimestamp() })
      else await addDoc(collection(db, 'users', user.uid, 'tasks'), { ...data, createdAt: serverTimestamp() })
      setModal(null); setNotice(modal?.id ? 'Tarea actualizada correctamente.' : 'Tarea creada correctamente.')
    } catch { setNotice('No se pudo guardar. Verifica tu conexión y las reglas de Firestore.') }
  }
  const removeTask = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta tarea?')) return
    try { await deleteDoc(doc(db, 'users', user.uid, 'tasks', id)); setNotice('Tarea eliminada.') }
    catch { setNotice('No se pudo eliminar la tarea.') }
  }
  const toggleDone = async (task) => {
    try { await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { status: task.status === 'Completada' ? 'Pendiente' : 'Completada', updatedAt: serverTimestamp() }) }
    catch { setNotice('No se pudo actualizar el estado.') }
  }
  if (!authReady) return <div className="loading-screen"><div className="loader"/><p>Preparando TaskFlow...</p></div>
  if (!user) return <AuthScreen/>

  const firstName = user.email?.split('@')[0] || 'Usuario'
  const greeting = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches'

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Check size={19}/></span> taskflow</div>
      <div className="side-label">MENÚ PRINCIPAL</div>
      <nav className="side-nav">
        <button className={activeView==='Todas'?'active':''} onClick={()=>setActiveView('Todas')}><LayoutDashboard size={18}/> Resumen</button>
        <button className={activeView==='Pendiente'?'active':''} onClick={()=>setActiveView('Pendiente')}><Circle size={18}/> Pendientes <span>{counts.pending}</span></button>
        <button className={activeView==='En progreso'?'active':''} onClick={()=>setActiveView('En progreso')}><Activity size={18}/> En progreso <span>{counts.progress}</span></button>
        <button className={activeView==='Completada'?'active':''} onClick={()=>setActiveView('Completada')}><CheckCircle2 size={18}/> Completadas <span>{counts.done}</span></button>
      </nav>
      <div className="sidebar-bottom"><div className="side-tip"><Sparkles size={18}/><strong>Un paso a la vez</strong><p>Los grandes logros comienzan con pequeñas tareas.</p></div><div className="profile"><div className="avatar">{firstName[0].toUpperCase()}</div><div className="profile-text"><strong>{firstName}</strong><small>{user.email}</small></div><button className="icon-btn" title="Cerrar sesión" onClick={()=>signOut(auth)}><LogOut size={17}/></button></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Mi espacio <span>/</span> {activeView === 'Todas' ? 'Resumen' : activeView}</div><div className="top-user"><span className="online-dot"/> Espacio personal</div></header>
      <section className="page">
        <div className="welcome-row"><div><span className="eyebrow purple">TU ESPACIO DE ORGANIZACIÓN</span><h1>{greeting}, {firstName} <span className="wave">✦</span></h1><p className="muted">Este es un buen momento para avanzar en lo que importa.</p></div><button className="btn primary" onClick={()=>setModal({})}><Plus size={18}/> Nueva tarea</button></div>
        {notice && <div className="notice">{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon violet"><ListTodo size={20}/></div><span>Total de tareas</span><strong>{counts.total}</strong><small>En tu espacio personal</small></div>
          <div className="stat-card"><div className="stat-icon amber"><Clock3 size={20}/></div><span>Pendientes</span><strong>{counts.pending}</strong><small>Por comenzar</small></div>
          <div className="stat-card"><div className="stat-icon blue"><Target size={20}/></div><span>En progreso</span><strong>{counts.progress}</strong><small>En las que estás trabajando</small></div>
          <div className="stat-card"><div className="stat-icon green"><CheckCircle2 size={20}/></div><span>Completadas</span><strong>{counts.done}</strong><small>¡Buen trabajo!</small></div>
        </div>
        <section className="tasks-section">
          <div className="section-heading"><div><h2>{activeView === 'Todas' ? 'Mis tareas' : activeView}</h2><p className="muted">Mantén tus actividades claras y bajo control.</p></div><span className="task-count">{visibleTasks.length} {visibleTasks.length===1?'tarea':'tareas'}</span></div>
          <div className="filters">
            <div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por título o descripción..."/>{search && <button onClick={()=>setSearch('')}><X size={15}/></button>}</div>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Filtrar por estado">{statuses.map(s=><option key={s} value={s}>{s === 'Todas' ? 'Todos los estados' : s}</option>)}</select>
            <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)} aria-label="Filtrar por prioridad">{priorities.map(p=><option key={p} value={p}>{p === 'Todas' ? 'Todas las prioridades' : `Prioridad ${p.toLowerCase()}`}</option>)}</select>
          </div>
          {loading ? <div className="empty-state"><div className="loader"/><p>Cargando tareas...</p></div> :
            visibleTasks.length ? <div className="task-list">{visibleTasks.map(task=><article className={`task-card ${task.status==='Completada'?'is-done':''}`} key={task.id}>
              <button className={`complete-btn ${task.status==='Completada'?'checked':''}`} onClick={()=>toggleDone(task)} title={task.status==='Completada'?'Marcar pendiente':'Marcar completada'}>{task.status==='Completada'?<Check size={17}/>:<span/>}</button>
              <div className="task-info"><div className="task-title-row"><h3>{task.title}</h3><span className={`priority priority-${(task.priority||'Media').toLowerCase()}`}><Flag size={12}/>{task.priority}</span></div>{task.description && <p>{task.description}</p>}<div className="task-meta"><span className={`status status-${task.status==='Completada'?'done':task.status==='En progreso'?'progress':'pending'}`}>{task.status}</span>{task.dueDate && <span><CalendarDays size={13}/>{new Date(`${task.dueDate}T00:00:00`).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</span>}</div></div>
              <div className="task-actions"><button className="icon-btn" title="Editar tarea" onClick={()=>setModal(task)}><Pencil size={16}/></button><button className="icon-btn danger" title="Eliminar tarea" onClick={()=>removeTask(task.id)}><Trash2 size={16}/></button></div>
            </article>)}</div> : <div className="empty-state"><div className="empty-icon"><ClipboardList size={27}/></div><h3>{search || statusFilter!=='Todas' || priorityFilter!=='Todas' ? 'No encontramos tareas' : 'Tu lista está lista para empezar'}</h3><p>{search || statusFilter!=='Todas' || priorityFilter!=='Todas' ? 'Prueba cambiando los filtros de búsqueda.' : 'Agrega tu primera tarea y convierte tus planes en acciones.'}</p>{!search && statusFilter==='Todas' && priorityFilter==='Todas' && <button className="btn primary" onClick={()=>setModal({})}><Plus size={17}/> Crear mi primera tarea</button>}</div>}
        </section>
        <footer className="page-footer">Hecho para avanzar, un pendiente a la vez. <Sparkles size={14}/></footer>
      </section>
    </main>
    {modal && <TaskModal initial={modal.id ? modal : null} onClose={()=>setModal(null)} onSave={saveTask}/>}
  </div>
}
export default App
