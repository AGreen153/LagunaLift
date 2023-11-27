import './CartMini.css'
import React, { useContext, useEffect, useState, useRef } from "react";
import { deleteCookie } from '../../cookies/cookieLogic';
import { WrapperContext } from "../WrapperComponent/Wrapper";
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { total, quantityCount, show10Plus, inputArrayLogic } from './CartMain';
import { removeItem, resetCart, setItemQuantity, setState } from '../../redux/cartReducer';
import { useDispatch } from "react-redux";

const CartMini = () => {
    /* Fetch Global States */
    const {cartHovered, email, inputArrayState, isSignedIn, navbarHovered, profileHovered, setInputArrayState, setIsSignedIn, setNavbarHovered, setUserSubscriptionType, setUserType} = useContext(WrapperContext);
    /* Local States Needed */
    let cartMiniElement = document.getElementsByClassName("cartMini-component")[0];
    let [isLoaded, setIsLoaded] = useState(false) 
    let [cartTransition, setCartTransition] = useState(false) /* A variable needed to track the transition from cart to  */
    let [isMouseOverCart, setIsMouseOverCart] = useState(false);
    let [optionsShown, setOptionsShown] = useState(false);
    /* States needed for dropdown menu */
    let [productsCopy, setProductsCopy] = useState([])
    let [maxQuantity, setMaxQuantity] = useState([]);
    let [cartIsEmpty, setCartIsEmpty] = useState(true);
    let [oldCartLength, setOldCartLength] = useState() /* If this variable changes, then fetch the products again */
    const dispatch = useDispatch();

    /* Load the Products from the redux */
    let products = useSelector(state=>state.cart.products);

    /* Change the display to none or block depending on cartHovered and mouse location */
    useEffect(() => {
        if (!isLoaded) { setIsLoaded(true); setOldCartLength(products.length); return;}
        let displayValue = window.getComputedStyle(cartMiniElement, null).display;

        /* Set the height and positioning since it's relative to the Navbar */
        let navbarElement = document.getElementsByClassName("navbar-component")[0];
        let navbarHeight = navbarElement.offsetHeight;
        cartMiniElement.style.top =  `${navbarHeight}px`
        
        if (cartHovered == true) {
            setCartTransition(true);
        }
        
        /* If the user mouses over another link then close the module */
        if ((window.innerWidth <= 1240) || navbarHovered != "cart" && navbarHovered != false) {
            cartMiniElement.style.display = "none"
            return;
        }

        /* Display or hide the element based on checks */
        if ( optionsShown == true || cartHovered == true || (cartTransition == true) || (displayValue == "block" && isMouseOverCart)) {
            cartMiniElement.style.display = "block"
        } else {
            cartMiniElement.style.display = "none"
        }
    }, [cartHovered, isMouseOverCart, cartTransition, navbarHovered, optionsShown])

    /* If the navbarHovered becomes false then navbarTransition = false too */
    useEffect(() => {
        if (!isLoaded) {return;}
        
        if (navbarHovered == false) {
            setCartTransition(false);
        }
    }, [navbarHovered])

    let changeQuantity = (item, newQuantity) => {
        if (!isSignedIn || email === null) {
            console.log("You are not signed in OR email is null")
            return false;
        }
        if (parseInt(newQuantity) === 0) {
            removeProduct(item)
            return;
        }

        if (parseInt(newQuantity) === 10) {
            /* Remove the other options and then add in the checkbox for them */
            let index = products.findIndex(thisItem => thisItem.id === item.id)
            show10Plus(index, productsCopy);
            return;
        }

        /* Iterate through products, find that id and change quantity of it to the newquantity */
        let itemTemp = products.find(thisItem => thisItem.id === item.id)
        let index = products.findIndex(thisItem => thisItem.id === item.id)
        dispatch(setItemQuantity({
            id: itemTemp.id,
            quantity: parseInt(newQuantity),
            email: email,
        }))

        /* Update productsCopy so it's up to date */
        let tempItem = {...productsCopy[index]};
        let tempProductsArray = [...productsCopy];
        tempItem.quantity = newQuantity;
        tempProductsArray[index] = tempItem;
        setProductsCopy([...tempProductsArray])
    }

    let removeProduct = (item) => {
        if (!isSignedIn || email === null) {
            console.log("You are not signed in OR email is null")
            return false;
        }
        
        let index = productsCopy.findIndex(thisItem => thisItem.id === item.id)
        let temp = [];
        let id = item.id;
        
        /* Remove item from redux */
        dispatch(removeItem(id));
        dispatch(removeItem({
            "id": id,
            "email": email,
        }));

        /* Remove item from productsCopy */
        temp = [...productsCopy]
        temp.splice(index, 1);
        setProductsCopy([...temp]);
        

        /* Remove item from maxQuantity */
        temp = [...maxQuantity]
        temp.splice(index, 1);
        setMaxQuantity([...temp]);

        /* Decrease oldCartLength by 1 so another call isn't made*/
        setOldCartLength(oldCartLength-1);

        /* If copyProducts is empty then change the dom - check for 1 because useState doesnt update until this finishes */
        if (productsCopy.length == 1) {
            setCartIsEmpty(true);
        }
    }

    

    const displayOptions = (item) => {
        let max = maxQuantity[products?.findIndex(thisItem => thisItem.id === item.id)];
        let quantity = item.quantity

        if (quantity >= 10) {
            let index = productsCopy.findIndex(thisItem => thisItem.id === item.id)
            show10Plus(index, productsCopy);
            return;
        }

        /* Depending on how many options exist for maxQuantity, display the appropriate number of options */
        switch (max) {
            case 1:
                return (<><option value="0">0 (Delete)</option><option value="1">1</option></>)
            case 2:
                return (<><option value="0">0 (Delete)</option><option value="1">1</option><option value="2">2</option></>)
            case 3:
                return (<><option value="0">0 (Delete)</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></>)
            case 4:
                return (<><option value="0">0 (Delete)</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></>)
            case 5:
                return (<><option value="0">0 (Delete)</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></>)
            case 6:
                return (<><option value="0">0 (Delete)</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option></>)
            case 7:
                return (<><option value="0">0 (Delete)</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option></>)
            case 8:
                return (<><option value="0">0 (Delete)</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option></>)
            case 9:
                return (<><option value="0">0 (Delete)</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option></>)
            default:
                return (<><option value="0">0 (Delete)</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10+</option></>)
        }
    }

    const submitChangeQuantity = (index, source) => {
        /* Ensure the user is actually logged in */
        if (!isSignedIn || email === null) {
            console.log("You are not signed in OR email is null")
            return false;
        }

        let inputElementArray = document.getElementsByClassName(`quantity-${index} ${source}`);
        let errorElementArray = document.getElementsByClassName(`error-${index} ${source}`);
        let reduxUpdated = false; /* To prevent multiple unnecessary dispatch calls */
        let newValue;

        /* Iterate through every user input and ensure it's a valid input */
        for (let i=0; i<inputElementArray.length; i++) {
            let inputElement = inputElementArray[i];
            let errorElement = errorElementArray[i];
            errorElement.style.color = "red";
        
            let value = parseInt(inputElement.value);
            
            let maxItems = maxQuantity[index];
            let tempArray = [];
            let tempJSON = {};

            /* Reset the error if there was an error */
            errorElement.innerHTML = "";


            /* Error checks */
            if (value <= 0) {
                errorElement.innerHTML = "Please enter a number greater than 0";
                return;
            }
            if (value > maxItems) {
                errorElement.innerHTML = `Unable to add to cart: There are only ${maxQuantity[index]} items in stock`;
                return;
            }
            
            /* Edit item in redux */
            if (!reduxUpdated) {
                dispatch(setItemQuantity({
                    id: productsCopy[index].id,
                    quantity: parseInt(value),
                    email: email,
                }))
                reduxUpdated = true;
            }

            /* Edit item in productsCopy */
            tempArray = [...productsCopy];
            tempJSON = {...tempArray[index]}
            tempJSON.quantity = value;
            tempArray[index] = tempJSON;
            setProductsCopy([...tempArray]);

            /* Unhide all the CSS */
            if (value >= 10) {
                /* Make it green so the user knows it was submitted */
                errorElement.style.color = "springgreen";
                errorElement.innerHTML = "Success!";
                inputElement.style.outline = "1px solid springgreen"

                return;
            }

            /* Reshow the original values */    
            document.getElementsByClassName(`quantityLabel-${index}`)[i].style.display = "block"
            document.getElementsByClassName(`changeQuantity-${index}`)[i].style.display = "block"
            document.getElementsByClassName(`moreThan10-${index}`)[i].style.display = "none"
        }

        /* Change the styling of ALL the elements so it's back to normal */
        let inputALLElementArray = document.getElementsByClassName(`quantity-${index}`);
        let changeQuantityALLElementArray = document.getElementsByClassName(`changeQuantity-${index}`);
        let moreThan10ALLElementArray = document.getElementsByClassName(`moreThan10-${index}`);
        if (newValue <= 10) {
            /* CSS: Hide the quantity- and moreThan10- and show the changeQuantity- */
            for (let j=0; j<inputALLElementArray.length; j++) {
                inputALLElementArray[j].style.display = "block";
                changeQuantityALLElementArray[j].style.display = "none"
                moreThan10ALLElementArray[j].style.display = "flex"
            }
        } else {
            /* CSS: Hide the changeQuantity- and show the quantity- and moreThan10- */
            for (let j=0; j<inputALLElementArray.length; j++) {
                inputALLElementArray[j].style.display = "none";
                moreThan10ALLElementArray[j].style.display = "none"
                changeQuantityALLElementArray[j].style.display = "block"
            }
        }
    }

    const fetchMaxQuantity = () => {
        if (!isLoaded) {
            return;
        }

        /* Iterate through every product and get the maxQuantity */
        let mQuantity = null;
        products?.map((item, index) => {
            const customHeaders = {
                "Content-Type": "application/json",
            }
            const bodyObj = {
                "id": item.id
            }
            const url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/getProduct";
            fetch(url, {
                method: "POST",
                headers: customHeaders,
                body: JSON.stringify(bodyObj),
            })
            .then((response) => response.json())
            .then((data) => {
                /* Get the max quantity from the data -> Get the index and item in products -> Edit that item -> Replace that item in products */
                mQuantity = data.quantity;
                let itemCopy = products.find(thisItem => thisItem.id === item.id)
                let itemIndex = products.findIndex(thisItem => thisItem.id === item.id)
                let max = data.quantity;
                
                /* Put max at the end of setMaxQuantity */
                let tempArray = maxQuantity;
                tempArray[itemIndex] = parseInt(max);
                setMaxQuantity([...maxQuantity])

            }).catch((e) => {
              /* Display the error */
              const errorMessage = e.constructor.name;
              console.log("An error CartMini fetchMaxQuantity() occured:", errorMessage)
            });
        })
    }

    let displayCart = () => {
        return (products?.forEach((item, index) => (
            <div className="item" key={index} id=''>
            <img src={JSON.parse(item.img)[0]} alt="" />
            <div className="details">
                <Link to={`/p/?id=${item.id}`} className="productLink" key={item.id} onClick={() => {sleep(50).then(() => {window.location.reload()})}}><h1 id="title">{item.title.slice(1,-1)}</h1></Link>
                <div id="quantity">
                    <label htmlFor="quantity" id={`quantityLabel-${index}`}>Quantity:</label>
                    <select className='fw-700' name='changeQuantity' id={`changeQuantity-${products?.findIndex(thisItem => thisItem.id === item.id)}`} value={products.findIndex(thisItem => thisItem.id === item.id).quantity} onChange={(e) => {changeQuantity(item, e.target.value);}} key={item.id}>
                        {displayOptions(item)} 
                    </select>
                </div>
                <h2 id="price">${item.price}</h2>
            </div>
            </div>
        )))
    }

    /* On page load OR if the redux changes, update the productsCopy state for the dropdown menu */
    useEffect(() => {
        if (products.length != 0) {
            setCartIsEmpty(false);
        }

        if (products.length == 0) {
            return;
        }

        /* Update maxQuantity array if Products.length*/
        if (products.length != oldCartLength) {
            let item = products?.at(-1);
            const customHeaders = {
                "Content-Type": "application/json",
            }
            const bodyObj = {
                "id": item.id
            }
            const url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/getProduct";
            fetch(url, {
                method: "POST",
                headers: customHeaders,
                body: JSON.stringify(bodyObj),
            })
            .then((response) => response.json())
            .then((data) => {
                let max = data.quantity;
                setMaxQuantity([...maxQuantity, max])
            }).catch((e) => {
              /* Display the error */
              const errorMessage = e.constructor.name;
              console.log("An error occured in the CartReducer Redux:", errorMessage)
            });
        }

        setOldCartLength(products.length)
        setProductsCopy([...products]);
    }, [products])

    /* Re render the cart whenever productsCopy changes so it's up to date */
    useEffect(() => {
        /* All of this was uncommented out, I don't see the point in this tbh so might not be needed */
        if (!isSignedIn) {
            return;
        }
        displayCart();
    }, [productsCopy]) 

    /* If the user signs in for the first time, fetch the maxQuantity */
    useEffect(() => {
        if (!isSignedIn) {
            return;
        }
        fetchMaxQuantity();
    }, [isSignedIn])

    /* Navigate needed for redirecting */
    const navigate = useNavigate(); 
    const routeChange = (path) =>{ 
        navigate(path);
    }

    return ( 
        <section className="cartMini-component" onMouseEnter={() => {setIsMouseOverCart(true)}} onMouseLeave={() => {setIsMouseOverCart(false);}}>
            {products.length==0 && <>{"The cart is empty"}</>}
            {products.length!=0 && products?.map((item, index) => (
                <div className="item" key={index}>
                    <img src={JSON.parse(item.img)[0]} alt="" />
                    <div className="details">
                        <Link to={ `/p/?id=${item.id}`} className="productLink" key={item.id} onClick={() => {sleep(50).then(() => {window.location.reload()})}}><h1 id="title">{item.title.slice(1,-1)}</h1></Link>
                        <div id="quantity">
                            <label htmlFor="quantity" className={`quantityLabel-${index}`}>Quantity:</label>
                            <select className={`fw-700 changeQuantity-${index}`} id={`changeQuantity-${index}`} onFocus={() => {setOptionsShown(true)}} onBlur={() => {setOptionsShown(false)}} onMouseEnter={() => {setIsMouseOverCart(true)}}  style={{display: "block"}} name='changeQuantity' value={products[products.findIndex(thisItem => thisItem.id === item.id)].quantity} onChange={(e) => {changeQuantity(item, e.target.value); document.getElementById(`changeQuantity-${index}`).blur(); if(e.target.value == 0 && products.length == 1){setIsMouseOverCart(false)};}} key={item.id}>
                                {displayOptions(item)} 
                            </select>
                            <div className={`moreThan10-${index}`} style={{display: "none"}}>
                                <input value={`${inputArrayState[index]}`} onInput={e => setInputArrayState(inputArrayLogic(e, index, inputArrayState))} className={`fw-700 quantity-${index} cartMini`} type="number" name="quantity" onClick={() => {document.getElementsByClassName(`quantity-${products.findIndex(thisItem => thisItem.id === item.id)} cartMini`)[0].style.outline = "unset"; document.getElementsByClassName(`error-${products.findIndex(thisItem => thisItem.id === item.id)}`)[0].innerHTML = "";}} />
                                <button className='fw-700' onClick={() => {submitChangeQuantity(productsCopy.findIndex(thisItem => thisItem.id === item.id), "cartMini")}}>Submit</button>
                            </div>
                        </div>
                        <p className={`error error-${index} cartMini`}></p>
                        <h2 id="price">${item.price}</h2>
                    </div>
                </div>
            ))}
            <div className="signoutStyling">
                {<button id="cart" className='noselect' onClick={() => {routeChange("/Cart")}}>Cart</button>}
                {<button id="orders" className='noselect' onClick={() => {routeChange("/Orders")}}>Orders</button>}
                <button id='signout' className='noselect' onClick={() => { deleteCookie("email"); deleteCookie("sessionID"); setIsSignedIn(false); setUserSubscriptionType(null); setUserType(null); setNavbarHovered("signout")}}>Sign out</button>
            </div>
        </section>
     );
}
 
export default CartMini;