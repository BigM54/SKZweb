import './index.css'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import { ClerkProvider } from '@clerk/clerk-react'

const Clerk_key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if(!Clerk_key) throw new Error("chelou")

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ClerkProvider publishableKey={Clerk_key}>
    <App />
    </ClerkProvider>
  </BrowserRouter>
)
