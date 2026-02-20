import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API = "https://functions.poehali.dev/b9d6437e-db44-45d9-88ed-c1ce0a0031ee";
const ADMIN_TOKEN = "uzi-admin-2026";

interface Appointment {
  id: number;
  doctor_name: string;
  patient_name: string;
  patient_phone: string;
  comment: string;
  day_of_week: string;
  time_slot: string;
  status: string;
  created_at: string;
}

interface Stats {
  total: number;
  new: number;
  confirmed: number;
  cancelled: number;
  by_doctor: { name: string; cnt: number }[];
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  new:       { label: "Новая",      color: "text-blue-600",  bg: "bg-blue-50 border-blue-200" },
  confirmed: { label: "Подтверждена", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  done:      { label: "Выполнена",  color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
  cancelled: { label: "Отменена",   color: "text-red-500",   bg: "bg-red-50 border-red-200" },
};

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<number | null>(null);

  const login = () => {
    if (password === ADMIN_TOKEN) { setAuthed(true); setPwError(false); }
    else setPwError(true);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([
        fetch(`${API}/admin/appointments${filter !== "all" ? `?status=${filter}` : ""}`, { headers: { "X-Admin-Token": ADMIN_TOKEN } }),
        fetch(`${API}/admin/stats`, { headers: { "X-Admin-Token": ADMIN_TOKEN } }),
      ]);
      const aData = await aRes.json();
      const sData = await sRes.json();
      setAppointments(aData.appointments || []);
      setStats(sData);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { if (authed) load(); }, [authed, filter]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await fetch(`${API}/admin/appointments/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN },
        body: JSON.stringify({ status }),
      });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          new: prev.new + (status === "new" ? 1 : appointments.find(a => a.id === id)?.status === "new" ? -1 : 0),
          confirmed: prev.confirmed + (status === "confirmed" ? 1 : appointments.find(a => a.id === id)?.status === "confirmed" ? -1 : 0),
          cancelled: prev.cancelled + (status === "cancelled" ? 1 : appointments.find(a => a.id === id)?.status === "cancelled" ? -1 : 0),
        } : null);
      }
    } catch { /* ignore */ }
    setUpdating(null);
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-golos px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Icon name="Baby" size={18} className="text-white" />
            </div>
            <div>
              <p className="font-montserrat font-bold text-slate-800 text-lg leading-none">УЗИ Центр</p>
              <p className="text-xs text-slate-400 mt-0.5">Панель администратора</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setPwError(false); }}
                onKeyDown={e => e.key === "Enter" && login()}
                placeholder="Введите пароль"
                className={`w-full px-4 py-3 rounded-xl border-2 text-slate-800 text-sm focus:outline-none transition ${pwError ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-primary"}`}
              />
              {pwError && <p className="text-xs text-red-500 mt-1.5">Неверный пароль</p>}
            </div>
            <Button className="w-full bg-primary text-white hover:bg-blue-700 rounded-xl h-11 font-semibold" onClick={login}>
              <Icon name="LogIn" size={16} className="mr-2" />Войти
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-golos">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Icon name="Baby" size={17} className="text-white" />
            </div>
            <div>
              <p className="font-montserrat font-bold text-slate-800 leading-none">УЗИ Центр</p>
              <p className="text-xs text-slate-400">Панель администратора</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 rounded-lg" onClick={load} disabled={loading}>
              <Icon name={loading ? "Loader" : "RefreshCw"} size={14} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Обновить
            </Button>
            <a href="/" className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5">
              <Icon name="ExternalLink" size={14} />Сайт
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Всего записей", val: stats.total, icon: "Calendar", color: "text-primary", bg: "bg-blue-50" },
              { label: "Новые", val: stats.new, icon: "Bell", color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Подтверждены", val: stats.confirmed, icon: "CheckCircle", color: "text-green-600", bg: "bg-green-50" },
              { label: "Отменены", val: stats.cancelled, icon: "XCircle", color: "text-red-500", bg: "bg-red-50" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon name={s.icon} size={19} className={s.color} />
                </div>
                <div className={`font-montserrat font-extrabold text-3xl ${s.color} leading-none mb-1`}>{s.val}</div>
                <div className="text-xs text-slate-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* By Doctor */}
        {stats?.by_doctor && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-montserrat font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Icon name="Users" size={16} className="text-primary" />
              Записи по врачам
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {stats.by_doctor.map(d => (
                <div key={d.name} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <span className="text-sm text-slate-700 font-medium truncate">{d.name}</span>
                  <Badge className="bg-primary text-white border-none shrink-0 ml-3">{d.cnt}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters + Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <h3 className="font-montserrat font-bold text-slate-800 mr-2">Записи пациентов</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { val: "all", label: "Все" },
                { val: "new", label: "Новые" },
                { val: "confirmed", label: "Подтверждены" },
                { val: "done", label: "Выполнены" },
                { val: "cancelled", label: "Отменены" },
              ].map(f => (
                <button key={f.val} onClick={() => setFilter(f.val)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filter === f.val ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
              Загружаю данные...
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Icon name="CalendarX" size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Записей не найдено</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Пациент</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Врач</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">День / Время</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Статус</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Дата записи</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appointments.map(a => {
                    const st = STATUS_MAP[a.status] || STATUS_MAP.new;
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{a.patient_name}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{a.patient_phone}</p>
                          {a.comment && <p className="text-slate-400 text-xs mt-0.5 italic truncate max-w-36">{a.comment}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-slate-600 text-sm leading-tight max-w-40">{a.doctor_name}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">{a.day_of_week}</p>
                          <p className="text-primary font-bold text-base">{a.time_slot}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(a.created_at)}</td>
                        <td className="px-5 py-4">
                          {updating === a.id ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {a.status !== "confirmed" && (
                                <button onClick={() => updateStatus(a.id, "confirmed")}
                                  className="text-xs px-2.5 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium">
                                  ✓ Подтвердить
                                </button>
                              )}
                              {a.status !== "done" && (
                                <button onClick={() => updateStatus(a.id, "done")}
                                  className="text-xs px-2.5 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium">
                                  Выполнено
                                </button>
                              )}
                              {a.status !== "cancelled" && (
                                <button onClick={() => updateStatus(a.id, "cancelled")}
                                  className="text-xs px-2.5 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium">
                                  Отменить
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
