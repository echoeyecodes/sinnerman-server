import PoolSingleton from '../utils/pool.singleton'
import {DataTypes} from 'sequelize'
import Video from './Video'
import { Model } from 'sequelize'
import User from './User'

const instance = PoolSingleton.getInstance()

class Comment extends Model{}

Comment.init({
    id:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    comment:{
        type: DataTypes.TEXT,
        allowNull: false 
    }
    

}, {
    sequelize: instance,
    modelName: "comments",
    tableName: 'comments',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})

export default Comment