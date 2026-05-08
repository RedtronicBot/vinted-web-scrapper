import { defineConfig } from "vite"
import { resolve } from "path"
import { viteStaticCopy } from "vite-plugin-static-copy"

export default defineConfig({
	plugins: [
		viteStaticCopy({
			targets: [
				{
					src: "manifest.json",
					dest: ".",
				},
			],
		}),
	],
	build: {
		outDir: "dist",
		emptyOutDir: true,
		rollupOptions: {
			input: {
				content: resolve(__dirname, "src/content/index.ts"),
			},
			output: {
				entryFileNames: "[name].js",
			},
		},
	},
})
