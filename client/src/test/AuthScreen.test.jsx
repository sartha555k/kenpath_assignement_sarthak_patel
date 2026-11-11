import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthScreen } from "../components/AuthScreen.jsx";
import { api, session } from "../lib/api.js";

vi.mock("../lib/api.js", () => ({ api: vi.fn(), session: { set: vi.fn() } }));

describe("authentication forms", () => {
  it("validates input before requesting login and displays API errors", async () => {
    const user = userEvent.setup();
    render(<AuthScreen onAuthenticated={vi.fn()} />);
    await user.click(
      screen.getByRole("button", { name: /log in to your journal/i }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent("valid email");
    expect(api).not.toHaveBeenCalled();
    await user.type(
      screen.getByLabelText("Email address"),
      "patient@example.com",
    );
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    api.mockRejectedValueOnce(new Error("Invalid email or password."));
    await user.click(
      screen.getByRole("button", { name: /log in to your journal/i }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );
  });

  it("registers through the API and stores the authenticated session", async () => {
    const user = userEvent.setup();
    const onAuthenticated = vi.fn();
    render(<AuthScreen onAuthenticated={onAuthenticated} />);
    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Your name"), "Alex");
    await user.type(screen.getByLabelText("Email address"), "alex@example.com");
    await user.type(screen.getByLabelText("Password"), "MyPassword123!");
    api.mockResolvedValueOnce({
      token: "test-token",
      user: { id: 1, name: "Alex" },
    });
    await user.click(
      screen.getByRole("button", { name: "Create your account" }),
    );
    expect(api).toHaveBeenLastCalledWith("/auth/register", {
      method: "POST",
      body: {
        name: "Alex",
        email: "alex@example.com",
        password: "MyPassword123!",
      },
    });
    expect(session.set).toHaveBeenCalledWith("test-token");
    expect(onAuthenticated).toHaveBeenCalledWith({ id: 1, name: "Alex" });
  });
});
