import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initTelegramApp } from './store.js'

initTelegramApp()
createRoot(document.getElementById('root')).render(<App />)