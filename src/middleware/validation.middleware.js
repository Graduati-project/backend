
import Joi from "joi";
import { asyncHandler } from "../utils/response/respone.js";


export const generalFields={
    firstName:Joi.string().required().min(3).max(30),
    LastName:Joi.string().required().min(3).max(30),
     email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net", "org", "io", "sa"] },
  }).required(),
    password:Joi.string().required(),
    confirmPassword:Joi.ref('password'),
    phone: Joi.string()
           
            .required(),
}
export const validation=(Schema)=>{
    return asyncHandler(
        async(req,res,next)=>{
            // Check if Schema is defined
            if (!Schema) {
                return res.status(400).json({message: "Validation schema is required"})
            }
            const validationError=[]
            // Iterate through schema properties (body, params, query, etc.)
            for(const key of Object.keys(Schema)){
                let dataToValidate = {}
                // Map schema keys to request properties
                switch(key) {
                    case 'body':
                        dataToValidate = req.body || {}
                        break
                    case 'params':
                        dataToValidate = req.params || {}
                        break
                    case 'query':
                        dataToValidate = req.query || {}
                        break
                    default:
                        dataToValidate = req[key] || {}
                }
                const validationResult=Schema[key].validate(dataToValidate)
                if(validationResult.error){
                    validationError.push({key,details:validationResult.error.details.map(ele=>{
                        return{message:ele.message,path:ele.path[0]}
                    })})
                }
            }
            if(validationError.length){
                return res.status(400).json({message:"Validation Error",errors:validationError})
            }
            return next()
        }
    )
}