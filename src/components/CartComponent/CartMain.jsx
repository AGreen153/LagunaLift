import './CartMain.css'
import { useEffect, useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeItem, resetCart, setItemQuantity } from '../../redux/cartReducer';
import { WrapperContext } from '../WrapperComponent/Wrapper';

export function total(productsCopy) {
    let total = 0;
    productsCopy?.forEach((item) => (total += item.quantity*item.price));
    return total.toFixed(2);
}

export const quantityCount = (productsCopy) => {
    let quantity = 0;
    productsCopy?.forEach((item) => (quantity += parseInt(item.quantity)))
    return quantity;
}

export function show10Plus(index, productsCopy) {
    /* Remove the other options and then add in the checkbox for them */
    let labelElement = document.getElementsByClassName(`changeQuantity-${index}`);
    let moreThan10Element = document.getElementsByClassName(`moreThan10-${index}`)
    let quantityElement = document.getElementsByClassName(`quantity-${index}`);
    if (labelElement && moreThan10Element && quantityElement) { /* If the dom has been loaded */
        
        for (let i=0; i< labelElement.length; i++) {
            let element = labelElement[i];
            element.style.display = "none";
        }

        for (let i=0; i< moreThan10Element.length; i++) {
            let element = moreThan10Element[i];
            element.style.display = "flex";
        }

        for (let i=0; i< quantityElement.length; i++) {
            let element = quantityElement[i];
            element.defaultValue = productsCopy[index].quantity;
        }

        /* CSS Styling, ensure the correct attributes are visible */
        let inputALLElementArray = document.getElementsByClassName(`quantity-${index}`);
        let moreThan10ALLElementArray = document.getElementsByClassName(`moreThan10-${index}`);
        for (let i=0; i<inputALLElementArray.length; i++) {
            inputALLElementArray[i].style.display = "block";
            moreThan10ALLElementArray[i].style.display = "flex";
        }
    }
    return;
}

export const inputArrayLogic = (e, index, inputArrayState) => {
    let newValue = e.target.value;
    let tempArray = [...inputArrayState];
    tempArray[index] = parseInt(newValue);
    return tempArray;
}

/* Using the products in the redux, send the list of items to the backend where it will be processed via stripe */
export function stripePayment(productsInput, email) {
    /* Iterate through the products redux, make the items array an array of objects [{id: 1, quantity: 3}, {id: 2, quantity: 1}]*/
    let items = [];

    /* This is a subscription payment - setup items appropriately */
    if (productsInput[0]?.subscription_type != undefined) {
        let object = {};
        object.subscription_type = productsInput.subscription_type
        items.push(productsInput[0])
    }

    /* This is a cart payment - setup items appropriately */
    if (productsInput[0]?.id != undefined) {
        productsInput?.map((item) => {
            let object = {};
            object.id = item.id
            object.quantity = item.quantity
            items.push(object);
        })

        if (total(productsInput) < 0.50) {
            console.log("Payment failed: Your cart must be $0.50 or greater")
            return;
        }
    }

    /* Send all the information to the backend server where it will be processed via Stripe */
    const url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/create-checkout-session";
    items.push(email);
    const customHeaders = {
        "Content-Type": "application/json",
    }
    fetch(url, {
        method: "POST",
        headers: customHeaders,
        body: JSON.stringify(items),
    }).then(async res => {
        if (res.ok) return res.json()

        /* If our return is not ok then make sure it fails*/
        return res.json().then(json => Promise.reject(json))
    }).then(({url}) => {
        /* The return from the server is a URL if it's successful so redirect the user */
        window.location = url;
    }).catch(e => {
        console.error(e.error)
    })
}

const CartMain = () => {
    let products = useSelector(state=>state.cart.products);
    let [productsCopy, setProductsCopy] = useState([])
    const dispatch = useDispatch();
    let [quantityValue, setQuantityValue] = useState([]);
    let [errorMessage, setErrorMessage] = useState("");
    // let [errorMessage, setErrorMessage] = useState("Your cart is empty");
    let [maxQuantity, setMaxQuantity] = useState([]);
    let [cartIsEmpty, setCartIsEmpty] = useState(true);
    let loadedOnce = false;
    const {isSignedIn, email, inputArrayState, setInputArrayState} = useContext(WrapperContext);
    
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

        /* Remove item from quantityValue */
        temp = [...quantityValue]
        temp.splice(index, 1);
        setQuantityValue([...temp]);

        /* If copyProducts is empty then change the dom*/
        if (productsCopy.length == 1) { // useState doesnt update until this finishes so check for 1 instead of 0
            hideCartAndCheckout(); 
            setCartIsEmpty(true);
        }
    }

    const submitChangeQuantity = (index, source) => {
        /* Ensure the user is actually logged in */
        if (!isSignedIn || email === null) {
            return false;
        }

        let inputElementArray = document.getElementsByClassName(`quantity-${index} ${source}`);
        let errorElementArray = document.getElementsByClassName(`error-${index} ${source}`);
        let reduxUpdated = false; /* To prevent multiple unnecessary dispatch calls */
        let newValue;
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

            /* Edit item in quantityValue */
            tempArray = [...quantityValue];
            tempArray[index] = value;
            setQuantityValue([...tempArray]);

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
            let index = productsCopy.findIndex(thisItem => thisItem.id === item.id)
            show10Plus(index, productsCopy);
            return;
        }

        /* Iterate through products, find that id and change quantity of it to the newquantity */
        let itemTemp = productsCopy.find(thisItem => thisItem.id === item.id)
        let index = productsCopy.findIndex(thisItem => thisItem.id === item.id)
        dispatch(setItemQuantity({
            id: itemTemp.id,
            quantity: parseInt(newQuantity),
            email: email,
        }))

        /* Update productsCopy */
        let tempItem = {...productsCopy[index]};
        let tempProductsArray = [...productsCopy];
        tempItem.quantity = newQuantity;
        tempProductsArray[index] = tempItem;
        setProductsCopy([...tempProductsArray])

        /* Update the Quantity useState */
        let tempArray = quantityValue;
        tempArray[index] = parseInt(newQuantity);
        setQuantityValue([...quantityValue]);

        /* Iterate through all the same types and ensure they have the same value changeQuantity- and quantity- */
        let inputALLElementArray = document.getElementsByClassName(`quantity-${index}`);
        let changeQuantityALLElementArray = document.getElementsByClassName(`changeQuantity-${index}`);
        for (let i=0; i<inputALLElementArray.length; i++) {
            inputALLElementArray[i].setAttribute('value', `${parseInt(newQuantity)}`);
            changeQuantityALLElementArray[i].value = parseInt(newQuantity);
        }
    }

    const fetchMaxQuantity = () => {
        if (loadedOnce) {
            return;
        }

        let mQuantity = null;

        /* Iterate through every item in products and update the maxQuantity array */
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
                let itemIndex = products.findIndex(thisItem => thisItem.id === item.id)
                let max = data.quantity;
                /* Put max at the end of setMaxQuantity */
                let tempArray = maxQuantity;
                tempArray[itemIndex] = parseInt(max);
                setQuantityValue([...tempArray]);
                setMaxQuantity([...maxQuantity, max])
            }).catch((e) => {
              /* Display the error */
              const errorMessage = e.constructor.name;
              console.log("An error occured in the CartReducer Redux:", errorMessage)
            });
        })
    }

    const displayOptions = (item) => {
        let max = maxQuantity[productsCopy?.findIndex(thisItem => thisItem.id === item.id)];
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

    let displayCart = () => {
        /* Create the main image array */
        let displayImageArray = [];
        productsCopy?.map((item) => {
            displayImageArray.push(JSON.parse(item.img)[0])
        })

        return (productsCopy?.map((item, index) => (
            <div className="item" key={item.id}>
                <img src={JSON.parse(item.img)[0]} alt="" />
                <div className="details">
                    <h1 id="title">{item.title.slice(1,-1)}</h1>
                    <p id="description">{item.description.slice(1,-1)}</p>
                    <h1 id="price">${item.price}</h1>
                    <div id="quantity">
                        <label htmlFor="quantity" className={`quantityLabel-${productsCopy.findIndex(thisItem => thisItem.id === item.id)}`}>Quantity:</label>
                        <select className={`fw-700 changeQuantity-${productsCopy.findIndex(thisItem => thisItem.id === item.id)}`} name='changeQuantity' value={products[productsCopy.findIndex(thisItem => thisItem.id === item.id)]?.quantity} onChange={(e) => {changeQuantity(item, e.target.value);}} key={item.id}>
                            {displayOptions(item)}
                        </select>
                        <div className={`moreThan10-${productsCopy.findIndex(thisItem => thisItem.id === item.id)} moreThan10Styling`} style={{display: "none"}}>
                            <input value={`${inputArrayState[index]}`} onInput={e => setInputArrayState(inputArrayLogic(e, index, inputArrayState))} className={`fw-700 quantity-${productsCopy.findIndex(thisItem => thisItem.id === item.id)} cartMain`} type="number" name="quantity" onClick={() => { document.getElementsByClassName(`quantity-${productsCopy.findIndex(thisItem => thisItem.id === item.id)} cartMain`)[0].style.outline = "unset"; document.getElementsByClassName(`error-${productsCopy.findIndex(thisItem => thisItem.id === item.id)} cartMain`)[0].innerHTML = "";}}/>
                            <button className='fw-700' onClick={() => {submitChangeQuantity(productsCopy.findIndex(thisItem => thisItem.id === item.id), "cartMain")}}>Submit</button>
                        </div>
                        <p className={`error error-${productsCopy.findIndex(thisItem => thisItem.id === item.id)} cartMain`}></p>
                    </div>
                    <button className='removeButton' onClick={() => {removeProduct(item)}}>Remove Item from cart</button>
                </div>
            </div>
        )))
    }

    const hideCartAndCheckout = () => {
        document.getElementById("cart").style.display = "none";
        document.getElementById("checkout").style.display = "none";
    }

    /* On page load, load the useState quantityValue with the products quantity so we can display that in the select's "value" */
    useEffect(() => {
        /* Set if products are empty or not */
        if (products.length != 0) {
            setCartIsEmpty(false)
        } else {
            setCartIsEmpty(true)
        }

        /* If products is empty then fetch it from the redux */
        if (loadedOnce) {
            return;
        }
        setProductsCopy([...products]);



        products?.map((item, index) => {
            setQuantityValue(quantityValue => [...quantityValue, parseInt(item.quantity)])
        })

        /* On page load gather the maximum quantity for every product for the dropdown and ensure that the user didn't mess with the maxQuantity */
        fetchMaxQuantity();


        loadedOnce = true;
    }, [products])
    
    useEffect(() => {
        /* Re render the cart whenever the quantityValue useState loads so the correct information is there */
        displayCart();
    }, [JSON.stringify(quantityValue)])

    /* If products changes from cartMini then update the productsCopy */
    useEffect(() => {
        if (!isSignedIn) {
            return;
        }
        setProductsCopy([...products]);
    }, [products])

    /* Update the error message based on login and cart status */
    useEffect(() => {
        if (isSignedIn == null || isSignedIn == false) {
            setErrorMessage("Please sign in")
        } else if (cartIsEmpty == true) {
            setErrorMessage("Your cart is empty")
        } else if (isSignedIn == true) {
            setErrorMessage("")
        }
    }, [cartIsEmpty, isSignedIn])

    return ( 
        <section className="cartmain-component">
            {(cartIsEmpty || isSignedIn) && <h1 id='loading'>{errorMessage}</h1>}
            {!cartIsEmpty && isSignedIn && <>
                <div id="cart">
                    <h1>Shopping Cart</h1>
                    <div id="links">
                        <a href="#" onClick={() => {dispatch(resetCart({"email": email})); hideCartAndCheckout(); setCartIsEmpty(true);}}>Reset Cart</a>
                    </div>
                    {displayCart()}
                </div> 
            </>}
            {!cartIsEmpty && isSignedIn && <>
                <div id="checkout">
                    <h1 id="total">Subtotal ({quantityCount(productsCopy)} items):<br /><strong>${total(productsCopy)}</strong></h1>
                    <button id='checkoutButton' onClick={() => {stripePayment(products, email);}}>Proceed to checkout</button>
                </div>
            </>}
            {!cartIsEmpty && isSignedIn && <p id="disclaimer">Disclaimer: All purchases are processed via Stripe's test mode and will not charge you.<br></br>For a successful purchase, use card number 4242 4242 4242 4242<br></br>For an unsuccessful purchase, use the back button on the top left of Stripe</p>}
        </section>
     );
}
 
export default CartMain;