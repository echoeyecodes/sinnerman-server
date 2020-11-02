import PoolSingleton from '../utils/pool.singleton'
import {DataTypes} from 'sequelize'
import { Model } from 'sequelize'
import Video from './Video'
import Tag from './Tag'

const instance = PoolSingleton.getInstance()

class Video_Tags extends Model{}

Video_Tags.init({
    video_id:{
        type: DataTypes.UUID,
        allowNull: false,
        references:{
            model: Video,
            key: 'id'
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    tag_id:{
        type: DataTypes.UUID,
        allowNull: false,
        references:{
            model: Tag,
            key: 'id'
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
}, {
    sequelize: instance,
    modelName: "video_tags",
    tableName: 'video_tags',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})

export default Video_Tags