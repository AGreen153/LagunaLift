import "./Orders.css"
import { useEffect, useContext, useState } from "react";
import { WrapperContext } from "../WrapperComponent/Wrapper";
import { getCookie } from "../../cookies/cookieLogic";


const OrdersComponent = () => {
    const {isSignedIn, email, setUserSubscriptionType} = useContext(WrapperContext);
    let [errorMessage, setErrorMessage] = useState(false);
    let [isLoaded, setIsLoaded] = useState(false);
    let [orders, setOrders] = useState(undefined);
    let [subscription, setSubscription] = useState(false)
    let [status, setStatus] = useState(null)


    /* On Signout OR if the user is not logged in then redirect them to the mainpage */
    useEffect(() => {
        if (!isLoaded || isSignedIn == undefined) {
            setIsLoaded(true);
            return;
        }

        if (!isSignedIn) {
            setErrorMessage("You are not logged in, redirecting in 5 seconds")
        }
    }, [isSignedIn, isLoaded])

    useEffect(() => {
        /* Check for first Load so it doesnt mess up */
        if (!isLoaded || isSignedIn == undefined) {
            setIsLoaded(true);
            return;
        }

        /* Whenever isSigned in changes, fetch the orders from the backend server - send the email */
        let url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/fetch-orders";
        const customHeaders = {
            "Content-Type": "application/json",
        }

        let bodyObj = {email: email}
        fetch(url, {
            method: "POST",
            headers: customHeaders,
            body: JSON.stringify(bodyObj),
        })
        .then(async res => {
            if (res.ok) return res.json()
    
            /* If our return is not ok then make sure it fails*/
            return res.json().then(json => Promise.reject(json))
        }).then((res) => {
            /* The return from the server is a URL if it's successful so redirect the user */
            let isSuccessful = res.isSuccessful
            if (!isSuccessful) {
                return;
            }

            let orders = JSON.parse(JSON.parse(res.orders))

            if (orders == null) {

            }
            setOrders(orders)
        })
        .catch(e => {
            console.error(e.error)
        })
    }, [isSignedIn, isLoaded])

    /* Fetch the most up to date userSubscriptionStatus and update it  */
    useEffect(() => {
        if ( (isSignedIn == false) || (isSignedIn == null) ) {
            return;
        }

        let url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/fetch-subscription";
        let bodyObj = {email: email}
        bodyObj.session_id = getCookie("sessionID");
        const customHeaders = {
            "Content-Type": "application/json",
        }
        fetch(url, {
            method: "POST",
            headers: customHeaders,
            body: JSON.stringify(bodyObj),
        })
        .then(async res => {
            if (res.ok) return res.json()
    
            /* If our return is not ok then make sure it fails*/
            return res.json().then(json => Promise.reject(json))
        }).then((res) => {
            /* The return from the server is a URL if it's successful so redirect the user */
            let isSuccessful = res.isSuccessful
            if (!isSuccessful) {
                return;
            }

            if (res.subscription_type <= 0 || res.subscription_type > 3) {
                console.log("Invalid subscriptiontype found")
                return;
            }
            setSubscription(JSON.parse(JSON.parse(res.subscription)))
        })
        .catch(e => {
            console.error("An error occured: ", e.error)
        })

    }, [isSignedIn])

    const displaySubscriptionName = (subType) => {
        switch (subType) {
            case 1:
                return "Comfort Pass"
            case 2:
                return "Premium Pass"
            case 3:
                return "All In Pass"
            default:
                return;
        }
    }

    const displayOrders = () => {
        if (orders == undefined) {
            return (
                <>{isLoaded && isSignedIn && <h2>You have no previous orders.</h2>}</>
            );
        }
        
        return (
            orders.map((order, index) => (
                <>
                {isSignedIn && 
                <div className="order" id={`order-${index}`} key={index}>
                    <div id="stats">
                        <div id="details">
                            <time>{`Order Placed: ${new Date(order.info.date)}`}</time>
                            <p>Total price: ${totalPrice(order.items)}</p>
                        </div>
                    </div>
                    {
                    order.items.map((item, index) => (
                        <div className="item">
                            <img src={item.photo} alt="" />
                            <div className="details" key={index}>
                                <h1>{item.product_title}</h1>
                                <p>Quantity: {item.quantity}</p>
                                <p>Price: ${item.quantity*item.price}</p>
                            </div>
                        </div>     
                    ))
                    }
                    <p id="orderNumber">Order ID: {order.info.session_id}</p>
                </div>}
                </>     
            ))

        );
    }

    const resetSubscription = () => {
        let url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/reset-subscription";
        const customHeaders = {
            "Content-Type": "application/json",
        }
        let bodyObj = {email: email}
        fetch(url, {
            method: "POST",
            headers: customHeaders,
            body: JSON.stringify(bodyObj),
        })
        .then(async res => {
            if (res.ok) return res.json()
    
            /* If our return is not ok then make sure it fails*/
            return res.json().then(json => Promise.reject(json))
        }).then((res) => {
            /* The return from the server is a URL if it's successful so redirect the user */
            let isSuccessful = res.isSuccessful
            if (!isSuccessful) {
                return;
            }

            setStatus("Successfully Reset Subscription! Changes will take effect in 5 seconds")
            setTimeout(() => {
                setSubscription(false)
                setUserSubscriptionType(null)
            }, 5000)

        })
        .catch(e => {
            console.error(e.error)
        })
    }

    function totalPrice(products) {
        let total = 0;
        products?.forEach((item) => (total += item.quantity*item.price));
        return total.toFixed(2);
    };

    return ( 
        <section className="orders-component">
            {!isSignedIn && <h1 id="error">You are not signed in. Please sign in using the navbar</h1>}
            {isSignedIn && (subscription != false) && <>
                <h1 id="title">Subscription Status:</h1>
                <div style={{marginBottom: "1em", textAlignLast: "center"}} className="order">
                <p>{`Subscription Name: ${displaySubscriptionName(subscription?.subscription_type)}`}</p>
                <p>{`Purchase Date: ${new Date(subscription?.purchase_date)}`}</p>
                <p>{`Expiration Date: ${new Date(subscription?.expiration_date)}`}</p>
                <button onClick={() => {resetSubscription()}} style={{backgroundColor: "var(--color-blue-4)", outline: "unset", marginTop: "0.5em", padding: "0.5em", borderRadius: "25px", color: "white", border: "2px solid black", cursor: "pointer"}}>Reset Subscription Status</button>
                <p>{status}</p>
                </div>
            </>}
            {isSignedIn && <>
                <h1 id="title">Order History:</h1>
            </>}
            <div id="orders">
                {displayOrders()}
            </div>
        </section>
     );
}
 
export default OrdersComponent;