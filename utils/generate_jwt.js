import jwt from 'jsonwebtoken'

const generateJWT = (user) => {
    const accessToken = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: "15m"
        }
    );

    const refreshToken = jwt.sign(
        {
            id: user.id
        },
        process.env.JWT_REFRESH_SECRET_KEY,
        {
            expiresIn: "7d"
        }
    );

    return { accessToken , refreshToken}
}

export default generateJWT