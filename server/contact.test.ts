import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("contact.submit", () => {
  it("successfully submits a contact form with all fields", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "John Doe",
      email: "john@example.com",
      company: "Acme Corp",
      message: "I'm interested in learning more about your platform.",
    });

    expect(result).toEqual({ success: true });
  });

  it("successfully submits a contact form without optional company field", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "Jane Smith",
      email: "jane@example.com",
      message: "This is a test message that is longer than 10 characters.",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects contact form with invalid email", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "Test User",
        email: "invalid-email",
        message: "This should fail validation.",
      })
    ).rejects.toThrow();
  });

  it("rejects contact form with message shorter than 10 characters", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "Test User",
        email: "test@example.com",
        message: "Short",
      })
    ).rejects.toThrow();
  });
});
