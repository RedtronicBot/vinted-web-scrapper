import { Route, Routes } from "react-router"
import Filter from "./page/Filter"
import Admin from "./page/Admin"

function App() {
	return (
		<Routes>
			<Route path="/" element={<Filter />} />
			<Route path="/admin" element={<Admin />} />
		</Routes>
	)
}

export default App
