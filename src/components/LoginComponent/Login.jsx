import "./Login.css"
import { useState, useContext } from "react";
import { useDispatch } from "react-redux";
import { setCookie, deleteCookie } from "../../cookies/cookieLogic";
import { setState } from "../../redux/cartReducer";
import { WrapperContext } from "../WrapperComponent/Wrapper"

const Login = () => {
    let [errorMessage, setErrorMessage] = useState("");
    let [signedInMessage, setSignedInMessage] = useState("You are currently signed in");
    let [signInSuccess, setSignInSuccess] = useState(false);
    const {setEmail, setUserType, setUserSubscriptionType, isSignedIn, setIsSignedIn } = useContext(WrapperContext);
    const dispatch = useDispatch();
    const redirectTimeout = 5000;

    let regexList = [
        {name: "regexMoreThanEight", regex: /^.{8,}$/}, 
        {name: "regexOneLowercase", regex: /[a-z]+/}, 
        {name: "regexOneNumber", regex: /[0-9]+/},
        {name: "regexOneSpecialCharacter", regex: /[!@#$%^&*]/},
        {name: "regexOneUppercase", regex: /[A-Z]+/}
    ]

    function showSignUp() {
        let cardSignInElement = document.getElementById("cardSignIn");
        cardSignInElement.style.display = "none";

        let cardSignUpElement = document.getElementById("cardSignUp");
        cardSignUpElement.style.display = "block";
    }

    function showSignIn() {
        let cardSignInElement = document.getElementById("cardSignIn");
        cardSignInElement.style.display = "block";

        let cardSignUpElement = document.getElementById("cardSignUp");
        cardSignUpElement.style.display = "none";
    }

    function fillAdminInfo() {
        document.getElementById("email").value="AdminEmail@gmail.com";
        document.getElementById("password").value="#AdminPassword22";
    }

    function fillUserInfo() {
        document.getElementById("email").value="UserEmail@gmail.com";
        document.getElementById("password").value="UserPassword!7";
    }

    function validatePasswordStrength() {
        let pass = document.getElementById("input_password").value;
        let passAllChecks = true;

        /* Apply the correct color */
        regexList.map((currElement) => {
            if (currElement.regex.test(pass)) {
                document.getElementById(`li_${currElement.name}`).style.color = "springgreen";
            } else {
                document.getElementById(`li_${currElement.name}`).style.color = "red";
                passAllChecks = false;
            }
        });

        /* Are both passwords the same */
        if (document.getElementById("input_password").value != "") {
            if (document.getElementById("input_password").value === document.getElementById("input_password_validation").value) {
                document.getElementById("li_samePass").style.color = "springgreen";
            } else {
                document.getElementById("li_samePass").style.color = "red";
                passAllChecks = false;
            }
        }
        return passAllChecks;
    }

    function stylingLoginEnable() {
        /* Reset all the variables */
        btn_sign_in.disabled = false;
        btn_sign_in.style.background = "var(--color-blue-3)";
        btn_sign_in.style.color = "black";
        btn_sign_in.innerHTML = "Sign in";
        document.getElementById("span_or").style.display = "block";
        document.getElementById("btnCreateAccount").style.display = "block";
        document.getElementById("text-blue-line").style.display = "block";
        document.getElementById("btnDevAdmin").style.display = "block";
        document.getElementById("btnDevUser").style.display = "block";
        document.getElementById("email").disabled = false;
        document.getElementById("password").disabled = false;
        document.getElementById("email").style.color = "black";
        document.getElementById("password").style.color = "black";
    }

    function stylingLoginDisable() {
        /* Disable the buttons and input fields and show it to the user */
        let btn_sign_in = document.getElementById("btn_sign_in");
        btn_sign_in.disabled = true;
        btn_sign_in.style.background = "grey";
        btn_sign_in.style.color = "white";
        btn_sign_in.innerHTML = "Logging in ... please wait...";
        document.getElementById("span_or").style.display = "none";
        document.getElementById("btnCreateAccount").style.display = "none";
        document.getElementById("text-blue-line").style.display = "none";
        document.getElementById("btnDevAdmin").style.display = "none";
        document.getElementById("btnDevUser").style.display = "none";
        document.getElementById("email").disabled = true;
        document.getElementById("password").disabled = true;
        document.getElementById("email").style.color = "black";
        document.getElementById("password").style.color = "black";
    }

    function stylingSignupEnable() {
        /* Reset all the variables */
        btn_create.disabled = false;
        btn_create.style.background = "linear-gradient(var(--color-blue-2), var(--color-blue-3))";
        btn_create.style.color = "black";
        btn_create.innerHTML = "Create your account";
        document.getElementById("input_first_name").disabled = false;
        document.getElementById("input_first_name").style.color = "black";
        document.getElementById("input_last_name").disabled = false;
        document.getElementById("input_last_name").style.color = "black";
        document.getElementById("input_email").disabled = false;
        document.getElementById("input_email").style.color = "black";
        document.getElementById("input_password").disabled = false;
        document.getElementById("input_password").style.color = "black";
        document.getElementById("btn_to_sign_in").style.display = "block";
    }

    function stylingSignupDisable() {
        /* Disable the button and show it to the user */
        let btn_create = document.getElementById("btn_create");
        btn_create.disabled = true;
        btn_create.style.background = "grey";
        btn_create.style.color = "white";
        btn_create.innerHTML = "Creating your account please wait...";

        /* Disable the input fields and other buttons so nothing weird happens */
        document.getElementById("input_first_name").disabled = true;
        document.getElementById("input_first_name").style.color = "black";
        document.getElementById("input_last_name").disabled = true;
        document.getElementById("input_last_name").style.color = "black";
        document.getElementById("input_email").disabled = true;
        document.getElementById("input_email").style.color = "black";
        document.getElementById("input_password").disabled = true;
        document.getElementById("input_password").style.color = "black";
        document.getElementById("btn_to_sign_in").style.display = "none";
    }

    async function handleSubmitLogin(e) {
        /* Disable default behavior */
        e.preventDefault();

        /* Disable the buttons and input fields and show it to the user */
        stylingLoginDisable();

        /* Store all the information in a JSON object and send to the Node JS Server */
        const email = document.getElementById("email").value;
        const pass = document.getElementById("password").value;

        let userInfoObj = {
            "email": email,
            "password": pass
        }
        const customHeaders = {
            "Content-Type": "application/json",
        }
        const url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/loginUser";

        fetch(url, {
            method: "POST",
            headers: customHeaders,
            body: JSON.stringify(userInfoObj),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.isSuccessful != true) {
                /* Set the Error message useState so the user can see why it failed */
                deleteCookie("email"); 
                deleteCookie("sessionID"); 
                setIsSignedIn(false);
                setUserSubscriptionType(null)
                setUserType(null)
                setErrorMessage(data.errors[0].msg);

                /* Reset all the styling */
                stylingLoginEnable();
                return;
            }

            /* Unset old variables to make sure everything is clean */
            deleteCookie("email"); 
            deleteCookie("sessionID"); 
            setIsSignedIn(false);
            setUserSubscriptionType(null)
            setUserType(null)

            /* Login is Successful Display that to the user */
            document.getElementById("error").style.color = "springgreen"
            setErrorMessage(`Login Successful! You will be redirected in ${redirectTimeout/1000} seconds...`);
            setSignedInMessage(`Login Successful! You will be redirected in ${redirectTimeout/1000} seconds...`);

            /* Update the global variables */
            setUserType(data.role)
            setUserSubscriptionType({"id": Number(data.subscription), "expiration": new Date(data.subscriptionExpiration)})
            setSignInSuccess(true);
            setIsSignedIn(true);
            setEmail(email);

            /* Redirect if successful */
            if (data.isSuccessful == true) {
                setTimeout(() => {
                    if (window.location.pathname != "/Login") {
                        return;
                    }
                    document.getElementById("logo").click();
                }, redirectTimeout);
            }

        })
        .then(() => {
            /* Get the new session ID from the server and store it in a cookie for later use */
            const url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/createCookie";
            userInfoObj = {
                "email": email
            }
            fetch(url, {
                method: "POST",
                headers: customHeaders,
                body: JSON.stringify(userInfoObj),
            })
            .then((response) => response.json())
            .then((data) => {
                setCookie("sessionID", data.sessionID);
                setCookie("email", email);
            }).catch((e) => {
                const errorMessage = e.constructor.name;
                if (errorMessage == "TypeError") {
                    setErrorMessage("Failed to Connect to the Server");
                    stylingLoginEnable();
                }
            })
        })
        .then(() => {
            /* Get the cart and update the redux to that cart */
            const url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/getCart";
            userInfoObj = {
                "email": email
            }
            const customHeaders = {
                "Content-Type": "application/json",
            }
            fetch(url, {
                method: "POST",
                headers: customHeaders,
                body: JSON.stringify(userInfoObj),
            })
            .then((response) => response.json())
            .then((data) => {
                let items = data.items;
                if (data.isSuccessful == false) {
                    console.log("Data is not successful, returning")
                    return;
                }
                /* If the cart is not empty then split */
                if (items==[]) {
                    return;
                }
                /* Remove first and last character to delete the []*/
                
                /* Set the redux */
                dispatch(setState(items));
            }).catch((e) => {
                const errorMessage = e.constructor.name;
                if (errorMessage == "TypeError") {
                    setErrorMessage("Failed to Connect to the Server");
                    stylingLoginEnable();
                }
            })

        })
        .then(() => {
            /* Redirect to the mainpage */
            if (data.isSuccessful == true) {
                setTimeout(() => {
                    if (window.location.pathname != "/Login") {
                        return;
                    }
                    document.getElementById("logo").click();
                }, redirectTimeout);
            }
        })
        .catch((e) => {
            const errorMessage = e.constructor.name;
            if (errorMessage == "TypeError") {
                setErrorMessage("Failed to Connect to the Server2");
                stylingLoginEnable();
            }
        });
        
    }

    function handleSubmitSignUp(e) {
        /* Disable default behavior */
        e.preventDefault();

        /* Ensure that the passwords match */
        if (document.getElementById("input_password").value != document.getElementById("input_password_validation").value) {
            setErrorMessage("Passwords do not match")
            return;
        }

        /* Password Validation */
        if (!validatePasswordStrength()) {
            setErrorMessage("Password Strength Validation is not met")
            return;
        }

        /* Disable the button and show it to the user */
        stylingSignupDisable();

        /* Gather our variables to work with */
        const first_name = e.target[0].value;
        const last_name = e.target[1].value;
        const email = e.target[2].value;
        const password = e.target[3].value;

        /* Store all the information in a JSON object and send to the Node JS Server */
        const userInfoObj = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "password": password
        }
        const customHeaders = {
            "Content-Type": "application/json",
        }
        const url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/createUser";


        fetch(url, {
            method: "POST",
            headers: customHeaders,
            body: JSON.stringify(userInfoObj),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.isSuccessful != true) {
                setErrorMessage(data.errors[0].msg);
                return;
            }

            /* Login is Successful Display that to the user */
            document.getElementById("error").style.color = "springgreen"
            setErrorMessage(`Signup Successful! Logging you in...`);

            /* Fill in the userName and password given to the form login and then sign in the user */
            document.getElementById("email").value = email;
            document.getElementById("password").value = password;
            handleSubmitLogin(e);
        }).catch((e) => {
            const errorMessage = e.constructor.name;
            if (errorMessage == "TypeError") {
                setErrorMessage("Failed to Connect to the Server");
                stylingSignupEnable();
            }
        });
    }


    return ( 
        <section className="login-component">
            {(isSignedIn || signInSuccess) && <h1>{signedInMessage}</h1>}
            {!isSignedIn && !signInSuccess && <>
                <span id="error">{errorMessage}</span>
                <div id="cardSignIn" className="card">
                    <section id="main" className="flex-col">
                        <form action="" method="post" className="flex-col" onSubmit={(e) => {handleSubmitLogin(e)}}>
                            <h1>Sign in with your LagunaLift account</h1>
                            <label htmlFor="email" className="col-grey-label">Email</label>
                            <input type="email" name="" id="email" onChange={() => {setErrorMessage("")}} required/>
                            <label htmlFor="password" className="col-grey-label">Password</label>
                            <input type="password" name="" id="password" onChange={() => {setErrorMessage("")}}  required/>
                            <button type="submit" id="btn_sign_in" className="btn_blue">Sign in</button>
                        </form>
                        <span className="" id="span_or">or</span>
                        <button id="btnCreateAccount" className="btn_orange" onClick={() => {showSignUp()}}>Create your account</button>
                    </section>
                    <h2 className="text-blue-line" id="text-blue-line"><span className="">Dev Tools</span></h2>
                    <section id="dev-tools" className="flex-col">
                        <button id="btnDevAdmin" className="btn_orange" onClick={() => {fillAdminInfo(); setErrorMessage("")}}>Auto Sign in as Admin</button>
                        <button id="btnDevUser" className="btn_orange" onClick={() => {fillUserInfo(); setErrorMessage("")}}>Auto Sign in as User</button>
                    </section>
                </div>
                <div id="cardSignUp" className="card">
                    <form action="" className="flex-col" onSubmit={(e) => {handleSubmitSignUp(e)}}>
                        <h1>Create your Account</h1>
                        <div id="row">
                            <div id="first_name" className="flex-col width50">
                                <label htmlFor="input_first_name">First Name</label>
                                <input type="text" id="input_first_name" onChange={() => {setErrorMessage("")}} required/>
                            </div>
                            <div id="last_name" className="flex-col width50">
                                <label htmlFor="input_last_name">Last Name</label>
                                <input type="text" id="input_last_name" onChange={() => {setErrorMessage("")}} required/>
                            </div>
                        </div>
                        <label htmlFor="input_email">Email</label>
                        <input type="email" id="input_email" onChange={() => {setErrorMessage("")}} required/>
                        <label htmlFor="input_password">Password</label>
                        <input type="password" id="input_password" onChange={() => {validatePasswordStrength(); setErrorMessage("")}} required/>
                        <label htmlFor="input_password_validation">Re-enter password</label>
                        <input type="password" id="input_password_validation" onChange={() => {validatePasswordStrength(); setErrorMessage("")}} required/>
                        <ul>
                            <li id="li_regexMoreThanEight">8 characters minimum</li>
                            <li id="li_regexOneLowercase">One lowercase letter</li>
                            <li id="li_regexOneNumber">One number</li>
                            <li id="li_regexOneSpecialCharacter">One special character</li>
                            <li id="li_regexOneUppercase">One uppercase letter</li>
                            <li id="li_samePass">Passwords must Match</li>
                        </ul>
                        <button type="submit" className="btn_blue" id="btn_create">Create your account</button>
                        <button id="btn_to_sign_in" className="btn_orange" onClick={() => {showSignIn()}}>Have an account?<br></br>Sign in</button>
                    </form>
                </div>
            </> }
        </section>
     );
}
 
export default Login;