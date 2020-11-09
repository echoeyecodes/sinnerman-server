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
        allowNull: false,
        defaultValue: "https://res.cloudinary.com/echoeyecodes/image/upload/c_scale,w_700/v1598606495/hbjawa1jnpqvpufxohrh.jpg"    
    },
    backdrop_path:{
        type: DataTypes.STRING,
        allowNull: false,
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
    foreignKey: 'user_id',
    foreignKeyConstraint: true,
    constraints: true,
    onUpdate: "NO ACTION",
    onDelete: "CASCADE"
})

User.hasMany(Comment, {
    foreignKey: 'user_id',
    foreignKeyConstraint: true,
    constraints: true
})

User.hasMany(Like, {
    foreignKey: 'user_id',
    foreignKeyConstraint: true,
    constraints: true
})

User.hasMany(UploadNotification, {
    foreignKey: 'user_id',
    foreignKeyConstraint: true,
    constraints: true,
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
})

User.hasMany(UploadNotification, {
    foreignKey: 'created_by',
    foreignKeyConstraint: true,
    constraints: true,
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
})

User.hasMany(View, {
    foreignKey: 'user_id',
    foreignKeyConstraint: true,
    constraints: true
})

User.sync({alter:true})
export default User