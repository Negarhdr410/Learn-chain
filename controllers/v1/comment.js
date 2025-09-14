const { name } = require("body-parser")
const commentModel = require("../../models/comment")
const courseModel = require("../../models/course")
const mongoose = require("mongoose")

exports.create = async (req, res) => {
    //میاذ کامنتی رو بوجود میاره

    const { body, courseHref, score } = req.body

    const course = await courseModel.findOne({ href: courseHref }).lean()

    if(!course) {
        return res.status(404).json({
            message: "Course not found!!"
        })
    }

    const comment = await commentModel.create({
        body,
        course: course._id,
        creator: req.user._id,
        score,
        isAnswer: 0,
        isAccept: 0
    })

    return res.status(201).json(comment)
}

exports.remove = async (req, res) => {
    //کامنتی رو حذف میکنه

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const deletedComment = await commentModel.findOneAndDelete({ _id: id }).lean()

    if (!deletedComment) {
        return res.status(404).json({
            message: "This comment not found!!"
        })
    }

    return res.json(deletedComment)
}

exports.accept = async (req, res) => {
    //کامنتی رو قبول میکنه

    const { id } = req.params
    
    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const acceptComment = await commentModel.findByIdAndUpdate(
        { _id: id },
        { isAccept: 1 }
    )

    if (!acceptComment) {
        return res.status(404).json({
            message: "This comment not found"
        })
    }

    return res.json({
        message: "Comment accepted successfully :))"
    })
}

exports.reject = async (req, res) => {
    //کامنتی رو رد میکنه

    const { id } = req.params
    
    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const rejectComment = await commentModel.findByIdAndUpdate(
        { _id: id },
        { isAccept: 0 }
    )

    if (!rejectComment) {
        return res.status(404).json({
            message: "This comment not found"
        })
    }

    return res.json({
        message: "Comment rejected successfully :))"
    })
}

exports.answer = async (req, res) => {
    //به کامنتی جواب میده

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const { body } = req.body

    const acceptedComment = await commentModel.findOneAndUpdate({ _id: id },{
        isAccept: 1
    })

    if (!acceptedComment) {
        return res.status(404).json({
            message: "This comment not found"
        })
    }

    const answerComment = await commentModel.create({
        body,
        course: acceptedComment.course,
        creator: req.user._id,
        isAnswer: 1,
        isAccept: 1,
        mainCommentID: id
    })

    return res.status(201).json(answerComment)
}

exports.getAll = async (req, res) => {
    //تمام کامنت ها رو به مدیر نشون میده

    const comments = await commentModel.find({}).populate("course", "name").populate("creator", "name").lean();

    const commentMap = {};
    comments.forEach(comment => {
      commentMap[comment._id.toString()] = { ...comment, replies: [] };
    });

    const allComments = [];

    comments.forEach((comment) => {
      if (!comment.mainCommentID) {
        
        allComments.push(commentMap[comment._id.toString()]);
      } else {
        const parent = commentMap[comment.mainCommentID.toString()];
        if (parent) {
          parent.replies.push(commentMap[comment._id.toString()]);
        }
      }
    });

    return res.json({ allComments });
}