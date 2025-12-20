import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Layout from './components/Layout.jsx'
import {createBrowserRouter, 
        Route, 
        createRoutesFromElements, 
        RouterProvider} from 'react-router-dom'
import RegisterPage from './components/RegisterPage.jsx'
import FreelancerRegisterPage from './components/FreelancerRegisterPage.jsx'
import LoginPage from './components/LoginPage.jsx'
import ClientRegisterPage from './components/ClientRegisterPage.jsx'
import { Dashboard } from './components/Dashboard.jsx'
import PostGig from './components/PostGig.jsx'
import Chat from './components/Chat.jsx'
import ClientChat from './components/ClientChat.jsx'
import UserProvider from './context/UserContext.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import PaymentPage from './components/PaymentPage.jsx'
import PaymentSuccessPage from './components/PaymentSuccessPage.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path='/' element={<Layout />}>
      <Route index element={<App />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/register/freelancer' element={<FreelancerRegisterPage />} />
      <Route path='/register/client' element={<ClientRegisterPage />} />  
      <Route path='/login' element={<LoginPage />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/client/post-gig' element={<PostGig />} />
      <Route path='chat' element={<Chat />} />
      <Route path='chat/client' element={<ClientChat />} />     
      <Route path='pay/:contractId' element={<PaymentPage />} />
      <Route path='/paymentsuccess' element={<PaymentSuccessPage />}/>
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Contact />} />
    </Route>
    </>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>
)