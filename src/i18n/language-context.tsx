"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  translations,
  type Language,
} from "./translation";

const LANGUAGE_STORAGE_KEY = "planora:language";

type TranslationValue =
  (typeof translations)[Language];

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationValue;
  hydrated: boolean;
};

const LanguageContext =
  createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("en");

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    const savedLanguage =
      window.localStorage.getItem(
        LANGUAGE_STORAGE_KEY
      );

    if (
      savedLanguage === "en" ||
      savedLanguage === "zh"
    ) {
      setLanguageState(savedLanguage);
    }

    setHydrated(true);
  }, []);

  function setLanguage(
    nextLanguage: Language
  ) {
    setLanguageState(nextLanguage);

    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      nextLanguage
    );

    document.documentElement.lang =
      nextLanguage === "zh"
        ? "zh-CN"
        : "en";
  }

  const value =
    useMemo<LanguageContextValue>(
      () => ({
        language,
        setLanguage,
        t: translations[language],
        hydrated,
      }),
      [language, hydrated]
    );

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}