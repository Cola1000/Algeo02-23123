import { Route, BrowserRouter as Router, Routes} from 'react-router-dom';
import { useState } from 'react'

import './App.css'
import Custom_Viewport from './components/Custom_Viewport';
import { Home3D, Home2D, About, Credits } from './pages/index.js';


function App() {
  const [count, setCount] = useState(0)

  return (
    <main className='w-screen h-screen relative'>
      <Router>
        <Custom_Viewport />
        <Routes>
          < Route path="/" element = {<Home3D/>} /> {/* Landing page will be Home3D */}
          < Route path="/Home2D" element = {<Home2D/>} />
          < Route path="/Credits" element = {<Credits/>} />
          < Route path="/About" element = {<About/>} />
        </Routes>
      </Router>
    </main>
  )
}

export default App
