exports.getAll = async (req, res) => {
    //کل مقالات را به کاربر نمایش میده

    const articles = await articleModel.find({}).lean()

    return res.json(articles)
}

exports.create = async (req, res) => {
    //مقاله ای را منتشر میکنه و به همه نشان میدهد 

    const { title, description, body, href, categoryID } = req.body

    const isvalid = mongoose.Types.ObjectId.isValid(categoryID)

    if (!isvalid){
        return res.status(409).json({
            message: "CategoryId is not valid !!"
        })
    }

    const existArticle = await articleModel.findOne({ body })

   if (existArticle){
      const article = await articleModel.findOneAndUpdate({ _id: existArticle._id }, { publish: 1 })  

      const mainArticle = await articleModel.findById(article._id).populate("creator", "-password")

      return res.status(201).json(mainArticle)
   }

   const article = await articleModel.create({
    title,
    description,
    body,
    href,
    categoryID,
    publish: 1,
    creator: req.user._id,
    cover: req.file.filename
})

    const mainArticle = await articleModel.findById(article._id).populate("creator", "-password")

    return res.status(201).json(mainArticle)
}

exports.getOne = async (req, res) => {
    //مفاله ای با اچرفی که کاربر میخواد رو بهش نمایش میده

    const { href } = req.params

    const article = await articleModel.findOne({ href }).populate("categoryID", "title").populate("creator", "-password").lean()

    if (!article) {
        return res.status(404).json({ message: "This article not found!!" })
    }

    return res.json(article)
}

exports.remove = async (req, res) => {
    //مقاله ای با آیدی موردنظر حذف میشه

    const { id } = req.params

    const isValid = mongoose.Types.ObjectId.isValid(id)

    if (!isValid) {
        return res.status(409).json({ message: "ID is not valid!!" })
    }

    const deletedArticle = await articleModel.findOneAndDelete({ _id: id }).lean()

    if(!deletedArticle){
        return res.status(404).json({ message: "This article not found!!" })
    }

    return res.json(deletedArticle)
}
exports.saveDraft = async (req, res) => {
    //مقاله رو به صورت پیش فرض در دیتابیس ذخیره میکنه

    const { title, description, body, href, categoryID } = req.body

    const isvalid = mongoose.Types.ObjectId.isValid(categoryID)

    if (!isvalid){
        return res.status(409).json({
            message: "CategoryId is not valid !!"
        })
    }

   const article = await articleModel.create({
    title,
    description,
    body,
    href,
    categoryID,
    publish: 0,
    creator: req.user._id,
    cover: req.file.filename
})

    const mainArticle = await articleModel.findById(article._id).populate("creator", "-password")

    return res.status(201).json(mainArticle)
}
exports.register = async (req, res) => {
    //کاربر در سایت ثبت نام میکنه

    const validationResult = registerValidator(req.body)
    if (validationResult != true){
        return res.status(422).json(validationResult)
    }

    const { username, name, email, phone, password } = req.body

    const isUserBan = await banUserModel.find({ phone })

    if(isUserBan.length){
        return res.status(409).json({
            message: "This phone number is ban !!"
        })
    }
    
    const isUserExists = await userModel.findOne({
        $or: [{ username }, { email }]
    })

    if (isUserExists) {
        return res.status(409).json({
            massage: "username or email is duplicated"
        })
    }

    const countOfUsers = await userModel.countDocuments()

    const hashedPassword = await bcrypt.hash(password,10)

    const user = await userModel.create({
        username,
        name,
        email,
        phone,
        password: hashedPassword,
        role: countOfUsers > 0 ? "USER" : "ADMIN"
    })

    const userObject = user.toObject()
    Reflect.deleteProperty(userObject, "password")

    const accessToken = jwt.sign({ id: user._id}, process.env.JWT_SECRET, {
        expiresIn: "30 day"
    })

    return res.status(201).json({user: userObject, accessToken})
}
exports.login = async (req, res) => {
    //کاربر توی سایت توی اکانتش ورود میکنه

    const { identifier, password } = req.body

    const user = await userModel.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    })

    if (!user){
        return res.status(401).json({ message: "There is no user with this username or email"})
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid){
        return res.status(401).json({
            message: "Password is not valid !!"
        })
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET,{
        expiresIn: "30 day"
    })

    return res.json({ accessToken })
}
exports.create = async (req, res) => {
    //کتگوری رو بوجود میاره
        
        const validationResult = registerValidator(req.body)
        if (validationResult != true){
            return res.status(422).json(validationResult)
        }
    
        const { title, href } = req.body
        const category = await categoryModel.create({ title, href })
    
        return res.status(201).json(category)
    }
    
exports.getAll = async (req, res) => {
        //همه کتگوری ها رو نمایش میده
    
        const categories = await categoryModel.find({}).lean()
    
        return res.status(200).json(categories)
}
    
exports.remove = async (req, res) => {
        //کتگوری که میخوای رو حذف میکنه
    
        const { id } = req.params
    
        const isValidId = mongoose.Types.ObjectId.isValid(id)
    
        if (!isValidId){
            return res.status(409).json({
                message: "Category ID is not valid !!"
            })
        }
    
        const deletedCategory = await categoryModel.findOneAndDelete({ _id: id })
    
        if (!deletedCategory){
            return res.status(404).json({
                message: "Category not found !!"
            })
        }
        return res.status(200).json(deletedCategory)
}
    
exports.update = async (req, res) => {
        //اطلاعات کتگوری رو آپدیت میکنه
    
        const { id } = req.params
        const { title, href } = req.body
    
        const validationResult = registerValidator(req.body)
        if (validationResult != true){
            return res.status(422).json(validationResult)
        }
    
        const isValidId = mongoose.Types.ObjectId.isValid(id)
    
        if (!isValidId){
            return res.status(409).json({
                message: "Category ID is not valid !!"
            })
        }
    
        const updatedCategory = await categoryModel.findOneAndUpdate({ _id: id }, {
            title,
            href
        })
    
        if (!updatedCategory){
            return res.status(404).json({
                message: "Category not found !!"
            })
        }
        return res.status(200).json(updatedCategory)
}
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

    const comments = await commentModel.find({}).populate("course", "name").populate("creator", "name").lean()

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

    return res.json({ comments, allComments })
}
exports.getAll = async (req, res) => {
    //کل درخواست های کانتکت رو به مدیر نشون میده

    const contacts = await contactModel.find({}).lean()

    res.json(contacts)
}

exports.create = async (req, res) => {
    //ارسال پیام برای ارتباط با ما

    const { name, email, phone, body } = req.body

    const contact = await contactModel.create({
        name,
        email,
        phone,
        answer: 0,
        body
    })

    return res.status(201).json(contact)
}

exports.remove = async (req, res) => {
    // کانتکی طبق خواسته مدیر حذف میشه

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const deletedContact = await contactModel.findOneAndDelete({ _id: id }).lean()

    if(!deletedContact) {
        return res.status(404).json({
            message: "This contact not found!!"
        })
    }

    res.json(deletedContact)
}

exports.answer = async (req, res) => {
    //به کامنت کاربر حواب میده و این جواب برای کاربر ایمیل میشه
    
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "negar.heidari1384@gmail.com",
            pass: "ufpuhmisxbfdywde"
        }
    })

    const mailOptions = {
        from: "negar.heidari1384@gmail.com",
        to: req.body.email,
        subject: "پاسخ پیغام شما از سمت آکادمی سبزلرن",
        text: req.body.answer
    }

    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            return res.json({ message: error })
        } else {
            const contact = await contactModel.findOneAndUpdate({ email: req.body.email }, {
                answer: 1
            })
            return res.json({ message: "Email sent successfully :))" })
        }
    })
}
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


    const isUserRegisteredToThisCourse = !!(await courseUserModel.findOne({
        user: req.user._id,
        course: course._id
    }))

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

    return res.json({ course, sessions, comments: allComments, courseStudentCount, isUserRegisteredToThisCourse})
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
exports.getAll = async (req, res) => {
    //کل منو ها رو به صورتی که اون منو اصلی هست و زیرش ساب منو میاد به کاربر نشون میده

    const menus = await menusModel.find({}).lean()

    menus.forEach((menu) => {
        let submenus = []

        for (let i = 0; i < menus.length; i++){
            const mainMenu = menus[i] 

            if(String(mainMenu.parent) == String(menu._id)){
                // if (mainMenu.parent ?.equals(menu._id)) { این دو دستور ایف یه کار یکسان رو انحام میدن
                    submenus.push(menus.splice(i, 1)[0])

                    i -= 1
                // }
            }
        }

        menu.submenus = submenus
    })

    return res.json(menus)
}

exports.create = async (req, res) => {
    //منویی را ایحاد میکند

    const { title, href, parent } = req.body

    const isvalid = mongoose.Types.ObjectId.isValid(parent)

    if(!isvalid) {
        return res.status(409).json({
            message: "ParentID is not valid !!"
        })
    }

    const menu = await menusModel.create({ title, href, parent })

    return res.status(201).json(menu)
}

exports.getAllInPanel = async (req, res) => {
    //همه منو ها رو به مدیر نمایش میده

    const menus = await menusModel.find({}).populate("parent").lean()

    return res.json(menus)
}

exports.remove = async (req, res) => {
    //منو موردنظر رو حذف میکنه

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const deletedMenu = await menusModel.findOneAndDelete({ _id: id }).lean()

    return res.json(deletedMenu)
}
exports.getAll = async (req, res) => {
    //کل ایمیل هایی که برای خبرنامه ثبت شدن رو نشون میده

    const newsletter = await newsletterModel.find({}).lean()
    
    return res.json(newsletter)
}

exports.create = async (req, res) => {
    //ایمیلی که کاربر میده رو توی بخش خبرنامه ذخیره میکنه

    const { email } = req.body

    const validationResult = validator(req.body)
    if (validationResult != true){
        return res.status(422).json(validationResult)
    }

    const newEmail = await newsletterModel.create({ email })

    return res.status(201).json(newEmail)
}
exports.create = async (req, res) => {
    //نوتیفیکیشن توسط مدیر ساخته میشود

    const validationResult = createValidator(req.body)
    if (validationResult != true){
        return res.status(422).json(validationResult)
    }

    const { message, admin } = req.body

    const isvalid = mongoose.Types.ObjectId.isValid(admin)

    if (!isvalid){
        return res.status(409).json({
            message: "AdminID is not valid !!"
        })
    }

    const notification = await notificationModel.create({ message, admin })

    return res.status(201).json(notification)
}

exports.get = async (req, res) => {
    const { _id } = req.user

    const adminNotifications = await notificationModel.find({ admin: _id }).lean()

    return res.json(adminNotifications)
}

exports.seen = async (req, res) => {
    //نوتیفیکیشنی که آیدی اون وارد شده سین میخوره

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if (!isvalid){
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const seenNotification = await notificationModel.findOneAndUpdate({ _id: id }, { seen: 1 }).lean()

    return res.json(seenNotification)
}

exports.getAll = async (req, res) => {
    //کل نوتیفیکیشن ها رو به مدیر نشون میده

    const notifications = await notificationModel.find({}).lean()

    return res.json(notifications)
}

exports.remove = async (req, res) => {
    //نوتیفیکیشنی که مدیر میخواد رو حذف میکنه

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if (!isvalid){
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const deletedNotification = await notificationModel.findOneAndDelete({ _id: id }).lean()

    return res.json(deletedNotification)
}
exports.getAll = async (req, res) => {
    //همه کد های ایحاد شدخ رو نمایش میده
    const offs = await offModel
        .find({}, "-__v")
        .populate("course", "name href")
        .populate("creator", "name")

    return res.json(offs)
}

exports.create = async (req, res) => {
    //کد تخفیف میسازه

    const { code, precent, course, max } = req.body

    const isCourseValid = mongoose.Types.ObjectId.isValid(course)

    if (!isCourseValid){
        return res.status(409).json({
            message: "CourseID is not valid !!"
        })
    }

    const newOff = await offModel.create({
        code,
        precent,
        course,
        max,
        uses: 0,
        creator: req.user._id
    })

    return res.status(201).json(newOff)
}

exports.setOnAll = async (req, res) => {
    //کد تخفیفی روی همه دوره ها اعمال میکنه

    const { discount } = req.body

    const coursesDiscounts = await courseModel.updateMany({ discount })

    return res.json({ message: "Discounts set successfully :))" })
}

exports.getOne = async (req, res) => {
    //اطلاعات اون کد تخفیف رو که دادیم بهمون برمیگردونه

    const { code } = req.params
    const { course } = req.body

    const isCourseValid = mongoose.Types.ObjectId.isValid(course)

    if (!isCourseValid){
        return res.status(409).json({
            message: "CourseID is not valid !!"
        })
    }

    const off = await offModel.findOne({ code, course }).lean()

    if (!off) {
        return res.status(404).json({ message: "Code is not valid" })
    } else if(off.max == off.uses) {
        return res.status(409).json({ message: "This code already used !!" })
    } else {
        await offModel.findOneAndUpdate(
            { code, course },
            { uses: off.uses + 1 } 
        )

        return res.json(off)
    }

}

exports.remove = async (req, res) => {
    //کد تخفیف مورد نظر رو حذف میکنه

    const { id } = req.params

    const deletedOff = await offModel.findOneAndDelete({ _id: id }).lean()

    return res.json(deletedOff)
}
exports.getAll = async (req, res) => {
    //سفارشاتی که کاربر توی اون دوره ها ثبت نام کرده رو به کلاینت نمایش میده

    const orders = await courseUserModel.find({ user: req.user._id }).populate("course", "name href").lean()

    return res.json(orders)
}

exports.getOne = async (req, res) => {
    //اطلاعات سفارش با اون آیدی وارد شده رو نشون میده

    const { id } = req.params
    const isValidId = mongoose.Types.ObjectId.isValid(id)

    if (!isValidId) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const order = await courseUserModel.findOne({ _id: id }).lean()

    return res.json(order)
}
exports.get = async (req, res) => {
    const { keyword } = req.params
    const courses = await courseModel.find({ 
        name: { $regex: ".*" + keyword + ".*"}
     })

     //articles

     return res.json(courses)
}
exports.getAll = async (req, res) => {
    //کل تیکت ها رو نشون میده

    const tickets = await ticketsModel.find({ answer: 0 }).populate("departmentID", "title").populate("departmentSubID", "title").populate("user", "name").lean()

    return res.json(tickets)
}

exports.create = async (req, res) => {
    //تیکتی رو ایحاد میکنه

    const { departmentID, departmentSubID, priority, title, body, course } = req.body

    const isvalidDepartment = mongoose.Types.ObjectId.isValid(departmentID)

    const isvalidDepartmentSub = mongoose.Types.ObjectId.isValid(departmentSubID)

    if(!isvalidDepartment || !isvalidDepartmentSub) {
        return res.status(409).json({
            message: "DepartmentID or DepartmentSubID is not valid !!"
        })
    }

    const ticket = await ticketsModel.create({
        departmentID,
        departmentSubID,
        priority,
        title,
        body,
        user: req.user._id,
        answer: 0,
        course,
        isAnswer: 0
    })

    const mainTicket = await ticketsModel.findOne({ _id: ticket._id }).populate("departmentID").populate("departmentSubID").populate("user", "-password").lean()

    return res.status(201).json(mainTicket)
}

exports.userTickets = async (req, res) => {
    //تیکت های یوزر موردنظر رو نمایش میده

    const tickets = await ticketsModel.find({ user: req.user._id }).sort({ _id: -1 }).populate("departmentID").populate("departmentSubID").populate("user", "-password").lean()

    return res.json(tickets)
}

exports.departments = async (req, res) => {
    // کل دپارتمان ها رو به نمایش میذاره

    const departments = await departmentsModel.find({}).lean()

    return res.json(departments)
}

exports.departmentsSubs = async (req, res) => {
    //میاد اون زیر محموعه های دپارتمان موردنظر رو با اطلاعاتش نمایش میده

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const departmentsSub = await departmentsSubsModel.find({ parent: id }).lean()

    return res.json(departmentsSub)
}

exports.setAnswer = async (req, res) => {
    //پاسخ یه تیکت رو میده

    const { body, ticketID } = req.body

    const isvalid = mongoose.Types.ObjectId.isValid(ticketID)

    if(!isvalid) {
        return res.status(409).json({
            message: "TicketID is not valid !!"
        })
    }

    const ticket = await ticketsModel.findOne({ _id: ticketID }).lean()

    const answer = await ticketsModel.create({
        title: "پاسخ تیکت شما",
        body,
        priority: ticket.priority,
        user: req.user._id,
        parent: ticketID,
        isAnswer: 1,
        answer: 0,
        departmentID: ticket.departmentID,
        departmentSubID: ticket.departmentSubID
    })

    await ticketsModel.findOneAndUpdate({ _id: ticketID }, { answer: 1 })

    return res.status(201).json(answer)
}

exports.getAnswer = async (req, res) => {
    //اطلاعات تیکت موردنظر رو همراه با پاسخ هاش به کاربر نمایش میده

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const ticket = await ticketsModel.findOne({ _id: id })

    const ticketAnswer = await ticketsModel.findOne({ parent: id })

    return res.json({
        ticket,
        ticketAnswer
    })
}
exports.banUser = async (req, res) => {
    //اون کاربری که میخوای رو بن میکنه

    const mainUser = await userModel.findOne({ _id: req.params.id }).lean()
    const banUserResult = banUserModel.create({ phone: mainUser.phone })

    if (banUserResult) {
        return res.status(200).json({ message: "User ban successfully :))" })
    }

    return res.status(500).json({ message: "Server error !!"})
}

exports.getAll = async (req, res) => {
    //تمام کاربر ها رو بهت نشون میده

    const users = await userModel.find({}, "-password")

    res.json(users)
}

exports.removeUser = async (req, res) => {
    //کاربری که میخوای رو حذف میکنه

    const isValidId = mongoose.Types.ObjectId.isValid(req.params.id)

    if (!isValidId) {
        return res.status(409).json({
            message: "User ID is not valid !!"
        })
    }

    const removedUser = await userModel.findByIdAndDelete({ _id: req.params.id })

    if (!removedUser) {
        return res.status(404).json({
            message: "There is no user !!"
        })
    }

    return res.status(200).json({
        message: "User removed successfully :))"
    })
}

exports.changeRole = async (req, res) => {
    //رول اون کاربری که میخوای رو عوض میکنه

    const { id } = req.body
    const isValidId = mongoose.Types.ObjectId.isValid(id)

    if (!isValidId) {
        return res.status(409).json({
            message: "User ID is not valid !!"
        })
    }

    const user = await userModel.findOne({ _id: id })
    
    let newRole = user.role === "ADMIN" ? "USER" : "ADMIN"
    const updateduser = await userModel.findByIdAndUpdate(
        { _id: id },
        { role: newRole }
    )
    
    if (updateduser) {
        res.json({
            message: "User role changed successfully :))"
        })
    }
}

exports.updateUser = async (req, res) => {
    //اطلاعات اون کاربری که میخوای رو آپدیت میکنه

    const { username, name, email, phone, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await userModel.findByIdAndUpdate({ _id: req.user._id},
        {
            name,
            username,
            email,
            phone,
            password: hashedPassword
        }
    )
    .select("-password")
    .lean()

    return res.json(user)
}