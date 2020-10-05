import bcrypt from 'bcryptjs'

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: bcrypt.hashSync('123456',10),
        isAdmin: true
    },
    {
        name: 'John Doe',
        password: bcrypt.hashSync('123456',10),
        email: 'john@example.com',
    },
    {
        name: 'Jane Doe',
        password: bcrypt.hashSync('123456',10),
        email: 'jane@example.com',
    },
]

export default users