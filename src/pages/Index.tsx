import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API = "https://functions.poehali.dev/b9d6437e-db44-45d9-88ed-c1ce0a0031ee";

const SERVICES = [
  { icon: "Baby", title: "УЗИ 1 триместра", desc: "Скрининг 11–14 недель. Оценка развития плода, измерение воротниковой зоны.", price: "от 2 500 ₽", duration: "30 мин" },
  { icon: "Heart", title: "УЗИ 2 триместра", desc: "Скрининг 18–21 недель. Анатомия плода, плацента, амниотические воды.", price: "от 2 800 ₽", duration: "40 мин" },
  { icon: "Activity", title: "УЗИ 3 триместра", desc: "Скрининг 30–34 недель. Положение плода, готовность к родам.", price: "от 3 000 ₽", duration: "40 мин" },
  { icon: "Stethoscope", title: "Допплерометрия", desc: "Оценка кровотока в сосудах плода и плаценты. Выявление гипоксии.", price: "от 1 800 ₽", duration: "20 мин" },
  { icon: "Scan", title: "3D/4D УЗИ", desc: "Трёхмерное изображение плода. Памятные фото и видео для родителей.", price: "от 3 500 ₽", duration: "45 мин" },
  { icon: "ShieldCheck", title: "Фетальная ЭхоКГ", desc: "УЗИ сердца плода. Выявление врождённых пороков на ранней стадии.", price: "от 3 200 ₽", duration: "50 мин" },
];

const REVIEWS = [
  { name: "Анна К.", weeks: "28 недель", text: "Елена Владимировна — замечательный специалист! Всё объяснила, показала малышку на экране. Аппарат новейший, всё видно очень чётко.", rating: 5, date: "10 февраля 2026" },
  { name: "Мария Д.", weeks: "20 недель", text: "Наталья Игоревна провела УЗИ очень профессионально и внимательно. Спокойная атмосфера, чистый кабинет. Рекомендую всем мамочкам!", rating: 5, date: "3 февраля 2026" },
  { name: "Светлана П.", weeks: "12 недель", text: "Первый скрининг прошёл прекрасно. Врач терпеливо отвечала на все вопросы, не торопилась. Очень приятная клиника!", rating: 5, date: "28 января 2026" },
];

const NAV = [
  { label: "Главная", href: "#hero" },
  { label: "Врачи", href: "#doctors" },
  { label: "Услуги", href: "#services" },
  { label: "Запись", href: "#booking" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Контакты", href: "#contacts" },
];

const DAY_ORDER = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];

const FALLBACK_DOCTORS = [
  { id: 1, name: "Елена Владимировна Смирнова", title: "Врач ультразвуковой диагностики", experience: "18 лет опыта", education: "РНИМУ им. Пирогова", specialization: "УЗИ при беременности, фетальная эхокардиография", photo_url: "https://cdn.poehali.dev/projects/6cb7ead7-5de0-42a7-aa75-540eda11078a/files/71da906d-77e9-4ba5-9c58-6b5ed8b36284.jpg" },
  { id: 2, name: "Наталья Игоревна Козлова", title: "Врач ультразвуковой диагностики", experience: "12 лет опыта", education: "Первый МГМУ им. Сеченова", specialization: "Акушерское УЗИ, допплерометрия", photo_url: "https://cdn.poehali.dev/projects/6cb7ead7-5de0-42a7-aa75-540eda11078a/files/9b29ee3a-55bc-413e-9149-f504f326b393.jpg" },
];

interface Doctor { id: number; name: string; title: string; experience: string; education: string; specialization: string; photo_url: string; }
interface Slot { id: number; time: string; booked: boolean; }
type Schedule = Record<string, Slot[]>;

export default function Index() {
  const [doctors, setDoctors] = useState<Doctor[]>(FALLBACK_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState(0);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetch(`${API}/doctors`).then(r => r.json()).then(d => { if (d.doctors?.length) setDoctors(d.doctors); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!doctors[selectedDoctor]) return;
    setLoadingSchedule(true);
    setSelectedDay(null);
    setSelectedSlot(null);
    fetch(`${API}/schedule?doctor_id=${doctors[selectedDoctor].id}`)
      .then(r => r.json()).then(d => setSchedule(d.schedule || {})).catch(() => {}).finally(() => setLoadingSchedule(false));
  }, [selectedDoctor, doctors]);

  const scrollTo = (href: string) => { document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }); setMobileOpen(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !doctors[selectedDoctor]) return;
    setSubmitting(true); setSubmitError("");
    try {
      const res = await fetch(`${API}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id: doctors[selectedDoctor].id, slot_id: selectedSlot.id, patient_name: form.name, patient_phone: form.phone, comment: form.comment, day_of_week: selectedDay, time_slot: selectedSlot.time }),
      });
      if (res.ok) {
        setSubmitted(true);
        setSchedule(prev => { const u = {...prev}; if (selectedDay && u[selectedDay]) u[selectedDay] = u[selectedDay].map(s => s.id === selectedSlot.id ? {...s, booked: true} : s); return u; });
      } else {
        const data = await res.json();
        setSubmitError(data.error || "Ошибка. Попробуйте ещё раз.");
      }
    } catch { setSubmitError("Ошибка соединения."); }
    setSubmitting(false);
  };

  const doctor = doctors[selectedDoctor];
  const days = Object.keys(schedule).sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  return (
    <div className="min-h-screen bg-background font-golos">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => scrollTo("#hero")} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-md">
              <Icon name="Baby" size={17} className="text-white" />
            </div>
            <span className="font-montserrat font-bold text-xl tracking-tight">
              <span className="text-primary">УЗИ</span><span className="text-slate-700">Центр</span>
            </span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {NAV.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)} className="text-sm text-slate-500 hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-blue-50">
                {l.label}
              </button>
            ))}
          </div>
          <Button size="sm" className="hidden md:flex bg-primary text-white hover:bg-blue-700 shadow-sm rounded-lg" onClick={() => scrollTo("#booking")}>
            <Icon name="Calendar" size={14} className="mr-1.5" />Записаться
          </Button>
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)}>
            <Icon name={mobileOpen ? "X" : "Menu"} size={22} className="text-slate-600" />
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-1 animate-fade-in">
            {NAV.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)} className="text-left text-sm text-slate-700 hover:text-primary py-2.5 px-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                {l.label}
              </button>
            ))}
            <Button size="sm" className="bg-primary text-white mt-2 w-full rounded-lg" onClick={() => scrollTo("#booking")}>Записаться</Button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="hero" className="pt-16 min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0" style={{background: "linear-gradient(135deg, #EFF6FF 0%, #FAFBFF 55%, #F0F9FF 100%)"}} />
        <div className="absolute top-24 right-0 w-[600px] h-[600px] rounded-full opacity-25 pointer-events-none" style={{background: "radial-gradient(circle at center, #93C5FD 0%, transparent 70%)"}} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 pointer-events-none" style={{background: "radial-gradient(circle at center, #38BDF8 0%, transparent 70%)"}} />

        <div className="relative max-w-6xl mx-auto px-4 py-24 grid md:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2.5 bg-white border border-blue-100 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-7 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              Запись онлайн открыта
            </div>
            <h1 className="font-montserrat text-5xl md:text-6xl font-extrabold text-slate-800 leading-[1.08] mb-6 tracking-tight">
              Забота о вас<br />и вашем<br />
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">малыше</span>
            </h1>
            <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
              Профессиональная УЗИ-диагностика беременности. Два опытных женщины-врача, современное оборудование и уютная атмосфера.
            </p>
            <div className="flex flex-wrap gap-3 mb-12">
              <Button size="lg" className="bg-primary text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all rounded-xl px-8 text-base font-semibold" onClick={() => scrollTo("#booking")}>
                <Icon name="CalendarCheck" size={19} className="mr-2" />
                Записаться онлайн
              </Button>
              <Button size="lg" variant="outline" className="border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-primary hover:text-primary rounded-xl px-8 text-base" onClick={() => scrollTo("#services")}>
                Наши услуги
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "Award", val: "18 лет", label: "макс. опыт" },
                { icon: "Users", val: "2", label: "специалиста" },
                { icon: "Star", val: "5.0", label: "рейтинг" },
              ].map(s => (
                <div key={s.icon} className="bg-white/70 backdrop-blur border border-slate-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Icon name={s.icon} size={17} className="text-primary" />
                  </div>
                  <div className="font-montserrat font-extrabold text-slate-800 text-lg leading-none">{s.val}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block animate-scale-in">
            <div className="relative max-w-sm mx-auto">
              <div className="absolute -inset-6 bg-gradient-to-br from-primary/15 to-sky-300/15 rounded-[48px] blur-3xl" />
              <div className="relative rounded-[36px] overflow-hidden shadow-2xl ring-4 ring-white">
                <img src="https://cdn.poehali.dev/projects/6cb7ead7-5de0-42a7-aa75-540eda11078a/files/71da906d-77e9-4ba5-9c58-6b5ed8b36284.jpg"
                  alt="Врач УЗИ" className="w-full h-[540px] object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 ring-1 ring-slate-100">
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
                  <Icon name="CheckCircle" size={22} className="text-green-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Сегодня</div>
                  <div className="font-montserrat font-bold text-slate-800">12 записей</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-2 ring-1 ring-slate-100">
                <span className="text-xl">⭐</span>
                <div>
                  <div className="font-montserrat font-bold text-slate-800 text-sm leading-none">5.0</div>
                  <div className="text-xs text-slate-400">отзывы</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="bg-gradient-to-r from-primary to-blue-700 py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: "ShieldCheck", label: "Лицензированная клиника" },
            { icon: "Microscope", label: "Экспертное оборудование" },
            { icon: "Clock", label: "Приём в день обращения" },
            { icon: "Heart", label: "Только женщины-врачи" },
          ].map(i => (
            <div key={i.icon} className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <Icon name={i.icon} size={21} className="text-white" />
              </div>
              <span className="text-white/90 text-sm font-medium">{i.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DOCTORS */}
      <section id="doctors" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-50 text-primary border-blue-100 px-4 py-1.5 text-sm font-semibold">Наши специалисты</Badge>
            <h2 className="font-montserrat text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Знакомьтесь с врачами</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-lg">Опытные женщины-врачи, которые создадут атмосферу заботы и доверия</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {doctors.map((doc, i) => (
              <div key={doc.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ring-1 ring-slate-100 hover:ring-primary/20">
                <div className="relative h-72 overflow-hidden">
                  <img src={doc.photo_url} alt={doc.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-montserrat font-bold text-white text-xl mb-1">{doc.name}</h3>
                    <p className="text-blue-200 text-sm font-medium">{doc.title}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-md">{doc.experience}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <Icon name="GraduationCap" size={15} className="text-primary" />
                      </div>
                      {doc.education}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <Icon name="Stethoscope" size={15} className="text-primary" />
                      </div>
                      {doc.specialization}
                    </div>
                  </div>
                  <Button className="w-full bg-primary text-white hover:bg-blue-700 rounded-xl h-11 font-semibold transition-all"
                    onClick={() => { setSelectedDoctor(i); scrollTo("#booking"); }}>
                    Записаться к врачу
                    <Icon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-28" style={{background: "linear-gradient(180deg, #F8FAFF 0%, #EFF6FF 100%)"}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white text-primary border-blue-100 shadow-sm px-4 py-1.5 text-sm font-semibold">Услуги</Badge>
            <h2 className="font-montserrat text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">УЗИ диагностика</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-lg">Весь спектр исследований в период беременности на аппаратах экспертного класса</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map(s => (
              <div key={s.title} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group cursor-default">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-sky-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon name={s.icon} size={23} className="text-primary" />
                </div>
                <h3 className="font-montserrat font-bold text-slate-800 text-base mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">{s.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="font-bold text-primary text-base">{s.price}</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-full font-medium">
                    <Icon name="Clock" size={12} />{s.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-blue-50 text-primary border-blue-100 px-4 py-1.5 text-sm font-semibold">Онлайн запись</Badge>
            <h2 className="font-montserrat text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Запись на приём</h2>
            <p className="text-slate-500 text-lg">Выберите врача, день и удобное время</p>
          </div>

          {submitted ? (
            <div className="text-center py-16 animate-scale-in">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Icon name="CheckCircle" size={44} className="text-green-500" />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-slate-800 mb-3">Запись принята!</h3>
              <p className="text-slate-500 mb-1">Мы свяжемся с вами в ближайшее время.</p>
              {doctor && <p className="text-sm text-slate-400 mt-2">Врач: <strong className="text-slate-600">{doctor.name}</strong></p>}
              {selectedDay && selectedSlot && <p className="text-sm text-slate-400">{selectedDay} в {selectedSlot.time}</p>}
              <Button className="mt-8 bg-primary text-white rounded-xl px-8"
                onClick={() => { setSubmitted(false); setSelectedSlot(null); setSelectedDay(null); setForm({ name: "", phone: "", comment: "" }); }}>
                Записаться ещё раз
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Step 1 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center font-montserrat shrink-0">1</div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Выберите врача</p>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {doctors.map((doc, i) => (
                    <button key={doc.id} onClick={() => setSelectedDoctor(i)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        selectedDoctor === i ? "border-primary bg-blue-50/60 shadow-md" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                      }`}>
                      <img src={doc.photo_url} alt={doc.name} className={`w-14 h-14 rounded-full object-cover object-top border-2 shadow-sm transition-all ${selectedDoctor === i ? "border-primary" : "border-white"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{doc.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{doc.experience}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${selectedDoctor === i ? "border-primary bg-primary" : "border-slate-200"}`}>
                        {selectedDoctor === i && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center font-montserrat shrink-0">2</div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Выберите день</p>
                </div>
                {loadingSchedule ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Загружаю расписание...
                  </div>
                ) : days.length === 0 ? (
                  <p className="text-slate-400 text-sm">Расписание временно недоступно</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {days.map(day => (
                      <button key={day} onClick={() => { setSelectedDay(day); setSelectedSlot(null); }}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          selectedDay === day ? "border-primary bg-primary text-white shadow-md" : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary"
                        }`}>
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3 */}
              {selectedDay && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 animate-fade-in">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center font-montserrat shrink-0">3</div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Выберите время</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(schedule[selectedDay] || []).map(slot => (
                      <button key={slot.id} disabled={slot.booked} onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          slot.booked ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through"
                          : selectedSlot?.id === slot.id ? "border-primary bg-primary text-white shadow-lg scale-105"
                          : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary hover:shadow-sm"
                        }`}>
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  <p className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                    <span className="w-3 h-3 inline-block bg-slate-100 border border-slate-200 rounded shrink-0" />
                    Зачёркнутые слоты уже заняты
                  </p>
                </div>
              )}

              {/* Step 4 */}
              {selectedSlot && (
                <form onSubmit={handleSubmit} className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-100 animate-fade-in space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center font-montserrat shrink-0">4</div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ваши данные</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-3 border border-blue-100 shadow-sm">
                    <Icon name="CalendarCheck" size={16} className="text-primary shrink-0" />
                    <span className="text-sm text-slate-700">
                      <strong>{doctor?.name}</strong> · {selectedDay} в <strong>{selectedSlot.time}</strong>
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Ваше имя *</label>
                      <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Например, Анна"
                        className="w-full px-4 py-3 rounded-xl border-2 border-white bg-white text-slate-800 text-sm focus:outline-none focus:border-primary transition shadow-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Телефон *</label>
                      <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+7 (___) ___-__-__"
                        className="w-full px-4 py-3 rounded-xl border-2 border-white bg-white text-slate-800 text-sm focus:outline-none focus:border-primary transition shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Срок беременности / комментарий</label>
                    <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}
                      placeholder="Например: 20 недель, первая беременность" rows={2}
                      className="w-full px-4 py-3 rounded-xl border-2 border-white bg-white text-slate-800 text-sm focus:outline-none focus:border-primary transition shadow-sm resize-none" />
                  </div>
                  {submitError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                      <Icon name="AlertCircle" size={15} />{submitError}
                    </div>
                  )}
                  <Button type="submit" size="lg" disabled={submitting} className="w-full bg-primary text-white hover:bg-blue-700 rounded-xl h-12 text-base font-semibold shadow-lg disabled:opacity-60">
                    {submitting ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Отправляем...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Icon name="CalendarCheck" size={18} />Подтвердить запись</span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-28" style={{background: "linear-gradient(180deg, #F8FAFF 0%, #EFF6FF 100%)"}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white text-primary border-blue-100 shadow-sm px-4 py-1.5 text-sm font-semibold">Отзывы</Badge>
            <h2 className="font-montserrat text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Пациентки о нас</h2>
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <span className="text-yellow-400 text-lg">⭐⭐⭐⭐⭐</span>
              <span className="font-bold text-slate-700">5.0</span>
              <span>· более 200 отзывов</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map(r => (
              <div key={r.name} className="bg-white rounded-2xl p-7 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-transparent hover:ring-primary/10">
                <div className="flex items-center gap-0.5 mb-5">
                  {Array.from({length: r.rating}).map((_,j) => <span key={j} className="text-yellow-400 text-base">⭐</span>)}
                </div>
                <p className="text-slate-600 leading-relaxed mb-6 text-sm italic">"{r.text}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{r.name}</p>
                    <p className="text-xs text-primary font-medium mt-0.5">{r.weeks}</p>
                  </div>
                  <p className="text-xs text-slate-400">{r.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-50 text-primary border-blue-100 px-4 py-1.5 text-sm font-semibold">Контакты</Badge>
            <h2 className="font-montserrat text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Как нас найти</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              {[
                { icon: "MapPin", title: "Адрес", value: "г. Москва, ул. Академика Сахарова, д. 12, этаж 2, кабинет 208" },
                { icon: "Phone", title: "Телефон", value: "+7 (495) 123-45-67" },
                { icon: "Mail", title: "Email", value: "info@uzi-center.ru" },
                { icon: "Clock", title: "Режим работы", value: "Пн–Пт: 09:00–18:00 / Сб: 10:00–14:00" },
              ].map(item => (
                <div key={item.icon} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon name={item.icon} size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-0.5">{item.title}</p>
                    <p className="text-slate-800 font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
              <Button size="lg" className="bg-primary text-white hover:bg-blue-700 rounded-xl w-full h-12 font-semibold shadow-lg" onClick={() => scrollTo("#booking")}>
                <Icon name="Calendar" size={18} className="mr-2" />Записаться онлайн
              </Button>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-xl ring-1 ring-slate-100 h-80 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <Icon name="MapPin" size={30} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-montserrat font-bold text-slate-800 text-xl">УЗИ Центр</p>
                <p className="text-slate-500 text-sm mt-1.5">ул. Академика Сахарова, д. 12<br />Москва, 2 этаж, каб. 208</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Icon name="Baby" size={17} className="text-white" />
              </div>
              <span className="font-montserrat font-bold text-white text-xl">УЗИ Центр</span>
            </div>
            <div className="flex flex-wrap gap-5 justify-center">
              {NAV.map(l => (
                <button key={l.href} onClick={() => scrollTo(l.href)} className="text-sm text-white/50 hover:text-white transition-colors">{l.label}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/40">
            <p>© 2026 УЗИ Центр. Все права защищены.</p>
            <a href="/admin" className="hover:text-white/60 transition-colors text-xs">Для администратора</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
