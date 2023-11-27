import './Merchandise.css'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Merchandise = () => {
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [cards, setCards] = useState([]);
    const [errorMessage, setErrorMessage] = useState("Fetching From Server...");
    
    const [checkedPrice, setCheckedPrice] = useState([null, null]);
    const [checkedCategories, setCheckedCategories] = useState([])
    const [checkedSort, setCheckedSort] = useState();
    const [categoryQuantity, setCategoryQuantity] = useState([0, 0, 0, 0])

    const shirts = document.getElementById("Shirts");
    const pants = document.getElementById("Pants");
    const shoes = document.getElementById("Shoes");
    const headwear = document.getElementById("Headwear");
    const priceAscending = document.getElementById("priceAscending");
    const priceDescending = document.getElementById("priceDescending");

    /* Minimums for Price Sorting */
    const filterPrice1Min = 0;
    const filterPrice1Max = 9.99;
    const filterPrice2Min = 10;
    const filterPrice2Max = 24.99;
    const filterPrice3Min = 25;
    const filterPrice3Max = 49.99;
    const filterPrice4Min = 50;
    const filterPrice4Max = 74.99;
    const filterPrice5Min = 75;
    const filterPrice5Max = Infinity;

    /* Gather Product Information from Database on Page Load*/
    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/LagunaLift/LagunaLift/getProducts`).then(
            response => response.json()
        ).then(data => {
            data = addHoverImageProp(data);
            setErrorMessage("");
            setCards(data);
            setIsLoadingData(false);
        }).catch((e) => {
            /* Display the error */
            const errorMessage = e.constructor.name;
            if (errorMessage == "TypeError") {
                setErrorMessage("Failed to Connect to the Server");
            }
        })
    }, []);

    /* Re render the dom whenever a category is checked OR a sort button is changed OR Price checked/unchecked */
    useEffect(() => {
        displayProductCards();
    }, [checkedCategories, checkedSort, checkedPrice])

    /* Display quanity values whenever the cards loads */
    useEffect(() => {
        displayQuantityCount();
    }, [cards])

    function addHoverImageProp(data) {
        data.map((card) => {
            if (card.img2 != null) {
                card.hover = card.img2;
            } else if (card.img3 != null) {
                card.hover = card.img3;
            } else if (card.img4 != null) {
                card.hover = card.img4;
            } else if (card.img5 != null) {
                card.hover = card.img5;
            } else {
                card.hover = card.img1;
            }
        })
        return data;
    }

    const displayQuantityCount = () => {
        let quantityShirts = 0;
        let quantityPants = 0;
        let quantityShoes = 0;
        let quantityHeadwear = 0;

        cards.map((card) => {
            switch (card.category) {
                case "Shirts":
                    quantityShirts++;
                    break;
                case "Pants":
                    quantityPants++;
                    break;
                case "Shoes":
                    quantityShoes++;
                    break;
                case "Headwear":
                    quantityHeadwear++;
                    break;
            } 
        })
        setCategoryQuantity([quantityShirts, quantityPants, quantityShoes, quantityHeadwear]);
    }

    const displayProductCards = () => {

        /* If everything is null (page load) then stop until the data loads */
        if (shirts === null || pants === null || shoes === null || headwear === null) {
            return;
        }

        /* If nothing is selected then display everything */
        if (!shirts.checked && !pants.checked && !shoes.checked && !headwear.checked) {
            let cardsToDisplay = cards;

            /* Sort card order if needed */
            if (checkedSort == "priceAscending") {
                cardsToDisplay = cardsToDisplay.sort((product1, product2)=>Number(product1.price) - Number(product2.price));
            }
            else if (checkedSort == "priceDescending") {
                cardsToDisplay = cardsToDisplay.sort((product1, product2)=>Number(product2.price) - Number(product1.price));
            }
            else if (checkedSort == null) {
                cardsToDisplay = cardsToDisplay.sort((product1, product2)=>Number(product1.id) - Number(product2.id));
            }

            /* If There is a price limit then limit the cards */
            if (checkedPrice[0] != null && checkedPrice[1] != null) {
                cardsToDisplay = cardsToDisplay.filter((product) => (Number(product.price) >= checkedPrice[0] && Number(product.price) <= checkedPrice[1]))
            }

            return (
                cardsToDisplay.map((card) => (
                <Link to={ `/p/?id=${card.id}`} className="card" key={card.id}>
                    <img src={card.img1}  alt="" />
                    <img src={card.hover} loading='lazy' id='hoverImg' alt="" />
                    <div id='text'>
                        <figcaption>{card.product_title}</figcaption>
                        <h2>${(Math.round(card.price * 100) / 100).toFixed(2)}</h2>
                    </div>
                </Link>
                ))
            );
        } 
        else {
            /* Filter the products by Categories */
            let filteredItems = [];
            cards.map((card) => {
                if (checkedCategories.includes(card.category)) {
                    filteredItems.push(card);
                }
            })

            /* Sort the products by Price */
            let cardsToDisplay = filteredItems;
            if (priceAscending.checked) {
                cardsToDisplay = cardsToDisplay.sort((product1, product2)=>Number(product1.price) - Number(product2.price));
            }
            if (priceDescending.checked) {
                cardsToDisplay = cardsToDisplay.sort((product1, product2)=>Number(product2.price) - Number(product1.price));
            }

            /* If There is a price limit then limit the cards */
            if (checkedPrice[0] != null && checkedPrice[1] != null) {
                cardsToDisplay = cardsToDisplay.filter((product) => (Number(product.price) >= checkedPrice[0] && Number(product.price) <= checkedPrice[1]))
            }

            /* Display all the cards */
            return (
                cardsToDisplay.map((card) => (
                <Link to={ `/p/?id=${card.id}`} className="card" key={card.id}>
                    <img src={card.img1} loading='eager' alt="" />
                    <img src={card.hover} loading='lazy' id='hoverImg' alt="" />
                    <div id='text'>
                        <figcaption>{card.product_title}</figcaption>
                        <h2>${(Math.round(card.price * 100) / 100).toFixed(2)}</h2>
                    </div>
                </Link>
                ))
            );
        }
    }

    let updateUseStateCheckedCategories = (e) => {
        /* Read the event and add or remove the category from checkedCategories useState*/
        let category = e.target.id;
        if (checkedCategories.includes(category)) {
            setCheckedCategories((checkedCategories) => checkedCategories.filter((elem) => elem !== category));
        }
        else {
            setCheckedCategories(checkedCategories => [...checkedCategories, category]);
        }
    }



    let updateUseStateCheckedSort = (e) => {
        const priceAscending = document.getElementById("priceAscending");
        const priceDescending = document.getElementById("priceDescending");
        let category = e.target.id;

        /* If checkedSort has this variable then it's a recheck so uncheck that box #priceAscending or #priceDescending */
        /* Otherwise it's a new Check, uncheck everything then set the useState thew new variable to update the dom */
        if (checkedSort == category) {
            checkedSort == "priceAscending" ? priceAscending.checked=false : null;
            checkedSort == "priceDescending" ? priceDescending.checked=false : null;
            category = null;
        } else {
            priceAscending.checked ? priceAscending.checked=false : null;
            priceDescending.checked ? priceDescending.checked=false : null;
        }

        /* Check the correct box */
        category == "priceAscending" ? priceAscending.checked=true : null;
        category == "priceDescending" ? priceDescending.checked=true : null;
        setCheckedSort(category);
    }

    let updateUseStateCheckedPrice = (minPrice, maxPrice) => {
        const filter1 = document.getElementById("filter-price-1");
        const filter2 = document.getElementById("filter-price-2");
        const filter3 = document.getElementById("filter-price-3");
        const filter4 = document.getElementById("filter-price-4");
        const filter5 = document.getElementById("filter-price-5");

        /* Uncheck everything if it's checked */
        filter1.checked ? filter1.checked=false : null;
        filter2.checked ? filter2.checked=false : null;
        filter3.checked ? filter3.checked=false : null;
        filter4.checked ? filter4.checked=false : null;
        filter5.checked ? filter5.checked=false : null;

        /* If this checkbox was checked previously then prepare for a null input */
        if (checkedPrice[0] == minPrice && checkedPrice[1] == maxPrice) {
            minPrice = null;
            maxPrice = null;
        } else {
            /* Check the new checkbox depending on the values */
            switch (minPrice, maxPrice) {
                case filterPrice1Min, filterPrice1Max:
                    filter1.checked = true;
                    break;
                case filterPrice2Min, filterPrice2Max:
                    filter2.checked = true;
                    break;
                case filterPrice3Min, filterPrice3Max:
                    filter3.checked = true;
                    break;
                case filterPrice4Min, filterPrice4Max:
                    filter4.checked = true;
                    break;
                case filterPrice5Min, filterPrice5Max:
                    filter5.checked = true;
                    break;
            }
        }
        /* Update the dom via the useState */
        setCheckedPrice([minPrice, maxPrice]);
    }
    
    return ( 
        <section className="merchandise-component">
            <div id="grid1x1">
                <div></div>
            </div>
            {isLoadingData && <h1 id='loading'>{errorMessage}</h1>}
            <div id="grid">
                {!isLoadingData && <aside id="sideBar">
                    <section className="categories">
                        <h1>Product Categories:</h1>
                        <div className="row">
                            <div className="left">
                                <input type="checkbox" name="product-categories" id="Shirts" onChange={(e) => {updateUseStateCheckedCategories(e); document.documentElement.scrollTop = 0;}}/>
                                <label htmlFor="Shirts" className='noselect'>Shirts</label>
                            </div>
                            <p className="quantity">({categoryQuantity[0]})</p>
                        </div>
                        <div className="row">
                            <div className="left">
                                <input type="checkbox" name="product-categories" id="Pants" onChange={(e) => {updateUseStateCheckedCategories(e); document.documentElement.scrollTop = 0;}}/>
                                <label htmlFor="Pants" className='noselect'>Pants</label>
                            </div>
                            <p className="quantity">({categoryQuantity[1]})</p>
                        </div>
                        <div className="row">
                            <div className="left">
                                <input type="checkbox" name="product-categories" id="Shoes" onChange={(e) => {updateUseStateCheckedCategories(e); document.documentElement.scrollTop = 0;}}/>
                                <label htmlFor="Shoes" className='noselect'>Shoes</label>
                            </div>
                            <p className="quantity">({categoryQuantity[2]})</p>
                        </div>
                        <div className="row">
                            <div className="left">
                                <input type="checkbox" name="product-categories" id="Headwear" onChange={(e) => {updateUseStateCheckedCategories(e); document.documentElement.scrollTop = 0;}}/>
                                <label htmlFor="Headwear" className='noselect'>Headwear</label>
                            </div>
                            <p className="quantity">({categoryQuantity[3]})</p>
                        </div>
                    </section>

                    <section className="price">
                        <h1>Filter by Price:</h1>
                        <div className="row">
                            <div className="left">
                                <input type="checkbox" name="filter-price" id="filter-price-1" onClick={() => {updateUseStateCheckedPrice(Number(filterPrice1Min), Number(filterPrice1Max)); document.documentElement.scrollTop = 0;}}/>
                                <label htmlFor="filter-price-1" className='noselect'>Less Than $10</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="left">
                                <input type="checkbox" name="filter-price" id="filter-price-2" onClick={() => {updateUseStateCheckedPrice(Number(filterPrice2Min), Number(filterPrice2Max)); document.documentElement.scrollTop = 0;}}/>
                                <label htmlFor="filter-price-2" className='noselect'>$10 - $25</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="left">
                                <input type="checkbox" name="filter-price" id="filter-price-3" onClick={() => {updateUseStateCheckedPrice(Number(filterPrice3Min), Number(filterPrice3Max)); document.documentElement.scrollTop = 0;}}/>
                                <label htmlFor="filter-price-3" className='noselect'>$25 - $50</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="left">
                                <input type="checkbox" name="filter-price" id="filter-price-4" onClick={() => {updateUseStateCheckedPrice(Number(filterPrice4Min), Number(filterPrice4Max)); document.documentElement.scrollTop = 0;}}/>
                                <label htmlFor="filter-price-4" className='noselect'>$50 - $75</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="left">
                                <input type="checkbox" name="filter-price" id="filter-price-5" onClick={() => {updateUseStateCheckedPrice(Number(filterPrice5Min), filterPrice5Max); document.documentElement.scrollTop = 0;}}/>
                                <label htmlFor="filter-price-5" className='noselect'>Over $75</label>
                            </div>
                        </div>
                    </section>

                    <section className="sort">
                        <h1>Sort:</h1>
                        <div className='row'>
                            <div>
                                <input type="checkbox" name="priceSort" id="priceAscending" onClick={(e) => {updateUseStateCheckedSort(e); document.documentElement.scrollTop = 0;}}/>
                                <label htmlFor="priceAscending">Price (Lowest First)</label>
                            </div>
                        </div>
                        <div className='row'>
                            <div>
                                <input type="checkbox" name="priceSort" id="priceDescending" onClick={(e) => {updateUseStateCheckedSort(e); document.documentElement.scrollTop = 0;}}/>
                                <label htmlFor="priceDescending">Price (Highest first)</label>
                            </div>
                        </div>
                    </section>
                    <section className="navigation">
                        <h1>Accessibility:</h1>
                        <div className="row">
                            <button onClick={() => {document.documentElement.scrollTop = 0;}}>Jump to Top</button>
                            <button onClick={() => {window.scrollTo(0, document.body.scrollHeight);}}>Jump to Bottom</button>
                        </div>
                    </section>
                </aside> }
                <section className="main">
                    {displayProductCards()}
                </section>
            </div>
        </section> 
    );
}
 
export default Merchandise;