import jwt from 'jsonwebtoken';
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "please login -no auth header",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decodedValue = jwt.verify(token, process.env.JWT_SECERT);
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: "invalid token"
            });
            return;
        }
        req.user = decodedValue.user;
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "please login -jwt error"
        });
    }
};
