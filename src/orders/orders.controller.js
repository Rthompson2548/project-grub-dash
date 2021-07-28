const path = require("path")

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"))

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId")



// MIDDLEWARE

// middleware for checking if there is a delivery location for order
function bodyHasDeliverProperty(req, res, next) {
  const { data: { deliverTo } = {} } = req.body
  // if there is a delivery location in the data, move onto the next function
  if (deliverTo) {
    return next()
  }
  // otherwise, return the following message
  next({
    status: 400,
    message: `A 'deliverTo' property is required.`,
  })
}


// middleware for checking if there is a phone number associated with the order
function bodyHasMobileProperty(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body
  // if there is a phone number associated with the order, move onto next function
  if (mobileNumber) {
    return next()
  }
  // otherwise, return the following message
  next({
    status: 400,
    message: `A 'mobileNumber' property is required.`,
  })
}


// middleware for checking if the order has a status
function bodyHasStatusProperty(req, res, next) {
  const { data: { status } = {} } = req.body
  // if the dish has a delivery status, move onto next function
  if (status) {
    return next()
  }
  // otherwise, return the following message
  next({
    status: 400,
    message: `A 'status' property is required.`,
  })
}


// middleware for checking if the status is in the correct format
function statusHasValidString(req, res, next) {
  const { data: { status } = {} } = req.body
  // if the dish delivery status is one of the following valid statuses, move onto next function
  if (status.includes("pending") || status.includes("preparing") || status.includes("out-for-delivery") || status.includes("delivered")) {
    return next()
  }
  // otherwise, return the following message
  next({
    status: 400,
    message: `status property must be valid string: 'pending', 'preparing', 'out-for-delivery', or 'delivered'`,
  })
}


// middleware for checking if there is a dish(s) in the order
function bodyHasDishesProperty(req, res, next) {
  const { data: { dishes } = {} } = req.body
  // if the order contain 1 or more dishes, move onto the next function
  if (dishes) {
    return next()
  }
  // otherwise, return the following message
  next({
    status: 400,
    message: `A 'dishes' property is required.`,
  })
}


// middleware for checking if there is a valid number of dishes in the order
function dishesIsValidArray(req, res, next) {
  const { data: { dishes } = {} } = req.body
  // if there are no dishes, return the following message
  if (!Array.isArray(dishes) || dishes.length == 0) {
    next({
      status: 400,
      message: `invalid dishes property: dishes property must be non-empty array`,
  })
  }
  // otherwise, move onto the next function
  next()
}


// middleware for checking if there is a valid quantity of a given dish
function dishesArrayHasValidQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body
  // go through every dish in the order
  dishes.forEach((dish) => {
    const quantity = dish.quantity
    // if the dish is not in the order, or they want 0, return the following message
    if (!quantity || quantity <= 0 || typeof quantity !== "number") {
      return next ({
        status: 400,
        message: `dish ${dish.id} must have quantity property, quantity must be an integer, and it must not be equal to or less than 0`
      })
    }
  }) 
  // otherwise, move onto the next function
  next()
}


// middleware for checking if the order and data for the order match
function dataIdMatchesOrderId(req, res, next) {
  const { data: { id } = {} } = req.body
  const orderId = req.params.orderId
  // if the id need not meet 1 or more of the following conditions,
  // return the following message
  if (id !== undefined && id !== null && id !== "" && id !== orderId) {
    next({
      status: 400,
      message: `id ${id} must match orderId provided in parameters`,
    })
  }
  // otherwise, move onto the next function
   return next()
}


// middleware for checking if the order exists
function orderExists(req, res, next) {
  const orderId = req.params.orderId
  // find the correct order from all orders
  const foundOrder = orders.find((order) => order.id === orderId)
  // if it exists, move onto the next function
  if(foundOrder) {
    return next()
  }
  // otherwise, return the following message
  next({
    status: 404,
    message: `Order id not found: ${req.params.orderId}`,
  })
}




// ROUTE HANDLERS

// handler for listing the all of the orders
function list(req, res) {
  res.json({ data: orders })
}


// handler for reading the orders
function read(req, res) {
  const orderId = req.params.orderId
  const foundOrder = orders.find((order) => order.id === orderId)
  res.json({ data: foundOrder })
}


// handler for making a new order
function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status: "out-for-delivery",
    dishes,
  }
  orders.push(newOrder)
  res.status(201).json({ data: newOrder })
}


// handler for updating an order
function update(req, res) {
  const orderId = req.params.orderId
  const foundOrder = orders.find((order) => order.id === orderId)
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
  foundOrder.deliverTo = deliverTo
  foundOrder.mobileNumber = mobileNumber
  foundOrder.status = status
  foundOrder.dishes = dishes
  res.json({ data: foundOrder })
}


// handler for deleting an order
function destroy(req, res, next) {
  const { orderId } = req.params
  const foundOrder = orders.find((order) => order.id === orderId)
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body
  if (foundOrder.status === "pending") {
    const index = orders.findIndex((order) => order.id === Number(orderId))
    orders.splice(index, 1)
    res.sendStatus(204)
  }
  return next ({
      status: 400,
      message: `order cannot be deleted unless order status = 'pending'`,
    })
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [bodyHasDeliverProperty, bodyHasMobileProperty, bodyHasDishesProperty, dishesIsValidArray, dishesArrayHasValidQuantity, create],
  update: [orderExists, dataIdMatchesOrderId, bodyHasDeliverProperty, bodyHasMobileProperty, bodyHasDishesProperty, bodyHasStatusProperty, statusHasValidString, dishesIsValidArray, dishesArrayHasValidQuantity, update],
  delete: [orderExists, destroy],
}