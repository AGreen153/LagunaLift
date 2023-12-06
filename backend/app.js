/* "npm run dev" to run the NodeJS and Express with nodemon */
/* Express and NodeJS backend server to create http server */
const express = require('express');
const { getEmployees, getEmployee, getTrainers, getProducts, getProduct, createProduct, createUser, verifyEmail, loginUser, getCart, updateCart, createCookie, getEmailFromSessionID, isEmailSessionIDValid, getProductQuantities, updateStripeOrders, fetchOrders, fetchSubscription, adminFetchOrders, adminProduct, resetSubscription} = require('./index.js')
const cors = require('cors');
const { validationResult, body } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const path = require('path')
require('dotenv').config({ path:
    path.join(__dirname, '.env') });

const app = express()
app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_URL,
}))

/* Backend Logging helper */
function devLogRequestsToConsole(path, date) {
    console.log(`LagunaLift - ${date} - Fetch Request ${path} called`)
    return;
}

/* Webpoints */
app.get("/LagunaLift/getEmployees", async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const validationRes = await getEmployees();
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.get("/LagunaLift/getEmployee/:id",  [
    /* express-validator checks */
    body('id').notEmpty().isNumeric().escape().trim(),
],async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());
    
    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, errors: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const id = req.params.id
        const validationRes = await getEmployee(id);
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.get("/LagunaLift/getTrainers", async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const validationRes = await getTrainers();
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.get("/LagunaLift/LagunaLift/getProducts", async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const validationRes = await getProducts();
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post("/LagunaLift/getProduct", [
    /* express-validator checks */
    body('id').notEmpty().isNumeric().escape().trim(),
], async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, errors: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const {id} = req.body;
        const validationRes = await getProduct(id)
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post("/LagunaLift/createProduct", [
    /* express-validator checks */
    body('id').notEmpty().isNumeric().escape().trim(),
    body('category').notEmpty().matches("Shirts" || "Pants" || "Shoes" || "Headwear").escape().trim(), /* The matches part of this may not work */
    body('product_description').notEmpty().escape(),
    body('price').notEmpty().isDecimal().escape().trim(),
    body('quantity').notEmpty().isNumeric().escape().trim(),
    body('img1').notEmpty().isURL().escape().trim(),
    body('img2').notEmpty().isURL().escape().trim(),
    body('img3').notEmpty().isURL().escape().trim(),
    body('img4').notEmpty().isURL().escape().trim(),
    body('img5').notEmpty().isURL().escape().trim(),
], async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, errors: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const { id, category, product_description, price, quantity, img1, img2, img3, img4, img5 } = req.body
        const validationRes = await createProduct(id, category, product_description, price, quantity, img1, img2, img3, img4, img5)
        res.status(201).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/verifyEmail/', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
], async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());
    
    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, errors: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const { email } = req.body;
        const validationRes = await verifyEmail(email);
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/createUser', [
    /* express-validator checks */
    body('first_name').notEmpty().isAlpha().escape().trim(),
    body('last_name').notEmpty().isAlpha().escape().trim(),
    body('email').notEmpty().isEmail().escape().trim(),
    body('password').notEmpty().escape().trim(),
], async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, errors: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const { first_name, last_name, email, password } = req.body
        const validationRes = await createUser(first_name, last_name, email, password);
        if (validationRes.errors != null && validationRes.errors[0].msg == "Email exists already") {
            res.status(403).send(validationRes);
            return;
        }
        res.status(201).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/loginUser', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
    body('password').notEmpty().escape().trim(),
], async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, errors: errors.array()});
    }


    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const { email, password } = req.body
        const loginEmail = await loginUser(email, password);
        
        if (loginEmail.errors != null && loginEmail.errors[0].msg == "Email does not exist") {
            /* This should be 404 but it clogs the console and makes it look like an external error */
            res.status(200).send(loginEmail);
            return;
        }
        if (loginEmail.errors != null && loginEmail.errors[0].msg == "Wrong Password") {
            /* This should be 404 but it clogs the console and makes it look like an external error */
            res.status(200).send(loginEmail);
            return;
        }
        res.status(200).send(loginEmail);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/getCart', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
], async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, errors: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const { email } = req.body
        const cart = await getCart(email);
        if (cart.errors != null && cart.errors[0].msg == "Email not found") {
            /* This should be 403 but it clogs the console and makes it look like an external error */
            res.status(200).send(cart);
            return;
        }
        res.status(200).send(cart);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/updateCart', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
    body('cart').notEmpty().isArray(),
    body('cookie').notEmpty().escape().trim(),
], async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, errors: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const { email, cart, cookie } = req.body
        const validationRes = await updateCart(email, cart, cookie);
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/createCookie', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
], async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, errors: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const { email } = req.body
        const validationRes = await createCookie(email);
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/getEmailFromSessionID', [
    /* express-validator checks */
    body('sessionID').notEmpty().escape().trim(),
], async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, errors: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const { sessionID } = req.body
        const validationRes = await getEmailFromSessionID(sessionID);
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/isEmailSessionIDValid', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
    body('sessionID').notEmpty().escape().trim(),
], async (req, res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, errors: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    const { email, sessionID } = req.body
    try {
        const validationRes = await isEmailSessionIDValid(email, sessionID);
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/fetch-orders', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
], async (req,res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    const {email} = req.body;

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, error: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const validationRes = await fetchOrders(email);
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/fetch-subscription', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
    body('session_id').notEmpty().escape().trim(),
], async (req,res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, error: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const {email, session_id} = req.body;
        const validationRes = await fetchSubscription(email, session_id);
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/reset-subscription', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
], async (req,res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, error: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const {email} = req.body;
        const validationRes = await resetSubscription(email);
        res.send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/admin-fetch-orders', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
    body('session_id').notEmpty().escape().trim(),
], async (req,res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, error: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const {email, session_id} = req.body;
        const validationRes = await adminFetchOrders(email, session_id);
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

app.post('/LagunaLift/admin-product', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
    body('session_id').notEmpty().escape().trim(),
    body('product').notEmpty(),
], async (req,res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, error: errors.array()});
    }

    /* Evaluate the parameters (if any) and retrieve the data from mySQL */
    try {
        const {email, session_id, product} = req.body;
        const validationRes = await adminProduct(email, session_id, product);
        res.status(200).send(validationRes);
    } catch (e) {
        console.log("An error occured=", e)
        res.status(200).send({"isSuccessful": false, "errors": e})
    }
})

/* Stripe Payments */
/* 
    https://stripe.com/docs/stripe-js/react
    https://stripe.com/docs/checkout/quickstart?client=react&lang=node
*/
app.post('/LagunaLift/create-checkout-session', async (req,res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Body is an array of objects with an id property and quantity property example: [{id: '3', quantity: 1}, {id: '4', quantity: 3}] */
    const email = req.body[req.body.length-1];
    req.body.pop();
    
    /* If it's a subscription */
    if (req.body[0]?.subscription_type != undefined) {
        console.log("LagunaLift - Subscription Payment")
        let subscription1 = {"name": "Subscription (1x): Comfort Pass", "price": 9.99}
        let subscription2 = {"name": "Subscription (1x): Premium Pass", "price": 24.99}
        let subscription3 = {"name": "Subscription (1x): All In Pass", "price": 49.99}

        // Set the subscription name and price based on the subscription_type
        switch (req.body[0]?.subscription_type) {
            case 1:
                delete req.body[0].subscription_type;
                req.body[0].price = subscription1.price;
                req.body[0].name = subscription1.name;
                req.body[0].quantity = 1;
                req.body[0].id = 1;
                break;
            case 2:
                delete req.body[0].subscription_type;
                req.body[0].price = subscription2.price;
                req.body[0].name = subscription2.name;
                req.body[0].quantity = 1;
                req.body[0].id = 2;
                break;
            case 3:
                delete req.body[0].subscription_type;
                req.body[0].price = subscription3.price;
                req.body[0].name = subscription3.name;
                req.body[0].quantity = 1;
                req.body[0].id = 3;
                break;
            default:
                res.status(200).send({"isSuccessful": false, "errors": "Subscription failed - Unknown subscription type"})
                return;
        }

        // Send the information to stripe in their requested formatting
        (async () => {
            try {
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    mode: "payment",
                    line_items: (req.body).map(item => {
                        const storeItem = {priceInCents: (item.price * 100), name: item.name} /* In cents */
                        return { /* Subscription */
                            price_data: {
                                currency: 'usd',
                                product_data: {name: storeItem.name},
                                unit_amount: storeItem.priceInCents
                            },
                            quantity: item.quantity
                        }
                    }),
                    success_url: `${process.env.CLIENT_URL}/SuccessfulPurchase?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${process.env.CLIENT_URL}/Cart`
                })
                // update the backend of the pending stripe request
                let session_id = session.id
                let session_status = session.status
                let status = await updateStripeOrders(session_id, session_status, req.body[0], null);
                res.json({url: session.url})
            } catch (e) {
                res.status(500).json({error: e.message})
            }
        })()
    }

    /* If it's a cart purchase */
    if ((req.body[0].id != undefined) && (req.body[0]?.name == undefined)) {
        
        /* Evaluate the backend and get the current prices and names of each requested item */
        const productsWithPrices = await getProductQuantities(req.body).then((productsWithPrices) => {
            // Make sure the user isn't trying to buy more items than we have in stock and inform them if there's an error
            productsWithPrices.map(item => {
                if (item.quantity > item.max_quantity) {
                    res.status(500).json({error: `Unable to purchase item ${item.product_title}: You tried to purchase ${item.quantity} units while there are ${item.max_quantity} units available.`})
                    return;
                }
            })
            return productsWithPrices;
        }).then((productsWithPrices) => {
            // Send the information to stripe in their requested formatting
            (async () => {
                try {
                    const session = await stripe.checkout.sessions.create({
                        payment_method_types: ["card"],
                        mode: "payment",
                        line_items: productsWithPrices.map(item => {
                            const storeItem = {priceInCents: (item.price * 100), name: item.product_title} /* In cents */
                            return {
                                price_data: {
                                    currency: 'usd',
                                    product_data: {name: storeItem.name},
                                    unit_amount: storeItem.priceInCents
                                },
                                quantity: item.quantity
                            }
                        }),
                        success_url: `${process.env.CLIENT_URL}/SuccessfulPurchase?session_id={CHECKOUT_SESSION_ID}`,
                        cancel_url: `${process.env.CLIENT_URL}/Cart`
                    })
                    let session_id = session.id
                    let session_status = session.status
                    let status = await updateStripeOrders(session_id, session_status, productsWithPrices, null);
                    res.json({url: session.url})
                } catch (e) {
                    res.status(500).json({error: e.message})
                }
            })()
        })
    }
})

app.post('/LagunaLift/evaluate-stripe-sessionID', [
    /* express-validator checks */
    body('email').notEmpty().isEmail().escape().trim(),
    body('session_id').notEmpty().escape().trim(),
], async (req,res) => {
    /* Print Request to Console for Backend Logging */
    devLogRequestsToConsole(req.route.path, new Date());

    /* Data Validation Check via express-validator */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({isSuccessful: false, error: errors.array()});
    }

    const {email} = req.body;
    const {session_id} = req.body;

    /* Check stripe and see if this session_id is valid */
    let paymentInfo = await null;
    try {
        paymentInfo = await stripe.checkout.sessions.retrieve(session_id);
    } catch (e) {
        res.json({isSuccessful: false, error: e.type})
        return;
    }
    let stripe_customer_status = paymentInfo?.status;
    let stripe_sessionID = paymentInfo?.id;

    /* update the backend of the stripe request */
    let result = await updateStripeOrders(stripe_sessionID, stripe_customer_status, null, email);

    res.send(result)
})

/* Error handling */
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke')
  })

app.listen(8080, () => {
    console.log('CORS-enabled web server listening on port 8080')
})


/* Fetch Static assets from the build and serve it using a router using the server (This goes at bottom so it doesn't override the other requests) */
/* Connect locally via http://localhost:8080/ since it's on port 8080 */
const _dirname = path.dirname("")
const buildPath = path.join(_dirname  , "../dist");
path.join(_dirname, '.env')

app.use(express.static(buildPath))

app.get("/*", function(req, res){
    console.log("attempting to send file")
    res.sendFile(
        path.join(__dirname, "../dist/index.html"),
        function (err) {
          if (err) {
            res.status(500).send(err);
          }
        }
      );

})