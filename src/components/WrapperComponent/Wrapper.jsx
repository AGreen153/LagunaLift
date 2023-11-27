import { useState, useEffect } from "react";
import { createContext } from "react";

/*
This Wrapper is designed to pass global useState variables to all of the children within this component. This is done via createContext.
*/
export let WrapperContext = createContext();

const Wrapper = ({children}) => {
    /* All of the useState's that will be global variables */
    let [isSignedIn, setIsSignedIn] = useState(null);
    let [email, setEmail] = useState();
    let [cartHovered, setCartHovered] = useState(false); /* Used for <cartMini /> logic so <Navbar /> can interact with <cartMini /> */
    let [navbarHovered, setNavbarHovered] = useState(false); /* Used for <cartMini /> and <profile /> logic so <Navbar /> can interact with <cartMini /> and <navbar />*/
    let [profileHovered, setProfileHovered] = useState(false); /* Used for <profile /> logic so <Navbar /> can interact with <profile /> */
    let [inputArrayState, setInputArrayState] = useState([]); /* Used for <cartMini /> and <cartMain /> logic so the input fields will be consistent*/
    let [userType, setUserType] = useState(null); /* Used for <Navbar /> so when a user signs in we know what type of user they are (admin/user) */
    let [userSubscriptionType, setUserSubscriptionType] = useState(null) /* Used for <Services /> so we know what plans to display to the user */

    return ( 
        <WrapperContext.Provider value={{isSignedIn, setIsSignedIn, email, setEmail, cartHovered, setCartHovered, navbarHovered, setNavbarHovered, profileHovered, setProfileHovered, inputArrayState, setInputArrayState, userType, setUserType, userSubscriptionType, setUserSubscriptionType}}>{children}</WrapperContext.Provider>
     );
}
 
export default Wrapper;