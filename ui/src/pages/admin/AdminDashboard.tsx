import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { adminApi, bookingApi, pcApi, type AdminStats, type AdminBooking, type Pc, type UserRow } from '../../services/api';
import { AdminLivePanel } from './AdminLivePanel';

type Tab = 'dashboard' | 'pcs' | 'bookings' | 'users' | 'live';

const STATUS_HEX: Record<string,string> = { free:'#22c55e', booked:'#eab308', occupied:'#3b82f6', maintenance:'#ef4444' };
const STATUS_RU:  Record<string,string> = { free:'Свободен', booked:'Забронирован', occupied:'Занят', maintenance:'Сервис' };
const BOOK_HEX:   Record<string,string> = { pending:'#eab308', active:'#22c55e', completed:'#6b7280', cancelled:'#ef4444' };
const ZONE_HEX = (z:string) => z==='STAGE'?'#3b82f6':z==='BOOTCAMP'?'#22c55e':'#a855f7';

function NavItem({ active, label, count, onClick }: { active:boolean; label:string; count?:number; onClick:()=>void }) {
  return (
    <button onClick={onClick}
      className="w-full text-left px-4 py-2.5 text-sm tracking-wide flex items-center justify-between transition-all"
      style={{ background:active?'rgba(239,68,68,0.07)':'transparent', color:active?'#f87171':'#64748b', borderLeft:`2px solid ${active?'#ef4444':'transparent'}` }}>
      <span>{label}</span>
      {count!=null && <span className="text-[10px] tabular-nums px-1.5 py-0.5 rounded" style={{background:'rgba(255,255,255,0.05)',color:'#64748b'}}>{count}</span>}
    </button>
  );
}

function Stat({ label, value, sub, color }: { label:string; value:number|string; sub?:string; color:string }) {
  return (
    <div className="rounded-xl p-5 border" style={{background:'rgba(255,255,255,0.02)',borderColor:`${color}22`}}>
      <div className="text-[10px] uppercase tracking-[.18em] text-[#475569] mb-2">{label}</div>
      <div className="text-2xl font-bold tabular-nums" style={{color}}>{value}</div>
      {sub && <div className="text-[11px] text-[#475569] mt-1">{sub}</div>}
    </div>
  );
}

function Badge({ status, map }: { status:string; map:Record<string,string> }) {
  const c=map[status]??'#6b7280';
  return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase" style={{color:c,background:`${c}18`,border:`1px solid ${c}33`}}>{status}</span>;
}

export function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]         = useState<Tab>('dashboard');
  const [stats, setStats]     = useState<AdminStats|null>(null);
  const [chart, setChart]     = useState<{date:string;revenue:number}[]>([]);
  const [pcs, setPcs]         = useState<Pc[]>([]);
  const [bookings, setBookings]= useState<AdminBooking[]>([]);
  const [users, setUsers]     = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [bStatus, setBStatus] = useState('');
  const [balInput, setBalInput]= useState<Record<number,string>>({});
  const [saving, setSaving]   = useState<number|null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'Admin') navigate('/login');
  }, [user, authLoading, navigate]);

  const load = useCallback(async (t:Tab) => {
    if (t === 'live') { setLoading(false); return; }
    setLoading(true);
    try {
      if (t==='dashboard') {
        setStats(await adminApi.stats());
        adminApi.revenueChart().then(setChart).catch(()=>{});
      }
      if (t==='pcs')       setPcs(await pcApi.getAll());
      if (t==='bookings')  setBookings(await bookingApi.getAll(bStatus||undefined));
      if (t==='users')     setUsers(await adminApi.users(search||undefined));
    } finally { setLoading(false); }
  }, [bStatus, search]);

  useEffect(() => { load(tab); }, [tab, load]);

  const setPcStatus = async (id:number, status:string) => {
    setSaving(id); try { await pcApi.setStatus(id,status); setPcs(p=>p.map(x=>x.id===id?{...x,status}:x)); } finally { setSaving(null); }
  };
  const setBookingStatus = async (id:number,status:string) => {
    await bookingApi.setStatus(id,status); setBookings(p=>p.map(x=>x.id===id?{...x,status}:x));
  };
  const toggleUser = async (id:number) => {
    const r=await adminApi.toggleUser(id); setUsers(p=>p.map(x=>x.id===id?{...x,isActive:r.isActive}:x));
  };
  const setRole = async (id:number,role:string) => {
    await adminApi.setRole(id,role); setUsers(p=>p.map(x=>x.id===id?{...x,role}:x));
  };
  const addBalance = async (id:number) => {
    const a=parseFloat(balInput[id]||'0'); if(!a) return;
    const r=await adminApi.addBalance(id,a); setUsers(p=>p.map(x=>x.id===id?{...x,balance:r.balance}:x));
    setBalInput(p=>({...p,[id]:''}));
  };

  const roleColor = (r:string) => r==='Admin'?'#ef4444':r==='Manager'?'#eab308':'#22d3ee';

  return (
    <div className="min-h-screen bg-[#060612] text-white flex font-mono">
      {/* ── Sidebar ─── */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.06] bg-black/40">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <Link to="/" className="text-base font-bold tracking-[.25em] block">
            CYBER<span className="text-[#ef4444]">X</span>
          </Link>
          <div className="text-[10px] text-[#ef4444] uppercase tracking-[.2em] mt-0.5 font-semibold">Admin Panel</div>
        </div>

        <nav className="flex-1 py-3">
          <NavItem active={tab==='dashboard'} label="Дашборд"       onClick={()=>setTab('dashboard')} />
          <NavItem active={tab==='pcs'}       label="Компьютеры"    count={pcs.length} onClick={()=>setTab('pcs')} />
          <NavItem active={tab==='bookings'}  label="Бронирования"  count={bookings.length} onClick={()=>setTab('bookings')} />
          <NavItem active={tab==='users'}     label="Пользователи"  count={users.length} onClick={()=>setTab('users')} />
          <NavItem active={tab==='live'}     label="Live Stats"    onClick={()=>setTab('live')} />
          <div className="my-3 border-t border-white/[0.06]" />
          <Link to="/live/control" className="block px-4 py-2.5 text-sm text-[#22d3ee]/70 hover:text-[#22d3ee] transition-colors tracking-wide">
            Live Control →
          </Link>
          <Link to="/live" target="_blank" className="block px-4 py-2.5 text-sm text-[#ff5500]/70 hover:text-[#ff5500] transition-colors tracking-wide">
            Публичный эфир ↗
          </Link>
        </nav>

        <button onClick={()=>{logout();navigate('/');}}
          className="mx-4 mb-4 py-2 text-[11px] text-[#475569] hover:text-red-400 transition-colors tracking-widest uppercase border border-white/[0.06] rounded">
          Выйти
        </button>
      </aside>

      {/* ── Content ─── */}
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-4 border-b border-white/[0.06] flex items-center justify-between bg-black/20">
          <div>
            <h1 className="text-sm font-bold tracking-[.15em] uppercase text-white/80">
              {tab==='dashboard'?'Дашборд':tab==='pcs'?'Компьютеры':tab==='bookings'?'Бронирования':tab==='live'?'Live Stats':'Пользователи'}
            </h1>
          </div>
          <button onClick={()=>load(tab)}
            className="px-4 py-1.5 text-[11px] uppercase tracking-widest border border-white/[0.08] text-[#475569] hover:text-white hover:border-white/20 transition-all rounded">
            Обновить
          </button>
        </div>

        {loading && tab !== 'live' && <div className="flex items-center justify-center h-64"><div className="text-[#475569] text-sm tracking-widest animate-pulse">ЗАГРУЗКА...</div></div>}

        {/* ── DASHBOARD ─── */}
        {!loading && tab==='dashboard' && stats && (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label="Пользователей"  value={stats.totalUsers}  sub={`${stats.activeUsers} активных`} color="#22d3ee" />
              <Stat label="Компьютеров"    value={stats.totalPcs}    sub={`${stats.freePcs} свободных`}   color="#22c55e" />
              <Stat label="Броней сегодня" value={stats.todayBookings}  color="#eab308" />
              <Stat label="Доход сегодня"  value={`${stats.todayRevenue} BYN`} sub={`Месяц: ${stats.monthRevenue} BYN`} color="#ef4444" />
            </div>

            {/* Revenue chart — last 30 days */}
            <div>
              <div className="text-[10px] uppercase tracking-[.18em] text-[#475569] mb-4">Доход за 30 дней</div>
              <div className="rounded-xl border border-white/[0.06] p-5" style={{background:'rgba(255,255,255,0.02)'}}>
                {chart.length===0 ? (
                  <div className="text-center text-[#475569] text-sm py-10 tracking-wider">— Нет данных о доходах —</div>
                ) : (() => {
                  const max = Math.max(...chart.map(c=>c.revenue), 1);
                  // build full 30-day series with zeros for missing days
                  const days: {label:string; revenue:number}[] = [];
                  for (let i=29;i>=0;i--) {
                    const d = new Date(); d.setDate(d.getDate()-i);
                    const key = d.toISOString().slice(0,10);
                    const found = chart.find(c=>c.date.slice(0,10)===key);
                    days.push({ label: d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'}), revenue: found?.revenue ?? 0 });
                  }
                  return (
                    <div className="flex items-end gap-1 h-36">
                      {days.map((d,i)=>(
                        <div key={i} className="flex-1 flex flex-col items-center group relative">
                          <div className="absolute -top-7 hidden group-hover:block px-2 py-0.5 rounded text-[9px] whitespace-nowrap z-10"
                            style={{background:'#0a0a1a',border:'1px solid rgba(239,68,68,0.4)',color:'#f87171'}}>
                            {d.label}: {d.revenue.toFixed(0)} BYN
                          </div>
                          <div className="w-full rounded-t transition-all"
                            style={{
                              height:`${Math.max(2,(d.revenue/max)*100)}%`,
                              background: d.revenue>0 ? 'linear-gradient(to top,#7f1d1d,#ef4444)' : 'rgba(255,255,255,0.04)',
                              minHeight:2,
                            }} />
                          {i%5===0 && <div className="text-[8px] text-[#475569] mt-1.5 tabular-nums">{d.label}</div>}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Zone load */}
            <div>
              <div className="text-[10px] uppercase tracking-[.18em] text-[#475569] mb-4">Загрузка по зонам</div>
              <div className="grid grid-cols-3 gap-4">
                {stats.zoneStats.map(z=>{
                  const pct=z.total>0?Math.round((z.occupied/z.total)*100):0;
                  const c=ZONE_HEX(z.zone);
                  return (
                    <div key={z.zone} className="rounded-xl p-5 border" style={{background:'rgba(255,255,255,0.02)',borderColor:`${c}22`}}>
                      <div className="text-[10px] font-bold tracking-[.18em] mb-3" style={{color:c}}>{z.zone}</div>
                      <div className="text-3xl font-bold tabular-nums mb-3">{pct}<span className="text-sm text-[#475569]">%</span></div>
                      <div className="h-1 rounded-full bg-white/[0.06]">
                        <div className="h-1 rounded-full" style={{width:`${pct}%`,background:c}} />
                      </div>
                      <div className="text-[11px] text-[#475569] mt-2">{z.occupied}/{z.total} занято</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PC status summary */}
            <div>
              <div className="text-[10px] uppercase tracking-[.18em] text-[#475569] mb-4">Статусы ПК</div>
              <div className="flex gap-3">
                {stats.pcStatusMap.map(s=>{
                  const c=STATUS_HEX[s.status]??'#6b7280';
                  return (
                    <div key={s.status} className="rounded-xl px-6 py-4 border flex-1 text-center" style={{background:`${c}08`,borderColor:`${c}22`}}>
                      <div className="text-2xl font-bold tabular-nums" style={{color:c}}>{s.count}</div>
                      <div className="text-[10px] text-[#475569] mt-1">{STATUS_RU[s.status]??s.status}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent bookings */}
            <div>
              <div className="text-[10px] uppercase tracking-[.18em] text-[#475569] mb-4">Последние бронирования</div>
              <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      {['#','Игрок','ПК','Зона','Начало','Часы','Сумма','Статус'].map(h=>(
                        <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[.15em] text-[#475569]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((b,i)=>(
                      <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                        style={{background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                        <td className="px-4 py-3 text-[#475569] text-xs">{b.id}</td>
                        <td className="px-4 py-3 font-semibold">{b.user}</td>
                        <td className="px-4 py-3 font-bold">#{b.pc}</td>
                        <td className="px-4 py-3 text-[10px] font-bold" style={{color:ZONE_HEX(b.zone)}}>{b.zone}</td>
                        <td className="px-4 py-3 text-[#475569] text-xs tabular-nums">{new Date(b.startTime).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</td>
                        <td className="px-4 py-3 text-sm">{b.durationH}ч</td>
                        <td className="px-4 py-3 font-bold tabular-nums">{b.totalPrice} <span className="text-[#475569] text-xs font-normal">BYN</span></td>
                        <td className="px-4 py-3"><Badge status={b.status} map={BOOK_HEX} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PCS ─── */}
        {!loading && tab==='pcs' && (
          <div className="p-8">
            {['STAGE','BOOTCAMP','STANDART'].map(zone=>{
              const zPcs=pcs.filter(p=>p.zone===zone);
              const c=ZONE_HEX(zone);
              return (
                <div key={zone} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-[10px] font-bold tracking-[.2em]" style={{color:c}}>{zone}</div>
                    <div className="text-[10px] text-[#475569]">{zPcs.filter(p=>p.status==='free').length}/{zPcs.length} свободно</div>
                    <div className="flex-1 h-px bg-white/[0.04]" />
                  </div>
                  <div className="grid grid-cols-5 lg:grid-cols-8 gap-3">
                    {zPcs.map(pc=>{
                      const sc=STATUS_HEX[pc.status];
                      return (
                        <div key={pc.id} className="rounded-lg p-3 border text-center" style={{background:`${sc}08`,borderColor:`${sc}33`}}>
                          <div className="text-sm font-bold mb-1.5" style={{color:sc}}>#{pc.number}</div>
                          <div className="text-[9px] text-[#475569] mb-2 leading-tight">{pc.hourlyRate} BYN/ч</div>
                          <select value={pc.status} disabled={saving===pc.id}
                            onChange={e=>setPcStatus(pc.id,e.target.value)}
                            className="w-full text-[9px] rounded px-1 py-1 border outline-none transition-colors disabled:opacity-50"
                            style={{background:'rgba(6,6,18,0.9)',borderColor:'rgba(255,255,255,0.1)',color:sc}}>
                            <option value="free">Свободен</option>
                            <option value="booked">Забронирован</option>
                            <option value="occupied">Занят</option>
                            <option value="maintenance">Сервис</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── BOOKINGS ─── */}
        {!loading && tab==='bookings' && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <select value={bStatus} onChange={e=>{setBStatus(e.target.value);load('bookings');}}
                className="px-3 py-2 rounded-lg text-sm border border-white/[0.08] bg-black/40 text-white outline-none">
                <option value="">Все статусы</option>
                <option value="pending">Ожидают</option>
                <option value="active">Активные</option>
                <option value="completed">Завершённые</option>
                <option value="cancelled">Отменённые</option>
              </select>
            </div>
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    {['#','Игрок','Email','ПК','Начало','Часы','Сумма','Статус','Изменить'].map(h=>(
                      <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[.15em] text-[#475569]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b,i)=>(
                    <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      style={{background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                      <td className="px-4 py-3 text-[#475569] text-xs">{b.id}</td>
                      <td className="px-4 py-3 font-semibold">{b.user.username}</td>
                      <td className="px-4 py-3 text-[#475569] text-xs">{b.user.email}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold">#{b.pc.number}</span>
                        <span className="ml-1.5 text-[9px] font-bold" style={{color:ZONE_HEX(b.pc.zone)}}>{b.pc.zone}</span>
                      </td>
                      <td className="px-4 py-3 text-[#475569] text-xs tabular-nums">
                        {new Date(b.startTime).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
                      </td>
                      <td className="px-4 py-3">{b.durationH}ч</td>
                      <td className="px-4 py-3 font-bold tabular-nums">{b.totalPrice} <span className="text-[#475569] text-xs font-normal">BYN</span></td>
                      <td className="px-4 py-3"><Badge status={b.status} map={BOOK_HEX} /></td>
                      <td className="px-4 py-3">
                        <select value={b.status} onChange={e=>setBookingStatus(b.id,e.target.value)}
                          className="text-[11px] rounded px-2 py-1 border border-white/[0.08] bg-black/40 text-white outline-none">
                          <option value="pending">pending</option>
                          <option value="active">active</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length===0 && <div className="py-16 text-center text-[#475569] text-sm tracking-wider">— Нет бронирований —</div>}
            </div>
          </div>
        )}

        {/* ── USERS ─── */}
        {!loading && tab==='users' && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <input value={search} onChange={e=>setSearch(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&load('users')}
                placeholder="Поиск по имени / email..."
                className="px-4 py-2 rounded-lg text-sm border border-white/[0.08] bg-black/40 text-white placeholder-[#475569] outline-none focus:border-white/20 w-72"
              />
              <button onClick={()=>load('users')}
                className="px-5 py-2 rounded-lg text-sm border border-white/[0.08] text-[#475569] hover:text-white hover:border-white/20 transition-all">
                Найти
              </button>
            </div>

            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    {['Пользователь','Роль','Баланс','Дата рег.','Заблокирован','Изменить роль','Пополнить','Статус'].map(h=>(
                      <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[.15em] text-[#475569]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u,i)=>(
                    <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      style={{background:i%2===0?'transparent':'rgba(255,255,255,0.01)',opacity:u.isActive?1:0.5}}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{background:`${roleColor(u.role)}18`,color:roleColor(u.role),border:`1px solid ${roleColor(u.role)}33`}}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{u.username}</div>
                            <div className="text-[11px] text-[#475569]">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{color:roleColor(u.role),background:`${roleColor(u.role)}18`}}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold tabular-nums text-cyan-400">{u.balance.toFixed(2)}</td>
                      <td className="px-4 py-3 text-[#475569] text-xs tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-4 py-3 text-[11px]" style={{color:u.isActive?'#22c55e':'#ef4444'}}>
                        {u.isActive?'Нет':'Да'}
                      </td>
                      <td className="px-4 py-3">
                        <select value={u.role} onChange={e=>setRole(u.id,e.target.value)}
                          className="text-[11px] rounded px-2 py-1 border border-white/[0.08] bg-black/40 text-white outline-none">
                          <option value="Player">Player</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <input value={balInput[u.id]??''} onChange={e=>setBalInput(p=>({...p,[u.id]:e.target.value}))}
                            placeholder="+BYN" className="w-16 px-2 py-1 rounded text-[11px] border border-white/[0.08] bg-black/40 text-white outline-none" />
                          <button onClick={()=>addBalance(u.id)}
                            className="px-2 py-1 rounded text-[11px] border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors">
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={()=>toggleUser(u.id)}
                          className="px-3 py-1 rounded text-[11px] transition-colors"
                          style={{border:`1px solid ${u.isActive?'rgba(239,68,68,0.3)':'rgba(34,197,94,0.3)'}`,color:u.isActive?'#f87171':'#4ade80',background:'transparent'}}>
                          {u.isActive?'Заблок.':'Разблок.'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length===0 && <div className="py-16 text-center text-[#475569] text-sm">— Нет пользователей —</div>}
            </div>
          </div>
        )}
        {tab==='live' && <AdminLivePanel />}
      </main>
    </div>
  );
}
