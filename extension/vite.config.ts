import { defineConfig, loadEnv } from "vite"
import { resolve } from "path"
import { viteStaticCopy } from "vite-plugin-static-copy"

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "")

	return {
		plugins: [
			viteStaticCopy({
				targets: [
					{
						src: "manifest.json",
						dest: ".",
						transform: (content) => {
							if (mode !== "preproduction") return content
							const manifest = JSON.parse(content.toString())
							manifest.name = `${manifest.name} (preprod)`
							return JSON.stringify(manifest, null, 2)
						},
					},
				],
			}),
		],
		define: {
			"import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
		},
		build: {
			outDir: mode === "preproduction" ? "dist-preprod" : "dist",
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
