import "./Product.css"
import { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, addToCartTHUNK } from "../../redux/cartReducer";
import { getCookie } from "../../cookies/cookieLogic";

import { WrapperContext } from "../WrapperComponent/Wrapper"

const Product = ({}) => {
    let [mainPhotoIndex, setMainPhotoIndex] = useState(0);
    let [quantity, setQuantity] = useState(1);
    let [remainingQuantity, setRemainingQuantity] = useState();
    let [maxQuantity, setMaxQuantity] = useState();
    let [product, setProduct] = useState({});
    let [isLoadingData, setIsLoadingData] = useState(true);
    let [errorMessage, setErrorMessage] = useState("Connecting to Server...");
    let [images, setImages] = useState([]);
    const [queryParameters] = useSearchParams();
    let id = queryParameters.get("id");
    let products = useSelector(state=>state.cart.products);
    const dispatch = useDispatch();
    const {isSignedIn, userType} = useContext(WrapperContext);

    let errorMessageZeroQuantity = "Unable to remove item - Cannot purchase 0 items"
    let errorMessageStock = `Unable to add item - There are ${product.quantity} units left in stock`
    let errorMessageQuantity = `Unable to add item - There are ${remainingQuantity} units available`

    /* Fetch the database for the information */
    useEffect(() => {
        if (isNaN(id)) { /* Stop user inputs that aren't numbers */
            setErrorMessage("The ID given is not a valid input");
            return;
        }

        /* Connect to the backend Node JS Server and retrieve the product info */
        const userInfoObj = {
            "id": id
        }
        const customHeaders = {
            "Content-Type": "application/json",
        }
        const url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/getProduct";
        fetch(url, {
            method: "POST",
            headers: customHeaders,
            body: JSON.stringify(userInfoObj),
        })
        .then((response) => response.json())
        .then((data) => {
            /* Check if undefined */
            if (data == undefined) {
                setErrorMessage("This product does not exist");
                return;
            }
            /* Set the data to the appropriate states */
            setErrorMessage("");
            setProduct(data);
            setIsLoadingData(false);
            let quantityInRedux = fetchQuantityInRedux(data.id)
            setMaxQuantity(data.quantity);
            setRemainingQuantity(data.quantity-quantityInRedux)
            if (images.length !== 0) { /* stop second mount */
                return;
            }
            loadImages(data);
        }).catch((e) => {
            /* Display the error */
            const errorMessage = e.constructor.name;
            if (errorMessage == "SyntaxError") {
                setErrorMessage("This Product Does Not Exist");
            } else if (errorMessage == "TypeError") {
                setErrorMessage("Failed to Connect to the Server");
            }
        });
    }, []);

    /* If Products changes (the redux), then see if the product still exists in redux. Update remaining quantity */
    useEffect(() => {
        let notFound = true;

        products?.map(item => {
            let itemId = item.id
            if (itemId != id) {
                return;
            }
            notFound = false;
            setRemainingQuantity(maxQuantity - item.quantity);
            return;
        })

        if (notFound) {
            setRemainingQuantity(maxQuantity)
        }
    }, [products])

    let fetchQuantityInRedux = (id) => {
        for (let i=0; i<products.length; i++) {
            let object = products[i];
            if (parseInt(object.id) == id) {
                return object.quantity;
            }
        }
        return 0;
    }

    let handleImageClick = (index) => {
        setMainPhotoIndex(index);
    }

    let displayQuantity = () => {
        /* If we hit the maximum units in the quantity then return 0 always */
        if (remainingQuantity == 0) {
            return 0;
        }
        return quantity;
    }

    let displayMainImage = () => {
        return images[mainPhotoIndex];
    }

    function displaySideImages() {
        return (
            images.map((url, i) => (
                <button onClick={() => {handleImageClick(i)}} id={i} key={i}><img src={images[i]} alt="" /></button>
            ))
        )
    }

    let updateCartQuantity = (update) => {
        let newNum = quantity + update;
        if (newNum > remainingQuantity) {
            setErrorMessage(errorMessageQuantity);
            return;
        }
        if (newNum < 1) {
            setErrorMessage(errorMessageZeroQuantity);
            return;
        }
        if (newNum > product.quantity) {
            setErrorMessage(errorMessageStock);
            return;
        }
        setErrorMessage("");
        setQuantity(newNum);
    }

    function arrayToJSONString(array) {
        let output = ``;
        const length = array.length;
        array.map((currentElement, index) => {
            output = output + `\"${currentElement}\"`;
            if (index != length-1) {
                output = output + `, `;
            }
        })
        return `[${output}]`;
    }

    let addItemsToCart = () => {
        if (remainingQuantity <= 0) {
            setErrorMessage(errorMessageQuantity);
            return;
        }
        if (product.quantity === 0) {
            setErrorMessage(errorMessageZeroQuantity);
            setQuantity(0);
            return;
        }
        /* If error message exists remove it */
        setErrorMessage("");
        /* Add to Cart */
        if (!isSignedIn) {
            console.log("Attempted to add to cart while not signed in")
            return;
        }
        let email = getCookie("email");

        /* Update redux */
        dispatch(addToCart({
            id: id,
            title: `\"${product.product_title}\"`,
            description: `\"${product.product_description}\"`,
            quantity: quantity,
            price: Number(product.price).toFixed(2),
            img: arrayToJSONString(images),
            email: email,
        }))

        /* Reset the quantity and reset the "Max number" of items available in the object*/
        product.quantity = product.quantity - quantity;
        setRemainingQuantity(remainingQuantity-quantity);
        if (remainingQuantity === 0) {
            setQuantity(0);
        } else {
            setQuantity(1);
        }
    }

    let loadImages = (data) => {
        if (data.img1 !== null) {
            images.push(data.img1)
        }
        if (data.img2 !== null) {
            images.push(data.img2)
        }
        if (data.img3 !== null) {
            images.push(data.img3)
        }
        if (data.img4 !== null) {
            images.push(data.img4)
        }
        if (data.img5 !== null) {
            images.push(data.img5)
        }
    }
    
    return ( 
        <section className="product-component" key={window.location.pathname}>
            {isLoadingData && <h1 id='loading'>{errorMessage}</h1>}
            {isLoadingData || 
            <aside id="images">
                <section id="photo-track">
                    {displaySideImages()}
                </section>
                <div id="main-image-container">
                    <img src={displayMainImage()} alt="" />
                </div>
            </aside>}
            {isLoadingData || 
            <section id="product-info">
                <h1 id="title">{product.product_title}</h1>
                <h1 id="price">${Number(product.price).toFixed(2)}</h1>
                <p id="description">{product.product_description}</p>
                {isSignedIn && (userType != "admin") && 
                <div id="quantity-and-error">
                    <div className="row">
                        <button id="left" className="noselect" onClick={() => {updateCartQuantity(-1);}}>-</button>
                        <span id="quantity">{displayQuantity()}</span>
                        <button id="right" className="noselect" onClick={() => {updateCartQuantity(1);}}>+</button>
                    </div>
                    <span id="error">{errorMessage}</span>
                </div>}
                {isSignedIn && (userType != "admin") && <button id="add-to-cart" onClick={() => {addItemsToCart()}}>Add To Cart</button>}
                <p id="product-type">Product Type: {product.category}</p>
                <p id="disclaimer">Disclaimer:<br></br>All data is retrieved automatically from the MySQL database via AWS RDS and Express JS<br></br>All images were generated with MidJourney AI and stored in a S3 bucket<br></br>All titles & product descriptions were generated with OpenAI<br></br>This product is a mock up and will not be sold for money.<br></br>All purchases are processed via Stripe's test mode and will not charge you.</p>
            </section>}
        </section>
    );
}
 
export default Product;