"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
};

type ThemeContextType = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
	children,
	defaultTheme = "system",
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(defaultTheme);

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") as Theme | null;
		if (savedTheme) {
			setTheme(savedTheme);
		} else if (defaultTheme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";
			setTheme(systemTheme);
		}
	}, [defaultTheme]);

	useEffect(() => {
		const root = window.document.documentElement;

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";

			root.classList.remove("dark", "light");
			root.classList.add(systemTheme);
		} else {
			root.classList.remove("dark", "light");
			root.classList.add(theme);
		}

		localStorage.setItem("theme", theme);
	}, [theme]);

	const value = {
		theme,
		setTheme,
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeContext);

	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
};
