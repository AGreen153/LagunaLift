import './Navbar.css'
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getCookie, deleteCookie } from '../../cookies/cookieLogic';
import { useSelector } from 'react-redux';

import imgCart from '../../assets/cart-shopping-fast-svgrepo-com.svg'
import { WrapperContext } from "../WrapperComponent/Wrapper"

const Navbar = () => {

    /* Import global states from useContext from Wrapper.jsx */
    const {userType, setUserType, userSubscriptionType, setUserSubscriptionType, isSignedIn, setIsSignedIn, setEmail, setCartHovered, setNavbarHovered, setInputArrayState} = useContext(WrapperContext);
    let [windowWidth, setWindowWidth] = useState(window.innerWidth);
    let quantity = useSelector(state=>state.cart.products.length)
    let products = useSelector(state=>state.cart.products);

    /* Close the mobile navbar dropdown if the user selects a link */
    let closeDropdown = () => {
        let checkboxToggle = document.getElementById("checkbox_toggle");
        checkboxToggle.checked = false;
    }

    /*  Whenever the navbar is first loaded, we will check if the user is logged in.
        If the user is logged in then we will do a fetch request from the backend based on their session token to retrieve their email and pass that property to the main
        If they are not logged in, nothing will happen until they log in then the request will happen because the useEffect (nameHere) will be changed causing this to re-render
    */
    useEffect(() => {
        /* If there's no cookies then stop */
        if ((userSubscriptionType == null) && (getCookie("sessionID") == null || getCookie("email") == null)) {
            return;
        }

        /* Validate credentials */
        if (!isSignedIn) {
            const customHeaders = {
                "Content-Type": "application/json",
            }
            const bodyObj = {
                "sessionID": getCookie("sessionID"),
                "email": getCookie("email")
            }
            const url = import.meta.env.VITE_BACKEND_URL + "/isEmailSessionIDValid";
            fetch(url, {
                method: "POST",
                headers: customHeaders,
                body: JSON.stringify(bodyObj),
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.isSuccessful == false) {
                    setIsSignedIn(false)
                    setUserSubscriptionType(null)
                    setUserType(null)
                    return;
                }
                /* Update states with up to date info */
                setUserType(data.role)
                setUserSubscriptionType({"id": Number(data.subscription), "expiration": new Date(data.subscriptionExpiration)})
                setIsSignedIn(true)
                setEmail(getCookie("email"))
            }).catch((e) => {
                setIsSignedIn(false)
                setUserSubscriptionType(null)
                setUserType(null)
            });
        }
    }, [isSignedIn, userSubscriptionType])

    /* Whenever products changes, update the prop inputArrayState */
    useEffect(() => {
        let tempArray = [];
        products?.map((item, index) => {
            tempArray.push(parseInt(item.quantity))
        })
        setInputArrayState(tempArray);
    }, [products])

    /* On a window size change, update the useState windowWidth */
    window.onresize = updateWindowWidth
    function updateWindowWidth() {
        setWindowWidth(window.innerWidth);
    }

    return ( 
        <section className="navbar-component" onMouseEnter={() => {setNavbarHovered(true)}} onMouseLeave={() => {setNavbarHovered(false)}}>
            <Link to="/" id="logo">
                <h1>Laguna</h1>
                <h1>Lift</h1>
            </Link>
            <input type="checkbox" id="checkbox_toggle" />
            <label htmlFor="checkbox_toggle" className="hamburger">&#8801;</label>
            <div className="links">
                <Link to="/Services" onClick={() => {closeDropdown(); document.documentElement.scrollTop = 0;}} onMouseEnter={() => {setNavbarHovered("services")}}>Services</Link>
                <Link to="/Facility" onClick={() => {closeDropdown(); document.documentElement.scrollTop = 0;}} onMouseEnter={() => {setNavbarHovered("facility")}}>Facility</Link>
                <Link to="/Merchandise" onClick={() => {closeDropdown(); document.documentElement.scrollTop = 0;}} onMouseEnter={() => {setNavbarHovered("merchandise")}}>Merchandise</Link>
                {!isSignedIn && <Link to="/Login" onClick={() => {closeDropdown(); document.documentElement.scrollTop = 0;}} onMouseEnter={() => {setNavbarHovered("joinnow")}}>Join Now</Link>}
                {isSignedIn && (userType == "admin") &&
                    <Link to="/AdminPanel" onClick={() => {closeDropdown(); document.documentElement.scrollTop = 0;}} onMouseEnter={() => {setNavbarHovered("admin")}}>Admin Panel</Link>
                }
                {(windowWidth >= 1240) && isSignedIn && (userType == "admin") &&
                    <a href='#' onClick={() => { deleteCookie("email"); deleteCookie("sessionID"); setIsSignedIn(false); setNavbarHovered("signout")}} >Sign out</a>
                }
                {(windowWidth >= 1240) && isSignedIn && (userType == "user") &&
                    <Link to="/Cart" onClick={() => {closeDropdown(); document.documentElement.scrollTop = 0;}} onMouseEnter={() => {setCartHovered(true); setNavbarHovered("cart")}} onMouseLeave={() => {setCartHovered(false)}}>
                        <section className='flexRow'>
                            <img id='imgCart' src={imgCart}>
                            </img>
                            <p className='noselect'>{quantity}</p>
                        </section>
                    </Link>
                }
                {(windowWidth <= 1240) && isSignedIn && (userType == "user") &&
                    <Link to="/Cart" onClick={() => {closeDropdown(); document.documentElement.scrollTop = 0;}}>Cart</Link>
                }
                {(windowWidth <= 1240) && isSignedIn && (userType == "user") &&
                    <Link to="/Orders" onClick={() => {closeDropdown(); document.documentElement.scrollTop = 0;}}>Orders</Link>
                }
                {(windowWidth <= 1240) && isSignedIn && 
                    <a href='#' onClick={() => { deleteCookie("email"); deleteCookie("sessionID"); setIsSignedIn(false); setNavbarHovered("signout")}} >Sign out</a>
                }
            </div>
        </section>
     );
}
 
export default Navbar;