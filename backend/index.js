/* "npm start" to run the backend with nodemon  <- THIS IS OUTDATED NOT USING EXPRESS*/

const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require("mysql2")
const dotenv = require('dotenv')
const Image = require('canvas').Image; /* */
dotenv.config();

/* 
    Connect to the Database 
        - Be sure to change wait_timeout and interactive_timeout in mySQL configuration from 28800 seconds to 31,536,000 seconds (1 year) to prevent timeout issues due to low interactions
            - For help read this https://stackoverflow.com/questions/4440336/mysql-wait-timeout-variable-global-vs-session
            - For RDS help read this https://stackoverflow.com/questions/31147206/amazon-rds-unable-to-execute-set-global-command
*/
const app = express()

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER, 
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,

    multipleStatements: false
}).promise(); 

/*
    Helper Functions
*/
function makeSessionID() { /* Logic needed to create a random 32 cookie of 62 characters: 62^32 = 2.2726579e+57*/
    let result = "";
    let length = 32;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
};


/* 
    Get Requests 
*/
app.get("/", (req, res)=>{
    res.json("hello this is the backend!");
});

/* 
    Backend logic 
*/
async function getEmployees() {
    const q = "SELECT id, first_name, last_name, position, photo_url, facebook, twitter, instagram FROM employees";
    
    const [rows] = await db.query(q);
    return rows;
}

async function getEmployee(id) {
    const q = "SELECT * FROM employees WHERE id = ?";
    
    const [rows] = await db.query(q, [id]);
    return rows[0];
}

async function getTrainers() {
    const q = "SELECT id, first_name, last_name, position, photo_url, facebook, twitter, instagram FROM employees WHERE position='trainer'";
    
    const [rows] = await db.query(q);
    return rows;
}

async function getProducts() {
    const q = "SELECT id, product_description, category, quantity, max_quantity, product_title, price, img1, img2, img3, img4, img5 FROM products";
    
    const [rows] = await db.query(q);
    return rows;
}

async function getProduct(id) {
    const q = "SELECT * FROM products WHERE id = ?";
    
    const [rows] = await db.query(q, [id]);
    return rows[0];
}

async function createProduct(category, product_title, product_description, price, quantity, max_quantity, img1, img2, img3, img4, img5) {
    const q = "INSERT INTO products (category, product_title, product_description, price, quantity, max_quantity, img1, img2, img3, img4, img5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    
    const [result] = await db.query(q, [category, product_title, product_description, price, quantity, max_quantity, img1, img2, img3, img4, img5]);
    const newId = result.insertId;
    return getProduct(newId);
}

async function verifyEmail(email) {
    const q = "SELECT email FROM users WHERE email = ?";
    const responseObject = {
        isSuccessful: false,
        errors: null
    }

    const [rows] = await db.query(q, [email]);
    if (rows[0] == undefined) {
        responseObject.errors = [{"msg": "Email does not exist"}];
    } else {
        responseObject.isSuccessful = true;
    }
    return responseObject;
}

async function createUser(first_name, last_name, email, password) {
    const hash = await bcrypt.hash(password, 15);
    const q = "INSERT INTO users (email, password, first_name, last_name, role, cart) VALUES (?, ?, ?, ?, 'user', null)";
    const responseObject = {
        isSuccessful: false,
        errors: null
    }

    // Check if the email exists and if it does then reject this submission so there's no duplicates
    if ((await verifyEmail(email)).isSuccessful == true) {
        responseObject.errors = [{"msg": "Email exists already"}];
        return responseObject;
    }

    // Send the query to mySQL and if it updates successfully then update the JSON responseObject
    const [result] = await db.query(q, [email, hash, first_name, last_name])
    if ([result][0].affectedRows == 1) {
        responseObject.isSuccessful = true;
    }
    return responseObject;
}

async function loginUser(email, password) {
    const q = "SELECT email, password, cart, role, subscription FROM users WHERE email = ?";
    const responseObject = {
        isSuccessful: false,
        errors: null
    }

    // Fetch the query from mySQL and make sure it exists
    const [query] = await db.query(q, [email]);
    let user = query[0];
    if (user == undefined) {
        responseObject.errors = [{"msg": "Email does not exist"}];
        return responseObject;
    }

    // Check that the password given matches the DB
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
        responseObject.errors = [{"msg": "Wrong Password"}];
        return responseObject;
    }

    // Check if their subscription is expired, if it is then remove it
    if (user.subscription != null) {
        let expiration_date = Date.parse(JSON.parse(user.subscription).expiration_date)
        let nowTime = new Date();
        if (expiration_date < nowTime) {
            // Expiration date is expired so remove it
            const qDeleteSubscription = "UPDATE users SET subscription= ? WHERE email = ?"
            const [rowsUpdateCart] = await db.query(qDeleteSubscription, [null, email]);
            if (rowsUpdateCart.affectedRows <=0 || rowsUpdateCart.affectedRows > 1) {
                responseObject.errors = "Unable to login - Subscription Verification failed";
                return responseObject;
            } else {
                responseObject.subscription = null;
            }
        }
    }

    // All user data is verified, gather their details and send it back to the frontend
    responseObject.isSuccessful = true;
    responseObject.cart = await getCart(email);
    responseObject.role = user.role;
    responseObject.subscription = JSON.parse(user.subscription)?.subscription_type;
    return responseObject;
}

async function getCart(email) {
    const q = "SELECT cart FROM users WHERE email = ?";
    const responseObject = {
        isSuccessful: false,
        errors: null
    }
    const [rows] = await db.query(q, [email]);

    // Check if the email exists
    if (rows[0] == undefined) {
        responseObject.isSuccessful = false;
        responseObject.errors = [{"msg": "Email not found"}];
        return responseObject;
    }

    // Prepare the JSON responseObject with the results from mySQL
    responseObject.isSuccessful = true;
    if (rows[0].cart == null) {
        responseObject.items = [];
    } else {
        let items = [rows][0][0].cart;
        responseObject.items = JSON.parse(items);
    }
    responseObject.items.map((item) => {
        // Add quotations around the title and description
        item.title = `\"${item.title}\"`
        item.description = `\"${item.description}\"`
    })

    return responseObject;
}

async function updateCart(email, cart, cookie) {
    let q = "UPDATE users SET cart= ? WHERE (email = ?) AND (sessionID = ?)";
    const responseObject = {
        isSuccessful: false,
        errors: null
    }
    let cartJSON = "";
    
    // Prepare the string which will be stored in mySQL and later parsed with JSON.parse()
    if (cart.length == 0) {
        cartJSON = "[]";
    } else {
        // Iterate through every entry in the cart and make it satisfy JSON requirements
        cartJSON = "[";
        for (const index in cart) {
            cartJSON += "{";
            const item = cart[index];
            for (const property in item) {
                cartJSON += `\"${property}\": ${item[property]}, `
            }
            // Remove the last comma and space
            cartJSON = cartJSON.substring(0, cartJSON.length-2);
            cartJSON += "}, ";
        }
        // Remove the last comma and space
        cartJSON = cartJSON.substring(0, cartJSON.length-2);
        cartJSON += "]"
    }

    // Update mySQL with the given parameters matching the query q
    const [rows] = await db.query(q, [cartJSON, email, cookie]); /* https://www.php.net/manual/en/mysqli-stmt.bind-param.php */
    
    // Evaluate if the query was successfully updated
    if (rows.affectedRows > 0) {
        responseObject.isSuccessful = true;
    } else {
        responseObject.errors = [{"msg": "Email not found"}];
    }
    return responseObject;
}

async function createCookie(email) {
    let q = "UPDATE users SET sessionID= ? WHERE email = ?";
    const responseObject = {
        isSuccessful: false,
        errors: null
    }

    // Create a random sessionID string and confirm it does not exist in the db
    let sessionID = makeSessionID();
    let sessionIDExists = (await getEmailFromSessionID(sessionID)).isSuccessful;

    // If the sessionID exists in the database then make a new one
    while (sessionIDExists) {
        sessionID = makeSessionID();
        sessionIDExists = (await getEmailFromSessionID(sessionID)).isSuccessful;
    }

    // Update mySQL with the given parameters matching the query q and evaluate whether it was successful
    const [rows] = await db.query(q, [sessionID, email]); /* https://www.php.net/manual/en/mysqli-stmt.bind-param.php */
    if (rows.affectedRows > 0) {
        responseObject.isSuccessful = true;
        responseObject.sessionID = sessionID;
    } else {
        responseObject.errors = [{"msg": "Email not found"}];
    }
    return responseObject;
}

async function getEmailFromSessionID(sessionID) {
    const q = "SELECT email, cart FROM users WHERE sessionID = ?";
    const responseObject = {
        isSuccessful: false,
        errors: null
    }

    // Check mySQL to see if the given sessionID is unique and send the result back
    const [rows] = await db.query(q, [sessionID]); /* https://www.php.net/manual/en/mysqli-stmt.bind-param.php */
    if (rows.length > 0) {
        responseObject.isSuccessful = true;
        responseObject.email = rows[0].email;
    } else {
        responseObject.errors = [{"msg": "sessionID not found"}];
    }
    return responseObject;
}

async function isEmailSessionIDValid(email, sessionID) {
    const q = "SELECT email, role, subscription FROM users WHERE email = ? AND sessionID = ?";
    const responseObject = {
        isSuccessful: false,
        errors: null,
        role: null
    }

    // Fetch info from mySQL with the given parameters matching the query q
    const [rows] = await db.query(q, [email, sessionID]); /* https://www.php.net/manual/en/mysqli-stmt.bind-param.php */
    
    // If the email and sessionID match then prepare the JSON responseObject with the correct information
    if (rows.length > 0) {
        // Check if the user's subscription status is expired, if it is then remove it
        let expiration_date = Date.parse(JSON.parse(rows[0].subscription)?.expiration_date)
        let nowTime = new Date();
        if (expiration_date < nowTime) {
            // The subscription is expired so delete it
            const qDeleteSubscription = "UPDATE users SET subscription= ? WHERE email = ?"
            const [rowsUpdateCart] = await db.query(qDeleteSubscription, [null, email]);
            if (rowsUpdateCart.affectedRows <=0 || rowsUpdateCart.affectedRows > 1) {
                responseObject.errors = "Unable to login - Subscription Verification failed";
                return responseObject;
            } else {
                responseObject.subscription = null;
            }
        }

        // Prepare the JSON responseObject with the correct information
        responseObject.isSuccessful = true;
        responseObject.email = rows[0].email;
        responseObject.role = rows[0].role;
        responseObject.subscription = JSON.parse(rows[0]?.subscription)?.subscription_type;
        responseObject.subscriptionExpiration = JSON.parse(rows[0].subscription)?.expiration_date;
    } else {
        responseObject.errors = [{"msg": "The given Email and SessionID tokens do not match"}];
    }

    return responseObject;
}

async function getProductQuantities(userProducts) {   
    // Fetch all products from the database and store the info into products
    let products = await getProducts()

    /* 
    Iterate through all of our given products and update the JSON so it has the up to date information
        - userProducts example: [{id: '3', quantity: 1}, {id: '4', quantity: 3}]
        - after mapping result: [{id: '3', quantity: 1, price: 0.01, product_title: 'nameHere', max_quantity: '5', photo: 'photo_url_here'}, {id: '4', quantity: 3, price: 345.5, product_title: 'nameHere', max_quantity: '5', photo: 'photo_url_here'}]
    */
    userProducts?.map(item => {
        let dbProductInfo = products.find(o => o.id == item.id);
        item.price = Number(Number(dbProductInfo.price).toFixed(2))
        item.product_title = dbProductInfo.product_title
        item.max_quantity = dbProductInfo.quantity
        item.photo = dbProductInfo.img1
    })

    return userProducts;
}

async function updateStripeOrders(session_id, status, items, email) {
    let responseObject = {isSuccessful: false}
    const qInsert = "INSERT INTO stripe_orders (session_id, status, items, time, email) VALUES (?, ?, ?, ?, ?)"
    const qUpdateStatus = "UPDATE stripe_orders SET status= ?, time= ?, email= ? WHERE session_id = ?";
    const qFetchUsersOrders = "SELECT stripe_orders FROM users WHERE email = ?";
    const qUpdateUsers = "UPDATE users SET stripe_orders= ? WHERE email = ?";
    const qUpdateUsersSubscription = "UPDATE users SET subscription= ? WHERE email = ?";
    const qSelectAll = "SELECT * FROM stripe_orders WHERE session_id = ?";
    const qUpdateItem = "UPDATE products SET quantity= ? WHERE id= ?"
    var dateTime = new Date();

    // Check if the session_id exists
    const [rowsWithSessionID] = await db.query(qSelectAll, [session_id]);
    let isSessionIDInDB = rowsWithSessionID?.length>0 ? true : false;
    let sessionIDStatus = rowsWithSessionID[0]?.status;
    let sessionItems = rowsWithSessionID[0]?.items;
    

    // If session_id doesnt exist then create it with qInsert (This is a pending request, add it)
    if (!isSessionIDInDB && items != null && status == "open") {
        const [rows] = await db.query(qInsert, [session_id, status, JSON.stringify(items), dateTime, null]);
        if (rows.affectedRows > 0 ) {
            responseObject.isSuccessful = true;
            return responseObject;
        }
    }

    // If session_id does exist and the old status was complete then this is a duplicate, ignore it
    if (isSessionIDInDB && sessionIDStatus == "complete") {
        responseObject.error = "This payment has already been completed";
        return responseObject;
    }


    /* 
       If it wasnt then if the parameter status is complete and the sessionID exists then we have to iterate through
       every item and items and update the products database's quantity so it's accurate. 
       
       THEN we have to update our users database and change the orders column and add those items to the database WITH THE DATE
       so we know when the processing happened.
    */
    if (isSessionIDInDB && status == "complete") {
        let items = JSON.parse(sessionItems)
        let isEverythingUpdated = {isSuccessful: true, error: []};
        

        /* Check if it's a subscription */
        if ((Object.prototype.toString.call(items) == "[object Object]") && items.name != undefined) {
            /* 
                Update the users table so their subscription  is up to date with this subscription
                The desired end result format is {"subscription_type": "1", "purchase_date": "", "expiration_date": "2024-11-04T14:10:54.670Z"} 
            */
            const dateNow = new Date();
            const dateExpiration = new Date();
            dateExpiration.setDate(dateExpiration.getDate() + 30);
            let resultObject = {"subscription_type": items.id, "purchase_date": dateNow, "expiration_date": dateExpiration}

            // Insert the object into the usersTable with the correct dates
            const [subsUpdateResult] = await db.query(qUpdateUsersSubscription, [JSON.stringify(resultObject), email]);
            if (subsUpdateResult.affectedRows <=0 || subsUpdateResult.affectedRows > 1) {
                responseObject.error = "Unable to update subscription";
                return responseObject;
            }

            // Update the stripe_orders table's status so it's up to date (open -> complete)
            const [rowsOrders] = await db.query(qUpdateStatus, [status, dateTime, email, session_id]);
            if (rowsOrders.affectedRows <=0 || rowsOrders.affectedRows > 1) {
                responseObject.error = "Unable to update status";
                return responseObject;
            }

            // Check that everything was updated properly
            if (isEverythingUpdated.isSuccessful == true) {
                responseObject.isSuccessful = true;
                return responseObject;
            } else {
                responseObject.error = isEverythingUpdated.error;
                return responseObject;
            }   
        }

        // Check if it's a cart purchase
        if ((Object.prototype.toString.call(items) == "[object Array]") && items[0]?.id != undefined) {
            // Update the products table so the quantity value is up to date
            for (let index=0; index<items.length; index++) {
                let item = items[index];
                let dbProduct = await getProduct(item.id)
                let newQuantity = dbProduct?.quantity - item?.quantity;

                // Update the products database with this item so it's now the new Quantity
                const [rows] = await db.query(qUpdateItem, [newQuantity, dbProduct?.id]);
                if (rows.affectedRows <=0 || rows.affectedRows > 1) {
                    isEverythingUpdated.isSuccessful = false;
                    isEverythingUpdated.error.push(dbProduct?.id)
                }
            }

            /* Update the users table so their orders is up to date with this order */
            // Get their old orders
            let [orders] = await db.query(qFetchUsersOrders, [email]);
            orders = orders[0].stripe_orders
            if (orders == null) {
                orders = [];
            } else {
                orders = JSON.parse(orders)
            }
            
            // Prepare constants and dates
            let info = {date: null, session_id: session_id}
            const date = new Date();
            info.date = date;

            // Append this object to their old stripe_orders
            let newObject = {items: items, info: info}
            orders.push(newObject)

            // Send this new information with the updated cart 
            const [rowsUpdateCart] = await db.query(qUpdateUsers, [JSON.stringify(orders), email]);
            if (rowsUpdateCart.affectedRows <=0 || rowsUpdateCart.affectedRows > 1) {
                responseObject.error = "Unable to update cart";
                return responseObject;
            }

            // Update the stripe_orders table's status so it's up to date (open -> complete)
            const [rowsOrders] = await db.query(qUpdateStatus, [status, dateTime, email, session_id]);
            if (rowsOrders.affectedRows <=0 || rowsOrders.affectedRows > 1) {
                responseObject.error = "Unable to update status";
                return responseObject;
            }

            // Check that everything was updated properly
            if (isEverythingUpdated.isSuccessful == true) {
                responseObject.isSuccessful = true;
                return responseObject;
            } else {
                responseObject.error = isEverythingUpdated.error;
                return responseObject;
            }    
        }
    }

    return responseObject;
}

async function fetchOrders(email) {
    const responseObject = {isSuccessful: false}
    const qFetchUsersOrders = "SELECT stripe_orders FROM users WHERE email = ?";
    
    // Fetch info from mySQL with the given parameters matching the query q
    let [orders] = await db.query(qFetchUsersOrders, [email]);
    if (orders.length == 0) {
        responseObject.error = "Email not found in database"
        return responseObject;
    }
    orders = orders[0].stripe_orders

    // Update the JSON responseObject so it's up to date
    responseObject.isSuccessful = true
    responseObject.orders = JSON.stringify(orders);

    return responseObject;
}

async function fetchSubscription(email, session_id) {
    const responseObject = {isSuccessful: false}
    const qFetchUsersOrders = "SELECT subscription FROM users WHERE email = ? AND sessionID= ?";
    
    // Fetch info from mySQL with the given parameters matching the query q and if email doesnt exist then update the JSON responseObject
    let [subscription] = await db.query(qFetchUsersOrders, [email, session_id]);
    if (subscription.length == 0) {
        responseObject.error = "Email not found in database"
        return responseObject;
    }

    // Confirm that the subscription exists
    subscription = subscription[0].subscription
    if (subscription == null) {
        responseObject.error = "No current subscription"
        return responseObject;
    }

    // Send the updated information to the JSON responseObject
    responseObject.isSuccessful = true
    responseObject.subscription = JSON.stringify(subscription);

    return responseObject;
}

let checkImage = path =>
        // Try to create a new image with the given URL and if it doesn't resolve properly then we know the image URL is invalid
        new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve({path, status: 'ok'});
            img.onerror = () => resolve({path, status: 'error'})

            if (path == "" || path == null) { /* If the input field was empty */
                resolve({path, status: null})
            }
            img.src = path;
        }   
);

async function adminFetchOrders(email, sessionID) {
    let qGetUserType = `SELECT role FROM users WHERE email= ? AND sessionID= ?`
    const qFetchUsersOrders = "SELECT * FROM stripe_orders WHERE status= ? ";
    const responseObject = {
        isSuccessful: false,
        errors: null,
    }

    // Double check that the email and session ID match up and the user is valid via the query qGetUserType
    const [userTypeResult] = await db.query(qGetUserType, [email, sessionID]);
    let userType = userTypeResult[0]?.role;

    // Confirm that the user is an Admin, if it's not then update JSON responseObject with the error
    if (userType != "admin") {
        responseObject.errors = "Submission Rejected: You are not an admin";
        return responseObject;
    }

    // Fetch the orders from stripe_orders where status is complete (so they don't see pending unsuccessful orders)
    const [orders] = await db.query(qFetchUsersOrders, ["complete"]);
    if (orders.length == 0) {
        responseObject.errors = "No orders found in database"
        return responseObject;
    } else {
        responseObject.isSuccessful = true
        responseObject.orders = orders;
        return responseObject;
    }
};

async function adminProduct(email, sessionID, product) {
    const responseObject = {
        isSuccessful: false,
        errors: null,
    }

    // Double check that the email and session ID match up and the user is valid and an admin
    let qGetUserType = `SELECT role FROM users WHERE email= ? AND sessionID= ?`
    const [userTypeResult] = await db.query(qGetUserType, [email, sessionID]);
    let userType = userTypeResult[0]?.role;
    if (userType != "admin") {
        responseObject.errors = "Submission Rejected: You are not an admin";
        return responseObject;
    }

    // Validation: ID - Not empty 
    if (product.id == "") {
        responseObject.errors = "Submission Rejected: ID cannot be empty";
        return responseObject;
    }

    // Validation: Title - Not empty
    if (product.product_title == "" || product.product_title == null) {
        responseObject.errors = "Submission Rejected: Title is missing";
        return responseObject;
    }

    // Validation: Product_description - Not empty
    if (product.product_description == "" || product.product_description == null) {
        responseObject.errors = "Submission Rejected: Description is missing";
        return responseObject;
    }

    // Validation: Quantity
    if (product.quantity <= 0 || (product.quantity % 1) != 0 || product.quantity == undefined) {
        responseObject.errors = "Submission Rejected: Quantity needs to be greater than 0 AND a whole number";
        return responseObject;
    }

    // Validation: Price
    if (Number(product.price) < 0.50) {
        responseObject.errors = "Submission Rejected: Price needs to be $0.50 or greater";
        return responseObject;
    }
    product.price = Number(product.price);

    // Validation: Image SRC
    let isImg1Valid = await checkImage(product.img1)
    let isImg2Valid = await checkImage(product.img2)
    let isImg3Valid = await checkImage(product.img3)
    let isImg4Valid = await checkImage(product.img4)
    let isImg5Valid = await checkImage(product.img5)
    if ((isImg1Valid.status == "error") || (isImg2Valid.status == "error") || (isImg3Valid.status == "error") || (isImg4Valid.status == "error") || (isImg5Valid.status == "error")) {
        responseObject.errors = "Submission Rejected: An image URL is invalid";
        return responseObject;
    }

    // Validaton: At least 1 image is provided
    if ((isImg1Valid.status == null) && (isImg2Valid.status == null) && (isImg3Valid.status == null) && (isImg4Valid.status == null) && (isImg5Valid.status == null)) {
        responseObject.errors = "Submission Rejected: At least 1 image is required";
        return responseObject;
    }

    // Validation: Category is one of the following (Shoes, Shirts, Pants, Headwear)
    let categoryValidity = false;
    if (product.category == "shoes" || product.category == "shirts" || product.category == "pants" || product.category == "headwear") {
        categoryValidity = true;
    }
    if (categoryValidity == false) {
        responseObject.errors = "Submission Rejected: Invalid category provided";
        return responseObject;
    }
    // Capitalize first letter to ensure it's compliant with the DB
    let firstLetter = product.category.charAt(0).toUpperCase()
    product.category = product.category.slice(1)
    product.category = firstLetter + product.category

    // Validation: Get new max_quantity by calling the product by ID if it exists and doing a calculation. If it doesnt exist then the quantity is the max_quantity
    let dbProduct = null;
    (product.id != undefined && product.id != "") ? dbProduct = await getProduct(product.id) : "";
    if (product.id != undefined && product.id != "") {
        product.max_quantity = (Number(dbProduct.max_quantity) + ( Number(product.quantity) - Number(dbProduct.quantity)))
    }

    /* Create a new array so we don't have gaps in imgs (example no 1, 2, 4, 5) */
    let imgArray = [];
    isImg1Valid.status == "ok" ? imgArray.push(product.img1) : ""
    isImg2Valid.status == "ok" ? imgArray.push(product.img2) : ""
    isImg3Valid.status == "ok" ? imgArray.push(product.img3) : ""
    isImg4Valid.status == "ok" ? imgArray.push(product.img4) : ""
    isImg5Valid.status == "ok" ? imgArray.push(product.img5) : ""
    // Fill in the remaining properties with null so it's easier for the mySQL statement
    switch (imgArray.length) {
        case 1:
            product.img1 = imgArray[0]
            product.img2 = null;
            product.img3 = null;
            product.img4 = null;
            product.img5 = null;
            break;
        case 2:
            product.img1 = imgArray[0]
            product.img2 = imgArray[1]
            product.img3 = null;
            product.img4 = null;
            product.img5 = null;
            break;
        case 3:
            product.img1 = imgArray[0]
            product.img2 = imgArray[1]
            product.img3 = imgArray[2]
            product.img4 = null;
            product.img5 = null;
            break;
        case 4:
            product.img1 = imgArray[0]
            product.img2 = imgArray[1]
            product.img3 = imgArray[2]
            product.img4 = imgArray[3]
            product.img5 = null;
            break;
        case 5:
            break;
    }
    
    // Send the input field information to the backend mySQL server
    // If ID doesnt exist in object then it's a submission. If it does then it's an edit (if it's not a number then it's an error)
    if (product.id == undefined) {
        // This is a submission, make sure this product_title doesn't exist and if it doesn't then submit
        let newProduct = await createProduct(product.category, product.product_title, product.product_description, product.price, product.quantity, product.max_quantity, product.img1, product.img2, product.img3, product.img4, product.img5)
        if (newProduct != null || newProduct != undefined) {
            responseObject.isSuccessful = true;
            return responseObject;
        }
    }
    if (typeof(product.id) == "number") {
        // This is an update, make sure the ID exists (this is done if the row is changed)
        const qUpdateItem = "UPDATE products SET category= ?, max_quantity=?, price= ?, product_title= ?, quantity= ?, img1= ?, img2= ?, img3= ?, img4= ?, img5= ? WHERE id= ?"
        const [rows] = await db.query(qUpdateItem, [product.category, product.max_quantity, product.price, product.product_title, product.quantity, product.img1, product.img2, product.img3, product.img4, product.img5, product.id]);
        if (rows.affectedRows <=0 || rows.affectedRows > 1) {
            responseObject.errors = "Submission Rejected: Product was not updated";
            return responseObject;
        } else {
            responseObject.isSuccessful = true;
            return responseObject;
        }
    }

    // If we get to this point then the validation wasn't successful so return the error to the user
    responseObject.errors = "Unable to add/update the item"
    return responseObject;
}

async function resetSubscription(email) {
    const responseObject = {
        isSuccessful: false,
        errors: null,
    }
    let qUpdateSubscription = "UPDATE users SET subscription= ? WHERE email= ?"

    // Update mySQL with the given parameters matching the query qUpdateSubscription
    const [rows] = await db.query(qUpdateSubscription, [null, email]);

    // Evaluate if the update happened and update the JSON responseObject
    if (rows.affectedRows <=0 || rows.affectedRows > 1) {
        responseObject.errors = "Submission Rejected: Product was not updated";
        return responseObject;
    } else {
        responseObject.isSuccessful = true;
        return responseObject;
    }
}

// app.listen(8800, () => { /* 8800 is the port that it will be listening from */
//     console.log("Connected to backend!")
// })

module.exports = {
    getEmployees, 
    getEmployee, 
    getTrainers, 
    getProducts, 
    getProduct, 
    createProduct, 
    createUser, 
    verifyEmail, 
    loginUser, 
    getCart, 
    updateCart, 
    createCookie, 
    getEmailFromSessionID, 
    isEmailSessionIDValid, 
    getProductQuantities,
    updateStripeOrders,
    fetchOrders,
    fetchSubscription,
    adminFetchOrders,
    adminProduct,
    resetSubscription,
  };