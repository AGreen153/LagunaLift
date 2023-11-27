import './main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { BrowserRouter as Router, Route, Routes} from "react-router-dom"
import { persistor, store } from "./redux/store"
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

/* Import Components */
import LandingPage from "../src/components/LandingPageComponent/LandingPage"
import NotFound from "../src/components/NotFoundComponent/NotFound"
import Services from "../src/components/ServicesComponent/Services"
import Facility from "../src/components/FacilityComponent/Facility"
import Merchandise from "../src/components/MerchandiseComponent/Merchandise"
import Product from "../src/components/ProductComponent/Product"
import Navbar from "../src/components/NavbarComponent/Navbar"
import Footer from "../src/components/FooterComponent/Footer"
import Login from "../src/components/LoginComponent/Login"
import CartMain from '../src/components/CartComponent/CartMain'
import CartMini from '../src/components/CartComponent/CartMini'
import Orders from '../src/components/OrdersComponent/Orders'
import AdminPanel from '../src/components/AdminComponent/AdminComponent'
import SuccessfulPurchase from '../src/components/SuccessfulPurchaseComponent/SuccessfulPurchase'
import Wrapper from './components/WrapperComponent/Wrapper'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Wrapper>
    <Provider store={store}>
      <PersistGate loading={"loading"} persistor={persistor}>
          <Router>
            <Navbar >
            </Navbar>
            <CartMini />
            <Routes>
              <Route exact path="/" element={<LandingPage />}></Route>
              <Route exact path="/Cart" element={<CartMain />}></Route>
              <Route exact path="/Services" element={<Services />}></Route>
              <Route exact path="/Facility" element={<Facility />}></Route>
              <Route exact path="/Merchandise" element={<Merchandise />}></Route>
              <Route path ="/p/?" element={<Product />} key={window.location.href}></Route>
              <Route path ="/SuccessfulPurchase?" element={<SuccessfulPurchase />} key={window.location.href}></Route>
              <Route exact path="/Login" element={<Login />}></Route>
              <Route exact path="/Orders" element={<Orders />}></Route>
              <Route exact path="/AdminPanel" element={<AdminPanel />}></Route>
              <Route path="*" element={<NotFound />}></Route>
            </Routes>
            <Footer />
          </Router>
      </PersistGate>
    </Provider>
    </Wrapper>
  </React.StrictMode>,
)
