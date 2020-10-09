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
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: instance,
    modelName: "videos",
    tableName: 'videos',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})

Video.hasMany(Comment, {
    foreignKey: "video_id"
})
Video.hasMany(Like, {
    foreignKey: "video_id"
})

Video.hasMany(UploadNotification, {
    foreignKey: "video_id"
})

Video.hasMany(View, {
    foreignKey: "video_id"
})

Comment.belongsTo(Video)
Like.belongsTo(Video)
View.belongsTo(Video)
Video.hasMany(UploadNotification)
UploadNotification.belongsTo(Video)


Video.belongsToMany(Tag, {through: "video_tags"})
Tag.belongsToMany(Video, {through: "video_tags"})

export default Video