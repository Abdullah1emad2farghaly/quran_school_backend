import { asyncWrapper } from "../middleWares/asyncWrapper.js";
import parentService from "../services/parents.service.js";
import httpStatusText from "../utils/httpStatusText.js";

const getParents = asyncWrapper(async (req, res, next) => {

    try {
        const parents = await parentService.getParents();
        const data = {
            status: httpStatusText.SUCCESS,
            data: { parents }
        }
        res.json({ data })
    } catch (error) {
        next(error)
    }
})

const getParentById = asyncWrapper(async (req, res, next) => {
    const parentId = req.params.id;
    try {
        const parent = await parentService.getParentById(parentId);
        const data = {
            status: httpStatusText.SUCCESS,
            data: { parent }
        }
        res.json({ data })
    } catch (error) {
        next(error)
    }
})

const getParentChildren = asyncWrapper(async (req, res, next) => {
    const parentId = req.params.id;

    try {
        const children = await parentService.getParentChildren(parentId);
        const data = {
            status: httpStatusText.SUCCESS,
            data: { children }
        }
        res.json({ data })
    } catch (error) {
        next(error)
    }
})


const getMyChildren = asyncWrapper(async (req, res, next) => {
    const userId = req.currentUser.id;

    try {
        const childern = await parentService.getMyChildren(userId);
        const data = {
            status: httpStatusText.SUCCESS,
            data: { childern }
        }
        res.json({ data })
    } catch (error) {
        next(error)
    }
})

const getMyChildById = asyncWrapper(async (req, res, next) => {
    const userId = req.currentUser.id;
    const studentId = req.params.id

    try {
        const childernDetails = await parentService.getMyChildById(userId, studentId);
        const data = {
            status: httpStatusText.SUCCESS,
            data: { childernDetails }
        }
        res.json({ data })
    } catch (error) {
        next(error)
    }
})


const parentController = {
    getMyChildren,
    getMyChildById,
    getParents,
    getParentChildren,
    getParentById
}

export default parentController;