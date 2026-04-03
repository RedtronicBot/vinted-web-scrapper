import { Route, Routes } from "react-router"
import Filter from "./page/Filter"

function App() {
	return (
		<Routes>
			<Route path="/" element={<Filter />} />
		</Routes>
	)
}

export default App
