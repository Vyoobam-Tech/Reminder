    import Employee from "../models/Employee.js";
    import express from 'express'

    const router = express.Router()

    router.get('/', async (req,res) => {
        try{
            const employee = await Employee.find()
            res.json(employee)
        } catch (err){
            res.status(500).json({message: err.message})
        }
    })

    router.post('/', async (req,res) => {
        const employee = new Employee(req.body)
        try{
            const postemployee = await employee.save()
            res.status(201).json(postemployee)
        } catch(err) {
            res.status(400).json({message: err.message})
        }
    })

    router.delete('/:id',async (req,res) => {
        try{
            await Employee.findByIdAndDelete(req.params.id)
            res.json({message: "employee deleted"})
        } catch (err) {
            res.status(500).json({message:err.message})
        }
    })

    export default router;