import { asyncWrapper } from "../middleWares/asyncWrapper.js";
import parentService from "../services/parents.service.js";
import httpStatusText from "../utils/httpStatusText.js";

const getMyChildren = asyncWrapper(async (req, res, next)=> {
    const userId = req.currentUser.id;

    try {
        const childern = await parentService.getMyChildren(userId);
        const data = {
            status: httpStatusText.SUCCESS,
            data: { childern }
        }
        res.json({data})
    }catch(error){
        next(error)
    }
})

const getMyChildById = asyncWrapper(async (req, res, next) =>{
    const userId = req.currentUser.id;
    const studentId = req.params.id

    try {
        const childernDetails = await parentService.getMyChildById(userId, studentId);
        const data = {
            status: httpStatusText.SUCCESS,
            data: { childernDetails }
        }
        res.json({ data })
    }catch(error){
        next(error)
    }
})


const parentController = {
    getMyChildren,
    getMyChildById
}

export default parentController;