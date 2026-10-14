"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type DocumentPictureInPictureApi = {
  window: Window | null;

  requestWindow: (options?: {
    width?: number;
    height?: number;
  }) => Promise<Window>;
};

export type MiniFocusOpenResult =
  | "opened"
  | "unsupported"
  | "failed";

function getDocumentPictureInPicture() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window as Window & {
      documentPictureInPicture?: DocumentPictureInPictureApi;
    }
  ).documentPictureInPicture;
}

function copyStyles(targetWindow: Window) {
  const targetDocument =
    targetWindow.document;

  Array.from(document.styleSheets).forEach(
    (styleSheet) => {
      try {
        const cssRules = Array.from(
          styleSheet.cssRules,
        )
          .map((rule) => rule.cssText)
          .join("");

        const style =
          targetDocument.createElement(
            "style",
          );

        style.textContent = cssRules;

        targetDocument.head.appendChild(
          style,
        );
      } catch {
        if (!styleSheet.href) {
          return;
        }

        const link =
          targetDocument.createElement(
            "link",
          );

        link.rel = "stylesheet";
        link.href = styleSheet.href;

        targetDocument.head.appendChild(
          link,
        );
      }
    },
  );
}

function syncTheme(targetWindow: Window) {
  const sourceRoot =
    document.documentElement;

  const targetRoot =
    targetWindow.document.documentElement;

  targetRoot.className =
    sourceRoot.className;

  targetRoot.lang = sourceRoot.lang;

  targetRoot.style.colorScheme =
    getComputedStyle(
      sourceRoot,
    ).colorScheme;
}

export function useMiniFocus() {
  const [supported, setSupported] =
    useState(false);

  const [portalRoot, setPortalRoot] =
    useState<HTMLElement | null>(null);

  const pipWindowRef =
    useRef<Window | null>(null);

  /**
   * Keep a stable reference to the main
   * Planora browser window.
   */
  const mainWindowRef =
    useRef<Window | null>(null);

  useEffect(() => {
    mainWindowRef.current = window;

    setSupported(
      Boolean(
        getDocumentPictureInPicture(),
      ),
    );
  }, []);

  const close = useCallback(() => {
    const pipWindow =
      pipWindowRef.current;

    if (
      pipWindow &&
      !pipWindow.closed
    ) {
      pipWindow.close();
    }

    pipWindowRef.current = null;

    setPortalRoot(null);
  }, []);

  /**
   * Bring the original Planora tab/window
   * back to the foreground.
   *
   * This works best when called directly
   * from a click inside the PiP window.
   */
  const focusMainWindow =
    useCallback(() => {
      const mainWindow =
        mainWindowRef.current;

      if (!mainWindow) {
        return;
      }

      mainWindow.focus();
    }, []);

  useEffect(() => {
    const pipWindow =
      pipWindowRef.current;

    if (!pipWindow || !portalRoot) {
      return;
    }

    syncTheme(pipWindow);

    const observer =
      new MutationObserver(() => {
        if (!pipWindow.closed) {
          syncTheme(pipWindow);
        }
      });

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "style",
        ],
      },
    );

    return () => {
      observer.disconnect();
    };
  }, [portalRoot]);

  const open =
    useCallback(
      async (): Promise<MiniFocusOpenResult> => {
        const api =
          getDocumentPictureInPicture();

        if (!api) {
          return "unsupported";
        }

        const existingWindow =
          api.window;

        if (
          existingWindow &&
          !existingWindow.closed
        ) {
          existingWindow.focus();

          return "opened";
        }

        try {
          const pipWindow =
            await api.requestWindow({
              width: 360,
              height: 230,
            });

          const pipDocument =
            pipWindow.document;

          pipDocument.title =
            "Planora Mini Focus";

          const viewport =
            pipDocument.createElement(
              "meta",
            );

          viewport.name = "viewport";

          viewport.content =
            "width=device-width, initial-scale=1";

          pipDocument.head.appendChild(
            viewport,
          );

          copyStyles(pipWindow);

          syncTheme(pipWindow);

          pipDocument.body.className =
            document.body.className;

          pipDocument.body.style.margin =
            "0";

          pipDocument.body.style.overflow =
            "hidden";

          const root =
            pipDocument.createElement(
              "div",
            );

          root.id =
            "planora-mini-focus-root";

          root.style.width = "100%";
          root.style.height = "100vh";

          pipDocument.body.appendChild(
            root,
          );

          pipWindowRef.current =
            pipWindow;

          setPortalRoot(root);

          pipWindow.addEventListener(
            "pagehide",
            () => {
              if (
                pipWindowRef.current ===
                pipWindow
              ) {
                pipWindowRef.current =
                  null;

                setPortalRoot(null);
              }
            },
            {
              once: true,
            },
          );

          return "opened";
        } catch {
          return "failed";
        }
      },
    []);

  useEffect(() => {
    return () => {
      const pipWindow =
        pipWindowRef.current;

      if (
        pipWindow &&
        !pipWindow.closed
      ) {
        pipWindow.close();
      }
    };
  }, []);

  return {
    supported,

    portalRoot,

    open,

    close,

    focusMainWindow,
  };
}