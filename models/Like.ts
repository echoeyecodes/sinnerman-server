import PoolSingleton from '../utils/pool.singleton'
import {DataTypes} from 'sequelize'
import Video from './Video'
import { Model } from 'sequelize'
import User from './User'

const instance = PoolSingleton.getInstance()

class Like extends Model{}

Like.init({
    id:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    video_id:{
        type: DataTypes.UUID,
        allowNull: false,
        references:{
            model: Video,
            key: 'id'
        }
    },
    user_id:{
        type: DataTypes.UUID,
        references:{
            model: User,
            key: 'id'
        }
    }
}, {
    sequelize: instance,
    modelName: "likes",
    tableName: 'likes',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})

export default Like