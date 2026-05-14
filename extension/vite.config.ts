import { defineConfig, loadEnv } from "vite"
import { resolve } from "path"
import { viteStaticCopy } from "vite-plugin-static-copy"

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "")

	return {
		plugins: [
			viteStaticCopy({
				targets: [{ src: "manifest.json", dest: "." }],
			}),
		],
		define: {
			"import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
		},
		build: {
			outDir: "dist",
			emptyOutDir: true,
			rollupOptions: {
				input: {
					content: resolve(__dirname, "src/content/index.ts"),
					background: resolve(__dirname, "src/background.ts"),
				},
				output: {
					entryFileNames: "[name].js",
				},
			},
		},
	}
})
