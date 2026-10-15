import { useEffect } from "react";

type useEnterKeyOptions = {
  enabled?: boolean;
  preventDefault?: boolean;
  ignoreInputLike?: boolean;
};

export function useEnterKey(
  handler: () => void,
  options: useEnterKeyOptions = {},
) {
  const {
    enabled = true,
    preventDefault = true,
    ignoreInputLike = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.defaultPrevented) return;

      if (ignoreInputLike) {
        const activeElement = document.activeElement;
        const isInputLike =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          activeElement instanceof HTMLSelectElement ||
          activeElement instanceof HTMLButtonElement ||
          activeElement instanceof HTMLAnchorElement ||
          (activeElement instanceof HTMLElement &&
            (activeElement.isContentEditable ||
              activeElement.getAttribute("role") === "button" ||
              activeElement.getAttribute("role") === "option" ||
              activeElement.tabIndex >= 0));

        if (isInputLike) return;
      }

      if (preventDefault) event.preventDefault();
      handler();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handler, ignoreInputLike, preventDefault]);
}
