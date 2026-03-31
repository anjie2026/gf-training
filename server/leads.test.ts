import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  insertLead: vi.fn().mockResolvedValue(undefined),
  getAllLeads: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "測試用戶",
      contact: "test@example.com",
      audienceType: "beginner",
      message: "我想了解更多",
      createdAt: new Date("2026-01-01T00:00:00Z"),
    },
  ]),
  deleteLeadById: vi.fn().mockResolvedValue(undefined),
}));

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-open-id",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-open-id",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("leads.submit", () => {
  it("應允許公開用戶提交潛客資訊", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.leads.submit({
      name: "測試用戶",
      contact: "test@example.com",
      audienceType: "beginner",
      message: "我想了解更多",
    });
    expect(result).toEqual({ success: true });
  });

  it("應允許提交不含留言的潛客資訊", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.leads.submit({
      name: "測試用戶二",
      contact: "0912345678",
      audienceType: "entrepreneur",
    });
    expect(result).toEqual({ success: true });
  });

  it("應拒絕空白姓名", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.leads.submit({ name: "", contact: "test@example.com", audienceType: "sales" })
    ).rejects.toThrow();
  });

  it("應拒絕無效的 audienceType", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.leads.submit({ name: "Test", contact: "test@example.com", audienceType: "invalid" as "beginner" })
    ).rejects.toThrow();
  });
});

describe("leads.list", () => {
  it("管理員應可取得潛客列表", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.leads.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("contact");
    expect(result[0]).toHaveProperty("audienceType");
  });

  it("一般用戶不應可取得潛客列表", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.leads.list()).rejects.toThrow("僅限管理員存取");
  });

  it("未登入用戶不應可取得潛客列表", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.leads.list()).rejects.toThrow();
  });
});

describe("leads.delete", () => {
  it("管理員應可刪除潛客資料", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.leads.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("一般用戶不應可刪除潛客資料", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.leads.delete({ id: 1 })).rejects.toThrow("僅限管理員存取");
  });
});
