const allowedOrigin = ["https://dumyum.netlify.app/"]

const corsOption = {
    origin: (origin:any, cb:any) => {
        if (allowedOrigin.indexOf(origin) !== -1 || !origin){
            cb(null, true)
        }else {
            cb(new Error('Not allowed'))
        }
    },
    optionsSuccessStatus: 200
}

export default corsOption