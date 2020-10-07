import PoolSingleton from '../utils/pool.singleton'
import {DataTypes} from 'sequelize'
import Video from './Video'
import { Model } from 'sequelize'
import Like from './Like'
import Comment from './Comment'
import UploadNotification from './UploadNotification'
import View from './View'

const instance = PoolSingleton.getInstance()

class User extends Model{}

User.init({
    fullname:{
        type: DataTypes.STRING,
        allowNull: false,        
    },
    id:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    username:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true    
    },
    profile_url:{
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ""      
    },
    is_verified:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,        
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,        
    }
}, {
    sequelize: instance,
    modelName: "users",
    tableName: 'users',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})

User.hasMany(Video, {
    foreignKey: "user_id"
})

User.hasMany(View, {
    foreignKey: "user_id"
})

User.hasMany(Like, {
    foreignKey: "user_id"
})

User.hasMany(Comment, {
    foreignKey: "user_id"
})

User.hasMany(UploadNotification, {
    foreignKey: "user_id"
})

UploadNotification.belongsTo(User)
Comment.belongsTo(User)
View.belongsTo(User)
Like.belongsTo(User)
Video.belongsTo(User)

export default User