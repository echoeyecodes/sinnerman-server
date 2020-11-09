import PoolSingleton from '../utils/pool.singleton'
import {DataTypes, Sequelize} from 'sequelize'
import Comment from './Comment'
import Like from './Like'
import { Model } from 'sequelize'
import UploadNotification from './UploadNotification'
import View from './View'
import Tag from './Tag'

const instance = PoolSingleton.getInstance()
class Video extends Model{}

Video.init({
    title:{
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
    description:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    video_url:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    thumbnail:{
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
    },
    original_url:{
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
    },
    duration:{
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
    },
    user_id:{
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: instance,
    modelName: "videos",
    tableName: 'videos',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})


Video.hasMany(Comment, {
    foreignKey: 'video_id',
    foreignKeyConstraint: true,
    constraints: true
})

Video.hasMany(Like, {
    foreignKey: 'video_id',
    foreignKeyConstraint: true,
    constraints: true
})

Video.hasMany(UploadNotification, {
    foreignKey: 'video_id',
    foreignKeyConstraint: true,
    constraints: true
})

Video.hasMany(View, {
    foreignKey: 'video_id',
    foreignKeyConstraint: true,
    constraints: true
})

Video.belongsToMany(Tag, {through: "video_tags", as: "video_id"})
Tag.belongsToMany(Video, {through: "video_tags", as: "tag_id"})
Video.sync({alter: true})



export default Video