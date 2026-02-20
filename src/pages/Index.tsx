import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const DOCTOR_PHOTO = "https://cdn.poehali.dev/projects/6cb7ead7-5de0-42a7-aa75-540eda11078a/files/71da906d-77e9-4ba5-9c58-6b5ed8b36284.jpg";

const DOCTORS = [
  {
    id: 1,
    name: "Елена Владимировна Смирнова",
    title: "Врач ультразвуковой диагностики",
    experience: "18 лет опыта",
    education: "РНИМУ им. Пирогова",
    specialization: "УЗИ при беременности, фетальная эхокардиография",
    photo: DOCTOR_PHOTO,
    schedule: {
      "Понедельник": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00"],
      "Среда": ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30"],
      "Пятница": ["10:00", "10:30", "11:00", "11:30", "12:00", "15:00", "15:30", "16:00"],
    } as Record<string, string[]>,
    booked: ["09:00", "10:00", "14:30", "15:30"],
  },
  {
    id: 2,
    name: "Наталья Игоревна Козлова",
    title: "Врач ультразвуковой диагностики",
    experience: "12 лет опыта",
    education: "Первый МГМУ им. Сеченова",
    specialization: "Акушерское УЗИ, допплерометрия",
    photo: DOCTOR_PHOTO,
    schedule: {
      "Вторник": ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"],
      "Четверг": ["09:00", "09:30", "10:00", "11:00", "11:30", "14:00", "15:00", "15:30"],
      "Суббота": ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
    } as Record<string, string[]>,
    booked: ["09:30", "11:00", "14:00"],
  },
];

const SERVICES = [
  {
    icon: "Baby",
    title: "УЗИ 1 триместра",
    desc: "Скрининг 11–14 недель. Оценка развития плода, измерение воротниковой зоны.",
    price: "от 2 500 ₽",
    duration: "30 мин",
  },
  {
    icon: "Heart",
    title: "УЗИ 2 триместра",
    desc: "Скрининг 18–21 недель. Анатомия плода, плацента, амниотические воды.",
    price: "от 2 800 ₽",
    duration: "40 мин",
  },
  {
    icon: "Activity",
    title: "УЗИ 3 триместра",
    desc: "Скрининг 30–34 недель. Положение плода, готовность к родам.",
    price: "от 3 000 ₽",
    duration: "40 мин",
  },
  {
    icon: "Stethoscope",
    title: "Допплерометрия",
    desc: "Оценка кровотока в сосудах плода и плаценты. Выявление гипоксии.",
    price: "от 1 800 ₽",
    duration: "20 мин",
  },
  {
    icon: "Scan",
    title: "3D/4D УЗИ",
    desc: "Трёхмерное изображение плода. Памятные фото и видео для родителей.",
    price: "от 3 500 ₽",
    duration: "45 мин",
  },
  {
    icon: "ShieldCheck",
    title: "Фетальная ЭхоКГ",
    desc: "УЗИ сердца плода. Выявление врождённых пороков сердца на ранней стадии.",
    price: "от 3 200 ₽",
    duration: "50 мин",
  },
];

const REVIEWS = [
  {
    name: "Анна К.",
    weeks: "28 недель",
    text: "Елена Владимировна — замечательный специалист! Всё объяснила, показала малышку на экране. Аппарат новейший, всё видно очень чётко.",
    rating: 5,
    date: "10 февраля 2026",
  },
  {
    name: "Мария Д.",
    weeks: "20 недель",
    text: "Наталья Игоревна провела УЗИ очень профессионально и внимательно. Спокойная атмосфера, чистый кабинет. Рекомендую всем мамочкам!",
    rating: 5,
    date: "3 февраля 2026",
  },
  {
    name: "Светлана П.",
    weeks: "12 недель",
    text: "Первый скрининг прошёл прекрасно. Врач терпеливо отвечала на все вопросы, не торопилась. Очень приятная клиника!",
    rating: 5,
    date: "28 января 2026",
  },
];

const NAV_LINKS = [
  { label: "Главная", href: "#hero" },
  { label: "Врачи", href: "#doctors" },
  { label: "Услуги", href: "#services" },
  { label: "Запись", href: "#booking" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Контакты", href: "#contacts" },
];

export default function Index() {
  const [selectedDoctor, setSelectedDoctor] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", comment: "" });
  const [submitted, setSubmitted] = useState(false);

  const doctor = DOCTORS[selectedDoctor];
  const days = Object.keys(doctor.schedule);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background font-golos">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="Baby" size={16} className="text-white" />
            </div>
            <span className="font-montserrat font-bold text-primary text-lg">
              УЗИ<span className="text-foreground font-medium">Центр</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {l.label}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            className="hidden md:flex bg-primary text-white hover:bg-primary/90"
            onClick={() => scrollTo("#booking")}
          >
            Записаться
          </Button>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} className="text-foreground" />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-blue-100 px-4 py-3 flex flex-col gap-3 animate-fade-in">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-left text-sm text-foreground hover:text-primary py-1 font-medium"
              >
                {l.label}
              </button>
            ))}
            <Button size="sm" className="bg-primary text-white mt-2" onClick={() => scrollTo("#booking")}>
              Записаться
            </Button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="hero" className="pt-16 min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-72 h-72 bg-sky-100/50 rounded-full blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <Badge className="mb-4 bg-secondary text-primary border-none text-sm px-3 py-1">
              🤰 УЗИ для беременных
            </Badge>
            <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              Забота о вас и<br />
              <span className="text-primary">вашем малыше</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Профессиональная ультразвуковая диагностика на современном оборудовании. Два опытных женщины-врача в уютной атмосфере.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                onClick={() => scrollTo("#booking")}
              >
                <Icon name="Calendar" size={18} className="mr-2" />
                Записаться онлайн
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-secondary" onClick={() => scrollTo("#services")}>
                Наши услуги
              </Button>
            </div>
            <div className="flex flex-wrap gap-6">
              {[
                { icon: "Award", text: "15+ лет опыта" },
                { icon: "Users", text: "2 женщины-врача" },
                { icon: "ShieldCheck", text: "Экспертное оборудование" },
              ].map((item) => (
                <div key={item.icon} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                    <Icon name={item.icon} size={14} className="text-primary" />
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-scale-in hidden md:block">
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-sky-200/30 rounded-3xl" />
              <img
                src={DOCTOR_PHOTO}
                alt="Врач УЗИ"
                className="w-full h-[500px] object-cover object-top rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Записей сегодня</div>
                  <div className="font-montserrat font-bold text-foreground">12 пациентов</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2">
                <span className="text-yellow-400 text-lg">⭐</span>
                <span className="font-montserrat font-bold text-foreground">5.0</span>
                <span className="text-xs text-muted-foreground">рейтинг</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section id="doctors" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-3 bg-secondary text-primary border-none">Специалисты</Badge>
            <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-foreground mb-4">Наши врачи</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Опытные женщины-врачи ультразвуковой диагностики, специализирующиеся на ведении беременности
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {DOCTORS.map((doc, i) => (
              <Card key={doc.id} className="overflow-hidden border-border hover:shadow-xl transition-all duration-300">
                <div className="h-64 relative overflow-hidden">
                  <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-white/90 text-primary border-none text-xs">{doc.experience}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-montserrat font-bold text-xl text-foreground mb-1">{doc.name}</h3>
                  <p className="text-primary text-sm font-medium mb-3">{doc.title}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Icon name="GraduationCap" size={15} className="text-primary mt-0.5 shrink-0" />
                      {doc.education}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Icon name="Stethoscope" size={15} className="text-primary mt-0.5 shrink-0" />
                      {doc.specialization}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Расписание:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(doc.schedule).map((day) => (
                        <span key={day} className="text-xs bg-secondary text-primary px-2 py-1 rounded-full">{day}</span>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    onClick={() => {
                      setSelectedDoctor(i);
                      setSelectedDay(null);
                      setSelectedSlot(null);
                      document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Записаться к врачу
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 bg-gradient-to-br from-blue-50 to-sky-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-3 bg-white text-primary border-none shadow-sm">Услуги</Badge>
            <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-foreground mb-4">УЗИ диагностика</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Полный спектр ультразвуковых исследований в период беременности на аппаратах экспертного класса
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <Card key={service.title} className="bg-white border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4">
                    <Icon name={service.icon} size={22} className="text-primary" />
                  </div>
                  <h3 className="font-montserrat font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{service.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{service.price}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon name="Clock" size={13} />
                      {service.duration}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-secondary text-primary border-none">Онлайн запись</Badge>
            <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-foreground mb-4">Запись на приём</h2>
            <p className="text-muted-foreground">Выберите врача, удобный день и время</p>
          </div>

          {submitted ? (
            <div className="text-center py-16 animate-scale-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="CheckCircle" size={40} className="text-green-500" />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-foreground mb-3">Запись принята!</h3>
              <p className="text-muted-foreground mb-1">Мы свяжемся с вами для подтверждения.</p>
              <p className="text-sm text-muted-foreground">Врач: <strong>{doctor.name}</strong></p>
              {selectedDay && selectedSlot && (
                <p className="text-sm text-muted-foreground">{selectedDay} в {selectedSlot}</p>
              )}
              <Button
                className="mt-8 bg-primary text-white"
                onClick={() => { setSubmitted(false); setSelectedSlot(null); setSelectedDay(null); setForm({ name: "", phone: "", comment: "" }); }}
              >
                Записаться ещё раз
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Step 1 */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Шаг 1 — Выберите врача
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {DOCTORS.map((doc, i) => (
                    <button
                      key={doc.id}
                      onClick={() => { setSelectedDoctor(i); setSelectedDay(null); setSelectedSlot(null); }}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        selectedDoctor === i ? "border-primary bg-secondary" : "border-border bg-white hover:border-blue-200"
                      }`}
                    >
                      <img src={doc.photo} alt={doc.name} className="w-14 h-14 rounded-full object-cover object-top border-2 border-white shadow" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.experience}</p>
                      </div>
                      {selectedDoctor === i && <Icon name="CheckCircle" size={18} className="text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Шаг 2 — Выберите день
                </p>
                <div className="flex flex-wrap gap-3">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => { setSelectedDay(day); setSelectedSlot(null); }}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedDay === day ? "border-primary bg-primary text-white" : "border-border bg-white text-foreground hover:border-blue-300"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3 */}
              {selectedDay && (
                <div className="animate-fade-in">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Шаг 3 — Выберите время
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(doctor.schedule[selectedDay] || []).map((slot) => {
                      const isBooked = doctor.booked.includes(slot);
                      return (
                        <button
                          key={slot}
                          disabled={isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                            isBooked
                              ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                              : selectedSlot === slot
                              ? "border-primary bg-primary text-white shadow-md"
                              : "border-border bg-white text-foreground hover:border-primary hover:text-primary"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                    <span className="w-3 h-3 inline-block bg-gray-100 border border-gray-200 rounded" />
                    Зачёркнутые слоты уже заняты
                  </p>
                </div>
              )}

              {/* Step 4 */}
              {selectedSlot && (
                <form onSubmit={handleSubmit} className="animate-fade-in space-y-4 bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                    Шаг 4 — Ваши данные
                  </p>
                  <div className="bg-white rounded-xl p-3 border border-blue-100 flex items-center gap-3">
                    <Icon name="Calendar" size={16} className="text-primary shrink-0" />
                    <span className="text-sm text-foreground">
                      <strong>{doctor.name}</strong> · {selectedDay} в {selectedSlot}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">Ваше имя *</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Например, Анна"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">Телефон *</label>
                      <input
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+7 (___) ___-__-__"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Срок беременности / комментарий</label>
                    <textarea
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      placeholder="Например: 20 недель, первая беременность"
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-primary text-white hover:bg-primary/90 shadow-lg">
                    <Icon name="CalendarCheck" size={18} className="mr-2" />
                    Подтвердить запись
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-24 bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-3 bg-white text-primary border-none shadow-sm">Отзывы</Badge>
            <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-foreground mb-4">Пациентки о нас</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((review) => (
              <Card key={review.name} className="bg-white border-border hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{review.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.weeks}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-3 bg-secondary text-primary border-none">Контакты</Badge>
            <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-foreground mb-4">Как нас найти</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              {[
                { icon: "MapPin", title: "Адрес", value: "г. Москва, ул. Академика Сахарова, д. 12, этаж 2, кабинет 208" },
                { icon: "Phone", title: "Телефон", value: "+7 (495) 123-45-67" },
                { icon: "Mail", title: "Email", value: "info@uzi-center.ru" },
                { icon: "Clock", title: "Режим работы", value: "Пн–Пт: 09:00–18:00 / Сб: 10:00–14:00" },
              ].map((item) => (
                <div key={item.icon} className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                    <Icon name={item.icon} size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">{item.title}</p>
                    <p className="text-foreground font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 shadow-md mt-4" onClick={() => scrollTo("#booking")}>
                <Icon name="Calendar" size={18} className="mr-2" />
                Записаться онлайн
              </Button>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border h-80 bg-gradient-to-br from-blue-50 to-sky-100 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                <Icon name="MapPin" size={28} className="text-primary" />
              </div>
              <p className="font-montserrat font-bold text-foreground">УЗИ Центр</p>
              <p className="text-sm text-muted-foreground text-center px-6">ул. Академика Сахарова, д. 12<br />Москва, этаж 2</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-white py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Icon name="Baby" size={14} className="text-white" />
            </div>
            <span className="font-montserrat font-bold text-white">УЗИ Центр</span>
          </div>
          <p className="text-sm text-white/50">© 2026 УЗИ Центр. Все права защищены.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {NAV_LINKS.map((l) => (
              <button key={l.href} onClick={() => scrollTo(l.href)} className="text-xs text-white/50 hover:text-white transition-colors">
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
