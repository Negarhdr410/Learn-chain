const createCourseValidator = require("../../validators/createCourse")
const createSessionValidator = require("../../validators/createSession")
const courseUserModel = require("../../models/course-user")
const courseModel = require("../../models/course")
const sessionModel = require("../../models/session")
const categoryModel = require("../../models/category")
const commentModel = require("../../models/comment")
const mongoose = require("mongoose")

exports.create = async (req, res) => {
    //دوره ای رو بوجود میاریم

    const validationResult = createCourseValidator(req.body)
    if (validationResult != true){
        return res.status(422).json(validationResult)
    }

    const { name, description, support, href, price, status, discount, categoryID } = req.body

    const isvalid = mongoose.Types.ObjectId.isValid(categoryID)

    if (!isvalid){
        return res.status(409).json({
            message: "CategoryId is not valid !!"
        })
    }

    const course = await courseModel.create({
        name,
        description,
        support,
        href,
        price,
        status,
        discount,
        categoryID,
        creator: req.user._id,
        cover: req.file.filename
    })

    const mainCourse = await courseModel.findById(course._id).populate("creator", "-password")

    return res.status(201).json(mainCourse)
}


exports.createSession = async (req, res) => {
    //جلسه ای رو تشکیل میدیم

    const validationResult = createSessionValidator(req.body)

    if (!validationResult) {
        return res.status(422).json(validationResult)
    }

    const { title, time, free } = req.body
    const { id } = req.params

    const isValid = mongoose.Types.ObjectId.isValid(id)

    if (!isValid) {
        return res.status(409).json({
            message: "courseID is not valid"
        })
    }

    const session = await sessionModel.create({
        title,
        time,
        free,
        video: "Video.mp4",
        course: id
    })

    return res.status(201).json(session)
}

exports.getAll = async (req, res) => {
    const courses = await courseModel
      .find({})
      .populate("categoryID")
      .populate("creator")
      .lean()
      .sort({ _id: -1 });
  
    const registers = await courseUserModel.find({}).lean();
    const comments = await commentModel.find({}).lean();
  
    const allCourses = [];
  
    courses.forEach((course) => {
      let courseTotalScore = 5;
      const courseRegisters = registers.filter(
        (register) => register.course.toString() === course._id.toString()
      );
  
      const courseComments = comments.filter((comment) => {
        return comment.course.toString() === course._id.toString();
      });
  
      courseComments.forEach(
        (comment) => (courseTotalScore += Number(comment.score))
      );
  
      allCourses.push({
        ...course,
        categoryID: course.categoryID.title,
        creator: course.creator.name,
        registers: courseRegisters.length,
        courseAverageScore: Math.floor(
          courseTotalScore / (courseComments.length + 1)
        ),
      });
    });
  
    return res.json(allCourses);
};

exports.getAllSessions = async (req, res) => {
   //کل جلسات رو نمایش میدیم

    const sessions = await sessionModel.find({}).populate("course", "name").lean()

    return res. status(200).json(sessions)
}

exports.getSessionInfo = async (req, res) => {
    // جلسه ای که میخوای رو نشون میده و علاوه بر اون کل جلسات توی اون href رو نشون میذه

    const { href } = req.params
    const { sessionID } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(sessionID)

    if(!isvalid) {
        return res.status(409).json({
            message: "sessionID is not valid !!"
        })
    }

    const course = await courseModel.findOne({ href }).lean()
    const session = await sessionModel.findOne({ _id: sessionID })
    const sessions = await sessionModel.find({ course: course._id })

    return res.json({ session, sessions })
}

exports.removeSession = async (req, res) => {
    //اون جلسه ای که میخوای رو حذف میکنه

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const deletedSession = await sessionModel.findOneAndDelete({ _id: id })

    if(!deletedSession){
        return res.status(404).json({
            message: "This session not found !!"
        })
    }

    return res.status(200).json(deletedSession)
}

exports.register = async (req, res) => {
    //کاربر رو توی دوره ای که میخواد ثبت نام میکنه

    const isUserAlreadyRegistered = await courseUserModel.findOne({
        user: req.user._id,
        course: req.params.id
    }).lean()

    if (isUserAlreadyRegistered) {
        return res.status(409).json({
            message: "User already registered in this course"
        })
    }

    const register = await courseUserModel.create({
        user: req.user._id,
        course: req.params.id,
        price: req.body.price
    })

    return res.status(201).json({ message: "User registered successfully :))" })
}

exports.getCoursesByCategory = async (req, res) => {
    // دوره های اون کتگوری که خواستی رو بهت نمایش میده

    const { href } = req.params

    const category = await categoryModel.findOne({ href }).lean()

    if(!category) {
        return res.status(404).json([])
    }

    const courses = await courseModel.find({ categoryID: category._id })

    return res.json(courses)
}

exports.getOne = async (req, res) => {
    //دوره ای که کاربر میخواد با اطلاعات کامل به اون نمایش داده میشه
    console.log(req)
    const { href } = req.params

    const course = await courseModel.findOne({ href }).populate("creator", "-password").populate("categoryID").lean()

    if (!course) {
        return res.status(404).json({
            message: "this href not found !!"
        })
    }

    const sessions = await sessionModel.find({ course: course._id }).lean()
    const comments = await commentModel.find({ course: course._id, isAccept: 1 }).populate("creator", "-password").populate("course").lean()
    const courseStudentCount = await courseUserModel.find({ course: course._id }).countDocuments()


    // const isUserRegisteredToThisCourse = !!(await courseUserModel.findOne({
    //     user: req.user._id,
    //     course: course._id
    // }))

    let allComments = []

    comments.forEach((comment) => {
        let commentAnswerInfo = null

        comments.forEach((answerComment)=>{
            if(String(comment._id) == String(answerComment.mainCommentID)) {
                allComments.push({
                    ...comment,
                    course: comment.course.name,
                    creator: comment.creator.name,
                    answerComment
                })
            }
        })
    })

    return res.json({ course, sessions, comments: allComments, courseStudentCount})
}

exports.removeCourse = async (req, res) => {
    //کسی که مدیره میاذ دوره ای که میخواد رو حذف میکنه

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const deletedCourse = await courseModel.findOneAndDelete({ _id: id })

    if (!deletedCourse) {
        return res.status(404).json({
            message: "Course not found !!"
        })
    }

    return res.json(deletedCourse)
}

exports.getRelated = async (req, res) => {
    //دوره های مرتبط با دوره ای که کاربر میخواد از نظر کتگوری مشترک به او نمایش داده میشود

    const { href } = req.params

    const course = await courseModel.findOne({ href }).lean()

    if (!course) {
        return res.status(404).json({
            message: "Course not found !!"
        })
    }

    let relatedCourses = await courseModel.find({ categoryID: course.categoryID }).lean()

    relatedCourses = relatedCourses.filter((course) => course.href != href)

    // if (!category) {
    //     return res.status(404).json({
    //         message: "category not found !!"
    //     })
    // }

    return res.json(relatedCourses)
}

exports.popular = async (req, res) => {
    //دوره هایی با امتیاز 5 به عنوان دوره محبوب شناخته و نمایش داده میشن

    const comments = await commentModel.find({ score: 5, mainCommentID: null }).lean()

    console.log('Comment ->', comments);
    

    const popularCourse = await courseModel.find({ _id: comments[0].course }).lean()



    return res.json(popularCourse)
}

exports.presell = async (req, res) => {
    //دوره هایی که پیش فروش هستند نمایش داده میشود

    const presell = await courseModel.find({ status: "پیش فروش" }).lean()

    return res.json(presell)
}