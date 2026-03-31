import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

const audienceLabels: Record<string, string> = {
  beginner: "完全新手",
  sales: "轉型銷售人員",
  entrepreneur: "創業 / 副業",
};

const GOLD = "oklch(0.78 0.12 80)";
const DARK_BG = "oklch(0.10 0.005 250)";
const DARK_CARD = "oklch(0.14 0.006 250)";
const DARK_SECTION = "oklch(0.12 0.005 250)";
const TEXT_MAIN = "oklch(0.90 0.008 80)";
const TEXT_MUTED = "oklch(0.60 0.008 80)";
const TEXT_DIM = "oklch(0.45 0.006 250)";
const BORDER_DIM = "oklch(0.22 0.006 250)";

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: leads, isLoading, refetch } = trpc.leads.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  const deleteLead = trpc.leads.delete.useMutation({
    onSuccess: () => {
      toast.success("已刪除該筆資料");
      refetch();
    },
    onError: (err) => {
      toast.error("刪除失敗：" + err.message);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: DARK_BG }}>
        <div className="text-sm tracking-widest" style={{ color: TEXT_MUTED, fontFamily: "'Inter', sans-serif" }}>
          載入中...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6" style={{ background: DARK_BG }}>
        <div className="text-3xl font-light mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: GOLD }}>
          GF 戰隊後台
        </div>
        <p className="text-sm" style={{ color: TEXT_MUTED, fontFamily: "'Inter', sans-serif" }}>
          請先登入以存取管理後台
        </p>
        <Button onClick={() => { window.location.href = getLoginUrl(); }}
          className="px-8 py-5 text-sm tracking-widest rounded-none"
          style={{ background: `linear-gradient(135deg, ${GOLD}, oklch(0.68 0.10 70))`, color: DARK_BG, border: "none" }}>
          登入管理員帳號
        </Button>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: DARK_BG }}>
        <div className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: GOLD }}>
          權限不足
        </div>
        <p className="text-sm" style={{ color: TEXT_MUTED, fontFamily: "'Inter', sans-serif" }}>
          此頁面僅限管理員存取
        </p>
        <Button variant="outline" onClick={() => navigate("/")}
          className="text-sm tracking-widest rounded-none"
          style={{ borderColor: `${GOLD}40`, color: GOLD, background: "transparent" }}>
          返回首頁
        </Button>
      </div>
    );
  }

  const totalLeads = leads?.length ?? 0;
  const countByType = (type: string) => leads?.filter((l) => l.audienceType === type).length ?? 0;

  return (
    <div className="min-h-screen" style={{ background: DARK_BG, color: TEXT_MAIN }}>
      {/* Header */}
      <header className="border-b px-8 py-5 flex items-center justify-between"
        style={{ borderColor: BORDER_DIM, background: DARK_SECTION }}>
        <div>
          <div className="text-xl font-light tracking-widest"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: GOLD }}>
            GF 戰隊 · 後台管理
          </div>
          <div className="text-xs mt-0.5" style={{ color: TEXT_DIM, fontFamily: "'Inter', sans-serif" }}>
            歡迎，{user.name ?? "管理員"}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/")}
          className="text-xs tracking-widest rounded-none"
          style={{ borderColor: BORDER_DIM, color: TEXT_MUTED, background: "transparent" }}>
          ← 返回首頁
        </Button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "總潛在客戶", value: totalLeads },
            { label: "完全新手", value: countByType("beginner") },
            { label: "轉型銷售", value: countByType("sales") },
            { label: "創業副業", value: countByType("entrepreneur") },
          ].map((stat) => (
            <div key={stat.label} className="p-6 border text-center"
              style={{ borderColor: `${GOLD}18`, background: DARK_CARD }}>
              <div className="text-3xl font-light mb-1"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: GOLD }}>
                {stat.value}
              </div>
              <div className="text-xs tracking-widest" style={{ color: TEXT_DIM, fontFamily: "'Inter', sans-serif" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="border" style={{ borderColor: BORDER_DIM }}>
          <div className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: BORDER_DIM, background: DARK_SECTION }}>
            <h2 className="text-base font-light tracking-widest"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.88 0.010 80)" }}>
              潛在客戶名單
            </h2>
            <span className="text-xs" style={{ color: TEXT_DIM, fontFamily: "'Inter', sans-serif" }}>
              共 {totalLeads} 筆
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-sm" style={{ color: TEXT_DIM, fontFamily: "'Inter', sans-serif" }}>
              載入中...
            </div>
          ) : !leads || leads.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-2xl mb-3" style={{ color: GOLD }}>✦</div>
              <p className="text-sm" style={{ color: TEXT_DIM, fontFamily: "'Inter', sans-serif" }}>
                尚無潛在客戶資料
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "'Inter', 'Noto Serif TC', sans-serif" }}>
                <thead>
                  <tr className="border-b" style={{ borderColor: BORDER_DIM }}>
                    {["#", "姓名", "聯絡方式", "身份", "留言", "提交時間", "操作"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs tracking-widest font-medium"
                        style={{ color: GOLD }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr key={lead.id} className="border-b"
                      style={{
                        borderColor: "oklch(0.18 0.006 250)",
                        background: i % 2 === 0 ? "transparent" : "oklch(0.12 0.005 250 / 0.5)",
                      }}>
                      <td className="px-5 py-4" style={{ color: TEXT_DIM }}>{lead.id}</td>
                      <td className="px-5 py-4 font-medium" style={{ color: "oklch(0.88 0.010 80)" }}>{lead.name}</td>
                      <td className="px-5 py-4" style={{ color: TEXT_MUTED }}>{lead.contact}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2 py-0.5 border"
                          style={{ borderColor: `${GOLD}35`, color: GOLD }}>
                          {audienceLabels[lead.audienceType] ?? lead.audienceType}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-[200px] truncate" style={{ color: TEXT_MUTED }}>
                        {lead.message ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-xs" style={{ color: TEXT_DIM }}>
                        {new Date(lead.createdAt).toLocaleString("zh-TW")}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => {
                            if (confirm(`確定要刪除「${lead.name}」的資料嗎？`)) {
                              deleteLead.mutate({ id: lead.id });
                            }
                          }}
                          className="text-xs px-3 py-1 border transition-colors"
                          style={{ borderColor: "oklch(0.55 0.22 25 / 0.4)", color: "oklch(0.65 0.18 25)" }}>
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
