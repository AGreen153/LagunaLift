import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { getCookie } from '../cookies/cookieLogic'

const initialState = {
  products:[]
}

// First, create the thunk
export const addToCartTHUNK = createAsyncThunk(
  'cart/addToCartTHUNK',
  async (objectInfo) => {
    cartSlice.caseReducers.addToCartTHUNK(objectInfo);
    const response = await updateMySQL(state, email, oldState)
    return response.data
  }
)

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

async function updateMySQL(state, email, oldState) {
  /* Update the mySQL for this email */
  const customHeaders = {
    "Content-Type": "application/json",
  }
  const bodyObj = {
    "email": email,
    "cart": state.products,
    "cookie": getCookie("sessionID"),
  }
  const url = import.meta.env.VITE_BACKEND_URL + "/LagunaLift/updateCart"; /* This line may not work because the URL */
  return fetch(url, {
      method: "POST",
      headers: customHeaders,
      body: JSON.stringify(bodyObj),
  })
  .then((response) => response.json())
  .then((data) => {
    if (data.isSuccessful == false) {
      cartSlice.caseReducers.setState(state, oldState);
      return false;
    } else {
      return true;
    }
  }).catch((e) => {
    /* Display the error */
    const errorMessage = e.constructor.name;
    console.log("***An error occured in the CartReducer Redux:", errorMessage)
    return false;
  });
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => { /* Iterate through the store, if it exists increase quantity else add to store */ 
      /* Grab the email from the object then remove it */
      const email = action.payload.email;
      let itemObject = action.payload;
      delete itemObject.email;
      const oldState = JSON.parse(JSON.stringify(state.products));

      const item = state.products.find(item => item.id === action.payload.id)
      if (item) {
          item.quantity+=action.payload.quantity;
      } else {
          state.products.push(itemObject);
      }
      updateMySQL(state, email, oldState).then(res => {
        if (res == false) {
          /* Something failed in the updateMySQL function. Reset the products state to the oldState by calling the setState reducer */
          console.log("The email / cookie provided is not valid. Not updated to mySQL")
        }
      });
    },
    addToCartTHUNK: (state, action) => { /* Iterate through the store, if it exists increase quantity else add to store */ 
      /* Grab the email from the object then remove it */
      const email = action.email;
      let itemObject = action;
      delete itemObject.email;
      const oldState = JSON.stringify(state.products);

      const item = state.products.find(item => item.id === itemObject.id)
      if (item) {
        item.quantity+=itemObject.quantity;
      } else {
        state.products.push(itemObject);
      }
      updateMySQL(state, email, oldState).then(res => {
        if (res == false) {
          /* Something failed in the updateMySQL function. Reset the products state to the oldState by calling the setState reducer */
          return false;
        }
      });
    },
    removeItem: (state, action) => {
      const oldState = state.products;
      const email = action.payload.email;
      delete action.payload.email;

      state.products=state.products.filter(item=>item.id !== action.payload.id);

      if (email != undefined) {
        updateMySQL(state, email, oldState);
      }
    },
    returnItemQuantity: (state, action) => {
    },
    setState: (state, action) => {
      /* Go through every entry in the array, they should have the following types if they dont have it 
          id = string
          title = string
          description = string
          quantity = numeric value
          price = string
          img = string 
      */
      let items = action.payload
      items.map((item) => {
        if (typeof(item.id) != "string") {
          item.id = item.id.toString()
        }

        if (typeof(item.title) != "string") {
          item.title = item.title.toString()
          item.title = `\"${item.title}\"`
        }

        if (typeof(item.description) != "string") {
          item.description = item.description.toString()
          item.description = `${item.description}`
        }

        if (typeof(item.quantity) != "number") {
          item.quantity = Number(item.quantity)
        }

        if (typeof(item.price) != "string") {
          item.price = Number(item.price).toFixed(2)
          item.price = item.price.toString()
        }

        if (typeof(item.img) != "string") {
          item.img = arrayToJSONString(item.img)
        }
      })     
      state.products = action.payload;
    },
    setItemQuantity: (state, action) => {
      /* After changing the quantity in cartMain or cartMini it should update the redux then update the mySQL. Requires a JSON object with attributes id and quantity */
      const email = action.payload.email;
      delete action.payload.email;
      const oldState = state.products;
      let itemIndex = state.products.findIndex(thisItem => thisItem.id === action.payload.id)
      state.products[itemIndex].quantity = action.payload.quantity;
      
      updateMySQL(state, email, oldState);
    },
    resetCart: (state, action) => {
      const oldState = state.products;
      let email = action.payload.email;
      state.products = [];

      updateMySQL(state, email, oldState);
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(addToCartTHUNK.pending, (state, action) => {
      // Add user to the state array
      let objectInfo = action.meta.arg
      cartSlice.caseReducers.addToCartTHUNK(state, objectInfo).then(res => {
      });
    })
  },
})

// Action creators are generated for each case reducer function
export const { addToCart, removeItem, returnItemQuantity, setState, setItemQuantity, resetCart } = cartSlice.actions;

export default cartSlice.reducer