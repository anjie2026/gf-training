import { useState, useRef } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type AudienceType = "beginner" | "worker" | "mom" | "sales" | "store";

const audienceLabels: Record<AudienceType, string> = {
  beginner: "完全新手",
  worker: "上班族斜槓",
  mom: "全職媽媽",
  sales: "直銷／品牌轉型",
  store: "實體加盟",
};

const audienceCopies: Record<AudienceType, { situation: string; jerose: string; gf: string; cta: string }> = {
  beginner: {
    situation: "你現在的感覺大概是這樣：看到別人在做，心動了，但一想到要在網路上公開說話就退縮。不知道說什麼、怕被人笑、發了文沒人理，然後默默刪掉。\n\n其實不是你不行，是你還沒有一個告訴你怎麼做的系統。",
    jerose: "品牌幫你建立第一層信任，249項認證讓你開口就有底氣。不需要囤貨、不用管物流，你只需要專心學。",
    gf: "每天有任務告訴你做什麼，AI機器人幫你想文案，CRM幫你管好每個客人。你不需要靠自律，只需要照著走。",
    cta: "我要開始我的 180 天旅程",
  },
  worker: {
    situation: "下班回到家，滑一下手機看到別人在做副業，心動了五秒，然後想到自己已經很累，算了。這個循環你重複過多少次了？\n\n不是你懶，是你沒有一個可以配合你生活節奏的系統。",
    jerose: "廣告費老闆出，物流系統幫你跑。下班後的時間只需要放在客人身上，其他的不用你管。",
    gf: "AI機器人把發文這件最耗時的事壓縮到最短。利潤系統讓你清楚看到每個月的數字，知道自己在往哪個方向走。",
    cta: "把時間用在對的地方",
  },
  mom: {
    situation: "你想要有自己的收入，不是因為貪心，是因為你也想要有點喘息的空間，不用每一筆花費都要跟人報備。但時間是破碎的，孩子一哭什麼都停下來。\n\n你需要的不是更多意志力，是一個能配合你生活的系統。",
    jerose: "你用過這類產品，你的真實感受比任何廣告都有說服力。手機就能操作，孩子睡著的二十分鐘也能做一件事。",
    gf: "任務彈性，時間破碎也能累積。AI機器人幫你快速出內容，不需要坐下來苦想。雙週通話讓導師了解你的狀況。",
    cta: "時間破碎也能做到",
  },
  sales: {
    situation: "你努力了很久，也帶過人，但說真的，你現在有點累了。業績卡著上不去，學員做了沒什麼進展，你一個人扛著整個團隊。\n\n問題不是你不努力，是你一直在用感情帶人，而不是用系統。",
    jerose: "控價機制保護你的客群，國際認證讓你轉型不從零開始，過去的積累可以直接用上。",
    gf: "CRM把你散落各處的客戶資料整理乾淨。企業化SOP讓帶人這件事變得有結構、可追蹤、能複製。這次系統在跑，不是你一個人撐著。",
    cta: "讓系統幫你跑",
  },
  store: {
    situation: "店還開著，你每天都在，但你心裡清楚，月底算完帳，留下來的越來越少。你不是沒努力，是這個模式的天花板就長那麼高。\n\n你需要的不是更努力，是換一條路。",
    jerose: "無店鋪模式讓你甩掉租金、人力、庫存。雲倉系統讓你不需要實體空間也能跑，成本結構整個翻轉。",
    gf: "你在實體累積的客人信任是你最大的本錢，我們幫你把它搬到線上。利潤系統讓你第一次清楚看到轉型後的數字。",
    cta: "換一條走得到的路",
  },
};

const phases = [
  {
    month: "第 1 個月",
    num: "01",
    title: "啟動與破冰",
    desc: "很多人卡在這裡——不知道說什麼、不敢開口、發了文沒人看。這個月我們把這些全部解決掉。",
    items: ["9 堂基礎課，涵蓋心態、自媒體、銷售、客戶服務與諮詢", "陪跑班每日任務，帳號從沉睡變活躍", "學會定位、拍片、開口說第一句話"],
    progress: 33,
  },
  {
    month: "第 2-3 個月",
    num: "02",
    title: "專業深化與信任建立",
    desc: "客人開始問你問題了，你能答嗎？這兩個月讓你真的懂產品。",
    items: ["26 堂產品知識課，含作業批改", "纖體、美肌、大健康全方位掌握", "從「賣產品的人」變成「客人主動找的顧問」"],
    progress: 66,
  },
  {
    month: "第 4-6 個月",
    num: "03",
    title: "系統裂變與團隊領導",
    badge: "達成晉升標準後解鎖",
    desc: "你已經有客群了。這個階段教你怎麼把你會的複製出去，開始帶自己的學員。",
    items: ["裂變系統 6 堂課，含作業批改", "帶領自己的第一批學員", "收入從個人銷售升級成團隊系統"],
    progress: 100,
  },
];

const supports = [
  { icon: "📅", title: "每週開課", desc: "你不需要靠意志力撐著自己。每週固定開課，今天做什麼系統告訴你，你照著走就好。" },
  { icon: "📝", title: "每週文字對標", desc: "不是那種「加油你可以」的鼓勵。是真的坐下來看，這週做了什麼、哪裡卡了、下週調整什麼。" },
  { icon: "🎙️", title: "雙週語音通話", desc: "每兩週跟導師一對一說說話。做得好的地方繼續，卡住的地方一起想，不讓你悶著頭撐。" },
  { icon: "🏅", title: "婕樂纖公司認證培訓", desc: "這套課程是被公司認證過的，不是誰自己拼湊出來的。每一步都有人走過，你不是第一個。" },
];

const tools = [
  { icon: "🔢", title: "利潤系統", desc: "你有沒有認真做，數字會說話。每個月清楚看到自己在哪裡，不再憑感覺猜「好像有賺」。" },
  { icon: "👥", title: "客戶管理系統", desc: "你現在是不是都用 Line 聊天記錄往上翻？每個客人的狀態、跟進時間全部管好。" },
  { icon: "📚", title: "培訓系統", desc: "你永遠知道下一步做什麼。不會有「我現在應該幹嘛」的茫然感，導師也能即時看到你的進度。" },
  { icon: "🤖", title: "AI 中文發文機器人", desc: "告訴它今天想說什麼，它幫你整理成爆款貼文。盯著空白畫面一小時什麼都寫不出來的感覺，不會再有了。" },
];

const brandAdvantages = {
  product: [
    { icon: "🔬", title: "台灣在地生技，維科生技二十年研發", desc: "你賣的東西有底氣。客人問成分、問效果，你有科學依據可以說，說得清楚，客人才真的信你。" },
    { icon: "🏆", title: "249項國際大獎、SNQ國家品質標章", desc: "客人第一次聽到這個品牌，心裡難免有問號。這些獎項幫你把那個問號消掉一大半。" },
    { icon: "👩‍⚕️", title: "醫師與營養師顧問團隊，首創纖體班", desc: "幫客人諮詢不是靠感覺，背後有真正的醫療專業在支撐。你說的話有人幫你背書。" },
    { icon: "💊", title: "纖飄錠，衛福部核可", desc: "合法、安全、有官方依據。這四個字是你面對任何質疑時最硬的底氣。" },
    { icon: "🛡️", title: "六億元產品責任險", desc: "能拿到這個保額，是產品安全到保險公司願意承保。品質過關最直接的證明。" },
  ],
  market: [
    { icon: "📺", title: "千萬行銷預算，廣告費老闆出", desc: "女人我最大、醫師好辣、全台實體看板，這些曝光你一毛都不用出。品牌已經在那裡。" },
    { icon: "⭐", title: "明星代言，開口就有光環", desc: "客人看到產品的第一眼已經是正面的。最難的第一步品牌幫你跨過去了。" },
    { icon: "🎁", title: "活動搭贈老闆出，毛利一分不動", desc: "做活動送贈品，費用全部由總公司買單。客人開心，你的利潤完全沒有損失。" },
  ],
  protection: [
    { icon: "📦", title: "雲倉系統，不需囤貨", desc: "訂單來了系統自己處理，你不用跑郵局、不用自己包貨。時間省下來放在真正重要的事情上。" },
    { icon: "🔒", title: "嚴格控價，努力不被搶走", desc: "品牌嚴格管控，沒有人可以削價競爭。你認真經營的每一個客人，都是真正屬於你的。" },
  ],
};

const testimonials = [
  {
    name: "Celine W.",
    tag: "從完全新手開始",
    duration: "加入第 5 個月",
    quote: "加入前連 IG 都沒認真經營過。陪跑班逼著我每天出現，三個月後開始有人主動問我產品。那個感覺真的很不一樣。",
    result: "月收入從 0 開始穩定成長",
  },
  {
    name: "Tiffany L.",
    tag: "做了三年銷售，第一次覺得有方向",
    duration: "加入第 6 個月",
    quote: "我以為我缺的是努力。加入之後才發現，我缺的是系統。第四個月解鎖裂變課之後，我的收入結構變了。",
    result: "從個人業績轉為團隊系統收入",
  },
  {
    name: "Mia C.",
    tag: "兩個孩子的媽，時間破碎也做到了",
    duration: "加入第 4 個月",
    quote: "我一直覺得時間不夠是我最大的問題。後來發現不是時間的問題，是我沒有一個適合我的節奏。",
    result: "建立穩定客群 20+ 人",
  },
];

// ── Tokens ──
const ROSE        = "oklch(0.58 0.13 10)";
const ROSE_DIM    = "oklch(0.58 0.13 10 / 0.08)";
const ROSE_BORDER = "oklch(0.58 0.13 10 / 0.28)";
const CREAM       = "oklch(0.97 0.008 60)";
const CREAM_CARD  = "oklch(0.995 0.004 60)";
const CREAM_DARK  = "oklch(0.93 0.014 40)";
const INK         = "oklch(0.16 0.010 30)";
const INK_MUTED   = "oklch(0.52 0.008 20)";
const BORDER      = "oklch(0.89 0.007 30)";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// Photo placeholder component
const PhotoBlock = ({ aspect, label }: { aspect: string; label?: string }) => (
  <div style={{
    width: "100%", aspectRatio: aspect,
    background: CREAM_DARK, border: `1.5px dashed ${BORDER}`,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
  }}>
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="6" width="24" height="17" rx="2" stroke={INK_MUTED} strokeWidth="1.2" />
      <circle cx="9" cy="12" r="2.5" stroke={INK_MUTED} strokeWidth="1.2" />
      <path d="M2 19l6-5 4 4 4-3 10 7" stroke={INK_MUTED} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
    <span style={{ fontSize: "16px", color: INK_MUTED, letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif" }}>
      {label || "照片"}
    </span>
  </div>
);

const AvatarPlaceholder = ({ initials }: { initials: string }) => (
  <div style={{
    width: "52px", height: "52px", borderRadius: "50%", flexShrink: 0,
    background: CREAM_DARK, border: `1.5px dashed ${BORDER}`,
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <span style={{ fontSize: "16px", color: INK_MUTED, fontFamily: "'Cormorant Garamond', serif" }}>{initials}</span>
  </div>
);

const Divider = () => (
  <div style={{ width: "48px", height: "1px", background: `linear-gradient(90deg, transparent, ${ROSE}, transparent)`, margin: "0 auto" }} />
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<AudienceType>("beginner");
  const [form, setForm] = useState({ name: "", contact: "", audienceType: "beginner" as AudienceType, message: "" });
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const submitLead = trpc.leads.submit.useMutation({
    onSuccess: () => { setSubmitted(true); toast.success("感謝您的留言！我們將盡快與您聯繫。"); },
    onError: (err) => { toast.error("提交失敗，請稍後再試：" + err.message); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) { toast.error("請填寫姓名與聯絡方式"); return; }
    submitLead.mutate({ name: form.name, contact: form.contact, audienceType: form.audienceType, message: form.message || undefined });
  };

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  const copy = audienceCopies[activeTab];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: CREAM, color: INK }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: `${CREAM}ec`, backdropFilter: "blur(14px)", borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif", fontSize: "17px", letterSpacing: "0.16em", color: INK }}>
          GF 戰隊
        </span>
        <div className="hidden md:flex items-center gap-6">
          {[["#brand", "為什麼選婕樂纖"], ["#gf", "為什麼選 GF 戰隊"], ["#phases", "計劃"], ["#stories", "見證"]].map(([href, label]) => (
            <a key={href} href={href}
              style={{ fontSize: "16px", letterSpacing: "0.14em", color: INK_MUTED, fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}>
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin" style={{ fontSize: "15px", color: INK_MUTED, letterSpacing: "0.12em", fontFamily: "'DM Sans', sans-serif" }} className="hidden sm:block">
            後台管理
          </a>
          <Button onClick={scrollToForm} size="sm"
            className="text-xs tracking-widest rounded-none px-5 py-2.5 font-medium"
            style={{ background: ROSE, color: CREAM, border: "none" }}>
            立即諮詢
          </Button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center px-6 pt-24 pb-16 overflow-hidden">
        {/* BG photo placeholder */}
        <div className="absolute inset-0 z-0">
          <div style={{ width: "100%", height: "100%", background: CREAM_DARK, opacity: 0.45 }}>
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px",
            }}>
              <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="6" width="24" height="17" rx="2" stroke={INK_MUTED} strokeWidth="1" />
                <circle cx="9" cy="12" r="2.5" stroke={INK_MUTED} strokeWidth="1" />
                <path d="M2 19l6-5 4 4 4-3 10 7" stroke={INK_MUTED} strokeWidth="1" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: "16px", color: INK_MUTED, letterSpacing: "0.14em", fontFamily: "'DM Sans', sans-serif" }}>
                Hero 背景大圖（建議比例 16:9）
              </span>
            </div>
          </div>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(120deg, ${CREAM} 45%, transparent 100%)` }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs tracking-[0.2em] font-medium mb-8 border"
                style={{ borderColor: ROSE_BORDER, color: ROSE, background: ROSE_DIM, fontFamily: "'DM Sans', sans-serif" }}>
                ✦ 新人 180 天成長計劃 ✦
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
                className="font-light leading-[1.15] mb-5"
                style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif", fontSize: "clamp(36px, 5vw, 60px)", color: INK }}>
                六個月後，<br />
                你有<span style={{ color: ROSE }}>客群、收入</span>、<br />
                和自己的學員
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                style={{ fontSize: "15px", color: INK_MUTED, lineHeight: 1.7, marginBottom: "6px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>
                很多人試過，卡關了，然後放棄。<br />
                我們做的事很簡單——讓你不用一個人硬撐。
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.28 }}
                style={{ fontSize: "15px", color: INK_MUTED, fontStyle: "italic", marginBottom: "32px", fontFamily: "'Cormorant Garamond', serif" }}>
                這是一條走得到終點的路。
              </motion.p>

              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.32 }}
                className="flex flex-col sm:flex-row gap-3 mb-12">
                <Button onClick={scrollToForm} size="lg"
                  className="px-8 py-5 text-sm font-medium tracking-[0.14em] rounded-none"
                  style={{ background: ROSE, color: CREAM, border: "none" }}>
                  你願意走嗎？立刻了解
                </Button>
                <Button onClick={() => document.getElementById("phases")?.scrollIntoView({ behavior: "smooth" })}
                  variant="outline" size="lg"
                  className="px-8 py-5 text-sm font-medium tracking-[0.14em] rounded-none"
                  style={{ borderColor: BORDER, color: INK_MUTED, background: "transparent" }}>
                  查看完整計劃
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
                className="grid grid-cols-3 gap-4 pt-8 border-t" style={{ borderColor: BORDER }}>
                {[{ num: "41", label: "堂課程" }, { num: "180", label: "天陪伴" }, { num: "3", label: "個成長階段" }].map((s) => (
                  <div key={s.label} className="text-center">
                    <div style={{ fontSize: "40px", fontWeight: 300, color: ROSE, lineHeight: 1, fontFamily: "'Cormorant Garamond', serif" }}>{s.num}</div>
                    <div style={{ fontSize: "15px", color: INK_MUTED, letterSpacing: "0.16em", marginTop: "4px", fontFamily: "'DM Sans', sans-serif" }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero audience card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
              className="hidden lg:block">
              <div className="border" style={{ borderColor: BORDER, background: CREAM_CARD, boxShadow: `0 8px 48px oklch(0.58 0.13 10 / 0.07)` }}>
                <div style={{ padding: "20px 20px 0" }}>
                  <p style={{ fontSize: "15px", letterSpacing: "0.22em", color: ROSE, fontFamily: "'DM Sans', sans-serif", marginBottom: "12px" }}>我是誰？</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {(Object.keys(audienceLabels) as AudienceType[]).map((key) => (
                      <button key={key} onClick={() => setActiveTab(key)}
                        style={{
                          fontSize: "16px", padding: "4px 10px", border: "1px solid",
                          borderColor: activeTab === key ? ROSE : BORDER,
                          color: activeTab === key ? CREAM : INK_MUTED,
                          background: activeTab === key ? ROSE : "transparent",
                          fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif", cursor: "pointer",
                        }}>
                        {audienceLabels[key]}
                      </button>
                    ))}
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }}
                    style={{ padding: "0 20px 20px" }}>
                    <p style={{ fontSize: "15px", color: INK_MUTED, lineHeight: 1.7, marginBottom: "14px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>
                      {copy.situation.split("\n\n")[1]}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                      {[{ label: "婕樂纖", content: copy.jerose }, { label: "GF 戰隊", content: copy.gf }].map((item) => (
                        <div key={item.label} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px", background: ROSE_DIM, border: `1px solid ${ROSE_BORDER}` }}>
                          <span style={{ fontSize: "12px", color: ROSE, border: `1px solid ${ROSE_BORDER}`, padding: "1px 6px", flexShrink: 0, marginTop: "2px", letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif" }}>
                            {item.label}
                          </span>
                          <p style={{ fontSize: "16px", color: INK_MUTED, lineHeight: 1.6, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{item.content}</p>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => { setForm((f) => ({ ...f, audienceType: activeTab })); scrollToForm(); }}
                      className="w-full py-4 text-xs tracking-[0.14em] rounded-none"
                      style={{ background: ROSE, color: CREAM, border: "none" }}>
                      {copy.cta} →
                    </Button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── AUDIENCE (mobile) ── */}
      <section className="py-20 px-6 lg:hidden" style={{ background: CREAM_DARK }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p style={{ fontSize: "15px", letterSpacing: "0.28em", color: ROSE, fontFamily: "'DM Sans', sans-serif", marginBottom: "12px" }}>FOR YOU</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif", fontSize: "36px", fontWeight: 300, color: INK, marginBottom: "16px" }}>你是哪一種？</h2>
            <Divider />
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {(Object.keys(audienceLabels) as AudienceType[]).map((key) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{
                  fontSize: "15px", padding: "6px 14px", border: "1px solid",
                  borderColor: activeTab === key ? ROSE : BORDER,
                  color: activeTab === key ? CREAM : INK_MUTED,
                  background: activeTab === key ? ROSE : "transparent",
                  fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif", cursor: "pointer",
                }}>
                {audienceLabels[key]}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab + "-mobile"} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
              style={{ border: `1px solid ${BORDER}`, background: CREAM_CARD, padding: "28px" }}>
              <p style={{ fontSize: "16px", color: INK_MUTED, lineHeight: 1.75, marginBottom: "20px", whiteSpace: "pre-line", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>
                {copy.situation}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {[{ label: "婕樂纖", content: copy.jerose }, { label: "GF 戰隊", content: copy.gf }].map((item) => (
                  <div key={item.label} style={{ display: "flex", gap: "12px", padding: "12px", background: ROSE_DIM, border: `1px solid ${ROSE_BORDER}` }}>
                    <span style={{ fontSize: "15px", color: ROSE, border: `1px solid ${ROSE_BORDER}`, padding: "2px 7px", flexShrink: 0, marginTop: "2px", letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif" }}>
                      {item.label}
                    </span>
                    <p style={{ fontSize: "15px", color: INK_MUTED, lineHeight: 1.65, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{item.content}</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => { setForm((f) => ({ ...f, audienceType: activeTab })); scrollToForm(); }}
                className="w-full py-5 text-sm tracking-[0.14em] rounded-none"
                style={{ background: ROSE, color: CREAM, border: "none" }}>
                {copy.cta} →
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="stories" className="py-24 px-6" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontSize: "15px", letterSpacing: "0.28em", color: ROSE, fontFamily: "'DM Sans', sans-serif", marginBottom: "12px" }}>STORIES</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 300, color: INK, marginBottom: "16px" }}>她們走過了</h2>
            <Divider />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i + 1}
                style={{ border: `1px solid ${BORDER}`, background: CREAM_CARD, display: "flex", flexDirection: "column" }}>
                {/* Photo placeholder */}
                <div style={{ padding: "16px 16px 0" }}>
                  <PhotoBlock aspect="1 / 1" label="學員照片（1:1）" />
                </div>
                <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "15px", fontWeight: 500, color: INK, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{t.name}</p>
                    <p style={{ fontSize: "16px", color: ROSE, marginTop: "2px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{t.tag}</p>
                  </div>
                  <p style={{ fontSize: "15px", lineHeight: 1.8, color: INK_MUTED, fontStyle: "italic", flex: 1, fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif", marginBottom: "16px" }}>
                    「{t.quote}」
                  </p>
                  <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "15px", color: INK_MUTED, fontFamily: "'DM Sans', sans-serif" }}>{t.duration}</span>
                    <span style={{ fontSize: "15px", color: ROSE, background: ROSE_DIM, padding: "3px 8px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{t.result}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={4}
            className="text-center mt-8"
            style={{ fontSize: "16px", color: INK_MUTED, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif" }}>
            * 以上為真實學員故事，個人結果因努力程度與市場因素而有所不同。
          </motion.p>
        </div>
      </section>

      {/* ── WHY JEROSE ── */}
      <section id="brand" className="py-24 px-6" style={{ background: CREAM_DARK }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontSize: "15px", letterSpacing: "0.28em", color: ROSE, fontFamily: "'DM Sans', sans-serif", marginBottom: "12px" }}>BRAND</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 300, color: INK, marginBottom: "8px" }}>為什麼選婕樂纖</h2>
            <p style={{ fontSize: "16px", color: INK_MUTED, marginBottom: "16px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>你賣的東西，決定了你說話的底氣。</p>
            <Divider />
          </div>

          {/* Brand hero photo */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="mb-16">
            <PhotoBlock aspect="21 / 9" label="品牌形象大圖（建議比例 21:9）" />
          </motion.div>

          {[
            { label: "產品力", items: brandAdvantages.product },
            { label: "市場力", items: brandAdvantages.market },
            { label: "加盟商保障", items: brandAdvantages.protection },
          ].map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "mt-14" : ""}>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
                style={{ fontSize: "15px", letterSpacing: "0.22em", color: ROSE, fontFamily: "'DM Sans', sans-serif", textAlign: "center", marginBottom: "20px" }}>
                {group.label}
              </motion.p>
              <div className={`grid gap-4 ${group.items.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
                {group.items.map((item, i) => (
                  <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={fadeUp} custom={i + 1}
                    style={{ padding: "20px", border: `1px solid ${BORDER}`, background: CREAM_CARD }}>
                    <div style={{ fontSize: "22px", marginBottom: "10px" }}>{item.icon}</div>
                    <h4 style={{ fontSize: "15px", fontWeight: 500, color: INK, marginBottom: "6px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{item.title}</h4>
                    <p style={{ fontSize: "15px", color: INK_MUTED, lineHeight: 1.65, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY GF ── */}
      <section id="gf" className="py-24 px-6" style={{ background: CREAM }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontSize: "15px", letterSpacing: "0.28em", color: ROSE, fontFamily: "'DM Sans', sans-serif", marginBottom: "12px" }}>WHY GF</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 300, color: INK, marginBottom: "8px" }}>為什麼選 GF 戰隊</h2>
            <p style={{ fontSize: "16px", color: INK_MUTED, maxWidth: "480px", margin: "0 auto 16px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif", lineHeight: 1.7 }}>
              同樣是婕樂纖加盟商，差別只有一個——<br />
              我們用系統代替自律，讓你每天都知道下一步做什麼。
            </p>
            <Divider />
          </div>

          {/* GF photo */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-16">
            <PhotoBlock aspect="16 / 7" label="團隊形象大圖（建議比例 16:7）" />
          </motion.div>

          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            style={{ fontSize: "15px", letterSpacing: "0.22em", color: ROSE, fontFamily: "'DM Sans', sans-serif", textAlign: "center", marginBottom: "20px" }}>
            企業化陪伴機制
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {supports.map((s, i) => (
              <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i + 1}
                style={{ padding: "20px", border: `1px solid ${BORDER}`, background: CREAM_CARD, textAlign: "center" }}>
                <div style={{ fontSize: "26px", marginBottom: "10px" }}>{s.icon}</div>
                <h4 style={{ fontSize: "15px", fontWeight: 500, color: INK, marginBottom: "8px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{s.title}</h4>
                <p style={{ fontSize: "16px", color: INK_MUTED, lineHeight: 1.65, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            style={{ fontSize: "15px", letterSpacing: "0.22em", color: ROSE, fontFamily: "'DM Sans', sans-serif", textAlign: "center", marginBottom: "20px" }}>
            四個專屬工具
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((t, i) => (
              <motion.div key={t.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i + 1}
                style={{ padding: "20px", border: `1px solid ${BORDER}`, background: CREAM_CARD, textAlign: "center" }}>
                <div style={{ fontSize: "26px", marginBottom: "10px" }}>{t.icon}</div>
                <h4 style={{ fontSize: "15px", fontWeight: 500, color: INK, marginBottom: "8px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{t.title}</h4>
                <p style={{ fontSize: "16px", color: INK_MUTED, lineHeight: 1.65, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section id="phases" className="py-24 px-6" style={{ background: CREAM_DARK }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontSize: "15px", letterSpacing: "0.28em", color: ROSE, fontFamily: "'DM Sans', sans-serif", marginBottom: "12px" }}>ROADMAP</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 300, color: INK, marginBottom: "16px" }}>180 天成長路線圖</h2>
            <Divider />
          </div>

          {/* Timeline */}
          <div style={{ position: "relative" }}>
            {/* Progress bar track */}
            <div style={{ position: "absolute", left: "28px", top: "32px", bottom: "32px", width: "2px", background: BORDER }} className="hidden md:block" />

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {phases.map((phase, i) => (
                <motion.div key={phase.month} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} custom={i + 1}
                  style={{ display: "flex", gap: "24px", alignItems: "flex-start", paddingBottom: i < phases.length - 1 ? "0" : "0" }}
                  className="md:flex hidden">
                  {/* Timeline node */}
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "8px" }}>
                    <div style={{
                      width: "56px", height: "56px", border: `2px solid ${ROSE}`, background: CREAM_CARD,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: "20px", fontWeight: 300, color: ROSE, fontFamily: "'Cormorant Garamond', serif" }}>{phase.num}</span>
                    </div>
                    {i < phases.length - 1 && (
                      <div style={{ width: "2px", height: "80px", background: `linear-gradient(180deg, ${ROSE}, ${BORDER})` }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, border: `1px solid ${BORDER}`, background: CREAM_CARD, padding: "24px", marginBottom: i < phases.length - 1 ? "0" : "0" }}>
                    {phase.badge && (
                      <span style={{ fontSize: "12px", color: ROSE, border: `1px solid ${ROSE_BORDER}`, padding: "2px 8px", letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif", float: "right", marginLeft: "8px" }}>
                        {phase.badge}
                      </span>
                    )}
                    <p style={{ fontSize: "15px", color: ROSE, letterSpacing: "0.16em", fontFamily: "'DM Sans', sans-serif", marginBottom: "4px" }}>{phase.month}</p>
                    <h3 style={{ fontSize: "20px", fontWeight: 400, color: INK, fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif", marginBottom: "8px" }}>{phase.title}</h3>
                    <p style={{ fontSize: "15px", color: INK_MUTED, lineHeight: 1.65, marginBottom: "14px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{phase.desc}</p>

                    {/* Progress bar */}
                    <div style={{ height: "2px", background: BORDER, marginBottom: "14px", position: "relative" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${phase.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        style={{ position: "absolute", top: 0, left: 0, height: "100%", background: ROSE }}
                      />
                    </div>

                    <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {phase.items.map((item) => (
                        <li key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "15px", color: INK_MUTED, lineHeight: 1.6, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>
                          <span style={{ color: ROSE, flexShrink: 0, marginTop: "2px" }}>—</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile version — cards */}
            <div className="md:hidden flex flex-col gap-4">
              {phases.map((phase, i) => (
                <motion.div key={phase.month + "-m"} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} custom={i + 1}
                  style={{ border: `1px solid ${BORDER}`, background: CREAM_CARD, padding: "20px", position: "relative" }}>
                  {phase.badge && (
                    <span style={{ position: "absolute", top: "12px", right: "12px", fontSize: "12px", color: ROSE, border: `1px solid ${ROSE_BORDER}`, padding: "2px 6px", letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif" }}>
                      {phase.badge}
                    </span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{ width: "44px", height: "44px", border: `2px solid ${ROSE}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "18px", fontWeight: 300, color: ROSE, fontFamily: "'Cormorant Garamond', serif" }}>{phase.num}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: "12px", color: ROSE, letterSpacing: "0.14em", fontFamily: "'DM Sans', sans-serif" }}>{phase.month}</p>
                      <h3 style={{ fontSize: "17px", fontWeight: 400, color: INK, fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif" }}>{phase.title}</h3>
                    </div>
                  </div>
                  <div style={{ height: "2px", background: BORDER, marginBottom: "12px", position: "relative" }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${phase.progress}%` }} viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      style={{ position: "absolute", top: 0, left: 0, height: "100%", background: ROSE }} />
                  </div>
                  <p style={{ fontSize: "15px", color: INK_MUTED, lineHeight: 1.65, marginBottom: "10px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>{phase.desc}</p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {phase.items.map((item) => (
                      <li key={item} style={{ display: "flex", gap: "8px", fontSize: "15px", color: INK_MUTED, lineHeight: 1.6, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>
                        <span style={{ color: ROSE, flexShrink: 0, marginTop: "2px" }}>—</span>{item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={4}
            className="text-center mt-14">
            <p style={{ fontSize: "15px", color: INK_MUTED, fontStyle: "italic", marginBottom: "20px", fontFamily: "'Cormorant Garamond', serif" }}>
              準備好了嗎？我們等你。
            </p>
            <Button onClick={scrollToForm} size="lg"
              className="px-10 py-5 text-sm tracking-[0.14em] rounded-none font-medium"
              style={{ background: ROSE, color: CREAM, border: "none" }}>
              立刻預約免費諮詢 →
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── LEAD FORM ── */}
      <section id="contact" className="py-24 px-6" style={{ background: CREAM }}>
        <div className="max-w-2xl mx-auto" ref={formRef}>
          <div className="text-center mb-10">
            <p style={{ fontSize: "15px", letterSpacing: "0.28em", color: ROSE, fontFamily: "'DM Sans', sans-serif", marginBottom: "12px" }}>JOIN US</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 300, color: INK, marginBottom: "8px" }}>你願意走嗎？</h2>
            <p style={{ fontSize: "16px", color: INK_MUTED, marginBottom: "16px", fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>
              留下聯絡方式，24 小時內我們主動找你聊聊。
            </p>
            <Divider />
          </div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: "center", padding: "64px 32px", border: `1px solid ${ROSE_BORDER}`, background: CREAM_CARD }}>
              <div style={{ fontSize: "32px", color: ROSE, marginBottom: "16px" }}>✦</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 300, color: INK, marginBottom: "8px" }}>感謝您的留言！</h3>
              <p style={{ fontSize: "15px", color: INK_MUTED, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>
                我們將在 24 小時內主動與您聯繫，期待與您同行這 180 天的旅程。
              </p>
            </motion.div>
          ) : (
            <motion.form initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              onSubmit={handleSubmit}
              style={{ padding: "36px", border: `1px solid ${BORDER}`, background: CREAM_CARD, display: "flex", flexDirection: "column", gap: "24px" }}>

              {[
                { label: "您的姓名 *", field: "name" as const, placeholder: "請輸入您的姓名" },
                { label: "聯絡方式（Line / 電話 / Email）*", field: "contact" as const, placeholder: "請輸入您的 Line ID、電話或 Email" },
              ].map((f) => (
                <div key={f.field}>
                  <label style={{ display: "block", fontSize: "15px", letterSpacing: "0.16em", color: ROSE, fontFamily: "'DM Sans', sans-serif", marginBottom: "8px" }}>{f.label}</label>
                  <Input value={form[f.field]} onChange={(e) => setForm((prev) => ({ ...prev, [f.field]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="rounded-none border-0 border-b bg-transparent text-sm py-3 focus-visible:ring-0 placeholder:opacity-35"
                    style={{ borderBottom: `1px solid ${BORDER}`, color: INK, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }} />
                </div>
              ))}

              <div>
                <label style={{ display: "block", fontSize: "15px", letterSpacing: "0.16em", color: ROSE, fontFamily: "'DM Sans', sans-serif", marginBottom: "10px" }}>你是哪一種？</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(Object.keys(audienceLabels) as AudienceType[]).map((key) => (
                    <button key={key} type="button" onClick={() => setForm((f) => ({ ...f, audienceType: key }))}
                      style={{
                        fontSize: "16px", padding: "5px 12px", border: "1px solid", cursor: "pointer",
                        borderColor: form.audienceType === key ? ROSE : BORDER,
                        color: form.audienceType === key ? CREAM : INK_MUTED,
                        background: form.audienceType === key ? ROSE : "transparent",
                        fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif",
                      }}>
                      {audienceLabels[key]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "15px", letterSpacing: "0.16em", color: ROSE, fontFamily: "'DM Sans', sans-serif", marginBottom: "8px" }}>想對我們說的話（選填）</label>
                <Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="你目前的狀況、期望或任何想法..."
                  rows={3}
                  className="rounded-none border bg-transparent text-sm resize-none focus-visible:ring-0 placeholder:opacity-35"
                  style={{ borderColor: BORDER, color: INK, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }} />
              </div>

              <Button type="submit" disabled={submitLead.isPending}
                className="w-full py-6 text-sm tracking-[0.14em] rounded-none font-medium"
                style={{ background: ROSE, color: CREAM, border: "none" }}>
                {submitLead.isPending ? "提交中..." : "我想了解，幫我約諮詢 →"}
              </Button>

              <p style={{ textAlign: "center", fontSize: "16px", color: INK_MUTED, fontFamily: "'DM Sans', sans-serif" }}>
                您的資訊將被嚴格保密，僅用於聯繫諮詢。
              </p>
            </motion.form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, background: CREAM_DARK, padding: "48px 24px" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-10 mb-10 text-center sm:text-left">
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 300, color: INK, letterSpacing: "0.14em", marginBottom: "10px" }}>GF 戰隊</div>
              <p style={{ fontSize: "15px", color: INK_MUTED, lineHeight: 1.7, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>
                有系統的自媒體變現路徑<br />我們陪你走完 180 天
              </p>
            </div>
            <div>
              <p style={{ fontSize: "15px", letterSpacing: "0.2em", color: ROSE, fontFamily: "'DM Sans', sans-serif", marginBottom: "10px" }}>CONTACT</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[["Line", "@gf_squad"], ["Instagram", "@gfsquad.official"]].map(([k, v]) => (
                  <p key={k} style={{ fontSize: "15px", color: INK_MUTED, fontFamily: "'DM Sans', 'Noto Sans TC', sans-serif" }}>
                    {k}：<span style={{ color: INK }}>{v}</span>
                  </p>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
              <Button onClick={scrollToForm}
                className="px-7 py-3 text-xs tracking-[0.16em] rounded-none"
                style={{ background: ROSE, color: CREAM, border: "none" }}>
                立即預約諮詢
              </Button>
              <p style={{ fontSize: "16px", color: INK_MUTED, fontFamily: "'DM Sans', sans-serif", marginTop: "12px" }}>24 小時內回覆</p>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "24px", textAlign: "center" }}>
            <p style={{ fontSize: "16px", color: INK_MUTED, letterSpacing: "0.12em", fontFamily: "'DM Sans', sans-serif" }}>
              © 2026 GF 戰隊 · 新人 180 天成長計劃
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
