import './AdminComponent.css'
import { useContext, useEffect, useState } from 'react';
import { WrapperContext } from '../WrapperComponent/Wrapper';
import { getCookie } from '../../cookies/cookieLogic';

import imgLoadFail1 from "../../assets/img1Fail.png"
import imgLoadFail2 from "../../assets/img2Fail.png"
import imgLoadFail3 from "../../assets/img3Fail.png"
import imgLoadFail4 from "../../assets/img4Fail.png"
import imgLoadFail5 from "../../assets/img5Fail.png"
import imgLoadFailGeneral from "../../assets/imgFailGeneral.png"

const AdminComponent = () => {
    const {userType, email} = useContext(WrapperContext);
    let [checkedSidebar, setCheckedSidebar] = useState(null);
    let [products, setProducts] = useState(null);
    let [itemToDisplay, setItemToDisplay] = useState(null);
    let [itemInfo, setItemInfo] = useState(null)
    let [isLoaded, setIsLoaded] = useState(false)
    let [URLErrorExists, setURLErrorExists] = useState(null)
    let [recentlySoldRows, setRecentlySoldRows] = useState(null)
    let [messageError, setMessageError] = useState("")
    let [messageSuccess, setMessageSuccess] = useState("")
    let imgFailArray = [imgLoadFail1, imgLoadFail2, imgLoadFail3, imgLoadFail4, imgLoadFail5, imgLoadFailGeneral]

    function updateCheckedSidebar() {
        setCheckedSidebar(document.querySelector('input[name="adminOptions"]:checked'))
    }

    // Fetch Orders from db if credentials are met
    useEffect(() => {
        if (!isLoaded) {
            setIsLoaded(true)
            return
        }
        if (userType != "admin") {
            return;
        }

        /* Fetch the orders from the database if it's not fetched */
        if (recentlySoldRows == null) {
            const customHeaders = {
                "Content-Type": "application/json",
            }
            const userInfoObj = {
                "email": email,
                "session_id": getCookie("sessionID"),
            }
            const url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/admin-fetch-orders";
            fetch(url, {
                method: "POST",
                headers: customHeaders,
                body: JSON.stringify(userInfoObj),
            })
            .then((response) => response.json())
            .then((data) => {
                setRecentlySoldRows(data.orders)
            }).catch((e) => {
                /* Display the error */
                const errorMessage = e.constructor.name;
                console.log(`Error Found in AdminComponent: ${errorMessage}`)
            });
        }
    }, [recentlySoldRows, checkedSidebar])

    let fetchRecentlySoldRows =() => {
        /* Render the recently sold completed items */
        return (
            <tbody>
                {recentlySoldRows?.map((order, index) => (
                    <tr key={index}>
                        <td>{order?.time}</td>
                        <td>{order?.session_id}</td>
                        <td>{order?.email}</td>
                        <td>{order?.status}</td>
                        <td>
                            <>            
                                {/* Cart Items */}                
                                {(JSON.parse(order?.items)[0] != undefined ) && <ul>
                                    {(JSON.parse(order?.items))?.map((item, index) => (
                                    <li key={index}>{item.product_title} - {item.quantity} Units</li>
                                ))}
                                </ul>}
                                {/* Subscription Items */}  
                                {(JSON.parse(order?.items)[0] == undefined) && <ul style={{padding: "unset"}}>
                                    <li style={{listStyleType: "none", padding: "unset"}}>{JSON.parse(order?.items)?.name}</li>
                                </ul>}
                            </>
                        </td>
                    </tr>
                ))}
            </tbody>
        )
    }

    function displaySideImages(input) {
        let images = []
        let textBoxArray = [];
        
        /* Add the images if they exist */
        input?.img1 ? images.push(itemInfo?.img1) : "";
        input?.img1 ? textBoxArray.push(0) : "";
        input?.img2 ? images.push(itemInfo?.img2) : "";
        input?.img2 ? textBoxArray.push(1) : "";
        input?.img3 ? images.push(itemInfo?.img3) : "";
        input?.img3 ? textBoxArray.push(2) : "";
        input?.img4 ? images.push(itemInfo?.img4) : "";
        input?.img4 ? textBoxArray.push(3) : "";
        input?.img5 ? images.push(itemInfo?.img5) : "";
        input?.img5 ? textBoxArray.push(4) : "";

        return (
            images.map((url, i) => (
                <img src={images[i]} alt="" onError={({ currentTarget }) => {
                    setURLErrorExists(true)
                    currentTarget.onerror = null;
                    currentTarget.src=imgFailArray[textBoxArray[i]];
                }} />
            ))
        )
    }

    function displayMainPhoto(input) {
        let images = []
        let textBoxArray = [];

        /* Stop infinite calls if all images are null */
        if (input?.img1 == "" && input?.img2 == "" && input?.img3 == "" && input?.img4 == "" && input?.img5 == "") {
            return;
        }

        /* Stop infinite calls if input is unset - Display the default error photo */
        if ((input?.img1 == undefined) && (input?.img2 == undefined) && (input?.img3 == undefined) && (input?.img4 == undefined) && (input?.img5 == undefined)) {
            return {url: "", index: 5};
        }
        
        // Ensure there's no gaps in the array so evaluate every img and update the input array it if it exists
        input?.img1 ? images.push(itemInfo?.img1) : "";
        (input?.img1 && textBoxArray.length == 0) ? textBoxArray.push(0) : "";
        input?.img2 ? images.push(itemInfo?.img2) : "";
        (input?.img2 && textBoxArray.length == 0) ? textBoxArray.push(1) : "";
        input?.img3 ? images.push(itemInfo?.img3) : "";
        (input?.img3 && textBoxArray.length == 0) ? textBoxArray.push(2) : "";
        input?.img4 ? images.push(itemInfo?.img4) : "";
        (input?.img4 && textBoxArray.length == 0) ? textBoxArray.push(3) : "";
        input?.img5 ? images.push(itemInfo?.img5) : "";
        (input?.img5 && textBoxArray.length == 0) ? textBoxArray.push(4) : "";

        if (images.length > 0) {
            return {url: images[0], index: textBoxArray[0]};
        } else {
            return {url: ""};
        }
    }

    function resetForm () {
        let userInputProductName = document.getElementById("productName");
        let userInputProductDescription = document.getElementById("productDescription")
        let userInputProductQuantity = document.getElementById("productQuantity");
        let userInputProductCategory = document.getElementById("productOptions");
        let userInputProductPrice = document.getElementById("productPrice");
        let userInputProductImg1 = document.getElementById("productImg1");
        let userInputProductImg2 = document.getElementById("productImg2");
        let userInputProductImg3 = document.getElementById("productImg3");
        let userInputProductImg4 = document.getElementById("productImg4");
        let userInputProductImg5 = document.getElementById("productImg5");

        let allObjectsArray = [userInputProductName, userInputProductDescription, userInputProductQuantity, userInputProductCategory, userInputProductPrice, userInputProductImg1, userInputProductImg2, userInputProductImg3, userInputProductImg4, userInputProductImg5]

        // Iterate through every element and reset the value
        allObjectsArray.map((item) => {
            if (item == null) {
                return;
            }
            item.value = "";
        })
    }

    const handleSubmit = async (event) => {
        /* Prevent default redirect */
        event.preventDefault();
        
        /* Gather all the input fields for easier logic no input is empty string*/
        let userInputProductName = document.getElementById("productName");
        let userInputProductDescription = document.getElementById("productDescription")
        let userInputProductQuantity = document.getElementById("productQuantity");
        let userInputProductCategory = document.getElementById("productOptions");
        let userInputProductPrice = document.getElementById("productPrice");
        let userInputProductImg1 = document.getElementById("productImg1");
        let userInputProductImg2 = document.getElementById("productImg2");
        let userInputProductImg3 = document.getElementById("productImg3");
        let userInputProductImg4 = document.getElementById("productImg4");
        let userInputProductImg5 = document.getElementById("productImg5");
        let navigationButtonSubmit = document.getElementById("submitBtn");
        let navigationButtonRefresh = document.getElementById("refreshBtn");

        let navigationToolbarRecentlySold = document.getElementById("recentlySold");
        let navigationToolbarItems = document.getElementById("allItems");
        let navigationToolbarItemAdd = document.getElementById("itemAdd");

        let allObjectsArray = [userInputProductName, userInputProductDescription, userInputProductQuantity, userInputProductCategory, userInputProductPrice, userInputProductImg1, userInputProductImg2, userInputProductImg3, userInputProductImg4, userInputProductImg5, navigationButtonSubmit, navigationButtonRefresh, navigationToolbarRecentlySold, navigationToolbarItems, navigationToolbarItemAdd]

        /* Disable all the input fields so the user can't change anything while the processing happens*/
        allObjectsArray.map((item) => {
            item.disabled = true;
        })
        
        /* 
            Validate that the input fields meet the correct requirements -  
            All validation is done in backend, but it's also done in front-end to prevent useless backend fetch requests
        */

        // Quantity Validation - Information is double checked in the backend
        if (userInputProductQuantity.value < 0 || (userInputProductQuantity.value % 1) != 0) {
            setMessageError("Quantity needs to be greater than 0 AND a whole number");
            allObjectsArray.map((item) => {
                item.disabled = false;
            })
            return;
        }

        // Price Validation - Information is double checked in the backend
        if (userInputProductPrice.value < 0.50) {
            setMessageError("Price needs to be $0.50 or greater");
            allObjectsArray.map((item) => {
                item.disabled = false;
            })
            return;
        }
        
        // Image SRC Validation - Information is double checked in the backend
        let isImg1Valid = await checkImage(userInputProductImg1.value)
        let isImg2Valid = await checkImage(userInputProductImg2.value)
        let isImg3Valid = await checkImage(userInputProductImg3.value)
        let isImg4Valid = await checkImage(userInputProductImg4.value)
        let isImg5Valid = await checkImage(userInputProductImg5.value)
        if ((isImg1Valid.status == "error") || (isImg2Valid.status == "error") || (isImg3Valid.status == "error") || (isImg4Valid.status == "error") || (isImg5Valid.status == "error")) {
            setMessageError("An image URL is invalid");
            allObjectsArray.map((item) => {
                item.disabled = false;
            })
            return;
        }
        // Ensure at least 1 image is provided - Information is double checked in the backend
        if ((isImg1Valid.status == null) && (isImg2Valid.status == null) && (isImg3Valid.status == null) && (isImg4Valid.status == null) && (isImg5Valid.status == null)) {
            setMessageError("At least 1 image is required");
            allObjectsArray.map((item) => {
                item.disabled = false;
            })
            return;
        }

        /* Create a new array so we don't have gaps in imgs (example no 1, 2, 4, 5) */
        let imgArray = [];
        isImg1Valid.status == "ok" ? imgArray.push(userInputProductImg1.value) : ""
        isImg2Valid.status == "ok" ? imgArray.push(userInputProductImg2.value) : ""
        isImg3Valid.status == "ok" ? imgArray.push(userInputProductImg3.value) : ""
        isImg4Valid.status == "ok" ? imgArray.push(userInputProductImg4.value) : ""
        isImg5Valid.status == "ok" ? imgArray.push(userInputProductImg5.value) : ""

        /* Create the new object with the new information that will be put into mySQL */
        let newObj = {};
        newObj.category = userInputProductCategory.value
        newObj.id = itemInfo.id
        if (itemInfo.id == undefined) {
            /* New submissions */
            newObj.max_quantity = Number(itemInfo?.quantity)
        } else {
            /* Edit submissions */
            let oldItem = products.find(thisItem => thisItem.id === itemInfo.id)
            newObj.max_quantity = (Number(itemInfo.max_quantity) + ( Number(userInputProductQuantity.value) - Number(oldItem.quantity)))
        }
        newObj.price = Number(userInputProductPrice.value).toFixed(2)
        newObj.product_title = userInputProductName.value
        newObj.product_description = userInputProductDescription.value
        newObj.quantity = Number(userInputProductQuantity.value)
        
        // Add the images that exist to the object
        for (let i=1; i<imgArray.length+1; i++) {
            switch (i) {
                case 1:
                    newObj.img1 = imgArray[0]
                    break;
                case 2:
                    newObj.img2 = imgArray[1]
                    break;
                case 3:
                    newObj.img3 = imgArray[2]
                    break;
                case 4:
                    newObj.img4 = imgArray[3]
                    break;
                case 5:
                    newObj.img5 = imgArray[4]
                    break;
            }
        }

        // Replaces all the undefined objects with null so it's easier for the mySQL statement
        newObj.img1 == undefined ? newObj.img1=null : ""
        newObj.img2 == undefined ? newObj.img2=null : ""
        newObj.img3 == undefined ? newObj.img3=null : ""
        newObj.img4 == undefined ? newObj.img4=null : ""
        newObj.img5 == undefined ? newObj.img5=null : ""

        /* Send that input field information to the backend mySQL server */
        const customHeaders = {
            "Content-Type": "application/json",
        }
        const userInfoObj = {
            "email": email,
            "product": newObj,
            "session_id": getCookie("sessionID"),
        }
        const url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/admin-product";
        fetch(url, {
            method: "POST",
            headers: customHeaders,
            body: JSON.stringify(userInfoObj),
        })
        .then((response) => response.json())
        .then((data) => {
            if (!data?.isSuccessful) {
                /* Enable the input fields */
                allObjectsArray.map((item) => {
                    item.disabled = false;
                })

                /* Display the error */
                setMessageError(data.errors)
                return;
            }

            /* Change was successful so update the products so the component is up to date */
            fetch(`${import.meta.env.VITE_BACKEND_URL}/LagunaLift/LagunaLift/getProducts`).then(
                response => response.json()
            ).then(data => {
                setProducts(data);
            }).catch((e) => {
                /* Display the error */
                const errorMessage = e.constructor.name;
                if (errorMessage == "TypeError") {
                    setMessageError("Updating Products - Failed to Connect to the Server");
                }
                return;
            })

            /* Enable the input fields */
            allObjectsArray.map((item) => {
                item.disabled = false;   
            })
            setMessageSuccess("Success!")
        }).catch((e) => {
            /* Enable the input fields */
            allObjectsArray.map((item) => {
                item.disabled = false;
            })

            /* Display the error */
            const errorMessage = e.constructor.name;
            if (errorMessage == "SyntaxError") {
                setMessageError("This Product Does Not Exist");
            } else if (errorMessage == "TypeError") {
                setMessageError("Failed to Connect to the Server");
            }
        });
    }

    const checkImage = path =>
        // Try to create a new image with the given URL and if it doesn't resolve properly then we know the image URL is invalid
        new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve({path, status: 'ok'});
            img.onerror = () => resolve({path, status: 'error'});

            if (path == "") { /* If the input field was empty */
                resolve({path, status: null})
            }
            img.src = path;
        }   
    );

    let displayPanel = () => {
        if (checkedSidebar == null) {
            return (
                <h1>Please Select an Admin Panel</h1>
            )
        }

        /* Display recently sold */
        if (checkedSidebar?.id == "recentlySold") {
            return (
                <section id="recentlySoldPanel">
                    <div className='row'>
                        <h1>Click on an item to edit their properties</h1>
                        <button id="refresh" onClick={() => {setRecentlySoldRows(null)}}>Refresh Data</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Session ID</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Items</th>
                            </tr>
                        </thead>
                        {fetchRecentlySoldRows()}
                    </table>
                </section>
            )
        }

        /* Display all items */
        if (checkedSidebar?.id == "allItems") {
            /* Fetch the items if we don't have it (If we dont have this then there will be infinite fetch requests) */
            if (products == null) {
                fetch(`${import.meta.env.VITE_BACKEND_URL}/LagunaLift/LagunaLift/getProducts`).then(
                    response => response.json()
                ).then(data => {
                    setProducts(data);
                }).catch((e) => {
                    /* Display the error */
                    const errorMessage = e.constructor.name;
                    if (errorMessage == "TypeError") {
                        console.log("Failed to Connect to the Server");
                    }
                })
            }
            /* If the user has selected an item then display a form with all that item's information that can be changed */
            if (itemToDisplay != null) {
                let item = products[itemToDisplay];
                if (URLErrorExists != false) {
                    setURLErrorExists(false)
                }
                if (itemInfo == null) {
                    setItemInfo({...item})
                }
                
                return (
                    <>
                    <div className="row">
                        <h1>Change item form:</h1>
                        <div id='buttons'>
                            <button id='refreshBtn' onClick={() => {setItemToDisplay(null); setItemInfo(null);}}>{"Display All Items"}</button>
                        </div>
                    </div>
                    <h2 id='error'>{messageError}</h2>
                    <h2 id='success'>{messageSuccess}</h2>
                    <div id="editItemContainer">
                        <div id="left">
                            <section id='photo-track'>
                                {displaySideImages(itemInfo)}
                            </section>
                            <div className="card">
                                <img src={displayMainPhoto(itemInfo)?.url} alt="" onError={({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src=imgFailArray[displayMainPhoto(itemInfo)?.index];
                                    setURLErrorExists(true)
                                }}/>
                                <div id="text">
                                    <h2 id='product_title'>{itemInfo?.product_title}</h2>
                                    <p id='id'>Product ID: {itemInfo?.id}</p>
                                    <p id="quantity">Units Available: {Math.round(itemInfo?.quantity).toFixed(0)}</p>
                                    <p id="category">Category: {itemInfo?.category}</p>
                                    <h2 id="price">${(Math.round(itemInfo?.price * 100) / 100).toFixed(2)}</h2>
                                </div>
                            </div>
                        </div>
                        <form id='container' action="" method="post" onSubmit={(e) => handleSubmit(e)}>
                            <div className="rowGrid">
                                <label htmlFor="productName">Product Name:</label>
                                <input type="text" name="productName" id="productName" defaultValue={item?.product_title} onChange={(e) => {let newItem = itemInfo; newItem.product_title=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}}/>
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productDescription">Product Description:</label>
                                <textarea type="text" name="productDescription" id="productDescription" defaultValue={item?.product_description} onChange={(e) => {let newItem = itemInfo; newItem.product_description=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}}/>
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productQuantity">Quantity Available:</label>
                                <input type="number" min={"0"} step={"1"} name="productQuantity" id="productQuantity" defaultValue={item?.quantity} onChange={(e) => {let newItem = itemInfo; newItem.quantity=Number(e.target.value); setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productOptions">Category:</label>
                                <select name="productOptions" id="productOptions" onChange={() => {setMessageError(""); setMessageSuccess("");}}>
                                    <option value="shoes">Shoes</option>
                                    <option value="shirts">Shirts</option>
                                    <option value="pants">Pants</option>
                                    <option value="headwear">Headwear</option>
                                </select>
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productPrice">Price per Unit:</label>
                                <input type="number" min={"0.50"} step={"0.01"} pattern={"^\d+(?:\.\d{1,2})?$"}  name="productPrice" id="productPrice" defaultValue={item?.price} onChange={(e) => {let newItem = itemInfo; newItem.price=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}}/>
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productImg1">Image 1 URL:</label>
                                <input type="url" name="productImg1" id="productImg1" defaultValue={item?.img1} onChange={(e) => {let newItem = itemInfo; newItem.img1=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productImg2">Image 2 URL:</label>
                                <input type="url" name="productImg2" id="productImg2" defaultValue={item?.img2} onChange={(e) => {let newItem = itemInfo; newItem.img2=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productImg3">Image 3 URL:</label>
                                <input type="url" name="productImg3" id="productImg3" defaultValue={item?.img3} onChange={(e) => {let newItem = itemInfo; newItem.img3=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productImg4">Image 4 URL:</label>
                                <input type="url" name="productImg4" id="productImg4" defaultValue={item?.img4} onChange={(e) => {let newItem = itemInfo; newItem.img4=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productImg5">Image 5 URL:</label>
                                <input type="url" name="productImg5" id="productImg5" defaultValue={item?.img5} onChange={(e) => {let newItem = itemInfo; newItem.img5=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="row">
                                <input id='submitBtn' type="submit" value="Submit Changes" />
                            </div>
                        </form>
                    </div>
                    </>
                )
            }
            /* The user has not selected an item, so return to them the list of all items until they select one */
            return (
                <>
                <div className="row">
                    <h1>Click on an item to edit their properties</h1>
                    <button id='refreshBtn' onClick={() => {setProducts(null)}}>{"Refresh Products"}</button>
                </div>
                <section id="allItemsPanel">
                    {products?.map((product, index) => (
                        <button className="card" onClick={() => {setItemToDisplay(index)}} id={`${index}`} key={product.id}>
                            <img src={product.img1} loading='eager' alt="" />
                            <div id='text'>
                                <h2>{product.product_title}</h2>
                                <p>Product ID: {product.id}</p>
                            </div>
                        </button>
                        
                    ))}
                </section>
                </>
            )
        }

        /* Display add an item */
        if (checkedSidebar?.id == "itemAdd") {
            if (itemToDisplay == null) {
                return (
                    <>
                    <div className="row">
                        <h1>Item Submission Form:</h1>
                        <div id='buttons'>
                            <button id='refreshBtn' onClick={() => {setItemToDisplay(null); resetForm(); setItemInfo({"img1": "", "img2": "", "img3": "", "img4": "", "img5": ""}); setMessageError(null); setMessageSuccess(null);}}>{"Reset Fields"}</button>
                        </div>
                    </div>
                    <h2 id='error'>{messageError}</h2>
                    <h2 id='success'>{messageSuccess}</h2>
                    <div id="editItemContainer">
                        <div id="left">
                            <section id='photo-track'>
                                {displaySideImages(itemInfo)}
                            </section>
                            <div className="card">
                                <img src={displayMainPhoto(itemInfo)?.url} alt="" onError={({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src=imgFailArray[displayMainPhoto(null)?.index];
                                    setURLErrorExists(true)
                                }}/>
                                <div id="text">
                                    <h2 id='product_title'>{itemInfo?.product_title}</h2>
                                    <p id='id'>Product ID: {itemInfo?.id}</p>
                                    <p id="quantity">Units Available: {Math.round(itemInfo?.quantity).toFixed(0)}</p>
                                    <p id="category">Category: {itemInfo?.category}</p>
                                    <h2 id="price">${(Math.round(itemInfo?.price * 100) / 100).toFixed(2)}</h2>
                                </div>
                            </div>
                        </div>
                        <form id='container' action="" method="post" onSubmit={(e) => handleSubmit(e)}>
                            <div className="rowGrid">
                                <label htmlFor="productName">Product Name:</label>
                                <input type="text" name="productName" id="productName" defaultValue={""} onChange={(e) => {let newItem = itemInfo; newItem.product_title=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}}/>
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productDescription">Product Description:</label>
                                <textarea type="text" name="productDescription" id="productDescription" defaultValue={""} onChange={(e) => {let newItem = itemInfo; newItem.product_description=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}}/>
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productQuantity">Quantity Available:</label>
                                <input type="number" min={"0"} step={"1"} name="productQuantity" id="productQuantity" defaultValue={""} onChange={(e) => {let newItem = itemInfo; newItem.quantity=Number(e.target.value); setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productOptions">Category:</label>
                                <select name="productOptions" id="productOptions" onChange={() => {setMessageError(""); setMessageSuccess("");}}>
                                    <option value="shoes">Shoes</option>
                                    <option value="shirts">Shirts</option>
                                    <option value="pants">Pants</option>
                                    <option value="headwear">Headwear</option>
                                </select>
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productPrice">Price per Unit:</label>
                                <input type="number" min={"0.50"} step={"0.01"} pattern={"^\d+(?:\.\d{1,2})?$"}  name="productPrice" id="productPrice" defaultValue={""} onChange={(e) => {let newItem = itemInfo; newItem.price=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}}/>
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productImg1">Image 1 URL:</label>
                                <input type="url" name="productImg1" id="productImg1" defaultValue={""} onChange={(e) => {let newItem = itemInfo; newItem.img1=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productImg2">Image 2 URL:</label>
                                <input type="url" name="productImg2" id="productImg2" defaultValue={""} onChange={(e) => {let newItem = itemInfo; newItem.img2=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productImg3">Image 3 URL:</label>
                                <input type="url" name="productImg3" id="productImg3" defaultValue={""} onChange={(e) => {let newItem = itemInfo; newItem.img3=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productImg4">Image 4 URL:</label>
                                <input type="url" name="productImg4" id="productImg4" defaultValue={""} onChange={(e) => {let newItem = itemInfo; newItem.img4=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="rowGrid">
                                <label htmlFor="productImg5">Image 5 URL:</label>
                                <input type="url" name="productImg5" id="productImg5" defaultValue={""} onChange={(e) => {let newItem = itemInfo; newItem.img5=e.target.value; setItemInfo({...newItem}); setMessageError(""); setMessageSuccess("");}} />
                            </div>
                            <div className="row">
                                <input id='submitBtn' type="submit" value="Submit Changes" />
                            </div>
                        </form>
                    </div>
                    </>
                )
            }
        }

    }
    
    return (
        <section className="admin-component">
            {(userType != "admin") && <>You are not an admin</>}
            {(userType == "admin") && 
            <div id="adminPanel">
                <aside id="sideBar">
                    <input type="radio" className='hidden' name="adminOptions" id="recentlySold" onChange={() => {updateCheckedSidebar(); setItemToDisplay(null); resetForm(); setItemInfo(null); setMessageError(null); setMessageSuccess(null);}} />
                    <label htmlFor="recentlySold">Recently Sold</label>
                    <input type="radio" className='hidden' name="adminOptions" id="allItems" onChange={() => {updateCheckedSidebar(); setItemToDisplay(null); resetForm(); setItemInfo(null); setMessageError(null); setMessageSuccess(null);}} />
                    <label htmlFor="allItems">Items</label>
                    <input type="radio" className='hidden' name="adminOptions" id="itemAdd" onChange={() => {updateCheckedSidebar(); setItemToDisplay(null); resetForm(); setItemInfo({"img1": "", "img2": "", "img3": "", "img4": "", "img5": ""}); setMessageError(null); setMessageSuccess(null);}} />
                    <label htmlFor="itemAdd">Add an Item</label>
                </aside>
                <section id="main">
                    {displayPanel()}
                </section>
            </div>
            }
        </section>  
    );
}

export default AdminComponent