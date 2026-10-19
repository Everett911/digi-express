import { describe, expect, it } from "vite-plus/test";
import { canViewAdmin, isDemoRole, maskCustomer, maskEmail, maskName } from "./demo";

describe("canViewAdmin", () => {
  it("lets admins and the demo account into the dashboard", () => {
    expect(canViewAdmin("admin")).toBe(true);
    expect(canViewAdmin("demo")).toBe(true);
  });

  it("keeps customers and signed-out visitors out", () => {
    expect(canViewAdmin("customer")).toBe(false);
    expect(canViewAdmin(undefined)).toBe(false);
    expect(canViewAdmin(null)).toBe(false);
  });

  it("only treats the demo role as read-only", () => {
    expect(isDemoRole("demo")).toBe(true);
    expect(isDemoRole("admin")).toBe(false);
  });
});

describe("maskEmail", () => {
  it("keeps the first letter and the domain", () => {
    expect(maskEmail("jane.doe@gmail.com")).toBe("j•••@gmail.com");
  });

  it("hides anything that isn't a normal address", () => {
    expect(maskEmail("not-an-email")).toBe("•••");
    expect(maskEmail("@example.com")).toBe("•••");
  });
});

describe("maskName", () => {
  it("shortens the last name to an initial", () => {
    expect(maskName("Jane Doe")).toBe("Jane D.");
    expect(maskName("  Mary Ann  smith ")).toBe("Mary S.");
  });

  it("leaves a single name as it is", () => {
    expect(maskName("Cher")).toBe("Cher");
  });
});

describe("maskCustomer", () => {
  it("masks name and email and keeps other fields", () => {
    expect(maskCustomer({ id: "u1", name: "Jane Doe", email: "jane@example.com" })).toEqual({
      id: "u1",
      name: "Jane D.",
      email: "j•••@example.com",
    });
  });
});
