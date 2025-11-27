export const asyncHandler=(fn)=>{
    return async(req,res,next)=>{
        try {
            await fn(req,res,next)
        }catch (error){
            error.cause=error.cause || "Something went wrong!"
            next(error)
        }
    }
}
export  const globalErrorHandler=(err,req,res,next)=>{
       const statusCode=err.cause?.statusCode ||500
       return res.status(statusCode).json({
        message:error.message ||"Internal Server Error",
        ...asyncHandler({
            stack:error.stack
        })
       })


}
export const successResponse=({res,message="Success",statusCode=200,data={}})=>{
return res.status(statusCode).json({
    success:true,
    message,
    data
})
}