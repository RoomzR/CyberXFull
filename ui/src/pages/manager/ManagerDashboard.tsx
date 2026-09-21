import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { pcApi, bookingApi, type Pc, type AdminBooking } from '../../services/api';

const STATUS_HEX: Record<string, string> = {
  free: '#22c55e', booked: '#eab308', occupied: '#3b82f6', maintenance: '#ef4444',
};
const STATUS_RU: Record<string, string> = {
  free: 'Свободен', booked: 'Забронирован', occupied: 'Занят', maintenance: 'Сервис',
};
const BOOKING_HEX: Record<string, string> = {
  pending: '#eab308', active: '#22c55e', completed: '#6b7280', cancelled: '#ef4444',
};

type Tab = 'map' | 'sessions' | 'bookings';

// ── Sidebar item ───────────────────────────────────────────────────────────
function NavItem({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full text-left px-4 py-2.5 text-sm tracking-wide transition-all"
      style={{
        background: active ? 'rgba(234,179,8,0.08)' : 'transparent',
        color: active ? '#eab308' : '#64748b',
        borderLeft: `2px solid ${active ? '#eab308' : 'transparent'}`,
      }}>
      {label}
    </button>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────
function Badge({ status, map }: { status: string; map: Record<string, string> }) {
  const col = map[status] ?? '#6b7280';
  return (
    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wider"
      style={{ color: col, background: `${col}18`, border: `1px solid ${col}33` }}>
      {status}
    </span>
  );
}

export function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]         = useState<Tab>('map');
  const [pcs, setPcs]         = useState<Pc[]>([]);
  const [bookings, setBookings]= useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selPc, setSelPc]     = useState<Pc | null>(null);
  const [saving, setSaving]   = useState<number | null>(null);

  useEffect(() => {
    if (!user || (user.role !== 'Manager' && user.role !== 'Admin')) navigate('/login');
  }, [user, navigate]);

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      if (t === 'map')     { setPcs(await pcApi.getAll()); }
      if (t === 'sessions'){ const [p,b]=await Promise.all([pcApi.getAll(),bookingApi.getAll('active')]); setPcs(p);setBookings(b); }
      if (t === 'bookings'){ setBookings(await bookingApi.getAll()); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const changePcStatus = async (id: number, status: string) => {
    setSaving(id);
    try { await pcApi.setStatus(id, status); setPcs(p=>p.map(x=>x.id===id?{...x,status}:x)); setSelPc(prev=>prev?.id===id?{...prev,status}:prev); }
    finally { setSaving(null); }
  };

  const changeBookingStatus = async (id: number, status: string) => {
    await bookingApi.setStatus(id, status);
    setBookings(p=>p.map(x=>x.id===id?{...x,status}:x));
  };

  const freeCnt = pcs.filter(p=>p.status==='free').length;
  const occCnt  = pcs.filter(p=>p.status==='occupied').length;
  const bokCnt  = pcs.filter(p=>p.status==='booked').length;
  const srvCnt  = pcs.filter(p=>p.status==='maintenance').length;

  const zoneColor = (z: string) => z==='STAGE'?'#3b82f6':z==='BOOTCAMP'?'#22c55e':'#a855f7';

  return (
    <div className="min-h-screen bg-[#060612] text-white flex font-mono">
      {/* ── Sidebar ─── */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.06] bg-black/40">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <Link to="/" className="text-base font-bold tracking-[.25em] block">
            CYBER<span className="text-[#eab308]">X</span>
          </Link>
          <div className="text-[10px] text-[#eab308] uppercase tracking-[.2em] mt-0.5 font-semibold">Manager</div>
        </div>

        <nav className="flex-1 py-3">
          <NavItem active={tab==='map'}      label="Карта зала"       onClick={()=>setTab('map')} />
          <NavItem active={tab==='sessions'} label="Активные сессии"  onClick={()=>setTab('sessions')} />
          <NavItem active={tab==='bookings'} label="Все бронирования" onClick={()=>setTab('bookings')} />
          <div className="my-3 border-t border-white/[0.06]" />
          <Link to="/profile" className="block px-4 py-2.5 text-sm text-[#475569] hover:text-white transition-colors tracking-wide">
            Профиль
          </Link>
          {user?.role==='Admin' && (
            <Link to="/admin-panel" className="block px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 transition-colors tracking-wide">
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Quick stats */}
        <div className="px-4 py-4 border-t border-white/[0.06] space-y-2">
          {([['Свободно',freeCnt,'#22c55e'],['Занято',occCnt,'#3b82f6'],['Забронир.',bokCnt,'#eab308'],['Сервис',srvCnt,'#ef4444']] as [string,number,string][]).map(([l,c,col])=>(
            <div key={l} className="flex justify-between items-center">
              <span className="text-[11px] text-[#475569]">{l}</span>
              <span className="text-[11px] font-bold tabular-nums" style={{color:col}}>{c}</span>
            </div>
          ))}
        </div>

        <button onClick={()=>{logout();navigate('/');}}
          className="mx-4 mb-4 py-2 text-[11px] text-[#475569] hover:text-red-400 transition-colors tracking-widest uppercase border border-white/[0.06] rounded">
          Выйти
        </button>
      </aside>

      {/* ── Main ─── */}
      <main className="flex-1 overflow-auto">

        {/* Top bar */}
        <div className="px-8 py-4 border-b border-white/[0.06] flex items-center justify-between bg-black/20">
          <div>
            <h1 className="text-sm font-bold tracking-[.15em] uppercase text-white/80">
              {tab==='map'?'Карта зала':tab==='sessions'?'Активные сессии':'Все бронирования'}
            </h1>
            <div className="text-[10px] text-[#475569] mt-0.5">
              {tab==='map'?`${pcs.length} компьютеров`:tab==='sessions'?`${bookings.filter(b=>b.status==='active').length} активных`:`${bookings.length} записей`}
            </div>
          </div>
          <button onClick={()=>load(tab)}
            className="px-4 py-1.5 text-[11px] uppercase tracking-widest border border-white/[0.08] text-[#475569] hover:text-white hover:border-white/20 transition-all rounded">
            Обновить
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-[#475569] text-sm tracking-widest animate-pulse">ЗАГРУЗКА...</div>
          </div>
        )}

        {/* ── MAP ─── */}
        {!loading && tab==='map' && (
          <div className="flex gap-0 h-[calc(100vh-73px)]">
            <div className="flex-1 overflow-auto p-8">
              {/* Legend */}
              <div className="flex gap-6 mb-6">
                {Object.entries(STATUS_RU).map(([k,v])=>(
                  <div key={k} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{background:STATUS_HEX[k]}} />
                    <span className="text-[11px] text-[#475569]">{v}</span>
                  </div>
                ))}
              </div>

              {['STAGE','BOOTCAMP','STANDART'].map(zone=>{
                const zPcs=pcs.filter(p=>p.zone===zone);
                const zCol=zoneColor(zone);
                const free=zPcs.filter(p=>p.status==='free').length;
                return (
                  <div key={zone} className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-[10px] font-bold tracking-[.2em]" style={{color:zCol}}>{zone}</div>
                      <div className="text-[10px] text-[#475569]">{free}/{zPcs.length} свободно</div>
                      <div className="flex-1 h-px bg-white/[0.04]" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {zPcs.map(pc=>{
                        const col=STATUS_HEX[pc.status];
                        const isSel=selPc?.id===pc.id;
                        return (
                          <button key={pc.id} onClick={()=>setSelPc(isSel?null:pc)}
                            className="w-11 h-11 rounded flex flex-col items-center justify-center text-[10px] font-bold transition-all"
                            style={{
                              background: isSel?`${col}22`:`${col}0e`,
                              border:`1px solid ${isSel?col:`${col}44`}`,
                              color:col,
                              transform:isSel?'scale(1.08)':'scale(1)',
                            }}>
                            <div className="w-1.5 h-1.5 rounded-full mb-0.5" style={{background:col}} />
                            {pc.number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            {selPc && (
              <div className="w-64 border-l border-white/[0.06] p-6 bg-black/30 shrink-0">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-lg font-bold">ПК #{selPc.number}</div>
                    <div className="text-[10px] font-bold tracking-[.15em] mt-0.5" style={{color:zoneColor(selPc.zone)}}>{selPc.zone}</div>
                  </div>
                  <button onClick={()=>setSelPc(null)} className="text-[#475569] hover:text-white text-lg leading-none">×</button>
                </div>

                <div className="text-[11px] text-[#475569] leading-relaxed mb-4">{selPc.specs}</div>

                <div className="mb-1 text-[10px] text-[#475569] uppercase tracking-wider">Стоимость</div>
                <div className="text-base font-bold text-cyan-400 mb-5">{selPc.hourlyRate} BYN/ч</div>

                <div className="mb-3 text-[10px] text-[#475569] uppercase tracking-wider">Статус</div>
                <div className="space-y-1.5">
                  {(['free','occupied','booked','maintenance'] as const).map(s=>{
                    const col=STATUS_HEX[s];
                    const active=selPc.status===s;
                    return (
                      <button key={s} disabled={saving===selPc.id} onClick={()=>changePcStatus(selPc.id,s)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded text-[12px] transition-all disabled:opacity-50"
                        style={{
                          background:active?`${col}18`:'rgba(255,255,255,0.02)',
                          border:`1px solid ${active?col:'rgba(255,255,255,0.06)'}`,
                          color:active?col:'#475569',
                        }}>
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:col}} />
                        {STATUS_RU[s]}
                        {active && <span className="ml-auto text-[9px] opacity-60">ТЕКУЩИЙ</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SESSIONS ─── */}
        {!loading && tab==='sessions' && (
          <div className="p-8">
            {bookings.filter(b=>b.status==='active').length===0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-[#475569]">
                <div className="text-4xl font-bold mb-3 opacity-20">—</div>
                <div className="text-sm tracking-wider">Нет активных сессий</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {bookings.filter(b=>b.status==='active').map(b=>{
                  const end=new Date(new Date(b.startTime).getTime()+b.durationH*3600000);
                  const rem=Math.max(0,Math.round((end.getTime()-Date.now())/60000));
                  const pct=Math.min(100,100-(rem/(b.durationH*60))*100);
                  return (
                    <div key={b.id} className="rounded-xl p-5 border border-[#22c55e]/20 bg-[#22c55e]/[0.03]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-base font-bold">ПК #{b.pc.number}</div>
                          <div className="text-[10px] font-bold tracking-[.15em] mt-0.5" style={{color:zoneColor(b.pc.zone)}}>{b.pc.zone}</div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e] animate-pulse" />
                      </div>

                      <div className="text-sm font-semibold mb-0.5">{b.user.username}</div>
                      <div className="text-[11px] text-[#475569] mb-4">{b.user.email}</div>

                      <div className="flex justify-between text-[11px] text-[#475569] mb-2">
                        <span>{new Date(b.startTime).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})} → {end.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</span>
                        <span className="font-bold text-[#eab308]">{rem} мин</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06] mb-4">
                        <div className="h-1 rounded-full transition-all" style={{width:`${pct}%`,background:'#22c55e'}} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#475569]">{b.durationH}ч · {b.totalPrice} BYN</span>
                        <button onClick={()=>changeBookingStatus(b.id,'completed')}
                          className="px-3 py-1 rounded text-[11px] border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                          Завершить
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BOOKINGS ─── */}
        {!loading && tab==='bookings' && (
          <div className="p-8">
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    {['#','Игрок','ПК','Начало','Длительность','Сумма','Статус','Действие'].map(h=>(
                      <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-[.15em] text-[#475569] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b,i)=>(
                    <tr key={b.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                      style={{background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                      <td className="px-5 py-3 text-[#475569] tabular-nums text-xs">{b.id}</td>
                      <td className="px-5 py-3 font-semibold">{b.user.username}</td>
                      <td className="px-5 py-3">
                        <span className="font-bold">#{b.pc.number}</span>
                        <span className="ml-1.5 text-[10px]" style={{color:zoneColor(b.pc.zone)}}>{b.pc.zone}</span>
                      </td>
                      <td className="px-5 py-3 text-[#475569] text-xs tabular-nums">
                        {new Date(b.startTime).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
                      </td>
                      <td className="px-5 py-3 text-sm">{b.durationH}ч</td>
                      <td className="px-5 py-3 font-bold tabular-nums">{b.totalPrice} <span className="text-[#475569] text-xs font-normal">BYN</span></td>
                      <td className="px-5 py-3"><Badge status={b.status} map={BOOKING_HEX} /></td>
                      <td className="px-5 py-3">
                        {b.status==='pending' && (
                          <button onClick={()=>changeBookingStatus(b.id,'active')}
                            className="px-3 py-1 rounded text-[11px] border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors">
                            Запустить
                          </button>
                        )}
                        {b.status==='active' && (
                          <button onClick={()=>changeBookingStatus(b.id,'completed')}
                            className="px-3 py-1 rounded text-[11px] border border-[#475569]/30 text-[#475569] hover:bg-white/[0.05] transition-colors">
                            Завершить
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length===0 && (
                <div className="py-16 text-center text-[#475569] text-sm tracking-wider">— Нет бронирований —</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
