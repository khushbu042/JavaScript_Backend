//using Promises
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
    new Promise
    .resolve(requestHandler(req, res, next))
    .reject((error) => next(error))
    }
}

export {asyncHandler}; 

//using try catch
// const  asyncHandler = () => {}
// const asyncHandler = (func) => {() => {}}
// const asyncHandler = () => async() => {}

// const asyncHandler = (func) = async(req, res, next) => {
//      try {
//          await func(req, res, next);
//      }catch (error) {
//         res.status(error.code || 500).json({
//             sucess: false,
//             message: error.message
//         })
//      }
// }



