import { validationResult } from 'express-validator';
import { asyncWrapper } from '../middleWares/asyncWrapper.js';
import groupService from '../services/group.service.js';
import httpStatusText from '../utils/httpStatusText.js';
import appErrors from '../utils/appErrors.js';

const getAllGroups = asyncWrapper(async (req, res, next) => {
    
    try {
        const groups = await groupService.getGroups();
        res.json({
            status: httpStatusText.SUCCESS,
            data: { groups }
        });
    } catch (error) {
        next(error);
    }
});

// Get Group by id
const getGroupById = asyncWrapper(async (req, res, next)=>{
    const groupId = req.params.id;

    try{
        const group = await groupService.getGroupById(groupId)
        const data = {
            status: httpStatusText.SUCCESS,
            data: { group }
        }
        res.json({data})
    }catch(error){
        next(error);
    }


})

// Create Group
const createGroup = asyncWrapper(async (req, res, next) => {
    try {   
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = appErrors.create(errors.array(), 400, httpStatusText.FAIL);
            return next(error);
        }

        const groupData = req.body;
        const result = await groupService.createGroup(groupData);

        const data = {
            status: httpStatusText.SUCCESS,
            msg: "Group created successfully",
            data: { group: { id: result.insertId, ...groupData } }
        };
        
        res.json({data})
    } catch (error) {
        next(error);
    }
});

// Update Group
const updateGroup = asyncWrapper(async (req, res, next) => {
    const groupId = req.params.id;
    const groupData = req.body;
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = appErrors.create(errors.array(), 400, httpStatusText.FAIL);
            return next(error);
        }
        const result = await groupService.updateGroup(groupId, groupData);
        const data = {
            status: httpStatusText.SUCCESS,
            msg: "Group updated successfully",
            data: {group: {id: groupId, ...groupData}}
        };
        res.json({data});
    } catch (error) {
        next(error);
    }
});

// delete Group
const deleteGroup = asyncWrapper( async (req, res, next)=>{
    const groupId = req.params.id;
    try {
        await groupService.deleteGroup(groupId);
        const data = {
            status: httpStatusText.SUCCESS,
            msg: `Group with id ${groupId} deleted successfully`,
            data: null
        };
        
        res.json({data})
    } catch (error) {
        next(error);
    }
})

// toggle group activation
const toggleGroupActivation = asyncWrapper( async (req, res, next) => {
    const projectId = req.params.id

    try{
        await groupService.toggleGroupActivation(projectId);

        const data = {
            status: httpStatusText.SUCCESS,
            msg: `Group status toggled successfully`,
            data: null
        };
        
        res.json({ data })
    }catch(error){
        next(error);
    }
})


// create groupSession
const createGroupSession = asyncWrapper (async (req, res, next) => {
    const groupId = req.params.id
    const groupData = req.body;

    try {
        const sessionData = await groupService.createGroupSession({ groupId, ...groupData });

        console.log(sessionData);
        const data = {
            status: httpStatusText.SUCCESS,
            msg: `sessionData saved successfully`,
            data: sessionData
        };
        
        res.json({ data })
    }catch(error){
        next(error);
    }
})


const getLastGroupSession = asyncWrapper ( async (req, res, next) => {
    const groupId = req.params.id;
    
    const userId = req.currentUser.id;

    try{
        const lastSessionData = await groupService.getLastGroupSession(groupId, userId);
        const data = {
            status: httpStatusText.SUCCESS,
            data: lastSessionData
        };
        
        res.json({ data })
    }catch(error){
        next(error)
    }
})
const groupController = {
    getAllGroups, 
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    toggleGroupActivation,
    createGroupSession,
    getLastGroupSession
};

export default groupController;