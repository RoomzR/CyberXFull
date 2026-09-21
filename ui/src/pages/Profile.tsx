import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileApi, bookingApi, pcApi, leaderboardApi, type Booking, type Pc, type PlayerStats, type LeaderRow } from '../services/api';

const ROLE_COLOR: Record<string,string> = { Admin:'#ef4444', Manager:'#eab308', Player:'#22d3ee' };
const ROLE_RU:    Record<string,string> = { Admin:'Администратор', Manager:'Менеджер', Player:'Игрок' };
const STATUS_COLOR: Record<string,string> = { pending:'#eab308', active:'#22c55e', completed:'#475569', cancelled:'#ef4444' };
const STATUS_RU:    Record<string,string> = { pending:'Ожидает', active:'Активна', completed:'Завершена', cancelled:'Отменена' };

const ZONE_COLOR = (z:string) => z==='STAGE'?'#3b82f6':z==='BOOTCAMP'?'#22c55e':'#a855f7';

function fmt(iso: string) {
  return new Date(iso).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

type Tab = 'bookings' | 'book' | 'top';

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance]   = useState(0);
  const [bookings,setBookings]  = useState<Booking[]>([]);
  const [session, setSession]   = useState<(Booking & {endTime:string})|null>(null);
  const [pcs,    setPcs]        = useState<Pc[]>([]);
  const [tab,    setTab]        = useState<Tab>('bookings');
  const [selPcId,setSelPcId]    = useState<number|null>(null);
  const [selDate,setSelDate]    = useState('');
  const [selHour,setSelHour]    = useState(1);
  const [busy,   setBusy]       = useState(false);
  const [bookErr,setBookErr]    = useState('');
  const [bookOk, setBookOk]     = useState('');
  const [loading,setLoading]    = useState(true);
  const [stats,  setStats]      = useState<PlayerStats|null>(null);
  const [leaders,setLeaders]    = useState<LeaderRow[]>([]);

  useEffect(() => {
    if (!user) { navigate('/login',{replace:true}); return; }
    Promise.all([
      profileApi.get().then(p=>setBalance(p.balance)),
      profileApi.bookings().then(setBookings),
      profileApi.activeSession().then(setSession),
      pcApi.getAll().then(setPcs),
      profileApi.stats().then(setStats).catch(()=>{}),
      leaderboardApi.top().then(setLeaders).catch(()=>{}),
    ]).finally(()=>setLoading(false));
  }, [user, navigate]);

  const handleLogout = async () => { await logout(); navigate('/',{replace:true}); };

  const handleBook = async () => {
    if (!selPcId||!selDate) { setBookErr('Выберите ПК и укажите время'); return; }
    setBookErr(''); setBookOk(''); setBusy(true);
    try {
      await bookingApi.create(selPcId, new Date(selDate).toISOString(), selHour);
      setBookOk('Бронирование создано успешно');
      const [b,p,s] = await Promise.all([profileApi.bookings(),profileApi.get(),profileApi.activeSession()]);
      setBookings(b); setBalance(p.balance); setSession(s);
      setSelPcId(null); setSelDate('');
    } catch (e: unknown) {
      setBookErr(e instanceof Error ? e.message : 'Ошибка');
    } finally { setBusy(false); }
  };

  const handleCancel = async (id:number) => {
    if (!confirm('Отменить бронирование и вернуть средства?')) return;
    await bookingApi.cancel(id);
    const [b,p] = await Promise.all([profileApi.bookings(),profileApi.get()]);
    setBookings(b); setBalance(p.balance);
  };

  if (!user||loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#060612]">
      <div className="text-[#475569] text-sm tracking-widest font-mono animate-pulse">ЗАГРУЗКА...</div>
    </div>
  );

  const selPc   = pcs.find(p=>p.id===selPcId);
  const price   = selPc ? selPc.hourlyRate * selHour : 0;
  const freePcs = pcs.filter(p=>p.status==='free');
  const rColor  = ROLE_COLOR[user.role]??'#fff';

  return (
    <div className="min-h-screen bg-[#060612] text-white font-mono flex">
      {/* ── Sidebar ─── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/[0.06] bg-black/40">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <Link to="/" className="text-base font-bold tracking-[.25em] block">
            CYBER<span style={{color:rColor}}>X</span>
          </Link>
        </div>

        {/* User card */}
        <div className="px-6 py-6 border-b border-white/[0.06]">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold mb-4"
            style={{background:`${rColor}12`,border:`1px solid ${rColor}30`,color:rColor}}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="font-bold text-sm mb-0.5">{user.username}</div>
          <div className="text-[11px] text-[#475569] mb-3">{user.email}</div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest"
            style={{color:rColor,background:`${rColor}18`,border:`1px solid ${rColor}30`}}>
            {ROLE_RU[user.role]}
          </span>
        </div>

        {/* Balance */}
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="text-[10px] uppercase tracking-[.18em] text-[#475569] mb-2">Баланс</div>
          <div className="text-2xl font-bold tabular-nums" style={{color:'#22d3ee'}}>{balance.toFixed(2)}</div>
          <div className="text-[11px] text-[#475569]">BYN</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {([['bookings','Мои бронирования'],['book','Забронировать ПК'],['top','Рейтинг игроков']] as [Tab,string][]).map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)}
              className="w-full text-left px-6 py-2.5 text-sm tracking-wide transition-all"
              style={{background:tab===k?`${rColor}10`:'transparent',color:tab===k?rColor:'#64748b',borderLeft:`2px solid ${tab===k?rColor:'transparent'}`}}>
              {l}
            </button>
          ))}
          <div className="my-3 border-t border-white/[0.06]" />
          <Link to="/3d-club" className="block px-6 py-2.5 text-sm text-[#475569] hover:text-white transition-colors tracking-wide">
            3D-тур по клубу
          </Link>
          {(user.role==='Manager'||user.role==='Admin') && (
            <Link to="/manager" className="block px-6 py-2.5 text-sm transition-colors tracking-wide" style={{color:'#eab308',opacity:.7}}>
              Manager Panel
            </Link>
          )}
          {user.role==='Admin' && (
            <Link to="/admin-panel" className="block px-6 py-2.5 text-sm text-red-400/60 hover:text-red-400 transition-colors tracking-wide">
              Admin Panel
            </Link>
          )}
        </nav>

        <button onClick={handleLogout}
          className="mx-4 mb-4 py-2 text-[11px] text-[#475569] hover:text-red-400 transition-colors tracking-widest uppercase border border-white/[0.06] rounded">
          Выйти
        </button>
      </aside>

      {/* ── Main ─── */}
      <main className="flex-1 overflow-auto p-8">

        {/* Active session banner */}
        {session && (
          <div className="mb-8 rounded-xl p-5 border border-[#22c55e]/20 bg-[#22c55e]/[0.04]">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e] animate-pulse mt-1.5 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-bold text-[#22c55e] mb-1">Активная сессия</div>
                <div className="font-bold mb-0.5">ПК #{session.pc.number} &middot; <span style={{color:ZONE_COLOR(session.pc.zone)}}>{session.pc.zone}</span></div>
                <div className="text-[11px] text-[#475569]">{fmt(session.startTime)} → {fmt(session.endTime)} &nbsp;&middot;&nbsp; {session.durationH}ч &nbsp;&middot;&nbsp; {session.totalPrice} BYN</div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Bookings ─── */}
        {tab==='bookings' && (
          <div>
            {/* Player stats */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {([
                  ['Всего броней', String(stats.totalBookings), '#22d3ee'],
                  ['Часов сыграно', String(stats.totalHours), '#22c55e'],
                  ['Потрачено', `${stats.totalSpent.toFixed(0)} BYN`, '#eab308'],
                  ['Любимая зона', stats.favoriteZone ?? '—', stats.favoriteZone ? ZONE_COLOR(stats.favoriteZone) : '#475569'],
                ] as [string,string,string][]).map(([l,v,c])=>(
                  <div key={l} className="rounded-xl p-4 border" style={{background:'rgba(255,255,255,0.02)',borderColor:`${c}22`}}>
                    <div className="text-[9px] uppercase tracking-[.18em] text-[#475569] mb-1.5">{l}</div>
                    <div className="text-xl font-bold tabular-nums" style={{color:c}}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-[10px] uppercase tracking-[.18em] text-[#475569] mb-5">
              История бронирований ({bookings.length})
            </div>
            {bookings.length===0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-[#475569]">
                <div className="text-3xl font-bold opacity-20 mb-3">—</div>
                <div className="text-sm tracking-wider mb-4">У вас нет бронирований</div>
                <button onClick={()=>setTab('book')} className="px-4 py-2 rounded-lg text-sm border border-white/[0.08] text-white/60 hover:text-white hover:border-white/20 transition-all">
                  Забронировать ПК
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.map(b=>{
                  const sc=STATUS_COLOR[b.status];
                  return (
                    <div key={b.id} className="rounded-xl border px-5 py-4 flex items-center gap-5 transition-all hover:bg-white/[0.02]"
                      style={{background:'rgba(255,255,255,0.02)',borderColor:'rgba(255,255,255,0.06)'}}>
                      <div className="w-1.5 shrink-0 self-stretch rounded-full" style={{background:sc,boxShadow:`0 0 6px ${sc}80`}} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm">ПК #{b.pc.number}</span>
                          <span className="text-[10px] font-bold" style={{color:ZONE_COLOR(b.pc.zone)}}>{b.pc.zone}</span>
                        </div>
                        <div className="text-[11px] text-[#475569] truncate">{b.pc.specs}</div>
                      </div>
                      <div className="text-sm text-[#475569] tabular-nums shrink-0">{fmt(b.startTime)}</div>
                      <div className="text-sm shrink-0">{b.durationH}ч</div>
                      <div className="font-bold tabular-nums shrink-0">{b.totalPrice} <span className="text-[#475569] text-xs font-normal">BYN</span></div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0"
                        style={{color:sc,background:`${sc}18`,border:`1px solid ${sc}33`}}>
                        {STATUS_RU[b.status]}
                      </span>
                      {b.status==='pending' && (
                        <button onClick={()=>handleCancel(b.id)}
                          className="px-3 py-1 rounded text-[11px] border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
                          Отменить
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Book ─── */}
        {tab==='book' && (
          <div className="max-w-xl">
            <div className="text-[10px] uppercase tracking-[.18em] text-[#475569] mb-6">
              Выберите компьютер и время
            </div>

            {/* Zone PC grid */}
            {['STAGE','BOOTCAMP','STANDART'].map(zone=>{
              const zPcs=freePcs.filter(p=>p.zone===zone);
              if (!zPcs.length) return null;
              const zc=ZONE_COLOR(zone);
              return (
                <div key={zone} className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-[10px] font-bold tracking-[.15em]" style={{color:zc}}>{zone}</div>
                    <div className="flex-1 h-px bg-white/[0.04]" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {zPcs.map(pc=>(
                      <button key={pc.id} onClick={()=>setSelPcId(pc.id)}
                        className="w-11 h-11 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background:selPcId===pc.id?`${zc}22`:`${zc}0a`,
                          border:`1px solid ${selPcId===pc.id?zc:`${zc}44`}`,
                          color:selPcId===pc.id?zc:'#64748b',
                          transform:selPcId===pc.id?'scale(1.08)':'scale(1)',
                        }}>
                        {pc.number}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {freePcs.length===0 && (
              <div className="text-center py-10 text-[#475569] text-sm border border-white/[0.06] rounded-xl mb-6">
                Нет свободных ПК в данный момент
              </div>
            )}

            {/* Selected PC info */}
            {selPc && (
              <div className="rounded-xl border border-white/[0.08] p-4 mb-5 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">ПК #{selPc.number}</span>
                  <span className="text-[10px] font-bold" style={{color:ZONE_COLOR(selPc.zone)}}>{selPc.zone}</span>
                </div>
                <div className="text-[11px] text-[#475569] mb-2">{selPc.specs}</div>
                <div className="text-sm font-bold text-cyan-400">{selPc.hourlyRate} BYN / час</div>
              </div>
            )}

            {/* Time + duration */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <div className="text-[10px] uppercase tracking-[.15em] text-[#475569] mb-2">Дата и время</div>
                <input type="datetime-local" value={selDate} onChange={e=>setSelDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/[0.08] bg-black/40 text-sm text-white outline-none focus:border-white/20 transition-colors" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[.15em] text-[#475569] mb-2">Длительность</div>
                <select value={selHour} onChange={e=>setSelHour(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/[0.08] bg-black/40 text-sm text-white outline-none focus:border-white/20">
                  {[1,2,3,4,6,8,12].map(h=><option key={h} value={h}>{h} ч</option>)}
                </select>
              </div>
            </div>

            {/* Price block */}
            {selPc && (
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-5 mb-5 text-center">
                <div className="text-[10px] uppercase tracking-[.18em] text-[#475569] mb-2">Итого к оплате</div>
                <div className="text-3xl font-bold text-cyan-400 tabular-nums mb-1">{price.toFixed(2)} BYN</div>
                <div className="text-[11px] text-[#475569]">
                  Баланс после: <span className={balance < price ? 'text-red-400' : 'text-white'}>{(balance-price).toFixed(2)} BYN</span>
                </div>
                {balance < price && (
                  <div className="mt-2 text-[11px] text-red-400">Недостаточно средств на балансе</div>
                )}
              </div>
            )}

            {bookErr && <div className="mb-4 text-sm text-red-400 text-center">{bookErr}</div>}
            {bookOk  && <div className="mb-4 text-sm text-[#22c55e] text-center">{bookOk}</div>}

            <button onClick={handleBook}
              disabled={busy || !selPcId || !selDate || balance < price || freePcs.length===0}
              className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{background:'linear-gradient(135deg,#0ea5e9,#22d3ee)',color:'#000'}}>
              {busy ? 'Обработка...' : 'Подтвердить бронирование'}
            </button>
          </div>
        )}

        {/* ── TAB: Leaderboard ─── */}
        {tab==='top' && (
          <div className="max-w-2xl">
            <div className="text-[10px] uppercase tracking-[.18em] text-[#475569] mb-6">
              Топ-10 игроков клуба по наигранным часам
            </div>
            {leaders.length===0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-[#475569]">
                <div className="text-3xl font-bold opacity-20 mb-3">—</div>
                <div className="text-sm tracking-wider">Пока нет завершённых сессий</div>
              </div>
            ) : (
              <div className="space-y-2">
                {leaders.map((l,i)=>{
                  const medal = i===0?'#eab308':i===1?'#9ca3af':i===2?'#b45309':'#1e293b';
                  const isMe = user && l.username===user.username;
                  return (
                    <div key={l.username} className="rounded-xl border px-5 py-4 flex items-center gap-5"
                      style={{background:isMe?'rgba(34,211,238,0.05)':'rgba(255,255,255,0.02)',
                              borderColor:isMe?'rgba(34,211,238,0.3)':'rgba(255,255,255,0.06)'}}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                        style={{background:`${medal}22`,color:i<3?medal:'#475569',border:`1px solid ${medal}44`}}>
                        {i+1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">
                          {l.username}
                          {isMe && <span className="ml-2 text-[9px] text-cyan-400 uppercase tracking-wider">вы</span>}
                        </div>
                        <div className="text-[11px] text-[#475569]">{l.sessions} сессий</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold tabular-nums" style={{color:'#22c55e'}}>{l.hours} ч</div>
                        <div className="text-[11px] text-[#475569] tabular-nums">{l.spent.toFixed(0)} BYN</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
