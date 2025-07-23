import React, { useState } from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { useThrottle } from "./index";

jest.useFakeTimers();

function TestComponent({ delay = 1000 }: { delay?: number }) {
  const [value, setValue] = useState("");
  const throttledFn = useThrottle((newVal: string) => {
    setValue(newVal);
  }, delay);

  return (
    <div>
      <button onClick={() => throttledFn("A")}>Click A</button>
      <button onClick={() => throttledFn("B")}>Click B</button>
      <div data-testid="output">{value}</div>
    </div>
  );
}

describe("useThrottle (with test component)", () => {
  it("calls throttled function immediately on first call", () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText("Click A"));
    expect(screen.getByTestId("output").textContent).toBe("A");
  });

  it("throttles multiple rapid calls", () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText("Click A"));
    fireEvent.click(screen.getByText("Click B")); // Should be throttled

    expect(screen.getByTestId("output").textContent).toBe("A");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId("output").textContent).toBe("B");
  });

  it("does not call throttled function again until delay passes", () => {
    render(<TestComponent delay={500} />);

    fireEvent.click(screen.getByText("Click A"));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    fireEvent.click(screen.getByText("Click B")); // Should still be throttled
    expect(screen.getByTestId("output").textContent).toBe("A");

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByTestId("output").textContent).toBe("B");
  });

  it("cleans up on unmount without calling throttled function again", () => {
    const { unmount } = render(<TestComponent />);
    fireEvent.click(screen.getByText("Click A"));
    fireEvent.click(screen.getByText("Click B"));

    unmount();

    act(() => {
      jest.runAllTimers();
    });

    // Can't assert directly, but this ensures no error is thrown
  });
});
