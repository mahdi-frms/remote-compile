exports.needArgs = (args) => {
    return async (req, res, next) => {
        const body = req.body
        if (!body) return res.status(400).end('json body required')
        for (const a of args)
            if (body[a] === undefined)
                return res.status(400).end(`body parameter ${a} required`)
        next()
    }
}