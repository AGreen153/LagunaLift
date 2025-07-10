import './SuccessfulPurchase.css'
import { useSearchParams } from 'react-router-dom';
import { useEffect, useContext, useState } from 'react';
import { WrapperContext } from '../WrapperComponent/Wrapper';
import { useDispatch } from 'react-redux';
import { resetCart } from '../../redux/cartReducer';
import { useNavigate } from 'react-router-dom';


const SucessfulPurchase = () => {
    const [queryParameters] = useSearchParams();
    let session_id = queryParameters.get("session_id");
    const {isSignedIn, email} = useContext(WrapperContext);
    let [loadedOnce, setLoadedOnce] = useState(false)
    let [message, setMessage] = useState("Processing your payment...")
    const dispatch = useDispatch();

    const navigate = useNavigate();

    useEffect(() => {
        if (!loadedOnce) {
            setLoadedOnce(true);
            return;
        }
        
        /* Double check that the user is indeed signed in properly and hasnt manipulated any data */
        if (!isSignedIn) {
            setMessage("Sign In Validation failed redirecting...")
            setTimeout(() => {
                if (!window.location.pathname.includes("/SuccessfulPurchase")) {
                    return;
                }
                navigate("/")
            }, 1000);
            return;
        }

        /* Send the email and session_id to the backend where it will be evaluated. 
            - the orders array for that email will be updated
            - the products quantity will be updated 
        */
        const url = import.meta.env.VITE_BACKEND_URL + "/evaluate-stripe-sessionID";
        let bodyObj = {email: email, session_id: session_id}
        const customHeaders = {
            "Content-Type": "application/json",
        }

        fetch(url, {
            method: "POST",
            headers: customHeaders,
            body: JSON.stringify(bodyObj),
        }).then(async res => {
            if (res.ok) return res.json()
    
            /* If our return is not ok then make sure it fails*/
            return res.json().then(json => Promise.reject(json))
        }).then(({isSuccessful, error}) => {
            /* The return from the server is a URL if it's successful so redirect the user */
            if (isSuccessful == false) {
                setMessage(`Failure - ${error}`)
            } else {
                setMessage("Success!")
                /* Reset the redux state */
                dispatch(resetCart({"email": email}))
            }

            // /* Redirect the user to the Orders component */
            // setTimeout(() => {
            //     if (!window.location.pathname.includes("/SuccessfulPurchase")) {
            //         return;
            //     }
            //     navigate("/Orders")
            // }, 1000);
        }).catch(e => {
            setMessage(e)
            console.log(e)
            console.error(e.error)
        })
        
    }, [isSignedIn, email])

    useEffect(() => {
        if (message === "Success!") {
            const timeout = setTimeout(() => {
            if (window.location.pathname.includes("/SuccessfulPurchase")) {
                navigate("/Orders");
            }
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [message]);

    return ( 
        <section className="successful-purchase-component">
            <h1>{message}</h1>
        </section>
     );
}
 
export default SucessfulPurchase;