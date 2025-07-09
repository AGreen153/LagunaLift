import './Services.css'
import React from 'react'
import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom';
import { WrapperContext } from '../WrapperComponent/Wrapper';
import { getCookie } from '../../cookies/cookieLogic';


import imgFacebook from "../../assets/facebook.svg"
import imgInstagram from "../../assets/instagram.svg"
import imgTwitter from "../../assets/twitter.svg"

import lagunaTrack from "../../assets/laguna_track.png"
import lagunaBasketball from "../../assets/laguna_basketball.png"
import lagunaSoccer from "../../assets/laguna_soccer.png"

import { stripePayment } from '../CartComponent/CartMain';

const Services = () => {
    let [indexCounter, setIndexCounter] = useState(0);
    const indexCounterRef = React.createRef();
    indexCounterRef.current = indexCounter; // https://stackoverflow.com/questions/61956823/why-cant-useeffect-access-my-state-variable-in-a-return-statement

    let [areClonesAdded, setAreClonesAdded] = useState(false);
    let [cardCount, setCardCount] = useState(250); /* Total number of cards after the copies are added */
    let [canAdvance, setCanAdvance] = useState(true); /* Checker during the copy to ensure that the user can actually move buttons (no animation jankiness) */
    let [detectMouseOut, setDetectMouseOut] = useState(1);
    const detectMouseOutRef = React.createRef();
    detectMouseOutRef.current = detectMouseOut;
    let [buttonClicked, setButtonClicked] = useState(false);
    const buttonClickedRef = React.createRef();
    buttonClickedRef.current = buttonClicked;

    const [trainers, setTrainers] = useState([]);

    let [pendingAutoSlide, setPendingAutoSlide] = useState(true);
    const pendingAutoSlideRef = React.createRef();
    pendingAutoSlideRef.current = pendingAutoSlide;

    const {isSignedIn, userSubscriptionType, setUserSubscriptionType, email} = useContext(WrapperContext);

    /* Modal */
    let [isModalOpen, setIsModalOpen] = useState(false);


    /* Connect to the database on page load and fill the state with the information */
    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/getTrainers`).then(
            response => response.json()
        ).then(data => {
            setTrainers(data);
        })
    }, []);

    /* IF the user is signed in then fetch their subscription status if any and update the states */
    useEffect(() => {
        if (isSignedIn == false || email == undefined) {
            return;
        }

        let url = import.meta.env.VITE_BACKEND_URL + "/fetch-subscription";
        let bodyObj = {"email": email, "session_id": getCookie("sessionID")}
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
            /* If the fetch was successful then set the subscription type */
            let isSuccessful = res.isSuccessful
            if (!isSuccessful) {
                return;
            }

            if (res.subscription_type <= 0 || res.subscription_type > 3) {
                console.log("Invalid subscription type found")
                return;
            }
            let data = JSON.parse(JSON.parse(res.subscription))
            setUserSubscriptionType({"id": Number(data.subscription_type), "expiration": new Date(data.expiration_date)})
        })
        .catch(e => {
            console.error(e.error)
        })
    }, [isSignedIn])

    /* Load the trainers cards info */
    const displayTrainerCards = () => {
        return (
            trainers.map((trainerInfo, i) => ( 
                <div className="card carousel-card" key={i}>
                    <div className="overlay"></div>
                    <img src={trainerInfo.photo_url} alt="" />
                    <div className="contents">
                        <h1 className='name'>{trainerInfo.first_name} {trainerInfo.last_name}</h1>
                        <div className="socials">
                            <a href={trainerInfo.facebook} target="_blank" className=''><img src={imgFacebook} alt="" /></a>
                            <a href={trainerInfo.twitter} target="_blank"><img src={imgTwitter} alt="" /></a>
                            <a href={trainerInfo.imgInstagram} target="_blank"><img src={imgInstagram} alt="" /></a>
                        </div>
                    </div>
                </div>
            ))
        );
    }


    useEffect(() => {        
        /* Resize event on window size change*/
        function handleResize() {
            /* If the component changes then don't continue because getBoundingClientRect */
            if (window.location.pathname != "/Services") {
                return;
            }

            const carouselContainer = [...document.querySelectorAll(".carousel-track")];
            const card = document.querySelector('.carousel-card');
            const cardWidth = card.getBoundingClientRect().width;

            carouselContainer.forEach((item, i) => {
                item.scrollTo(((cardWidth*(indexCounterRef.current)) + (20*(indexCounterRef.current))), 0);
            })
        }
        window.addEventListener('resize', handleResize);

        /* If clones weren't added to the end yet then add it */
        if (!areClonesAdded && (trainers.length != 0)) {             
            carouselAddClonesToEnd();
        }


        /* Auto slide every 5 seconds */
        let ranOnce = false;
        if (!ranOnce) { /* Or if the cursor is outside the width of the track */
            setTimeout(() => {
                /* If the button was clicked at all then do nothing (return) */
                if (pendingAutoSlideRef.current == false) {
                    return
                }              

                /* Otherwise, continue to scroll */
                let indexAtTime = indexCounterRef.current;
                carouselAutoSlide();
            }, 5000);
        }
        return;
    }, [indexCounterRef.current, detectMouseOutRef.current, trainers]);

    const carouselPreviousClick = () => {
        /* If the animation can't be clicked then do nothing */
        if (!canAdvance) {
            return;
        }

        /* If the component changes then don't continue because getBoundingClientRect */
        if (window.location.pathname != "/Services") {
            return;
        }

        /* Set the buttonClickedRef so the useState autoslide doesn't fire twice */
        setButtonClicked(true);
        setPendingAutoSlide(false);

        const carouselContainer = [...document.querySelectorAll(".carousel-track")];
        const card = document.querySelector('.carousel-card');
        const cardWidth = card.getBoundingClientRect().width;

        /* Update the class to prevent double slides  */
        carouselContainer.forEach((item, i) => {
            const carousel = document.querySelector(".carousel");
            carousel.classList.add("doNotSlide");
            if (!carousel.classList.contains("doNotSlide")) {
                carousel.classList.add("doNotSlide");
            }

            // Update the UseState
            if (indexCounterRef.current < cardCount) {
                setIndexCounter(indexCounterRef.current-1);
            }

            // Adjust the bar to where it needs to be
            item.scrollTo(((cardWidth*(indexCounterRef.current-1)) + (20*(indexCounterRef.current-1))), 0);

            /* See if we need to jump to a non-clone */
            carouselJumpToNonClone();
        })
    }

    const carouselNextClick = event => {
        /* If the animation can't be clicked then do nothing */
        if (!canAdvance) {
            return;
        }

        /* If the component changes then don't continue because getBoundingClientRect */
        if (window.location.pathname != "/Services") {
            return;
        }

        /* Set the buttonClickedRef so the useState autoslide doesn't fire twice */
        setButtonClicked(true);
        setPendingAutoSlide(false);

        const carouselContainer = [...document.querySelectorAll(".carousel-track")];
        const card = document.querySelector('.carousel-card');// Get width of card
        const cardWidth = card.getBoundingClientRect().width;

        carouselContainer.forEach((item, i) => {
            /* Update the class to fix an issue where Button Press and autoslide don't play nice */
            const carousel = document.querySelector(".carousel");
            carousel.classList.add("doNotSlide");
            if (!carousel.classList.contains("doNotSlide")) {
                carousel.classList.add("doNotSlide");
            }

            // Update the UseState
            if (indexCounterRef.current < cardCount) {
                setIndexCounter(indexCounterRef.current+1);
            }

            // Adjust the bar to where it needs to be
            item.scrollTo(((cardWidth*(indexCounterRef.current+1)) + (20*(indexCounterRef.current+1))), 0);

            /* See if we need to jump to a non-clone */
            carouselJumpToNonClone();
        })
    }

    function handleMouseOutInfinite() {
        // Swap the state so the useEffect runs the infinite scroll effect
        if (detectMouseOutRef.current === 1) {
            setDetectMouseOut(2);
        }
        else {
            setDetectMouseOut(1);
        }
    }

    function carouselAutoSlide() {
        /* If the animation can't be clicked then do nothing */
        if (!canAdvance) {
            return false;
        }        

        /* If the component changes then don't continue because getBoundingClientRect */
        if (window.location.pathname != "/Services") {
            return;
        }

        if (pendingAutoSlideRef.current == false) {
            return
        }

        const carousel = document.querySelector(".carousel");
        const carouselContainer = [...document.querySelectorAll(".carousel-track")];
        const card = document.querySelector('.carousel-card');
        const cardWidth = card.getBoundingClientRect().width;


        /* Update the class to fix an issue where Button Press and autoslide  don't play nice */
        if (carousel.classList.contains("doNotSlide")) {
            carousel.classList.remove("doNotSlide");
            return;
        }


        if (!carousel.matches(':hover')) { 
            setPendingAutoSlide(true)
            // Move carousel-track 1 card width.
            carouselContainer.forEach((item, i) => {
                // Update the UseState
                if (indexCounterRef.current < cardCount) {
                    setIndexCounter(indexCounterRef.current+1);
                }

                // Adjust the bar to where it needs to be
                item.scrollTo(((cardWidth*(indexCounterRef.current+1)) + (20*(indexCounterRef.current+1))), 0);
            })
        
            /* See if we need to jump to a non-clone */
            carouselJumpToNonClone();
            return true;
        }
        return false;
    }


    function carouselAddClonesToEnd() {
        if (areClonesAdded) {
            return;
        }

        // Grab the first 10 cards and add it to the end of the carousel
        const cardsToCopyArray = [...document.querySelectorAll(".carousel-card")].slice(0,10); // Gathers all .carousel-cards and puts it in an array. Then cuts it down to the first 10
        let carouselTrack = document.querySelector(".carousel-track");


        cardsToCopyArray.forEach((card, i) => {
            let newNode = card.cloneNode(true);
            carouselTrack.appendChild(newNode);
        })

        /* Update the cardCount use State */
        setCardCount(carouselTrack.childElementCount - 5); 

        setAreClonesAdded(true);
    }

    let carouselJumpToNonClone = () => {
        /* If trainers doesn't exist or we don't need to jump to the beginning (we're not at the end) then stop */
        if ((trainers.length == 0) || (indexCounterRef.current < (trainers?.length-1))) {
            return;
        }    

        /* If the component changes then don't continue because getBoundingClientRect */
        if (window.location.pathname != "/Services") {
            return;
        }

        /* Move the bar forward 1 card with the animation */
        const carouselContainer = [...document.querySelectorAll(".carousel-track")];
        const card = document.querySelector('.carousel-card');// Get width of card
        const cardWidth = card.getBoundingClientRect().width;

        /* Update the counter to reset for next operation */
        setIndexCounter(0);    // If it's main screen, then decrease state by 13 + 5 (originalCardCount + 3)


        /*  Reset the bar to the beginning so the effect is there */
        carouselContainer.forEach((item, i) => {    
            // Move to the next card with the animation ON
            item.scrollTo(((cardWidth*(indexCounter+1)) + (20*(indexCounter+1))), 0);

            /* Use a timeout to ensure the smooth animation plays, otherwise it will snap to the beginning */
            setTimeout(() => {
                /* Turn off the effect */
                item.style.scrollBehavior = "auto";

                /* Move the Bar */
                let reset = 0;
                item.scrollTo(((cardWidth*(reset)) + (20*(reset))), 0);

                /* Turn on the effect */
                item.style.scrollBehavior = "smooth";
                
                /* Turn on can advance so the user can actually click now */
                setCanAdvance(true);
            }, 300);
        })
    }


    /* Modal */
    let openModal = (buttonIndex) => {
        /* setIsModalOpen for the state tracking */
        setIsModalOpen(true);

       /* Close every modal if it was previously opened */
        for (let i=1; i<=3; i++) {
            const photo = document.getElementById(`modalImage${i}`);
            const ul = document.getElementById(`modalUl${i}`);

            photo.style.display = "none";
            ul.style.display = "none";
        }

        /* Grab the elements */
        const modal = document.querySelector(".modal");
        const photo = document.getElementById(`modalImage${buttonIndex}`);
        const ul = document.getElementById(`modalUl${buttonIndex}`);

        /* Change the display from none to block */
        photo.style.display = "block";
        ul.style.display = "block";

        modal.showModal();
    }

    let closeModal = () => {
        setIsModalOpen(false);
        const modal = document.querySelector(".modal");
        modal.close();
    }

    let handleModalClick = (e) => {
        /* If clicked outside the modal div & isModalOpen==true then close the modal */
        let modal = document.getElementById("modalContents");
        if (!modal.contains(e.target)) {
            closeModal();
        }
    }
    

    return ( 
        <section className="services-component">            
            <h1 id='subHeading'>Gym Subscriptions:</h1>
            <div className="card-container">
                <div className="card card-1">
                    <header>
                        <h1>Comfort Pass</h1>
                        <h2 id='sub-price'>$9.99 USD</h2>
                    </header>
                    <div className="benefit-line benefit-check"><h2 id='sub-price'>24/7 Gym Access</h2></div>
                    <div className="benefit-line benefit-check"><h2 id='sub-price'>Access to all Weights and Machines</h2></div>
                    <div className='benefit-line benefit-x'><h2 id='sub-price'>Pool, Spa, and Sauna</h2></div>
                    <div className='benefit-line benefit-x'><h2 id='sub-price'>Access to Soccer, Basketball, and Track Fields</h2></div>
                    <div className='benefit-line benefit-x'><h2 id='sub-price'>Fitness Assessments with a Personal Trainer</h2></div>
                    <div className='benefit-line benefit-x'><h2 id='sub-price'>24/7 Virtual Nutrition Assist</h2></div>                    
                    {!isSignedIn && <Link to="/Login"><button className='sub-purchase'>Purchase Now</button></Link>}
                    {!(userSubscriptionType?.id >= 1) && isSignedIn && <button className='sub-purchase' onClick={() => {stripePayment([{"subscription_type": 1}], email);}}>Purchase Now</button>}
                    {(userSubscriptionType?.id >= 1) && isSignedIn && <button className='sub-purchase'>Already Purchased</button>}
                </div>
                <div className="card card-2">
                    <header>
                        <h1>Premium Pass</h1>
                        <h2 id='sub-price'>$24.99 USD</h2>
                    </header>
                    <div className="benefit-line benefit-check"><h2 id='sub-price'>24/7 Gym Access</h2></div>
                    <div className="benefit-line benefit-check"><h2 id='sub-price'>Access to all Weights and Machines</h2></div>
                    <div className="benefit-line benefit-check"><h2 id='sub-price'>Pool, Spa, and Sauna</h2></div>
                    <div className="benefit-line benefit-check"><h2 id='sub-price'>Access to Soccer, Basketball, and Track Fields</h2></div>
                    <div className='benefit-line benefit-x'><h2 id='sub-price'>Fitness Assessments with a Personal Trainer</h2></div>
                    <div className='benefit-line benefit-x'><h2 id='sub-price'>24/7 Virtual Nutrition Assist</h2></div>
                    {!isSignedIn && <Link to="/Login"><button className='sub-purchase'>Purchase Now</button></Link>}
                    {!(userSubscriptionType?.id >= 2) && isSignedIn && <button className='sub-purchase' onClick={() => {stripePayment([{"subscription_type": 2}], email);}}>Purchase Now</button>}
                    {(userSubscriptionType?.id >= 2) && isSignedIn && <button className='sub-purchase'>Already Purchased</button>}
                </div>
                <div className="card card-3">
                    <header>
                        <h1>All In Pass</h1>
                        <h2 id='sub-price'>$49.99 USD</h2>
                    </header>
                    <div className="benefit-line benefit-check"><h2 id='sub-price'>24/7 Gym Access</h2></div>
                    <div className="benefit-line benefit-check"><h2 id='sub-price'>Access to all Weights and Machines</h2></div>
                    <div className="benefit-line benefit-check"><h2 id='sub-price'>Pool, Spa, and Sauna</h2></div>
                    <div className="benefit-line benefit-check"><h2 id='sub-price'>Access to Soccer, Basketball, and Track Fields</h2></div>
                    <div className='benefit-line benefit-check'><h2 id='sub-price'>Fitness Assessments with a Personal Trainer</h2></div>
                    <div className='benefit-line benefit-check'><h2 id='sub-price'>24/7 Virtual Nutrition Assist</h2></div>
                    {!isSignedIn && <Link to="/Login"><button className='sub-purchase'>Purchase Now</button></Link>}
                    {!(userSubscriptionType?.id >= 3) && isSignedIn && <button className='sub-purchase' onClick={() => {stripePayment([{"subscription_type": 3}], email);}}>Purchase Now</button>}
                    {(userSubscriptionType?.id >= 3) && isSignedIn && <button className='sub-purchase'>Already Purchased</button>}
                </div>
            </div>
            {(userSubscriptionType?.id >= 1) && <h2 style={{color: "white", textAlignLast: "center"}}> Subscription Expiration Date: {`${userSubscriptionType?.expiration}`}</h2>}
            {<h2 style={{color: "white", textAlignLast: "center", margin: "unset", marginTop: "2em"}}>Disclaimer: All purchases are processed via Stripe's test mode and will not charge you.<br></br>For a successful purchase, use card number 4242 4242 4242 4242<br></br>Click the reset button in Orders to reset subscription status</h2>}
            {(trainers.length != 0) && 
            <div className="coaches">
                <h1 id='subHeading'>Build Your Body With Our Best Trainers:</h1>
                <div className="carousel noselect" onMouseLeave={() => {handleMouseOutInfinite();}}>
                    <button className="control left cont-left" onClick={(e) => {
                        e.currentTarget.disabled=true; 
                        let myPromise = new Promise(function(resolve, reject) {carouselPreviousClick(); resolve(e);});
                        myPromise.then(function(resolve) {
                            setTimeout(() => {
                                let control = document.querySelector(".cont-left")
                                control.disabled = false;
                            }, 500);   
                    });}}>&#8678;</button>
                    <div className="carousel-track">
                        {displayTrainerCards()}
                    </div>
                    <button className="control right cont-right" onClick={(e) => {
                        e.currentTarget.disabled=true; 
                        let myPromise = new Promise(function(resolve, reject) {carouselNextClick(); resolve(e);});
                        myPromise.then(function(resolve) {
                            setTimeout(() => {
                                let control = document.querySelector(".cont-right")
                                control.disabled = false;
                            }, 500);            
                    });}}>&#8680;</button>
        
                </div>
            </div>}
            <h1 id='subHeading'>Gym Amenities:</h1>
            <section className='amenities-container'>
                    <div className="track">
                        <button id='imageModal' onClick={() => {openModal(1);}}><img src={lagunaTrack} alt="" /></button>
                        <div className="text">
                            <figcaption>Track Field</figcaption>
                            <p>The track is perfect for a variety of track and field events, including running, jumping, and throwing.</p>
                        </div>
                    </div>
                    <div className="soccer">
                        <button id='imageModal' onClick={() => {openModal(2);}}><img src={lagunaSoccer} alt="" /></button>
                        <div className="text">
                            <figcaption>Soccer Field</figcaption>
                            <p>The field is the best place to get your soccer fix, no matter your skill level or competitive drive. </p>
                        </div>
                    </div>
                    <div className="basketball">
                    <button id='imageModal' onClick={() => {openModal(3);}}><img src={lagunaBasketball} alt="" /></button>
                        <div className="text">
                            <figcaption>Basketball Court</figcaption>
                            <p>The court is well-lit and spacious, making it ideal for both casual and competitive basketball games.</p>
                        </div>
                    </div>
                    <dialog className='modal' onClick={(e) => {handleModalClick(e);}}>
                        <div className="contents" id="modalContents">
                            <div className="images">
                                <img src={lagunaTrack} alt="" id='modalImage1' className='noselect'/>
                                <img src={lagunaSoccer} alt="" id='modalImage2' className='noselect'/>
                                <img src={lagunaBasketball} alt="" id='modalImage3' className='noselect'/>
                            </div>
                            <div className='text'>
                                <button className="closeButton noselect" onClick={() => {closeModal();}}>x</button>
                                <ul id='modalUl1'>
                                    <li>Size: 200 meters</li>
                                    <li>Surface: Mondotrack® indoor track surface</li>
                                    <li>Lighting: LED lighting</li>
                                    <li>Amenities: Scoreboard, bleachers, water fountains, and track and field equipment</li>
                                </ul>
                                <ul id='modalUl2'>
                                    <li>Size: 94 feet by 50 feet</li>
                                    <li>Surface: Sport Court® indoor basketball court flooring</li>
                                    <li>Lighting: LED lighting</li>
                                    <li>Amenities: Scoreboard, bleachers, water fountains, and basketball hoops</li>
                                </ul>
                                <ul id='modalUl3'>
                                    <li>Size: 50 yards by 25 yards</li>
                                    <li>Surface: Indoor soccer turf</li>
                                    <li>Lighting: LED lighting</li>
                                    <li>Amenities: Scoreboard, bleachers, water fountains, and soccer goals</li>
                                </ul>
                            </div>
                        </div>
                    </dialog>
            </section>
        </section>
     );
}
 
export default Services;