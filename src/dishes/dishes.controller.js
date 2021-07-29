// COMPLETE!!

const path = require("path")

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"))

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId")

// instructions:
// add middleware and handlers for dishes to this file, 
// then export the functions for use by the router.


// middleware for checking if the dish has a name in order 
// to move onto 'create' and 'update' handler
function bodyHasName(req, res, next) {
    const { data: { name } = {} } = req.body
    // if the dish has a name, move the request body onto the next function
    if (name) {
        return next()
    }
    // if no name is provided, stop executing and return the following 
    next({
        status: 400,
        message: `A 'name'property is required.`,
    })
}


// middleware for checking if the dish has an image property
// in order to move onto 'create' and 'update' handler
function bodyHasImg(req, res, next) {
  const { data: { image_url } = {} } = req.body
  // if there is an image url
  if (image_url) {
  // move onto next function
  return next()
  }
  // otherwise, return the following message
  next({
    status: 400,
    message: `A 'image_url' property is required.`,
  })
}



// middleware for checking if the dish has a price
// in order to move onto 'create' and 'update' handler
function bodyHasPrice(req, res, next) {    
  // price is the request body, but is empty object as default
  const { data: { price } } = {} = req.body 
  // if a price is provided, move to next function
  if (price) {
      return next()
  }
  // otherwise, return the following message
  next({
      status: 400,
      message: `A 'price' property is required.`,
  })
}


// middleware for checking if the dish has a description 
// in order to move onto 'create' and 'update' handler
function bodyHasDescription(req, res, next) {
    // description is the request body, but is empty object as default
    const { data: { description } = {} } = req.body
    // if there is a description, move on to the next function
    if (description) {
        return next()
    }
    // otherwise, return the following message
    next({
        status: 400,
        message: `A 'description' property is required.`,
      })
}



// middleware for checking if the dish has a valid price property
// in order to move onto 'create' handler
function bodyHasValidPrice(req, res, next) {
    const { data: { price } = {} } = req.body
    // if there is a valid price, move onto next function
    if (price > 0) {
      return next()
    }
    // otherwise, return the following message
    next({
      status: 400,
      message: `price cannot be less than 0`,
    })
}

  
// middleware for checking if the dish's price property is
// valid for updating it in order to move onto 'update' handler
function bodyHasValidPriceForUpdate(req, res, next) {
    const { data: { price } = {} } = req.body
    // if the price data type is not a number, or if
    // the price is less than or equal to $0, return the 
    // following message
    if (typeof(price) !== "number" || price <= 0) {
      next({
        status: 400,
        message: `type of price must be number`,
      })
    }
    // otherwise, move onto the next function()
    return next()
}
  
// middleware for checking if the dish exists in the data in order to move
// onto 'read' and 'update' handler
function dishExists(req, res, next) {
    const { dishId } = req.params
    // create a variable for the dish that matches the dish's id
    const matchingDish = dishes.find((dish) => dish.id === dishId)
    // if there is a matching dish, move onto the next function
    if (matchingDish) {
      return next()
    }
    // otherwise, return the following message
    next ({ 
      status: 404,
      message: `Dish id not found: ${dishId}`,
    })
}
  

// write a separate helper function to make sure req.body.data.id matches req.params.dishId

// middleware for checking if the data id matches it's parameters id
// in order to move onto 'update' handler
function dishIdMatchesDataId(req, res, next) {
    const { data: { id } = {} } = req.body
    const dishId = req.params.dishId
    // if the id is defined, not null, not a string, and not the dishId
    if (id !== "" 
        && id !== dishId
        && id !== null
        && id !== undefined ) {
    // return the following message
    next({
        status: 400,
        message: `id ${id} must match dataId provided in parameters`,
      })
    }
    // otherwise, move onto the next function
     return next()
}
  

// handler for listing the dishes
function list(req, res) {
    res.json({ data: dishes })
}


// handler for reading the dishes
function read(req, res) {
    // uses dish id parameter from request
    const dishId = req.params.dishId
    // create variable for finding the dish with the correct id
    const matchingDish = dishes.find((dish) => (dish.id === dishId))
    // return that dish's data
    res.json({ data: matchingDish })
}
  

// handler for creating a new dish
function create(req, res) {
    // the request body includes the new dish's name, price, and image
    const { data: { name, price, image_url } = {} } = req.body
    // dish object for making an update request
    const newDish = {
      id: nextId(),
      name, 
      price,
      image_url,
    }

    // push the new dish onto the array of all other dishes
    dishes.push(newDish)
    // send an okay status + the new dish object
    res
    .status(201)
    .json({ data: newDish })
}
 

// handler for updating a dish's data
function update(req, res) {
    const dishId = req.params.dishId
    // create variable that finds the dish with a matching id
    const matchingDish = dishes.find((dish) => (dish.id === dishId))
    const { data: { name, description, price, image_url } = {} } = req.body
        // use that variable to define the key-value pairs of the new dish
        matchingDish.description = description
        matchingDish.name = name
        matchingDish.price = price
        matchingDish.image_url = image_url
    // return the new dish's data
    res.json({ data: matchingDish })
}
  

module.exports = {
    list, 
    read: [dishExists, read],
    create: [bodyHasName, bodyHasDescription, bodyHasPrice, bodyHasImg, bodyHasValidPrice, create],
    update: [dishExists, dishIdMatchesDataId, bodyHasName, bodyHasDescription, bodyHasPrice, bodyHasImg, bodyHasValidPriceForUpdate, update],
}
