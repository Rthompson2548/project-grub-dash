// COMPLETE!!

const router = require("express").Router()
const controller = require("./dishes.controller")
const methodNotAllowed = require("../errors/methodNotAllowed")

// TODO: Implement the /dishes routes needed to make the tests pass

router
    // routes to home page
    .route('/')
    // for making a get request at the route
    .get(controller.list)
    // for making a post request at the route
    .post(controller.create)
    // for request types that aren't available to use on dish
    .all(methodNotAllowed)


router
    // routes to the dish's webpage
    .route('/:dishId')
    // for making a get request at the route
    .get(controller.read)
    // for making a put request at the route
    .put(controller.update)
    // for request types that aren't available to use on the dish
    .all(methodNotAllowed)

module.exports = router
