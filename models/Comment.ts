import PoolSingleton from '../utils/pool.singleton'
import {DataTypes} from 'sequelize'
import { Model } from 'sequelize'

const instance = PoolSingleton.getInstance()

class Comment extends Model{}

Comment.init({
    id:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    comment:{
        type: DataTypes.TEXT,
        allowNull: false 
    },
    user_id:{
        type: DataTypes.UUID,
        allowNull: false,
    },
    video_id:{
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: instance,
    modelName: "comments",
    tableName: 'comments',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})

export default Comment