(async () => {
    await mongoose.connect(process.env.MONGO_URL)
    console.log("connected to mongoDB successfully :))")
})()

app.listen(port, () => {
    console.log(`server running on ${port}`)
})