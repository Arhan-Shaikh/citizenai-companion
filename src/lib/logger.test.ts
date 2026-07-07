import { describe, expect, it, vi, afterEach } from "vitest";
import { createLogger } from "@/lib/logger";

describe("createLogger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits scoped debug messages in dev", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const log = createLogger("test-scope");
    log.debug("hello", { a: 1 });
    expect(spy).toHaveBeenCalledWith("[test-scope]", "hello", { a: 1 });
  });

  it("emits error messages regardless of environment", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const log = createLogger("errors");
    log.error("boom");
    expect(spy).toHaveBeenCalledWith("[errors]", "boom");
  });

  it("omits the meta argument when not provided", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = createLogger("s");
    log.info("msg");
    expect(spy).toHaveBeenCalledWith("[s]", "msg");
  });

  it("warn is scoped and forwards metadata", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const log = createLogger("warn-scope");
    log.warn("careful", 42);
    expect(spy).toHaveBeenCalledWith("[warn-scope]", "careful", 42);
  });
});
