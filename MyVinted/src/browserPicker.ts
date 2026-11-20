import { registerPlugin } from "@capacitor/core"
import { Preferences } from "@capacitor/preferences"

type Browser = { package: string; name: string }

const BrowserPicker = registerPlugin<{
	list(): Promise<{ browsers: Browser[] }>
	open(o: { url: string; package?: string }): Promise<void>
}>("BrowserPicker")

export async function listBrowsers(): Promise<Browser[]> {
	const { browsers } = await BrowserPicker.list()
	// dédoublonne par package (un navigateur peut remonter plusieurs fois)
	return [...new Map(browsers.map((b) => [b.package, b])).values()]
}

export const saveBrowser = (pkg: string) => Preferences.set({ key: "browser", value: pkg })

export async function openInChosenBrowser(url: string) {
	const { value } = await Preferences.get({ key: "browser" })
	await BrowserPicker.open({ url, package: value ?? undefined })
}

export async function getSavedBrowser(): Promise<string> {
	const { value } = await Preferences.get({ key: "browser" })
	return value ?? ""
}
